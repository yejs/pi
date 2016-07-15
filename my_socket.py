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
from data import _DEVICE_, _LAMP_ , _CURTAIN_, _AIR_CONDITIONER_, _TV_
from g_data import GlobalVar

class Connection(object):    
    heart_beat_init = False
    heart_beat_timer = None
    clients = set()    
    output_param = list()#{"ip": "", "pin": "", "item": None}
    time_tick = 0
    timer = None
    lirc_air = None
    lirc_tv = None
    sock = None #声明一个socket全局变量，否则调用Connection.output时会有断言错误 assert isinstance
    def __init__(self, stream, address):   
        Connection.sock = self
        Connection.clients.add(self)   
        self._stream = stream    
        self._address = address    
        self._stream.set_close_callback(self.on_close)    
        self.read_message()    
        if Connection.lirc_air == None:
            Connection.lirc_air = LIRC("lircd.conf")
            Connection.lirc_tv = LIRC("lircd.conf")
        print("New connection: %s, " % address[0])

        if False == Connection.heart_beat_init:
            Connection.heart_beat_init = True
            Connection.heart_beat()
  
    def read_message(self):    
        self._stream.read_bytes(1024, self.doRecv, partial=True)

    def doRecv(self, data):    
        obj = json.loads(data[:-1].decode())
        if obj and obj.get('event') == 'report':    
            set_dev_item(obj['dev_id'], self._address[0], obj['status'])
            print("recv from %s: %s" % (self._address[0], data[:-1].decode()))   
            WebSocket.broadcast_device();
        #self._stream.write(data)  	
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
        for k,v in _DEVICE_['lamp'].items():#当连接断开后，需要将设备的状态设为off,并广播到客户端同步
            if v.get('ip') == self._address[0]:
                _LAMP_[mode][k]['status'] = 'off'
				
        for k,v in _DEVICE_['curtain'].items():#当连接断开后，需要将设备的状态设为off,并广播到客户端同步
            if v.get('ip') == self._address[0]:
                _CURTAIN_[mode][k]['status'] = 'close'

        WebSocket.broadcast_lamp_status()
        WebSocket.broadcast_curtain_status()
	
    def check_output():
        l = len(Connection.output_param)
        if l > 20:
            Connection.output_param = Connection.output_param[l-4:-1]
			
    def output(self, dev_id, ip, pin, key, value, item):
        param = {"dev_id": dev_id, "ip": ip, "pin": pin, "key": key, "value": value, "item": item}
        Connection.output_param.append(param)  

        if Connection.timer:
            Connection.timer.cancel()
        #输出优化处理，当单位时间内输出很多信息到ESP时，ESP会挂掉，所以这里用定时器做过滤处理，每秒顶多输出10个信息（0.1秒定时）
        if time.time() - Connection.time_tick > 2:
            Connection.output_ex()
        else :
            Connection.timer = threading.Timer(0.1, Connection.output_ex)#延时0.3秒输出
            Connection.timer.start()

    def output_ex():
        Connection.time_tick = time.time()
		
        if len(Connection.output_param) == 0:
            Connection.timer.cancel()
            Connection.timer = None
            return;

        Connection.timer = threading.Timer(0.1, Connection.output_ex)#延时0.3秒输出
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
        elif dev_id.find('air_conditioner') != -1:
            LIRC_KEY = None
            if key == 'power_on':
                LIRC_KEY = 'KEY_POWER'
            elif key == 'temp_inc' and value == 'true':
                LIRC_KEY = 'KEY_UP'
            elif key == 'temp_inc' and value == 'false':
                LIRC_KEY = 'KEY_DOWN'
            elif key == 'mode':
                LIRC_KEY = 'KEY_MODE'
            elif key == 'speed':
                LIRC_KEY = 'KEY_SPEED'
            elif key == 'up_down_swept':
                LIRC_KEY = 'KEY_KP0'
            elif key == 'left_right_swept':
                LIRC_KEY = 'KEY_KP1'
            value = Connection.lirc_air.getKey(LIRC_KEY) if LIRC_KEY else None
            if value == None:
                print('%s is not find the key %s in this lircd.conf file!!!!!!!!' %(key, LIRC_KEY))
                return
            msg = "{\"event\":\"msg\", \"dev_id\":\"ir\", \"data\":\"%s\", \"is_raw\":\"0\"}" %(value, )
        elif dev_id.find('tv') != -1:
            LIRC_KEY = None
            if key == 'power_on':
                LIRC_KEY = 'KEY_POWER'
            elif key == 'vol_inc' and value == 'true':
                LIRC_KEY = 'KEY_VOLUMEUP'
            elif key == 'vol_inc' and value == 'false':
                LIRC_KEY = 'KEY_VOLUMEDOWN'
            elif key == 'prog_inc' and value == 'true':
                LIRC_KEY = 'KEY_DOWN'
            elif key == 'prog_inc' and value == 'false':
                LIRC_KEY = 'KEY_UP'
            elif key == 'ok':
                LIRC_KEY = 'KEY_OK'
            elif key == 'mute':
                LIRC_KEY = 'KEY_MUTE'
            elif key == 'av/tv':
                LIRC_KEY = 'KEY_AV/TV'
            elif key == 'home':
                LIRC_KEY = 'KEY_HOME'
            elif key == 'back':
                LIRC_KEY = 'KEY_BACK'
            value = Connection.lirc_tv.getKey(LIRC_KEY) if LIRC_KEY else None
            if value == None:
                print('%s is not find the key %s in this lircd.conf file!!!!!!!!' %(key, LIRC_KEY))
                return
            msg = "{\"event\":\"msg\", \"dev_id\":\"ir\", \"data\":\"%s\", \"is_raw\":\"0\"}" %(value, )

        for conn in Connection.clients:
            if conn._address[0].find(ip) != -1:
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