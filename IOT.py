#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
  服务主模块
  https://linux.cn/article-3782-1.html  使用树莓派红外控制空调和风扇
  http://my.oschina.net/funnky/blog/147094 用红外遥控器遥控树莓派\
  http://stackoverflow.com/questions/22652156/how-to-use-irrecord-with-2ms-timing-instead-of-the-default-5ms
  http://lirc.sourceforge.net/remotes
  
  https://github.com/zzmp/juliusjs?utm_source=ourjs.com
  
  http://wiki.dfrobot.com.cn/index.php/(SKU:DFR0177)%E4%B8%AD%E6%96%87%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB%E6%A8%A1%E5%9D%97Voice_Recognition
http://www.waveshare.net/wiki/LD3320_Board_(B)

"""
__author__ = 'yejs'
__version__ = '1.0'

from myhandler import WebHandler
from my_websocket import WebSocket
from my_socket import SocketServer, Connection
from my_gpio import RPi_GPIO

import os, threading, sys
#import RPi.GPIO as GPIO

import tornado.httpserver
import tornado.ioloop
import tornado.web
import signal
import logging
import time
import upgrade.upgrade
#

from tornado.options import define, options
define("http_port", default=8000, help="run on the given port", type=int)
define("socket_port", default=5000, help="run on the given port", type=int)

is_closing = False

def signal_handler(signum, frame):
    global is_closing
    logging.info('exiting...')
    is_closing = True

def try_exit(): 
    global is_closing
    if is_closing:
        # clean up here
        tornado.ioloop.IOLoop.instance().stop()
        logging.info('exit success')

'''
handler  是一个列表，每个列表项是tuple，每个tuple有三个选项，第一个为条件匹配项，符合此条件的则调用第二个handler选项，第三个可选项作为参数传给handler
'''
application = tornado.web.Application([
    ('/', tornado.web.RedirectHandler, dict(url='/web/index.html')),	#不输入任何参数，默认重定向打开首页
    ('/web/(.*)', tornado.web.StaticFileHandler, dict(path='./web')),	#打开静态页面
    ('/control', WebHandler),										#动态控制方法
	('/socket', WebSocket),
])
 
if __name__ == "__main__":
    try:
        RPi_GPIO.init(dir())
        #os.chdir(os.path.dirname(__file__))
        tornado.options.parse_command_line()
        signal.signal(signal.SIGINT, signal_handler)       
        http_server = tornado.httpserver.HTTPServer(application, xheaders=True)
        http_server.listen(options.http_port)
        server = SocketServer()    
        server.listen(options.socket_port)
        print ("webserver 127.0.0.1:%s start..." % options.http_port)
        WebHandler.set_asr_callback()
        tornado.ioloop.PeriodicCallback(try_exit, 100).start()
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.instance().stop()
        if Connection.heart_beat_timer != None:
            Connection.heart_beat_timer.cancel()
    finally:
        RPi_GPIO.cleanup()
        tornado.ioloop.IOLoop.instance().stop()
        if Connection.heart_beat_timer != None:
            Connection.heart_beat_timer.cancel()