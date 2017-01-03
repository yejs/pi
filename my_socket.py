#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 命令处理模块 
"""

__author__ = 'yejs'
__version__ = '1.0'


import os
from tornado.tcpserver import TCPServer 
import json
import base64
import urllib
import logging
import queue
import threading
import time
from my_gpio import RPi_GPIO
from my_websocket import WebSocket
from mymedia import mymedia
#from myhandler import WebHandler
from lirc import LIRC
from data.data import *
from data.g_data import GlobalVar
from data.asr import asr
import types 

class Connection(object):    
    do_disarming_timer = None
    stop_flag = False
    close_timer = None	  				#关闭超时定时器
    close_ip = None
    clients = set()    
    last_heart_beat_msg = None

    lirc_air = None
    lirc_tv = None
    last_param = None
    perform_save = None
    def __init__(self, stream, address):   
        Connection.clients.add(self)   
		
        self.q = queue.Queue()#list()#{"ip": "", "pin": "", "item": None}
        self.time_tick = 0
        self.timer = None
        self.heart_beat_timer = None
		
        self._stream = stream    
        self._address = address    
        self.heart_beat_ack = True    			#心跳应答标志位
        self.heart_beat_ack_timer = None		#心跳应答超时定时器
        self.write_success = True	  			#发送成功标志位
        self.write_ack_timer = None	  			#发送超时定时器
        self.last_write_msg = None
        self.media = {'flag':False, 'send_id':0}
        self._stream.set_close_callback(self.on_close)    
        self.read_message()    
        if Connection.lirc_air == None:
            Connection.lirc_air = LIRC("conf/lircd_air.conf")
            Connection.lirc_tv = LIRC("conf/tv.conf")
        print("New connection: %s, " % address[0])
		
        Connection.do_OnOff()
		
        Connection.do_disarming_timer = threading.Timer(0.1, Connection.do_disarming)#延时0.1秒输出
        Connection.do_disarming_timer.start()
        #Connection.do_disarming()#根据场景模式撤防、布防处理
		
        self.heart_beat_timer = threading.Timer(10, self.heart_beat)#10秒心跳输出
        self.heart_beat_timer.start()      
  
    def read_message(self):    
        self._stream.read_bytes(1024, self.doRecv, partial=True)

    def set_dev_item(dev_id, ip, status):
        if _DEVICE_.get(dev_id) == None:
            return
		
        for id in _DEVICE_[dev_id]:
            if _DEVICE_[dev_id][id].get('status') and _DEVICE_[dev_id][id].get('ip') and _DEVICE_[dev_id][id]['ip'] == ip:
                _DEVICE_[dev_id][id]['status'] = status
				
        Connection.do_alert(dev_id, ip, status)
				
    def check_status(dev_id): 
        if dev_id == 'flammable' or dev_id == 'fire':
            key_status = 'alert'
        elif dev_id == 'ir_in':
            key_status = 'alert'
        elif dev_id == 'door' or dev_id == 'window':
            key_status = 'open'
			
        for id in _DEVICE_[dev_id].keys():
            if not _DEVICE_[dev_id][id].get('ip'):
                continue

            sock = Connection.is_online(_DEVICE_[dev_id][id]['ip'])

            if sock and _DEVICE_[dev_id][id]['status'].find(key_status) != -1:
                return True
				
        return False
					
    def do_alert(dev_id, ip, status):
        if _DEVICE_.get(dev_id) == None:
            return
			
		
			
        msg = "{\"event\":\"alert\", \"dev_id\":\"all\", \"status\":\"security\"}"
        if (((dev_id == 'flammable' or dev_id == 'fire') and status == 'alert') or (dev_id == 'ir_in' and status == 'alert') or ((dev_id == 'door' or dev_id == 'window') and status == 'open')):
            msg = "{\"event\":\"alert\", \"dev_id\":\"%s\", \"status\":\"%s\"}" %(dev_id, status)	
        else:
            if Connection.check_status('flammable'):
                msg = "{\"event\":\"alert\", \"dev_id\":\"%s\", \"status\":\"%s\"}" %('flammable', 'alert')	
            elif Connection.check_status('fire'):
                msg = "{\"event\":\"alert\", \"dev_id\":\"%s\", \"status\":\"%s\"}" %('fire', 'alert')	
            elif Connection.check_status('ir_in'):
                msg = "{\"event\":\"alert\", \"dev_id\":\"%s\", \"status\":\"%s\"}" %('ir_in', 'alert')	
            elif Connection.check_status('door'):
                msg = "{\"event\":\"alert\", \"dev_id\":\"%s\", \"status\":\"%s\"}" %('door', 'open')	
            elif Connection.check_status('window'):
                msg = "{\"event\":\"alert\", \"dev_id\":\"%s\", \"status\":\"%s\"}" %('window', 'open')	
			
        #print("\ndo_alert: %s" %msg)
		
        for id in _DEVICE_['alert'].keys():
            if not _DEVICE_['alert'][id].get('ip'):
                continue

            sock = Connection.is_online(_DEVICE_['alert'][id]['ip'])
			
            if sock:
                sock.time_tick = time.time()
                if sock.timer:
                    sock.timer.cancel()
                    sock.timer = None
                try:
                    sock.do_write(msg)
                except:
                    logging.error('Error sending message', exc_info=True)		
        '''
        if dev_id == 'humiture':#温湿度超过设定最大最小值
            pos = status.find(':')
            if pos != -1:
                temperature = status[0:pos]
                humidity = status[pos+1:]
                if type(eval(temperature)) == float and type(eval(humidity)) == float:
                    for id in _DEVICE_[dev_id]:
                        if _DEVICE_[dev_id][id]['ip'] == ip and (float(temperature)>_DEVICE_[dev_id][id]['t_max'] or float(temperature)<_DEVICE_[dev_id][id]['t_min'] or float(humidity)>_DEVICE_[dev_id][id]['h_max'] or float(humidity)<_DEVICE_[dev_id][id]['h_min']):
                            pass
        elif dev_id == 'flammable' or dev_id == 'fire':#燃气、火警报警处理
            pass
        elif (dev_id == 'door' or dev_id == 'window') and status == 'open':#门、窗非法打开报警处理
            pass
        elif dev_id == 'ir_in' and status == 'alert':#红外报警处理
            pass
        '''	

		
    def doRecv(self, data):    
        if len(data) == 0:
            self.on_close()
            return

        if Connection.close_timer and Connection.close_ip == self._address[0]:
            Connection.close_timer.cancel()	
            Connection.close_timer = None

        if isinstance(data, (bytes)):
            data = data[:].decode('utf-8') 
 
        if data[:].find('{') == 0 and (data[:].find('}') == len(data[:])-1 or data[:].find('}') == len(data[:])-2):
            obj = json.loads(data[:]) 
            if obj:
                if obj.get('event') != 'heart_beat':
                    print("recv from %s: %s" % (self._address[0], data[:]))
					
                if obj.get('event') == 'report':    
                    Connection.set_dev_item(obj['dev_id'], self._address[0], obj['status'])
                    WebSocket.broadcast_the_device(obj['dev_id']);
                    #print("recv from %s: %s" % (self._address[0], data[:])) 
                elif obj.get('event') == 'ack':    
                    if self.media['flag']:#dev_id.find('media') != -1:
                        self.heart_beat_ack = True
                        mymedia.time_tick = time.time()
                        if self.heart_beat_ack_timer:
                            self.heart_beat_ack_timer.cancel()
                            self.heart_beat_ack_timer = None
                    else:
                        WebSocket.broadcast_messages(data[:]);
                    #print("recv from %s: %s" % (self._address[0], data[:]))  
                elif obj.get('event') == 'heart_beat':    
                    pass
                elif obj.get('event') == 'asr' and obj.get('data') and len(obj.get('data'))<3:    #语音识别
                    asr.do_recv(obj['data'])
                elif obj.get('event') == 'gesture' and obj.get('data'):    #手势识别
                    asr.do_recv(obj['data'], self._address[0])
					
                self.heart_beat_ack = True  #print("recv from2 %s: %s" % (self._address[0], data[:]))  
                if self.heart_beat_ack_timer:
                    self.heart_beat_ack_timer.cancel()
                    self.heart_beat_ack_timer = None
        else:
            print("recv from %s: %s" % (self._address[0], data[:]))  

        self.read_message()
		
    def do_write_callback(self):
        self.write_success = True

		
    def do_write_overtime(self):
        self.write_ack_timer = None
        #self.write_success = True
        if self.last_write_msg:
            self.do_write(self.last_write_msg)

		
    def do_write(self, msg):
        if self._stream.closed():
            self.on_close()
            return
        elif self.write_success:
            self._stream.write(msg.encode(), self.do_write_callback)
            self.write_success = False
            self.last_write_msg = None
        else:
            self.last_write_msg = msg

            if self.write_ack_timer:
                self.write_ack_timer.cancel()			
            self.write_ack_timer = threading.Timer(0.5, self.do_write_overtime)#发送超时处理
            self.write_ack_timer.start()

    def stop(): 
        Connection.stop_flag = True
        if Connection.close_timer:
            Connection.close_timer.cancel()
			
        for conn in Connection.clients:
            if conn.timer != None:
                conn.timer.cancel()
            if conn.heart_beat_timer != None:
                conn.heart_beat_timer.cancel()
            if conn.heart_beat_ack_timer != None:
                conn.heart_beat_ack_timer.cancel()
            if conn.write_ack_timer != None:
                conn.write_ack_timer.cancel()

	
    def do_OnOff(): 
        Connection.check_online('flammable')
        Connection.check_online('humiture')
        Connection.check_online('fire')
        Connection.check_online('ir_in')
        Connection.check_online('door')
        Connection.check_online('window')
        #Connection.perform_save();
        WebSocket.broadcast_device()
		
    def on_close(self):    
        if self not in Connection.clients:
            return
			
        Connection.clients.remove(self)    
        if self.timer != None:
            self.timer.cancel()
        if self.heart_beat_timer != None:
            self.heart_beat_timer.cancel()
        if self.heart_beat_ack_timer != None:
            self.heart_beat_ack_timer.cancel()
        if self.write_ack_timer != None:
            self.write_ack_timer.cancel()
			
        print("%s closed, connection num %d" % (self._address[0], len(Connection.clients)))  


        if Connection.close_timer:
            Connection.close_timer.cancel()	
            Connection.close_timer = None
        Connection.close_timer = threading.Timer(2, self.doClose)
        Connection.close_timer.start()
		
    def doClose(self):    
        if Connection.close_timer:
            Connection.close_timer.cancel()	
            Connection.close_timer = None

        mode = GlobalVar.get_mode()
        for k,v in _DEVICE_['lamp'].items():#当连接断开后，需要将设备的状态设为off,并广播到客户端同步
            if v.get('ip') == self._address[0]:
                _LAMP_[mode][k]['status'] = 'off'
				
        for k,v in _DEVICE_['curtain'].items():#当连接断开后，需要将设备的状态设为off,并广播到客户端同步
            if v.get('ip') == self._address[0]:
                _CURTAIN_[mode][k]['status'] = 'close'
				
        for k,v in _DEVICE_['plugin'].items():#当连接断开后，需要将设备的状态设为off,并广播到客户端同步
            if v.get('ip') == self._address[0]:
                _PLUGIN_[mode][k]['status'] = 'off'

        Connection.do_OnOff()
        WebSocket.broadcast_lamp_status()
        WebSocket.broadcast_curtain_status()
        WebSocket.broadcast_plugin_status()
	
	#媒体信号特殊处理
    def output_media(self, ip, pin, key, value):
        if not self.heart_beat_ack and value != '000000':
            #print('media last send_id:%d' %self.media['send_id'])
            return

        self.media['flag'] = True
        self.media['send_id'] = (self.media['send_id']+1)%100
        msg = "{\"event\":\"msg\", \"dev_id\":\"media\", \"send_id\":\"%d\", \"pin\":\"%s\", \"%s\":\"%s\"}" %(self.media['send_id'], pin, key, value)
        try:
            self.do_write(msg)
        except:
            logging.error('Error sending message', exc_info=True)	

        mymedia.time_tick = time.time()
        self.heart_beat_ack = False
        if self.heart_beat_ack_timer:
            self.heart_beat_ack_timer.cancel()
        self.heart_beat_ack_timer = threading.Timer(3, self.heart_beat_overtime)#5秒心跳应答超时处理
        self.heart_beat_ack_timer.start()
			
    def output(self, dev_id, ip, pin, key, value, item):
        if dev_id.find('tv') != -1 and time.time() - self.time_tick < 0.5 and Connection.last_param and Connection.lirc_tv.remote.get('repeat') and Connection.last_param["value"] == value and Connection.last_param["ip"] == ip:#电视连续按键处理
            param = {"dev_id": dev_id, "ip": ip, "pin": pin, "key": key, "value": "repeat", "item": item}
        else:
            param = {"dev_id": dev_id, "ip": ip, "pin": pin, "key": key, "value": value, "item": item}
            if dev_id.find('tv') != -1:
                Connection.last_param = param
			
        self.q.put(param)  #如果前端等待终端应答后再发送命令，原则上命令队列里永远只有一个，否则会有若干个
		
        if self.timer:
            self.timer.cancel()
            self.timer = None
			
        #输出优化处理，当单位时间内输出很多信息到ESP时，ESP会挂掉，所以这里用定时器做过滤处理，每秒顶多输出10个信息（0.1秒定时）
        if time.time() - self.time_tick > 2 or (time.time() - self.time_tick > 0.5 and self.q.qsize() == 1):
            if dev_id.find('tv') != -1 and value.isdigit() and int(value) >=0 and int(value)<=9:#如果是电视的首个数字键则延时0.5秒，否则第二个数字键来不及按被误当作两个独立的按键输出
                self.timer = threading.Timer(0.5, self.output_ex)
                self.timer.start()
            else:
                self.output_ex()

        else :
            self.timer = threading.Timer(0.1, self.output_ex)#延时0.1秒输出
            self.timer.start()
	
    def output_ex(self):
        self.time_tick = time.time()
        if self.timer:
            self.timer.cancel()
            self.timer = None

        param = self.q.get()
        if param == None:
            return;

        self.timer = threading.Timer(0.1, self.output_ex)#延时0.1秒输出
        self.timer.start()
        dev_id = param['dev_id']
        ip = param['ip']
        pin = param['pin']
        key = param['key']
        value = param['value']
        if dev_id.find('lamp') != -1:
            color = RPi_GPIO.get_colors(param['item'])#{'r' : 50, 'g' : 50, 'b' : 50} 转为'7f7f7f'字符串
            msg = "{\"event\":\"msg\", \"dev_id\":\"%s\", \"pin\":\"%s\", \"%s\":\"%s\", \"color\":\"%s\"}" %(dev_id, pin, key, value, color)
        elif dev_id.find('curtain') != -1:
            msg = "{\"event\":\"msg\", \"dev_id\":\"%s\", \"pin\":\"%s\", \"%s\":\"%s\"}" %(dev_id, pin, key, value)
        elif dev_id.find('plugin') != -1:
            msg = "{\"event\":\"msg\", \"dev_id\":\"%s\", \"pin\":\"%s\", \"%s\":\"%s\"}" %(dev_id, pin, key, value)
        elif dev_id.find('media') != -1:
            msg = "{\"event\":\"msg\", \"dev_id\":\"%s\", \"send_id\":\"%d\", \"pin\":\"%s\", \"%s\":\"%s\"}" %(dev_id, self.media['send_id'], pin, key, value)
        elif dev_id.find('air_conditioner') != -1:#command 可能的值：power_on、power_off、temp_inc、temp_dec、mode_heat~mode_health、speed_x、up_down_swept、left_right_swept
            LIRC_KEY = None
            if value == 'power_on' or value == 'power_off':
                LIRC_KEY = 'KEY_POWER'
            elif value == 'temp_inc':
                LIRC_KEY = 'KEY_UP'
            elif value == 'temp_dec':
                LIRC_KEY = 'KEY_DOWN'
            elif value.find('mode_') != -1:
                LIRC_KEY = 'KEY_MODE'
            elif value.find('speed_') != -1:
                LIRC_KEY = 'KEY_VOLUMEUP'
            elif value.find('up_down_swept_') != -1:
                LIRC_KEY = 'KEY_DOWN'
            elif value.find('left_right_swept_') != -1:
                LIRC_KEY = 'KEY_RIGHT'

            value = Connection.lirc_air.getKey(LIRC_KEY) if LIRC_KEY else None
            is_raw = Connection.lirc_air.is_raw()
            
            if value == None:
                print('%s is not find the key %s in this lircd.conf file!!!!!!!!' %(value, LIRC_KEY))
                return

            msg = "{\"event\":\"msg\", \"dev_id\":\"%s\", \"data\":\"%s\", \"is_raw\":\"%d\"}" %(dev_id, value, is_raw)
        elif dev_id.find('tv') != -1:#command 可能的值：power_on、power_off、vol_inc、vol_dec、prog_inc、prog_dec、mute、av/tv、home、back、view
            LIRC_KEY = None
            if value == 'power_on' or value == 'power_off':
                LIRC_KEY = 'KEY_POWER'
            elif value == 'vol_up':
                LIRC_KEY = 'KEY_VOLUMEUP'
            elif value == 'vol_down':
                LIRC_KEY = 'KEY_VOLUMEDOWN'
            elif value == 'channel_up':
                LIRC_KEY = 'KEY_CHANNELDOWN'
            elif value == 'channel_down':
                LIRC_KEY = 'KEY_CHANNELUP'
				
            elif value == 'right':
                LIRC_KEY = 'KEY_RIGHT'
            elif value == 'down':
                LIRC_KEY = 'KEY_DOWN'
            elif value == 'left':
                LIRC_KEY = 'KEY_LEFT'
            elif value == 'up':
                LIRC_KEY = 'KEY_UP'
				
            elif value == 'ok':
                LIRC_KEY = 'KEY_OK'
            elif value == 'mute':
                LIRC_KEY = 'KEY_MUTE'
            elif value == 'av/tv':
                LIRC_KEY = 'KEY_TV'
            elif value == 'home':
                LIRC_KEY = 'KEY_HOME'
            elif value == 'back':
                LIRC_KEY = 'KEY_BACK'
            elif value.isdigit() and int(value) >=0 and int(value)<=9:
                LIRC_KEY = 'KEY_' + value
            else:
                print('value:%s' %(value))
                return
				
            is_raw = Connection.lirc_tv.is_raw()
            if value.find('repeat') != -1:#电视连续按键处理
                value = Connection.lirc_tv.remote['repeat'].replace('  ', ' ')
            else:#非连续按键
                value = Connection.lirc_tv.getKey(LIRC_KEY) if LIRC_KEY else None

                if value == None:
                    print('%s is not find the key %s in this lircd.conf file!!!!!!!!' %(value, LIRC_KEY))
                    return
            msg = "{\"event\":\"msg\", \"dev_id\":\"%s\", \"data\":\"%s\", \"is_raw\":\"%d\"}" %(dev_id, value, is_raw)
        #print(msg)

        try:
            self.do_write(msg)
        except:
            logging.error('Error sending message', exc_info=True)	
		
    def check_online(dev_id): 
        for id in _DEVICE_[dev_id].keys():
            if not _DEVICE_[dev_id][id].get('ip'):
                continue

            sock = Connection.is_online(_DEVICE_[dev_id][id]['ip'])

            if sock:
                _DEVICE_[dev_id][id]['online'] = 1
            else:
                _DEVICE_[dev_id][id]['online'] = 0
            print('dev_id:%s, id:%s, ip:%s, online:%d' %(dev_id, id, _DEVICE_[dev_id][id]['ip'], _DEVICE_[dev_id][id]['online']))
		
    def is_online(ip): 
        for conn in Connection.clients:
            if conn._address[0].find(ip) != -1:
                return conn
        return None
		
    def is_disarming(): 
        Disarming = 'false'
        mode = GlobalVar.get_mode()
        if "normal" == mode or "guests" == mode or "diner" == mode:#在‘回家’、‘会客’、‘用餐’场景模式下撤防，其它场景模式下布防
            Disarming = 'true'
        return Disarming
			
    def do_disarming(): 
        Connection.do_disarming_timer = None

        msg = "{\"event\":\"disarming\", \"data\":\"%s\", \"mode\":\"%s\"}" %(Connection.is_disarming(), GlobalVar.get_mode())

        for conn in Connection.clients:
            try:
                conn.do_write(msg)
            except:
                logging.error('Error sending message', exc_info=True)	
				
	#收到心跳包应答超时处理
    def heart_beat_overtime(self):
        self.heart_beat_ack_timer = None
        if not self.heart_beat_ack:
            self.heart_beat_ack = True
            #print('heart_beat has no ack: %s!' %Connection.last_heart_beat_msg)
		
    #发送心跳包到ESP,因为ESP断电后socket服务检测不到socket断开的动作，这里通过发送心跳检测客户端socket是否已经断开	
    def heart_beat(self):
        if not self.stop_flag:
            self.heart_beat_timer = threading.Timer(10, self.heart_beat)#10秒心跳输出
            self.heart_beat_timer.start()

        if time.time() - self.time_tick > 10:
            msg = "{\"event\":\"heart_beat\", \"time\":\"%d\"}" %time.time()
            Connection.last_heart_beat_msg = msg

            try:
                if self.heart_beat_ack:
                    self.do_write(msg)
                    self.heart_beat_ack = False
                    if self.heart_beat_ack_timer:
                        self.heart_beat_ack_timer.cancel()
                    self.heart_beat_ack_timer = threading.Timer(3, self.heart_beat_overtime)#5秒心跳应答超时处理
                    self.heart_beat_ack_timer.start()
                #print(msg)
            except:
                logging.error('Error sending message', exc_info=True)	

class SocketServer(TCPServer):    
    def handle_stream(self, stream, address):   
        Connection(stream, address)   
        print("connection num is:", len(Connection.clients))