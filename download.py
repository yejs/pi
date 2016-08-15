#!/usr/bin/python
#encoding:utf-8
import urllib.request
import os
import sys
import ftplib
import filecmp

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

#local = url.split('/')[0:-1]
#local = os.path.join('./','setting.html')
#urllib.request.urlretrieve(url,local,Schedule)

#x = filecmp.dircmp("1", "2")
#x.report()
#print(x.diff_files)


class FTPSync(object):
    def __init__(self):
        #print(help(ftplib.FTP))
        self.conn = ftplib.FTP('43.254.148.23', 'caiweijie', 'FZXr43zJejHGojpC5ewd')
        self.conn.connect('43.254.148.23', 18021)
        self.conn.cwd('/')        # 远端FTP目录
        os.chdir('/data/')        # 本地下载目录
    def get_dirs_files(self):
        u''' 得到当前目录和文件, 放入dir_res列表 '''
        dir_res = []
        self.conn.dir('.', dir_res.append)
        files = [f.split(None, 8)[-1] for f in dir_res if f.startswith('-')]
        dirs = [f.split(None, 8)[-1] for f in dir_res if f.startswith('d')]
        return (files, dirs)
    def walk(self, next_dir):
        print('Walking to', next_dir)
        self.conn.cwd(next_dir)
        try:
            os.mkdir(next_dir)
        except OSError:
            pass
        os.chdir(next_dir)
        ftp_curr_dir = self.conn.pwd()
        local_curr_dir = os.getcwd()
        files, dirs = self.get_dirs_files()
        print("FILES: ", files)
        print("DIRS: ", dirs)
        for f in files:
            print(next_dir, ':', f)
            outf = open(f, 'wb')
            try:
                self.conn.retrbinary('RETR %s' % f, outf.write)
            finally:
                outf.close()
        for d in dirs:
            os.chdir(local_curr_dir)
            self.conn.cwd(ftp_curr_dir)
            self.walk(d)
    def run(self):
        self.walk('.')
def main():
    f = FTPSync()
    f.run()
if __name__ == '__main__':
    main()