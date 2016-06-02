#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 命令处理模块
"""
__author__ = 'yejs'
__version__ = '1.0'

__all__ = ["WebHandler", "RPi_GPIO"]

import os
#import RPi.GPIO as io
import tornado.web
import tornado.websocket
from tornado.tcpserver import TCPServer 
import json
import base64
import logging

#BOARD模式
_LAMP_ = {'1':{'pin': '11', 'ip' : '192.168.26.140' , 'status' : 'off'}, '2':{'pin': '12', 'ip' : '192.168.1.111' , 'status' : 'off'}, '3':{'pin': '13', 'ip' : '192.168.1.111' , 'status' : 'off'}, '4':{'pin': '15', 'ip' : '192.168.1.111' , 'status' : 'off'}, '5':{'pin': '16', 'ip' : '192.168.1.111' , 'status' : 'off'}, '6':{'pin': '18', 'ip' : '192.168.1.111' , 'status' : 'off'}, '7':{'pin': '22', 'ip' : '192.168.1.111' , 'status' : 'off'}, '8':{'pin': '7', 'ip' : '192.168.1.111' , 'status' : 'off'}, '9':{'pin': '3', 'ip' : '192.168.1.111' , 'status' : 'off'}, '10':{'pin': '5', 'ip' : '192.168.1.111' , 'status' : 'off'}, '11':{'pin': '24', 'ip' : '192.168.1.111' , 'status' : 'off'}, '12':{'pin': '26', 'ip' : '192.168.1.111' , 'status' : 'off'}, '13':{'pin': '19', 'ip' : '192.168.1.111' , 'status' : 'off'}, '14':{'pin': '21', 'ip' : '192.168.1.111' , 'status' : 'off'}, '15':{'pin': '23', 'ip' : '192.168.1.111' , 'status' : 'off'}, '16':{'pin': '8', 'ip' : '192.168.1.111' , 'status' : 'off'}, '17':{'pin': '10', 'ip' : '192.168.1.111' , 'status' : 'off'}}
sock = None #声明一个socket全局变量，否则调用output时会有断言错误 assert isinstance
class RPi_GPIO():
	_is_exist = False;
	
	def is_exist(modules, module): 
		for m in modules:
			if m == module:
				return True;
		return False;
		
	def init(modules):
		if RPi_GPIO.is_exist(modules, 'io'):
			print ("RPi.GPIO init...")
			RPi_GPIO._is_exist = True
			io.setmode(io.BOARD)
			for k,v in _LAMP_.items():
				io.setup(int(v['pin']), io.OUT)
				io.output(int(v['pin']), io.HIGH)

	def cleanup():
		if RPi_GPIO._is_exist:
			io.cleanup()
	
	def output(channle, command):
		if RPi_GPIO._is_exist == False:
			return;

		io.output(channle, command)
		
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
		
    def output(self, ip, message):
        for conn in Connection.clients:
            if conn._address[0].find(ip) != -1:
                try:
                    msg = "{\"event\":\"msg\", \"data\":\"%s\"}" %(message)
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
        WebSocket.broadcast_message(message)
	
    def broadcast_message(message):
        for handler in WebSocket.socket_handlers:
            try:
                handler.write_message(message)
            except:
                logging.error('Error sending message', exc_info=True)
				
    #向其它页面客户端广播状态消息
    def broadcast_lamp_status():
        str1 = '{\"event\": \"lamp\", \"data\":{'
 
        first = True  
        for key, value in _LAMP_.items():
            if first:
                first = False
            else :
                str1 += ","
            str1 += "\"%s\":\"%s\"" % (key, value['status'])
        str1 += '}}'
  
        WebSocket.broadcast_message(str1) 
		
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
            
            #str1 = '{\"dev_id\":\"'+post_data['dev_id'][0]+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['command'][0]+'\", \"status\":\"'+str(_LAMP_)+'\"}'
        elif post_data['dev_id'][0] == 'car':
            WebHandler.car(post_data) 
			
        str1 = '{\"dev_id\":\"'+post_data['dev_id'][0]+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['command'][0]+'\"}'			
        self.write(base64.encodestring(str1.encode('gbk')))#响应页面post请求（数据base64简单加密处理）
					
    def lamp(post_data):
        global sock
        id = post_data['id'][0]
        if post_data['command'][0] == 'on':	
            command = False
        elif post_data['command'][0] == 'off':
            command = True
        RPi_GPIO.output(int(_LAMP_[id]['pin']), command)
        sock.output(_LAMP_[id]['ip'], post_data['command'][0])
		
        if id == '12':
            for k,v in _LAMP_.items():
                RPi_GPIO.output(int(v['pin']), command)
                sock.output(v['ip'], post_data['command'][0])
                v['status'] = post_data['command'][0]
        else:
            _LAMP_[id]['status'] = post_data['command'][0]
			
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