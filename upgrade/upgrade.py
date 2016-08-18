#!/usr/bin/python
#encoding:utf-8
import urllib.request
import os
import sys
import logging
import ftplib
import filecmp

sys.path.append('upgrade')
import update

sys.path.append('..')
from data.g_data import GlobalVar

web_root = 'http://192.168.152.144:8000/web/'
local_root = './test/'

#下载文件进度指示
def Schedule(a,b,c):
    '''''
    a:已经下载的数据块
    b:数据块的大小
    c:远程文件的大小
   '''
    per = 100.0 * a * b / c
    if per > 100 :
        per = 100
    #print('%.2f%%' % per)

#下载指定的某个文件
def download_file(file):
	file = file.replace('\\','/')
	print('download_file:%s' %(file))
	pos = file.rfind('/')
	if pos>=0:
		path = local_root + file[0:pos]
		if not os.path.exists(path):
			os.makedirs(path)
			#print('makedirs:%s , web:%s' %(path, web_root + file))
	str = web_root + file
	str = str[0:7] + str[7:].replace('//','/')
	
	try:
		urllib.request.urlretrieve(str, local_root + file, Schedule)
	except:# (HTTPError, URLError):
		print('urllib.request.urlretrieve raise URLError')
		return False
	finally:
		return True
	
def checkUpgrade(line):
	if line.find('Upgrade_No') > -1:#检查用户Serial_No 在不在 Upgrade_No范围内，不在则不升级更新
		Upgrade_No = line[len('Upgrade_No:'):].upper()
		if Upgrade_No != 'ALL':
			Upgrade_No = Upgrade_No.split('~')
			if GlobalVar.get_Serial_No() < int(Upgrade_No[0]) or GlobalVar.get_Serial_No() > int(Upgrade_No[1]):
				print('Serial_No: %d, Upgrade_No: %s ~ %s' %(GlobalVar.get_Serial_No(), Upgrade_No[0], Upgrade_No[1]))
				return 0;
		print('do upgrade ...')
		return -1
	return 1
	
#更新升级主模块函数
def doUpgrade():
	ret = False
	
	if not os.path.exists(local_root):
		os.makedirs(local_root)
		
	if False == download_file('filelist.txt'):
		return ret

	fl = open(local_root + 'filelist.txt','r')  
	
	list_of_all_the_lines = fl.readlines( )

	for line in list_of_all_the_lines:
		line=line.strip('\n')
		ret = checkUpgrade(line)
		if 0 == ret:
			return
		elif -1 == ret:
			continue

		va = line.split(' ')
		f = va[0]
		path = (local_root + f).replace('\\','/').replace('//','/')
		if os.path.exists(path):
			fo = open(path,'rb')  
			try:
				buf = fo.read( )
			finally:
				fo.close( )
			value = update.md5_encode(buf)
			
			if value != va[1]:#.find(value) == -1:
				print('file:%s, old:%s, new:%s' %(f, va[1], value))
				download_file(f)
				ret = True
		else:
			download_file(f)
			ret = True
	print('do upgrade finish!!!')
	fl.close
	return ret
	
if __name__ == '__main__':
    doUpgrade()
