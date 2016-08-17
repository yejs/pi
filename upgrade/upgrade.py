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

web_root = 'http://192.168.152.144:8000/web/'
local_root = './test/'

def Schedule(a,b,c):
    '''''
    a:已经下载的数据块
    b:数据块的大小
    c:远程文件的大小
   '''
    per = 100.0 * a * b / c
    if per > 100 :
        per = 100
    print('%.2f%%' % per)

def download_file(file):
	file = file.replace('\\','/')
	pos = file.rfind('/')
	if pos>=0:
		path = local_root + file[0:pos]
		if not os.path.exists(path):
			os.makedirs(path)
			#print('makedirs:%s , web:%s' %(path, web_root + file))
	str = web_root + file
	str = str[0:7] + str[7:len(str)].replace('//','/')
	
	try:
		urllib.request.urlretrieve(str, local_root + file, Schedule)
	except:# (HTTPError, URLError):
		print('urllib.request.urlretrieve raise URLError')
		return False
	finally:
		return True
	
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
		if line.find('filelist.txt') > -1 or line.find('start.py') > -1:#filelist.txt 和 start.py 不需要更新
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

	fl.close
	return ret
	
if __name__ == '__main__':
    doUpgrade()
