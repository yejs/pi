#!/usr/bin/python
#encoding:utf-8
import urllib.request
import os
import sys
import ftplib
import filecmp
from update import md5_encode

web_root = 'http://192.168.152.144:8000/web/'
local_root = '../test/'

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

def get_file(file):
	file = file.replace('\\','/')
	pos = file.rfind('/')
	if pos>=0:
		path = local_root + file[0:pos]
		if not os.path.exists(path):
			os.makedirs(path)
			#print('makedirs:%s , web:%s' %(path, web_root + file))
	str = web_root + file
	str = str[0:7] + str[7:len(str)].replace('//','/')
	#print(str)
	urllib.request.urlretrieve(str, local_root + file, Schedule)

def check_filelist():
	old_file = local_root + 'old_filelist.txt'
	if os.path.exists(old_file):
		os.remove(old_file)
		
	os.rename(local_root + 'filelist.txt', old_file)
	
	fo = open(old_file, 'r')  
	try:
		buf = fo.read( )
	finally:
		fo.close( )
	
	get_file('filelist.txt')
	fl = open(local_root + 'filelist.txt','r')  
	
	list_of_all_the_lines = fl.readlines( )

	for line in list_of_all_the_lines:
		va = line.split(' ')
		f = va[0]
		path = (local_root + f).replace('\\','/').replace('//','/')

		if (buf.find(line) == -1) or (not os.path.exists(path)):
			get_file(f)
		'''
		va = line.split(' ')
		f = va[0]
		path = (local_root + f).replace('\\','/').replace('//','/')
		if os.path.exists(path):
			
			fo = open(path,'rb')  
			try:
				buf = fo.read( )
			finally:
				fo.close( )
			value = md5_encode(buf)
			print('file:%s, old:%s, new:%s' %(f, va[1], value))
			if value != va[1]:
				
				get_file(f)
		else:
			get_file(f)
		'''		
	fl.close
	
#local = url.split('/')[0:-1]
#local = os.path.join('./','setting.html')
#urllib.request.urlretrieve(url,local,Schedule)

#x = filecmp.dircmp("1", "2")
#x.report()
#print(x.diff_files)

def main():
    check_filelist()
if __name__ == '__main__':
    main()
