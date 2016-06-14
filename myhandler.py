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
_LAMP_ = {'1':{'pin': '11', 'ip' : '192.168.228.49' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '2':{'pin': '12', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '3':{'pin': '13', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '4':{'pin': '15', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '5':{'pin': '16', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '6':{'pin': '18', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '7':{'pin': '22', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '8':{'pin': '7', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '9':{'pin': '3', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '10':{'pin': '5', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '11':{'pin': '24', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '12':{'pin': '26', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '13':{'pin': '19', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '14':{'pin': '21', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '15':{'pin': '23', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '16':{'pin': '8', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, '17':{'pin': '10', 'ip' : '192.168.1.111' , 'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}, 'all':{'status' : 'off', 'color' : {'r' : 100, 'g' : 100, 'b' : 100}}}
_all_ = {'pin': '', 'ip' : '' , 'status' : 'off'}
sock = None #声明一个socket全局变量，否则调用Connection.output时会有断言错误 assert isinstance
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
			for k,v in _LAMP_.items():
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
		
	def output(channle, msg, value):
		if RPi_GPIO._is_exist == False:
			return;

		if msg == 'command':#开关指令
			if value == 'on':	
				command = False
			elif value == 'off':
				command = True
			GPIO.output(channle, command)
		elif msg == 'color':#调光调色指令
			r, g, b = RPi_GPIO.get_color(value)
		#	GPIO.output(channle, value)
		
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
		
    def output(self, item, msg, value):

        for conn in Connection.clients:
            if conn._address[0].find(item['ip']) != -1:
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
        str1 = '{\"event\": \"lamp\", \"data\":{'
 
        first = True  
        for key, value in _LAMP_.items():
            if first:
                first = False
            else :
                str1 += ","
            str1 += "\"%s\":{\"status\":\"%s\", \"color\":{\"r\":%d, \"g\":%d, \"b\":%d}}" % (key, value['status'], value['color']['r'], value['color']['g'], value['color']['b'])
        str1 += '}}'
  
        WebSocket.broadcast_messages(str1) 
		
class WebHandler(tornado.web.RequestHandler):
    def post(self, *args, **kwargs):
        post_data = {}
        for key in self.request.arguments:
            post_data[key] = self.get_arguments(key)
        ''' 
        post 参数示例: /control?dev_id=lamp&id=1&command=on
        '''
        if post_data['dev_id'][0] == 'lamp':
            WebHandler.lamp(post_data)
        elif post_data['dev_id'][0] == 'car':
            WebHandler.car(post_data) 
			
        if WebHandler.has_key('command', post_data):#开关指令
            str1 = '{\"dev_id\":\"'+post_data['dev_id'][0]+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['command'][0]+'\"}'
        elif WebHandler.has_key('color', post_data):#调光调色指令
            str1 = '{\"dev_id\":\"'+post_data['dev_id'][0]+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['color'][0]+'\"}'
        			
        self.write(base64.encodestring(str1.encode('gbk')))#响应页面post请求（数据base64简单加密处理）
		
    def has_key(key, dict):
        for k in dict.keys():
            if k == key:
                return True;
        return False;
	
    def output(item, msg, value):
        global sock
        if msg == 'command':#开关指令
            item['status'] = value
        elif msg == 'color':#调光调色指令
            r, g, b = RPi_GPIO.get_color(value)
            item['color']['r'], item['color']['g'], item['color']['b'] = int(r*100/255 + 0.5), int(g*100/255 + 0.5), int(b*100/255 + 0.5)
            #print("get_colors: %s  %s  %d  %d" %(value, RPi_GPIO.get_colors(item), r, item['color']['r']))
        if WebHandler.has_key('pin', item):
            RPi_GPIO.output(int(item['pin']), msg, value)
			
        if sock != None and WebHandler.has_key('ip', item):
            sock.output(item, msg, value)

		
    def lamp(post_data):
        id = post_data['id'][0]
        if WebHandler.has_key('command', post_data):#开关指令
            msg = 'command'
        elif WebHandler.has_key('color', post_data):#调光调色指令
            msg = 'color'
			
        if id == 'all':
            for k,v in _LAMP_.items():
                WebHandler.output(v, msg, post_data[msg][0])
        #else:
        WebHandler.output(_LAMP_[id], msg, post_data[msg][0])
 
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