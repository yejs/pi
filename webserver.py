#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
  服务主模块
"""
__author__ = 'yejs'
__version__ = '1.0'

from myhandler import ControlHandler
from myhandler import RPi_GPIO 
import os
import RPi.GPIO as io

import tornado.httpserver
import tornado.options
import tornado.ioloop
import tornado.web
import signal
import logging
from tornado.options import options
from tornado.options import define, options
define("port", default=8000, help="run on the given port", type=int)

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
    ('/control', ControlHandler),										#动态控制方法
])
 
if __name__ == "__main__":
    try:
        RPi_GPIO.init(dir())
        #os.chdir(os.path.dirname(__file__))
        tornado.options.parse_command_line()
        signal.signal(signal.SIGINT, signal_handler)       
        http_server = tornado.httpserver.HTTPServer(application)
        http_server.listen(options.port)
        print ("webserver 127.0.0.1:%s start..." % options.port)
        tornado.ioloop.PeriodicCallback(try_exit, 100).start()
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.instance().stop()
    finally:
        RPi_GPIO.cleanup()
        tornado.ioloop.IOLoop.instance().stop()