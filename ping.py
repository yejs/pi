#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

__author__ = 'yejs'
__version__ = '1.0'

import os, threading, sys
import time
import re

import subprocess 
import datetime

from data.g_data import GlobalVar
'''
场景模式自动控制模块，通过循环遍历ping家庭成员的手机的IP,只要有一个手机的IP能ping通，
说明该手机的主人在家，切换到“回家”模式，否则则认为所有家庭成员都不在家，切换到“离家”模式
'''
class ping(threading.Thread):
	def __init__(self, callback):
		threading.Thread.__init__(self)
		self.daemon=True
		self.start()
		self.do_post = callback
		
	#ping 过程函数
	def check_alive(host):
		p = subprocess.Popen(['ping', '-n', '1', host],
							stdin = subprocess.PIPE,
							stdout = subprocess.PIPE,
							stderr = subprocess.PIPE,
							shell = True)
		out = p.stdout.read().decode('utf-8')

		regex = re.compile("time<\d*", re.IGNORECASE | re.MULTILINE)
		if len(regex.findall(out)) > 0:#ping得通
			return True
		else:
			return False
	
	#切换场景模式
	def check_mode(self, online):
		mode = GlobalVar.get_mode()
		if ('leave' == mode and online) or ('leave' != mode and not online):
			post_data = {}
			if 'leave' == mode and online:
				post_data['mode'] = ['normal']
			else:
				post_data['mode'] = ['leave']
			self.do_post(None, post_data)
	
	#线程函数，循环遍历ping家庭成员的手机的IP
	def run(self):
		while True:
			f = open('data/host.txt','r') #动态获取家庭成员手机IP列表（这个文件能够动态更新）
			online = False
			n = 0
			for host in f.readlines():
				host = host.strip(' ')
				host = host.strip('\n')
				if host.find(';') != -1 or host.find('//') != -1 or host.find('#') != -1 or len(host) <= 0:#注解跳过
					continue
				n += 1
				ret = ping.check_alive(host)
				if ret:
					online = True#有一个ping得通，即认为有人在家
					break
			f.close
			
			if n>0 and GlobalVar.get_auto_mode() == 'true':
				self.check_mode(online)
			
			time.sleep(5)