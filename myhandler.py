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
import signal
import json
import base64

#BOARD模式
_OUT_ = {'1':'11', '2':'12', '3':'13', '4':'15', '5':'16', '6':'18', '7':'22', '8':'7', '9':'29', '10':'31', '11':'33', '12':'35', '13':'37', '14':'32', '15':'36', '16':'38', '17':'40'}



class RPi_GPIO():
	_is_exist = False;
	
	def is_exist(modules, module): 
		for m in modules:
			if m == module:
				return True;
		return False;
		
	def init(modules):
		if RPi_GPIO.is_exist(modules, 'RPi'):
			print ("RPi.GPIO init...")
			RPi_GPIO._is_exist = True
			io.setmode(io.BOARD)
			for k,v in _OUT_:
				io.setup(int(v), io.OUT)
				io.output(int(v), io.HIGH)

	def cleanup():
		if RPi_GPIO._is_exist:
			io.cleanup()
	
	def lamp(channle, command):
		if RPi_GPIO._is_exist == False:
			return;
		if command == 'on':
			io.output(int(channle), io.LOW)
		elif command == 'off':
			io.output(int(channle), io.HIGH)

class ControlHandler(tornado.web.RequestHandler):
    def post(self, *args, **kwargs):
        post_data = {}
        for key in self.request.arguments:
            post_data[key] = self.get_arguments(key)
        ''' 
        post 参数示例: /control?dev_id=lamp&id=1&command=on
        '''
        str = '{\"dev_id\":\"'+post_data['dev_id'][0]+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['command'][0]+'\"}';
        #print ("do_POST:",  _OUT_[post_data['id'][0]])
        self.write(base64.encodestring(str.encode('gbk')))#响应页面post请求（数据base64简单加密处理）
		
        if post_data['dev_id'][0] == 'lamp':
            self.lampHandler(post_data)
					
    def lampHandler(self, post_data):
        id = post_data['id'][0]
        command = post_data['command'][0]
        RPi_GPIO.lamp(_OUT_[id], command)

        if id == 12:
            for k,v in _OUT_:
                RPi_GPIO.lamp(v, command)

if __name__ == "__main__":
    pass