# /usr/bin/python
# -*- coding:utf-8 -*-
import os
import base64

try:
    import hashlib
    hash = hashlib.md5()
except ImportError:
    # for Python << 2.5
    import md5
    hash = md5.new()
	
def update_filelist(path):
	fl = open('../web/filelist.txt','w')  
	
	for fpath,dirs,fs in os.walk(path):
		pos = fpath.find(path)
		if pos>=0:
			rpath = fpath[len(path):len(fpath)]
		for f in fs:
			fo = open(os.path.join(fpath,f),'rb')  
			try:
				buf = fo.read( )
			finally:
				fo.close( )
			value = md5_encode(buf)
			fl.write(os.path.join(rpath,f) + ' ' + value + '\n')  
			#print(os.path.join(rpath,f))
	fl.close
			
def md5_encode(data):
	hash.update(data)#.encode("utf8"))
	value = hash.digest()
	return hash.hexdigest()

def main():
    #md5_encode('spam,spam,and egges')
	update_filelist('F:\Raspi\WebProject\web')
if __name__ == '__main__':
    main()