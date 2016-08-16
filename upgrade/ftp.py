#!/usr/bin/env python
# -*- coding: utf-8 -*-

#import ConfigParser
import os, sys
import ctypes
sys.path.append(os.path.abspath('..'))
from pyftpdlib.authorizers import DummyAuthorizer
from pyftpdlib.handlers import FTPHandler
from pyftpdlib.servers import ThreadedFTPServer
import logging
import platform





g_user =u"ITC"
g_password =u"ITC123"
g_dir =u"c:"
g_port =2121
g_banonymous = False
g_hided = False

# advanced feature
g_max_connect=256
g_permission = "elradfmw"                #允许权限
g_bautostartup = 0                         #是否随机启动



def read_config():
    global g_user
    global g_password
    global g_dir
    global g_port
    global g_banonymous
    global g_hided

    global g_bautostartup
    global g_max_connect
    global g_permission

    try:
        '''
        cf = ConfigParser.ConfigParser()
        cf.read(os.path.join(os.getcwd(), "FtpConfig.ini"))
 
        if cf.has_option("base","user"):
            g_user = cf.get("base", "user").decode("GBK")
        if cf.has_option("base","password"):
            g_password = cf.get("base", "password").decode("GBK")
        if cf.has_option("base","dir"):
            g_dir = cf.get("base", "dir", sys.path[0]).decode("GBK")
        if cf.has_option("base","port"):
            g_port = cf.getint("base", "port")
        if cf.has_option("base","anonymous"):
            g_banonymous = cf.getboolean("base", "anonymous")
        if cf.has_option("base","hided"):
            g_hided = cf.getboolean("base" , "hided")
        #////////////////////////////////high level feature
        if cf.has_option("advanced","max_connect"):
            g_max_connect = cf.getint("advanced","max_connect" )
        if cf.has_option("advanced","permission"):
            g_permission = cf.get("advanced","permission","elradfmw").decode("GBK")
        if cf.has_option("advanced","autosetup"):
            g_bautostartup = cf.getboolean("advanced", "autosetup")
        '''
        g_user = 'yejs'
        g_password = 123000
        g_dir = 'c://new/test/good'
        g_port = 2121
        g_banonymous = False
        g_hided = False
        g_max_connect = 256
        g_permission = 'elradfmw'
        g_bautostartup = True
			
        check_ini_para()
        auto_setup(g_bautostartup)
        return  True
    except Exception:
        print('ex')
        os.system("pause")
        return False


def check_ini_para():
    global g_user
    global g_password
    global g_dir
    global g_port
    global g_banonymous
    global g_hided
    global g_bautostartup
    global g_max_connect
    global g_permission

    if len(g_permission) == 0:
        g_permission = "elradfmw"
        logging.info("permission error")
    if g_max_connect < 1:
        g_max_connect =1
        logging.info("the allowed connecting could not smaller than 1")
    if os.path.exists(g_dir) is False:
        os.makedirs(g_dir)
        logging.info("create dir : " + g_dir)




def run():
    global g_user
    global g_password
    global g_dir
    global g_port
    global g_banonymous
    global g_hided
    global g_bautostartup
    global g_max_connect
    global g_permission

    print("currnt dir : " +g_dir)

    try:
        authorizer = DummyAuthorizer()
        if g_banonymous:
            authorizer.add_anonymous(g_dir,perm=g_permission)
        else:
            authorizer.add_user(g_user, g_password, g_dir, perm=g_permission)
        handler = FTPHandler
        handler.authorizer = authorizer
        server = ThreadedFTPServer(("0.0.0.0", g_port), handler)
        server.max_cons = g_max_connect
        server.serve_forever()


    except ex:
        print('ex')
        os.system("pause")
        return


def hide_wnd():
    if platform.system() != "Windows":
        return
    global  g_hided
    if g_hided is False:
        logging.info("windoes not hided")
        return
    whnd = ctypes.windll.kernel32.GetConsoleWindow()
    if whnd != 0:
        ctypes.windll.user32.ShowWindow(whnd, 0)
        logging.info("windows hided")
        # ctypes.windll.kernel32.CloseHandle(whnd)

def auto_setup(t_bsetup):
    if t_bsetup is False:
        return
    # doing something to setup with windows




if __name__ == "__main__":
    if read_config():
        hide_wnd()
        run()
