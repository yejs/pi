#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 命令处理模块
"""
__author__ = 'yejs'
__version__ = '1.0'

__all__ = ["ControlHandler", "RPi_GPIO"]

import os
#import RPi.GPIO as io
import tornado.web
import tornado.websocket
import json
import base64

#BOARD模式
_OUT_ = {'1':'11', '2':'12', '3':'13', '4':'15', '5':'16', '6':'18', '7':'22', '8':'7', '9':'3', '10':'5','11':'24', '12':'26', '13':'19', '14':'21', '15':'23', '16':'8', '17':'10'}
_LAMP_ = {'1':'off', '2':'off', '3':'off', '4':'off', '5':'off', '6':'off', '7':'off', '8':'off', '9':'off', '10':'off', '11':'off', '12':'off', '13':'off', '14':'off', '15':'off', '16':'off', '17':'off'}

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
			for k,v in _OUT_.items():
				io.setup(int(v), io.OUT)
				io.output(int(v), io.HIGH)

	def cleanup():
		if RPi_GPIO._is_exist:
			io.cleanup()
	
	def output(channle, command):
		if RPi_GPIO._is_exist == False:
			return;

		io.output(channle, command)

def send_lamp_status():
    for handler in ChatSocketHandler.socket_handlers:
        str1 = '{\"event\": \"lamp\", \"data\":{'
 
        first = True  
        for key, value in _LAMP_.items():
            if first:
                first = False
            else :
                str1 += ","
            str1 += "\"%s\":\"%s\"" % (key, value)
        str1 += '}}'
  
        send_message(str1) 
			
def send_message(message):
    for handler in ChatSocketHandler.socket_handlers:
        try:
            handler.write_message(message)
        except:
            logging.error('Error sending message', exc_info=True)
			
class ChatSocketHandler(tornado.websocket.WebSocketHandler):
    socket_handlers = set()
    def open(self):
        ChatSocketHandler.socket_handlers.add(self)
        send_lamp_status()
        #send_message('A new user has entered the chat room.')
    def on_close(self):
        ChatSocketHandler.socket_handlers.remove(self)
        #send_message('A user has left the chat room.')
    def on_message(self, message):
        send_message(message)
		
class ControlHandler(tornado.web.RequestHandler):
    def post(self, *args, **kwargs):
        post_data = {}
        for key in self.request.arguments:
            post_data[key] = self.get_arguments(key)
        ''' 
        post 参数示例: /control?dev_id=lamp&id=1&command=on
        '''


        if post_data['dev_id'][0] == 'lamp':
            ControlHandler.lamp(post_data)
            
            #str1 = '{\"dev_id\":\"'+post_data['dev_id'][0]+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['command'][0]+'\", \"status\":\"'+str(_LAMP_)+'\"}'
        elif post_data['dev_id'][0] == 'car':
            ControlHandler.car(post_data) 
			
        str1 = '{\"dev_id\":\"'+post_data['dev_id'][0]+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['command'][0]+'\"}'			
        self.write(base64.encodestring(str1.encode('gbk')))#响应页面post请求（数据base64简单加密处理）
					
    def lamp(post_data):
        id = post_data['id'][0]
        if post_data['command'][0] == 'on':	
            command = False
        elif post_data['command'][0] == 'off':
            command = True
        RPi_GPIO.output(int(_OUT_[id]), command)

        if id == '12':
            for k,v in _OUT_.items():
                RPi_GPIO.output(int(v), command)
                _LAMP_[k] = post_data['command'][0]
        else:
            _LAMP_[post_data['id'][0]] = post_data['command'][0]
			
        send_lamp_status()
				
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