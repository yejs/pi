#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 命令处理模块 
"""

__author__ = 'yejs'
__version__ = '1.0'


import os
#import RPi.GPIO as GPIO
import json
import base64
import urllib
import logging
from data import _DEVICE_, _LAMP_ , _CURTAIN_, _AIR_CONDITIONER_

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
			
	# '7f7f7f'字符串转为 {'r' : 50, 'g' : 50, 'b' : 50}
	def get_color(color):
		r = int('0x' + color[0:2], 16)
		g = int('0x' + color[2:4], 16)
		b = int('0x' + color[4:6], 16)
		return r, g, b
		
	#{'r' : 50, 'g' : 50, 'b' : 50} 转为'7f7f7f'字符串
	def get_colors(item):
		r, g, b = int(item['color']['r']*255/100), int(item['color']['g']*255/100), int(item['color']['b']*255/100)
		color = hex(int(r/16))[2:] + hex(int(r%16))[2:] + hex(int(g/16))[2:] + hex(int(g%16))[2:] + hex(int(b/16))[2:] + hex(int(b%16))[2:]
		return color
		
	def output(pin, key, value):
		if RPi_GPIO._is_exist == False:
			return;

		if key == 'command':#开关指令
			if value == 'on' or value == 'open':	
				command = False
			elif value == 'off' or value == 'close':
				command = True
			GPIO.output(pin, command)
		elif key == 'color':#调光调色指令
			r, g, b = RPi_GPIO.get_color(value)
		#	GPIO.output(pin, value)