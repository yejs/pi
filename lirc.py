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
	remote = None
	def __init__(self, file):
		self.f = open(file,'r') 
		self.remote = {}
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

		self.remote['is_raw'] = False
		raw_key_name = None
		raw_code = ''
		
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
			
			if self.remote['is_raw'] == False:
				'''
				if len(key)>0 and key.find('flags') != -1: 
					line = line[line.find(key) + len(key):].strip()
					if line.find('RAW_CODES') != -1:
						self.remote['is_raw'] = True 
				'''
				if len(key)>0 and key.find('begin') != -1: #  begin raw_codes   或   begin codes， 这里不用flags判断，否则begin raw_codes前的字段解析不到
					line = line[line.find(key) + len(key):].strip()
					if line.find('raw_codes') != -1:
						self.remote['is_raw'] = True 
						
				elif len(key)>0 and line.find('begin') == -1 and line.find('end') == -1: 
					if line.find('#') != -1:					#去掉注解
						line = line[0:line.find('#')]
					line = line[line.find(key) + len(key):].strip()

					self.remote[key] = line

			else:#is raw data
				if len(key)>0 and (key.find('name') != -1 or key.find('end') != -1): 
					if raw_key_name:				#先将上一个键、值保存处理好
						self.remote[raw_key_name] = raw_code[:]
						raw_code = ''
						#print('key: %s, code: %s' %(raw_key_name, self.remote[raw_key_name]))
					if key.find('name') != -1:		#当前键
						raw_key_name = line[line.find(key) + len(key):].strip()
					elif key.find('end') != -1:
						break
				elif len(key)>0 and raw_key_name:	#处理当前键的值
					line = line.strip().replace('     ', ' ').replace('    ', ' ') + ' '
					raw_code += line
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
			
	def is_raw(self):
		return self.remote['is_raw'];
		
	def getKey(self, key):
		if None == self.remote.get(key):
			return None
		if False == self.remote['is_raw']:
			if None == self.remote.get('pre_data') or None == self.remote.get('pre_data_bits'):
				return None
			
			addr = self.remote['pre_data']
			tmp = int(addr, 16)
			if tmp < 0xff and int(self.remote['pre_data_bits']) == 16:#地址反码
				tmp2 = ~tmp&255
				addr += ('0' if tmp2<16 else '') + hex(tmp2)[2:]
			return addr + self.remote[key][2:]#地址码 + 数据码
		else:
			return self.remote[key][:]
	
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
		if self.f:
			self.f.close
		
if __name__ == "__main__":
	try:
		obj1 = LIRC("conf/lircd_air.conf")
		#print('%s' % obj1.getKey('KEY_VOLUMEDOWN'))
		print('header1:%s, header2:%s' % obj1.getEx('one'))
		#print('header1:%s' % obj1.getEx('header'))

	except:
		pass
	finally:
		pass
