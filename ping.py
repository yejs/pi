#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

__author__ = 'yejs'
__version__ = '1.0'

import os, threading, sys
import time
import re

import platform
import subprocess 
import datetime

from data.g_data import GlobalVar
'''
场景模式自动控制模块，通过循环遍历ping家庭成员的手机的IP,只要有一个手机的IP能ping通，
说明该手机的主人在家，切换到“回家”模式，否则则认为所有家庭成员都不在家，切换到“离家”模式
TODO:Linux下待测试！！！！！！！！！！！！！！！
'''
class ping(threading.Thread):
	count_param = '-n'#ping指定数目的参数
	timeout_param = '-w'#ping timeout
	timeout_value = '500'
	host_set = set() 
	do_post = None
	close_flag = False
	def __init__(self, callback):
		threading.Thread.__init__(self)
		self.daemon=True
		self.start()
		ping.do_post = callback
		
		#window、linux ping 指定数目的参数不一样
		if platform.system().find('Linux')>=0:
			ping.count_param = '-c'
			timeout_param = '-i'
			timeout_value = '0.5'
		elif platform.system().find('Windows')>=0:
			ping.count_param = '-n'
			timeout_param = '-w'
			timeout_value = '3000'
			
		ping.init_host()
			
	def init_host():
		ping.host_set.clear()
		f = open('data/host.txt','r') #动态获取家庭成员手机IP列表
		for host in f.readlines():
			host = host.strip(' ')
			host = host.strip('\n')
			if host.find(';') != -1 or host.find('//') != -1 or host.find('#') != -1 or len(host) <= 0:#注解跳过
				continue
			ping.host_set.add(host)  
		f.close
		

	def close():
		ping.close_flag = True
		
	#ping 过程函数
	#TODO:Linux下待测试
	def do_ping(host):
		p = subprocess.Popen(['ping', ping.count_param, '1', host],
							stdin = subprocess.PIPE,
							stdout = subprocess.PIPE,
							stderr = subprocess.PIPE,
							shell = True)
		out = p.stdout.read()#.decode('gb2312')#.decode('utf-8')

	
		ret = ping.check_time(out, "time<\d*", "时间<\d*")
		if not ret:
			ret = ping.check_time(out, "time=\d*", "时间=\d*")
		return ret
		
	def check_time(out, str_time1, str_time2):
		try:#判断返回字符串的编码方式
			out = out.decode('utf-8')
			str_time = str_time1
		except:
			out = out.decode('gb2312')
			str_time = str_time2
		finally:
			pass
			
		regex = re.compile(str_time, re.IGNORECASE | re.MULTILINE)
		if len(regex.findall(out)) > 0:#ping得通
			return True
		else:
			return False
	
	#切换场景模式
	def do_mode(leave):
		if not ping.do_post:
			return
			
		mode = GlobalVar.get_mode()
		if ('leave' == mode and not leave) or ('leave' != mode and leave):
			post_data = {}
			if 'leave' == mode and not leave:
				post_data['mode'] = [GlobalVar.get_last_mode()]
			else:
				post_data['mode'] = ['leave']
			ping.do_post(None, post_data)
	
	#线程函数，循环遍历ping家庭成员的手机的IP
	def run(self):
		n = 0
		while not ping.close_flag:
			if GlobalVar.get_auto_mode() == 'true' and len(ping.host_set):#只有在自动模式控制时才检测 
				leave = True

				for host in ping.host_set:
					if ping.do_ping(host):
						leave = False#有一个手机IP ping得通，即认为有人在家
						break

				ping.do_mode(leave)
			
			time.sleep(1)
			n += 1
			if n > 60:
				ping.init_host()
				n = 0

			
if __name__ == "__main__":
	try:
		ping(None)
		while True:
			time.sleep(1)
	except:
		pass
	finally:
		print('exit.........')
		pass		