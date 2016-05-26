#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 命令处理模块
"""
__author__ = 'yejs'
__version__ = '1.0'

__all__ = ["ControlHandler", "RPi_GPIO"]

import os
import RPi.GPIO as io
import tornado.web
import json
import base64

#BOARD模式
_OUT_ = {'1':'11', '2':'12', '3':'13', '4':'15', '5':'16', '6':'18', '7':'22', '8':'7', '9':'29', '10':'31', '11':'33', '12':'35', '13':'37', '14':'32', '15':'36', '16':'38', '17':'40'}

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