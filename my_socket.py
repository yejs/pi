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

import threading
import time
from my_gpio import RPi_GPIO
from my_websocket import WebSocket
#from myhandler import WebHandler
from lirc import LIRC
from data.data import *
from data.g_data import GlobalVar
from data.asr import asr
import types 

class Connection(object):    
    do_disarming_timer = None
    heart_beat_timer = None
    close_timer = None	  				#关闭超时定时器
    close_ip = None
    clients = set()    
    output_param = list()#{"ip": "", "pin": "", "item": None}
    last_heart_beat_msg = None
    time_tick = 0
    timer = None
    lirc_air = None
    lirc_tv = None
    sock = None #声明一个socket全局变量，否则调用Connection.output时会有断言错误 assert isinstance
    last_param = None
    def __init__(self, stream, address):   
        Connection.sock = self
        Connection.clients.add(self)   
        self._stream = stream    
        self._address = address    
        self.heart_beat_ack = True    			#心跳应答标志位
        self.heart_beat_ack_timer = None		#心跳应答超时定时器
        self.write_success = True	  			#发送成功标志位
        self.write_ack_timer = None	  			#发送超时定时器
        self.last_write_msg = None
        self._stream.set_close_callback(self.on_close)    
        self.read_message()    
        if Connection.lirc_air == None:
            Connection.lirc_air = LIRC("conf/lircd_air.conf")
            Connection.lirc_tv = LIRC("conf/tv.conf")
        print("New connection: %s, " % address[0])
		
        Connection.timer = threading.Timer(0.1, Connection.do_disarming)#延时0.1秒输出
        Connection.timer.start()
        #Connection.do_disarming()#根据场景模式撤防、布防处理
		
        if None == Connection.heart_beat_timer:
            Connection.heart_beat()             
  
    def read_message(self):    
        self._stream.read_bytes(1024, self.doRecv, partial=True)

    def set_dev_item(dev_id, ip, status):
        if _DEVICE_.get(dev_id) == None:
            return
			
        if dev_id == 'humiture':#温湿度超过设定最大最小值
            pos = status.find(':')
            if pos != -1:
                temperature = status[0:pos]
                humidity = status[pos+1:]
                if type(eval(temperature)) == float and type(eval(humidity)) == float:
                    for id in _DEVICE_[dev_id]:
                        if _DEVICE_[dev_id][id]['ip'] == ip and (float(temperature)>_DEVICE_[dev_id][id]['t_max'] or float(temperature)<_DEVICE_[dev_id][id]['t_min'] or float(humidity)>_DEVICE_[dev_id][id]['h_max'] or float(humidity)<_DEVICE_[dev_id][id]['h_min']):
                            pass
        elif (dev_id == 'flammable' or dev_id == 'fire') and status == 'alert':#燃气、火警报警处理
            pass
        elif dev_id == 'door' and status == 'open':#门、窗非法打开报警处理
            pass
			
        for id in _DEVICE_[dev_id]:
            if _DEVICE_[dev_id][id].get('status') and _DEVICE_[dev_id][id].get('ip') and _DEVICE_[dev_id][id]['ip'] == ip:
                _DEVICE_[dev_id][id]['status'] = status
				
				

		
    def doRecv(self, data):    
        if len(data) == 0:
            self.on_close()
            return

        if Connection.close_timer and Connection.close_ip == self._address[0]:
            Connection.close_timer.cancel()	
            Connection.close_timer = None
			
        if isinstance(data, (bytes)):
            data = data[:].decode() 
        if data[:].find('{') == 0 and (data[:].find('}') == len(data[:])-1 or data[:].find('}') == len(data[:])-2):
            obj = json.loads(data[:]) 
            if obj:
                if obj.get('event') == 'report':    
                    Connection.set_dev_item(obj['dev_id'], self._address[0], obj['status'])
                    WebSocket.broadcast_the_device(obj['dev_id']);
                    self.do_write("{\"event\":\"ack\"}")
                    #print("recv from %s: %s" % (self._address[0], data[:])) 
                elif obj.get('event') == 'ack':    
                    WebSocket.broadcast_messages(data[:]);
                    #print("recv from %s: %s" % (self._address[0], data[:]))  
                elif obj.get('event') == 'heart_beat':    
                    self.heart_beat_ack = True  #print("recv from2 %s: %s" % (self._address[0], data[:]))  
                    if self.heart_beat_ack_timer:
                        self.heart_beat_ack_timer.cancel()
                        self.heart_beat_ack_timer = None
                elif obj.get('event') == 'asr' and obj.get('data'):    #语音识别
                    asr.do_recv(obj['data'])
        else:
            print("recv from %s: %s" % (self._address[0], data[:]))  

        self.read_message()
		
    def do_write_callback(self):
        self.write_success = True

		
    def do_write_overtime(self):
        self.write_success = True
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
		
    def on_close(self):    
        if self not in Connection.clients:
            return
        Connection.clients.remove(self)    
        Connection.close_ip = self._address[0]
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

        WebSocket.broadcast_lamp_status()
        WebSocket.broadcast_curtain_status()
        WebSocket.broadcast_plugin_status()
	
    def check_output():
        l = len(Connection.output_param)
        if l > 20:
            Connection.output_param = Connection.output_param[l-4:-1]
			
    def output(self, dev_id, ip, pin, key, value, item):
        if dev_id.find('tv') != -1 and time.time() - Connection.time_tick < 0.5 and Connection.last_param and Connection.lirc_tv.remote.get('repeat') and Connection.last_param["value"] == value and Connection.last_param["ip"] == ip:#电视连续按键处理
            param = {"dev_id": dev_id, "ip": ip, "pin": pin, "key": key, "value": "repeat", "item": item}
        else:
            param = {"dev_id": dev_id, "ip": ip, "pin": pin, "key": key, "value": value, "item": item}
            if dev_id.find('tv') != -1:
                Connection.last_param = param
			
        Connection.output_param.append(param)  #如果前端等待终端应答后再发送命令，原则上命令队列里永远只有一个，否则会有若干个
		
        if Connection.timer:
            Connection.timer.cancel()
            Connection.timer = None
			
        #输出优化处理，当单位时间内输出很多信息到ESP时，ESP会挂掉，所以这里用定时器做过滤处理，每秒顶多输出10个信息（0.1秒定时）
        if time.time() - Connection.time_tick > 2 or (time.time() - Connection.time_tick > 0.5 and len(Connection.output_param) == 1):
            if dev_id.find('tv') != -1 and value.isdigit() and int(value) >=0 and int(value)<=9:#如果是电视的首个数字键则延时0.5秒，否则第二个数字键来不及按被误当作两个独立的按键输出
                Connection.timer = threading.Timer(0.5, Connection.output_ex)
                Connection.timer.start()
            else:
                Connection.output_ex()

        else :
            Connection.timer = threading.Timer(0.1, Connection.output_ex)#延时0.1秒输出
            Connection.timer.start()

    def front(sets):
        if len(sets) == 0:
            return None;
		
        for param in sets:
            sets.remove(param)
            return param
			
    def output_ex():
        Connection.time_tick = time.time()
        if Connection.timer:
            Connection.timer.cancel()
            Connection.timer = None
			
        #param = Connection.output_param.pop()
        param = Connection.front(Connection.output_param)
        if param == None:
            return;

        Connection.timer = threading.Timer(0.1, Connection.output_ex)#延时0.1秒输出
        Connection.timer.start()
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

        conn = Connection.is_online(ip)
        if conn:
            try:
                conn.do_write(msg)
            except:
                logging.error('Error sending message', exc_info=True)	
					
    def is_online(ip): 
        for conn in Connection.clients:
            if conn._address[0].find(ip) != -1:
                return conn
        return None
		
    def do_disarming(): 
        Connection.do_disarming_timer = None
        Disarming = 'false'
        mode = GlobalVar.get_mode()
        if "normal" == mode or "guests" == mode or "diner" == mode:#在‘回家’、‘会客’、‘用餐’场景模式下撤防，其它场景模式下布防
            Disarming = 'true'

        msg = "{\"event\":\"disarming\", \"data\":\"%s\", \"mode\":\"%s\"}" %(Disarming, mode)

        for conn in Connection.clients:
            try:
                conn.do_write(msg)
            except:
                logging.error('Error sending message', exc_info=True)	
				
	#收到心跳包应答超时处理
    def heart_beat_overtime(self):
        if not self.heart_beat_ack:
            self.heart_beat_ack = True
            #print('heart_beat has no ack: %s!' %Connection.last_heart_beat_msg)
		
    #发送心跳包到ESP,因为ESP断电后socket服务检测不到socket断开的动作，这里通过发送心跳检测客户端socket是否已经断开	
    def heart_beat():
        if Connection.heart_beat_timer != None:
            Connection.heart_beat_timer.cancel()
        Connection.heart_beat_timer = threading.Timer(10, Connection.heart_beat)#10秒心跳输出
        Connection.heart_beat_timer.start()

        if time.time() - Connection.time_tick > 10:
            msg = "{\"event\":\"heart_beat\", \"time\":\"%d\"}" %time.time()
            Connection.last_heart_beat_msg = msg
            for conn in Connection.clients:
                try:
                    if conn.heart_beat_ack:
                        conn.do_write(msg)
                        conn.heart_beat_ack = False
                        if conn.heart_beat_ack_timer:
                            conn.heart_beat_ack_timer.cancel()
                        conn.heart_beat_ack_timer = threading.Timer(3, conn.heart_beat_overtime)#5秒心跳应答超时处理
                        conn.heart_beat_ack_timer.start()
                    #print(msg)
                except:
                    logging.error('Error sending message', exc_info=True)	
				
class SocketServer(TCPServer):    
    def handle_stream(self, stream, address):   
        Connection(stream, address)   
        print("connection num is:", len(Connection.clients))