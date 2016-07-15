#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
  解析红外记录文件
"""
__author__ = 'yejs'
__version__ = '1.0'

import os, threading
import signal
import logging
import json

class LIRC():
	f = None
	remote = {}
	def __init__(self, file):
		self.f = open(file,'r') 
		'''
		self.remote['name'] = self.read('name')
		self.remote['header'] = self.read('header')
		self.remote['one'] = self.read('one')
		self.remote['zero'] = self.read('zero')
		self.remote['ptrail'] = self.read('ptrail')
		self.remote['repeat'] = self.read('repeat')
		self.remote['pre_data_bits'] = self.read('pre_data_bits')
		self.remote['pre_data'] = self.read('pre_data')#地址码
		self.remote['KEY_VOLUMEDOWN'] = self.read('KEY_VOLUMEDOWN')
		self.remote['KEY_PLAYPAUSE'] = self.read('KEY_PLAYPAUSE')
		self.remote['KEY_VOLUMEUP'] = self.read('KEY_VOLUMEUP')
		'''

		self.f.seek(0, 0)
		line = self.f.readline()
		while line:
			if line.find('begin remote') != -1:
				line = self.f.readline()
				break;
			line = self.f.readline()
			
		while line:
			s = 0
			while line[s:s+1] == ' ' and s+1 < len(line):
				s+=1
			e = s
			while line[e:e+1] != ' ' and e+1 < len(line):
				e+=1
			key = line[s:e]
			if len(key)>0 and line.find('begin') == -1 and line.find('end') == -1: 
				line = line[line.find(key) + len(key):].strip()
				self.remote[key] = line
			line = self.f.readline()
		#print(json.dumps(self.remote))
		
	def read(self, key):
		self.f.seek(0, 0)
		line = self.f.readline()
		while line:
			if line.find('begin remote') != -1:
				line = self.f.readline()
				break;
			line = self.f.readline()
			
		while line:
			if line.find(key) != -1 and line[line.find(key) + len(key) : line.find(key) + len(key)+1] == ' ':
				line = line[line.find(key) + len(key):].strip()
				return line
				break;
			line = self.f.readline()
		
	def getKey(self, key):
		if None == self.remote.get('pre_data') or None == self.remote.get('pre_data_bits') or None == self.remote.get(key):
			return None
		addr = self.remote['pre_data']
		tmp = int(addr, 16)
		if tmp < 0xff and int(self.remote['pre_data_bits']) == 16:#地址反码
			tmp2 = ~tmp&255
			addr += ('0' if tmp2<16 else '') + hex(tmp2)[2:]
		return addr + self.remote[key][2:]#地址码 + 数据码
	
	def getEx(self, key):
		if self.remote.get(key) == None:
			return None
		
		value = self.remote[key]
		e = 0
		while value[e:e+1] != ' ' and e+1 < len(value):
			e+=1
		value1 = value[0:e]
		value2 = value[e:].strip()
		
		return value1, value2
		

		
	def __del__(self):
		self.f.close
		
if __name__ == "__main__":
	try:
		obj1 = LIRC("lircd.conf")
		print('%s' % obj1.getKey('KEY_VOLUMEDOWN'))
		print('header1:%s, header2:%s' % obj1.getEx('header'))
		#print('header1:%s' % obj1.getEx('header'))
	except:
		pass
	finally:
		pass
