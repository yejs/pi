# /usr/bin/python
# -*- coding:utf-8 -*-
import os
import base64
import hashlib
'''
这是服务端升级时更新filelist的脚本文件，当代码需要更新时，升级服务端首先运行此脚本文件，得到最新的需要更新的文件列表；
用户WEB服务端定时调用upgrade.py检查升级服务端的filelist，当filelist上的文件md5码与本地文件的md5码不一致时，则下载升级。
'''
def update_filelist(path):
	fl = open('../web/filelist.txt','w')  
	
	for fpath,dirs,fs in os.walk(path):
		pos = fpath.find(path)
		if pos>=0:
			rpath = fpath[len(path):len(fpath)]
		for f in fs:
			fo = open(os.path.join(fpath,f),'rb')  
			buf = None
			try:
				buf = fo.read( )
			finally:
				fo.close( )
			value = md5_encode(buf)
			fl.write(os.path.join(rpath,f) + ' ' + value + '\n')  
	fl.close
			
def md5_encode(data):
	hash = hashlib.md5()
	hash.update(data)#.encode("utf8"))
	value = hash.digest()
	return hash.hexdigest()

def main():
	update_filelist('F:\Raspi\WebProject\web')
if __name__ == '__main__':
    main()