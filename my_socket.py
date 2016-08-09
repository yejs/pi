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
from lirc import LIRC
from data import _DEVICE_, _LAMP_ , _CURTAIN_, _AIR_CONDITIONER_, _TV_, _PLUGIN_
from g_data import GlobalVar

class Connection(object):    
    heart_beat_timer = None
    clients = set()    
    output_param = list()#{"ip": "", "pin": "", "item": None}
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
        self._stream.set_close_callback(self.on_close)    
        self.read_message()    
        if Connection.lirc_air == None:
            Connection.lirc_air = LIRC("conf/lircd_air.conf")
            Connection.lirc_tv = LIRC("conf/tv.conf")
        print("New connection: %s, " % address[0])
        Connection.do_disarming()#根据场景模式撤防、布防处理
		
        if None == Connection.heart_beat_timer:
            Connection.heart_beat()             
  
    def test():    
        pass#print(json.dumps(_LAMP_['normal']['1']))
		
    def read_message(self):    
        self._stream.read_bytes(1024, self.doRecv, partial=True)

    def set_dev_item(dev_id, ip, status):   #TODO,08/09
        if _DEVICE_.get(dev_id) == None:
            return
			
        for id in _DEVICE_[dev_id]:
            if _DEVICE_[dev_id][id].get('status') and _DEVICE_[dev_id][id].get('ip') and _DEVICE_[dev_id][id]['ip'] == ip:
                _DEVICE_[dev_id][id]['status'] = status
        #print('set_dev_item, dev_id:%s, ip:%s, status:%s ' %(dev_id, ip, status))

    def doRecv(self, data):    
        if data[:-1].decode().find('{') != -1 and data[:-1].decode().find('}') != -1:
            obj = json.loads(data[:-1].decode()) 
            if obj and obj.get('event') == 'report':    
                Connection.set_dev_item(obj['dev_id'], self._address[0], obj['status'])
                WebSocket.broadcast_device();
            elif obj and obj.get('event') == 'ack':    
                WebSocket.broadcast_messages(data[:-1].decode());
                print("recv from2 %s: %s" % (self._address[0], data[:-1].decode()))  
        else:
            pass#print("recv from %s: %s" % (self._address[0], data[:-1].decode()))  
        self.read_message()
		
    '''
    def broadcast_messages(self, data):    
        print("recv from %s: %s" % (self._address[0], data[:-1].decode()))  
        for conn in Connection.clients:    
            conn._stream.write(data)  	
    '''
    def on_close(self):    
        Connection.clients.remove(self)    
        print("%s closed, connection num %d" % (self._address[0], len(Connection.clients)))  
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
            Connection.last_param = param
			
        Connection.output_param.append(param)  #如果前端等待终端应答后再发送命令，原则上命令队列里永远只有一个，否则会有若干个
		

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

    def output_ex():
        Connection.time_tick = time.time()
		
        if len(Connection.output_param) == 0:
            Connection.timer.cancel()
            Connection.timer = None
            return;

        if Connection.timer:
            Connection.timer.cancel()
        Connection.timer = threading.Timer(0.1, Connection.output_ex)#延时0.1秒输出
        Connection.timer.start()
        param = Connection.output_param.pop()
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
				
            if value.find('repeat') != -1:#电视连续按键处理
                value = Connection.lirc_tv.remote['repeat'].replace('  ', ' ')
                msg = "{\"event\":\"msg\", \"dev_id\":\"%s\", \"data\":\"%s\", \"is_raw\":\"%d\"}" %(dev_id, value, True)
            else:#非连续按键
                value = Connection.lirc_tv.getKey(LIRC_KEY) if LIRC_KEY else None
                is_raw = Connection.lirc_tv.is_raw()
			
                if value == None:
                    print('%s is not find the key %s in this lircd.conf file!!!!!!!!' %(value, LIRC_KEY))
                    return
                msg = "{\"event\":\"msg\", \"dev_id\":\"%s\", \"data\":\"%s\", \"is_raw\":\"%d\"}" %(dev_id, value, is_raw)
        #print(msg)
        for conn in Connection.clients:
            if conn._address[0].find(ip) != -1:
                try:
                    conn._stream.write(msg.encode())
                except:
                    logging.error('Error sending message', exc_info=True)	
					
    def do_disarming(): 
        Disarming = 'false'
        mode = GlobalVar.get_mode()
        if "normal" == mode or "guests" == mode or "diner" == mode:#在‘回家’、‘会客’、‘用餐’场景模式下撤防，其它场景模式下布防
            Disarming = 'true'

        msg = "{\"event\":\"disarming\", \"data\":\"%s\"}" %Disarming

        for conn in Connection.clients:
            try:
                conn._stream.write(msg.encode())
            except:
                logging.error('Error sending message', exc_info=True)	
				
    #发送心跳包到ESP,因为ESP断电后socket服务检测不到socket断开的动作，这里通过发送心跳检测客户端socket是否已经断开	
    def heart_beat():
        if Connection.heart_beat_timer != None:
            Connection.heart_beat_timer.cancel()
        Connection.heart_beat_timer = threading.Timer(5, Connection.heart_beat)#5秒心跳输出
        Connection.heart_beat_timer.start()

        msg = "{\"event\":\"heart_beat\"}"

        for conn in Connection.clients:
            try:
                conn._stream.write(msg.encode())
            except:
                logging.error('Error sending message', exc_info=True)	
				
class SocketServer(TCPServer):    
    def handle_stream(self, stream, address):   
        Connection(stream, address)   
        print("connection num is:", len(Connection.clients))