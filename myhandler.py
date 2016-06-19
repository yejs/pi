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
import logging

#BOARD模式
_DEVICE_ = {'1':{'pin': '11', 'ip' : '192.168.1.101'}, '2':{'pin': '12', 'ip' : '192.168.1.111'}, '3':{'pin': '13', 'ip' : '192.168.1.111'}, '4':{'pin': '15', 'ip' : '192.168.1.111'}, '5':{'pin': '16', 'ip' : '192.168.1.111'}, '6':{'pin': '18', 'ip' : '192.168.1.111'}, '7':{'pin': '22', 'ip' : '192.168.1.111'}, '8':{'pin': '7', 'ip' : '192.168.1.111'}, '9':{'pin': '3', 'ip' : '192.168.1.111'}, '10':{'pin': '5', 'ip' : '192.168.1.111'}, '11':{'pin': '24', 'ip' : '192.168.1.111'}}
_LAMP_ = {"normal":{'1':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '2':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '3':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '4':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '5':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '6':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '7':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '8':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '9':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '10':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '11':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, 'all':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}}, "leave":{'1':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '2':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '3':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '4':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '5':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '6':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '7':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '8':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '9':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '10':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '11':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, 'all':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}}, "night":{'1':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '2':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '3':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '4':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '5':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '6':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '7':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '8':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '9':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '10':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '11':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, 'all':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}}, "getup":{'1':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '2':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '3':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '4':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '5':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '6':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '7':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '8':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '9':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '10':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '11':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, 'all':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}}, "guests":{'1':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '2':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '3':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '4':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '5':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '6':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '7':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '8':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '9':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '10':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '11':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, 'all':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}}, "diner":{'1':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '2':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '3':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '4':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '5':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '6':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '7':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '8':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '9':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '10':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '11':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, 'all':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}}}

sock = None #声明一个socket全局变量，否则调用Connection.output时会有断言错误 assert isinstance
mode = 'normal'
id = '1'
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
			for k,v in _DEVICE_.items():
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
    clients = set()    
    def __init__(self, stream, address):   
        global sock
        sock = self
        Connection.clients.add(self)   
        self._stream = stream    
        self._address = address    
        self._stream.set_close_callback(self.on_close)    
        self.read_message()    
        print("New connection: %s, " % address[0])
		
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
        print("%s closed." % self._address[0])  
        Connection.clients.remove(self)    
        print("connection num is:", len(Connection.clients))
		
    def output(self, ip, item):

        for conn in Connection.clients:
            if conn._address[0].find(ip) != -1:
                try:
                    msg = "{\"event\":\"msg\", \"status\":\"%s\", \"color\":\"%s\"}" %(item['status'], RPi_GPIO.get_colors(item))
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
    def broadcast_lamp_status():
        global mode
        global id
        str1 = '{\"event\": \"lamp\", \"data\":'
        str1 += json.dumps(_LAMP_)
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += id
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
class WebHandler(tornado.web.RequestHandler):
    def post(self, *args, **kwargs):
        post_data = {}

        for key in self.request.arguments:
            post_data[key] = self.get_arguments(key)
        ''' 
        post 参数示例: /control?dev_id=lamp&id=1&command=on
        '''
        
 
        if WebHandler.has_key('command', post_data):#开关指令
            str1 = '{\"dev_id\":\"'+post_data['dev_id'][0]+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['command'][0]+'\"}'
        elif WebHandler.has_key('color', post_data):#调光调色指令
            str1 = '{\"dev_id\":\"'+post_data['dev_id'][0]+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['color'][0]+'\"}'
        else :#模式指令
            str1 = '{\"dev_id\":\"'+post_data['dev_id'][0] + '\"}'
        			
        self.write(base64.encodestring(str1.encode('gbk')))#响应页面post请求（数据base64简单加密处理）
		
        if post_data['dev_id'][0] == 'lamp':
            WebHandler.lamp(post_data)
        elif post_data['dev_id'][0] == 'car':
            WebHandler.car(post_data) 
		
    def has_key(key, dict):
        for k in dict.keys():
            if k == key:
                return True;
        return False;
	
    def output(id, key, value):
        global sock
        item = _LAMP_[mode][id]
        if key == 'command':#开关指令
            item['status'] = value
        elif key == 'color':#调光调色指令
            r, g, b = RPi_GPIO.get_color(value)
            item['color']['r'], item['color']['g'], item['color']['b'] = int(r*100/255 + 0.5), int(g*100/255 + 0.5), int(b*100/255 + 0.5)
            #print("get_colors: %s  %s  %d  %d" %(value, RPi_GPIO.get_colors(item), r, item['color']['r']))
        elif key == None:    #模式指令
            key = 'command'
            value = item['status']
			
        if WebHandler.has_key(id, _DEVICE_):
            if WebHandler.has_key('pin', _DEVICE_[id]):
                RPi_GPIO.output(int(_DEVICE_[id]['pin']), key, value)
			
            if sock != None and WebHandler.has_key('ip', _DEVICE_[id]):
                sock.output(_DEVICE_[id]['ip'], item)

		
    def lamp(post_data):
        global mode
        global id
        id = None
        key = None
        value = None
		
        if WebHandler.has_key('id', post_data):
            id = post_data['id'][0]
			
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
                WebHandler.output(k, key, value)
				
        if id != None:
            WebHandler.output(id, key, value)
        else:
            id = '1'
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

if __name__ == "__main__":
    pass