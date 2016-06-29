#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 命令处理模块 
"""
__author__ = 'yejs'
__version__ = '1.0'

__all__ = ["WebHandler", "RPi_GPIO"]

import os
#import RPi.GPIO as GPIO
import tornado.web
import tornado.websocket
from tornado.tcpserver import TCPServer 
import json
import base64
import urllib
import logging
from data import _DEVICE_, _LAMP_ 
import threading
import time

sock = None #声明一个socket全局变量，否则调用Connection.output时会有断言错误 assert isinstance
mode = 'normal'
id = '1'
dev_id = 'lamp'

class RPi_GPIO():
	_is_exist = False;
	
	def is_exist(modules, module): 
		for m in modules:
			if m == module:
				return True;
		return False;
		
	def init(modules):
		if RPi_GPIO.is_exist(modules, 'GPIO'):
			print ("RPi.GPIO init...")
			RPi_GPIO._is_exist = True
			GPIO.setmode(GPIO.BOARD)
			for k,v in _DEVICE_['lamp'].items():
				GPIO.setup(int(v['pin']), GPIO.OUT)
				GPIO.output(int(v['pin']), GPIO.HIGH)

	def cleanup():
		if RPi_GPIO._is_exist:
			GPIO.cleanup()
	
	def get_color(color):
		r = int('0x' + color[0:2], 16)
		g = int('0x' + color[2:4], 16)
		b = int('0x' + color[4:6], 16)
		return r, g, b
		
	def get_colors(item):
		r, g, b = int(item['color']['r']*255/100), int(item['color']['g']*255/100), int(item['color']['b']*255/100)
		color = hex(int(r/16))[2:] + hex(int(r%16))[2:] + hex(int(g/16))[2:] + hex(int(g%16))[2:] + hex(int(b/16))[2:] + hex(int(b%16))[2:]
		return color
		
	def output(pin, key, value):
		if RPi_GPIO._is_exist == False:
			return;

		if key == 'command':#开关指令
			if value == 'on':	
				command = False
			elif value == 'off':
				command = True
			GPIO.output(pin, command)
		elif key == 'color':#调光调色指令
			r, g, b = RPi_GPIO.get_color(value)
		#	GPIO.output(pin, value)

		
class Connection(object):    
    heart_beat_init = False
    timer = None
    clients = set()    
    output_param = {"ip": "", "pin": "", "item": None, "time_tick":0, "timer":None}
    def __init__(self, stream, address):   
        global sock
        sock = self
        Connection.clients.add(self)   
        self._stream = stream    
        self._address = address    
        self._stream.set_close_callback(self.on_close)    
        self.read_message()    
        print("New connection: %s, " % address[0])

        if False == Connection.heart_beat_init:
            Connection.heart_beat_init = True
            Connection.heart_beat()
  
    def read_message(self):    
        #self._stream.read_until('\n', self.broadcast_messages)    
        self._stream.read_bytes(1024, self.broadcast_messages, partial=True)

    def broadcast_messages(self, data):    
        print("recv from %s: %s" % (self._address[0], data[:-1].decode()))  
        for conn in Connection.clients:    
            conn.send_message(data)  	
        self.read_message()    
        
    def send_message(self, data):    
        self._stream.write(data)   
            
    def on_close(self):    
        Connection.clients.remove(self)    
        print("%s closed, connection num %d" % (self._address[0], len(Connection.clients)))  
        for k,v in _DEVICE_['lamp'].items():#当连接断开后，需要将设备的状态设为off,并广播到客户端同步
            if WebHandler.has_key('ip', v) and v['ip'] == self._address[0]:
                _LAMP_[mode][k]['status'] = 'off'

        WebSocket.broadcast_lamp_status()
		
    def output(self, ip, pin, item):
        Connection.output_param['ip'] = ip
        Connection.output_param['pin'] = pin
        Connection.output_param['item'] = item
        if Connection.output_param['timer']:
            Connection.output_param['timer'].cancel()
        #输出优化处理，当单位时间内输出很多信息到ESP时，ESP会挂掉，所以这里用定时器做过滤处理，每秒顶多输出10个信息（0.1秒定时）
        if time.time() - Connection.output_param['time_tick'] > 2:
            Connection.output_ex()
        else :
            Connection.output_param['timer'] = threading.Timer(0.3, Connection.output_ex)#延时0.3秒输出
            Connection.output_param['timer'].start()

    def output_ex():
        Connection.output_param['time_tick'] = time.time()
        Connection.output_param['timer'] = None
        msg = "{\"event\":\"msg\", \"pin\":\"%s\", \"status\":\"%s\", \"color\":\"%s\"}" %(Connection.output_param['pin'], Connection.output_param['item']['status'], RPi_GPIO.get_colors(Connection.output_param['item']))

        for conn in Connection.clients:
            if conn._address[0].find(Connection.output_param['ip']) != -1:
                try:
                    conn._stream.write(msg.encode())
                except:
                    logging.error('Error sending message', exc_info=True)	
		
    #发送心跳包到ESP,因为ESP断电后socket服务检测不到socket断开的动作，这里通过发送心跳检测客户端socket是否已经断开	
    def heart_beat():
        if Connection.timer != None:
            Connection.timer.cancel()
        Connection.timer = threading.Timer(5, Connection.heart_beat)#5秒心跳输出
        Connection.timer.start()
		
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
		
class WebSocket(tornado.websocket.WebSocketHandler):
    socket_handlers = set()
    def open(self):
        #print( "%s" % (self.request))#.method, self.request.uri, self.request.remote_ip))
        WebSocket.socket_handlers.add(self)
        WebSocket.broadcast_device()
        WebSocket.broadcast_lamp_status()
    def on_close(self):
        WebSocket.socket_handlers.remove(self)
    def on_message(self, message):
        WebSocket.broadcast_messages(message)
	
    def broadcast_messages(message):
        for handler in WebSocket.socket_handlers:
            try:
                handler.write_message(message)
            except:
                logging.error('Error sending message', exc_info=True)
				
    #向其它页面客户端广播状态消息(用于各客户端间同步，一个客户端发送命令，其它客户端同时此看到命令)
    def broadcast_device():
        global mode
        global id
        str1 = '{\"event\": \"device\", \"data\":'
        str1 += json.dumps(_DEVICE_)
        str1 += '}'

        WebSocket.broadcast_messages(str1) 
		
    def broadcast_lamp_status():
        global mode
        global id
        str1 = '{\"event\": \"lamp\", \"data\":'
        str1 += json.dumps(_LAMP_[mode])
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += id
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
class WebHandler(tornado.web.RequestHandler):
    def post(self, *args, **kwargs):
        global dev_id
        global id

        post_data = {}

        for key in self.request.arguments:
            post_data[key] = self.get_arguments(key)
			
        if WebHandler.has_key('dev_id', post_data) == True:
            dev_id = post_data['dev_id'][0]
        else :
            dev_id = 'lamp'
			
        if WebHandler.has_key('id', post_data):
            id = post_data['id'][0]
        else :
            id = '1'
        ''' 
        post 参数示例: /control?dev_id=lamp&id=1&command=on
        '''
        #print(json.dumps(post_data))
        if WebHandler.has_key('device_set', post_data):	#设定指令
            str1 = '{\"dev_id\":\"'+dev_id+'\", \"id\":\"'+post_data['id'][0]+'\", \"device_set\":'+post_data['device_set'][0]+'}'
        elif WebHandler.has_key('command', post_data):	#开关指令
            str1 = '{\"dev_id\":\"'+dev_id+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['command'][0]+'\"}'
        elif WebHandler.has_key('color', post_data):	#调光调色指令
            str1 = '{\"dev_id\":\"'+dev_id+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['color'][0]+'\"}'
        else :#模式指令
            str1 = '{\"dev_id\":\"'+dev_id + '\"}'
        			
        self.write(str1)#base64.encodestring(str1.encode('gbk')))#响应页面post请求（数据base64简单加密处理）

        if WebHandler.has_key('device_set', post_data) == False:
            if dev_id == 'lamp':
                WebHandler.lamp(post_data)
            elif dev_id == 'car':
                WebHandler.car(post_data) 
            timer = threading.Timer(5, WebHandler.perform_save)#延时5秒保存
            timer.start()
        elif WebHandler.has_key('device_set', post_data) == True:
            WebHandler.device_set(post_data)
            WebHandler.perform_save()

    def perform_save(): 
        f = open('data.py','w')            
        f.write('_DEVICE_ = ' + json.dumps(_DEVICE_) + '\n')  
        f.write('_LAMP_ = ' + json.dumps(_LAMP_) + '\n')  
        f.close
		
    def has_key(key, dict):
        for k in dict.keys():
            if k == key:
                return True;
        return False;
	
    #硬件层输出（GPIO 或 socket到硬件终端）
    def output(dev_id, id, key, value):
        global sock
		
        if dev_id == 'lamp':
            item = _LAMP_[mode][id]
        else:#TODO:其它设备待完成
            return;
			
        if key == 'command':#开关指令
            item['status'] = value
        elif key == 'color':#调光调色指令
            r, g, b = RPi_GPIO.get_color(value)
            item['color']['r'], item['color']['g'], item['color']['b'] = int(r*100/255 + 0.5), int(g*100/255 + 0.5), int(b*100/255 + 0.5)
            #print("get_colors: %s  %s  %d  %d" %(value, RPi_GPIO.get_colors(item), r, item['color']['r']))
        elif key == None:    #模式指令
            key = 'command'
            value = item['status']
			
        if WebHandler.has_key(id, _DEVICE_[dev_id]):
            if WebHandler.has_key('pin', _DEVICE_[dev_id][id]):
                RPi_GPIO.output(int(_DEVICE_[dev_id][id]['pin']), key, value)
			
            if sock != None and WebHandler.has_key('ip', _DEVICE_[dev_id][id]):
                sock.output(_DEVICE_[dev_id][id]['ip'], _DEVICE_[dev_id][id]['pin'], item)

		
    def lamp(post_data):
        global mode
        global id

        key = None
        value = None

        if WebHandler.has_key('command', post_data):#开关指令
            key = 'command'
        elif WebHandler.has_key('color', post_data):#调光调色指令
            key = 'color'

        if key != None:		
            value = post_data[key][0]
 	
        if WebHandler.has_key('mode', post_data):		
            mode = post_data['mode'][0]
        else:
            mode = "normal"
			
        if WebHandler.has_key(mode, _LAMP_) == False:		
            return
			
        if id == 'all' or key == None:
            for k in _LAMP_[mode].keys():
                WebHandler.output('lamp', k, key, value)

        WebHandler.output('lamp', id, key, value)

        #print("%s : %s" %(mode, json.dumps(_LAMP_[mode])))
        WebSocket.broadcast_lamp_status()
				
    def car(post_data):
        command = post_data['command'][0]
        _CAR_ = {'INT1':11, 'INT2':12, 'INT3':13, 'INT4':15}
        if command == 'front':
            RPi_GPIO.output(_CAR_['INT1'], True)
            RPi_GPIO.output(_CAR_['INT2'], False)
            RPi_GPIO.output(_CAR_['INT3'], True)
            RPi_GPIO.output(_CAR_['INT4'], False)
        elif command == 'back':
            RPi_GPIO.output(_CAR_['INT1'], False)
            RPi_GPIO.output(_CAR_['INT2'], True)
            RPi_GPIO.output(_CAR_['INT3'], False)
            RPi_GPIO.output(_CAR_['INT4'], True)
        elif command == 'stop':
            RPi_GPIO.output(_CAR_['INT1'], False)
            RPi_GPIO.output(_CAR_['INT2'], False)
            RPi_GPIO.output(_CAR_['INT3'], False)
            RPi_GPIO.output(_CAR_['INT4'], False)

    def device_set(post_data):
        if WebHandler.has_key('dev_id', post_data) == False or WebHandler.has_key('id', post_data) == False:
            return
        obj = json.loads(post_data['device_set'][0])
        obj['name'] = urllib.parse.unquote(obj['name'])
        _DEVICE_[post_data['dev_id'][0]][post_data['id'][0]] = obj
        WebSocket.broadcast_device()
			
if __name__ == "__main__":
    pass