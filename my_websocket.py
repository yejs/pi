#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 命令处理模块 
"""

__author__ = 'yejs'
__version__ = '1.0'


import os
import tornado.websocket
import json
import base64
import urllib
import logging
import threading
import time

from data.data import *
from data.g_data import GlobalVar
		

class WebSocket(tornado.websocket.WebSocketHandler):
    socket_handlers = set()
    def open(self):
        #print( "%s" % (self.request))#.method, self.request.uri, self.request.remote_ip))
        WebSocket.socket_handlers.add(self)
        WebSocket.broadcast_device()
        WebSocket.broadcast_lamp_status()
        WebSocket.broadcast_curtain_status()
        WebSocket.broadcast_air_status()
        WebSocket.broadcast_tv_status()
        WebSocket.broadcast_plugin_status()
    def on_close(self):
        WebSocket.socket_handlers.remove(self)
    def on_message(self, message):
        WebSocket.broadcast_messages(message)
	
    def broadcast_messages(message):
        for handler in WebSocket.socket_handlers:
            try:
                handler.write_message(message)
            except:
                logging.error('Error sending message', exc_info=True)
				
    #向其它页面客户端广播状态消息(用于各客户端间同步，一个客户端发送命令，其它客户端同时此看到命令)
    def broadcast_device():
        str1 = '{\"event\": \"device\", \"data\":'
        str1 += json.dumps(_DEVICE_)
        str1 += '}'

        WebSocket.broadcast_messages(str1) 
		
    def broadcast_the_device(dev_id):
        if _DEVICE_.get(dev_id) == None:
            return
        str1 = '{\"event\": \"the_device\", \"data\":'
        str1 += json.dumps(_DEVICE_[dev_id])
        str1 += ', \"dev_id\":\"'
        str1 += dev_id
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
    def broadcast_lamp_status():
        mode = GlobalVar.get_mode()
        str1 = '{\"event\": \"lamp\", \"data\":'
        str1 += json.dumps(_LAMP_[mode])
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += GlobalVar.get_lamp_id()
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
    def broadcast_curtain_status():
        mode = GlobalVar.get_mode()
        str1 = '{\"event\": \"curtain\", \"data\":'
        str1 += json.dumps(_CURTAIN_[mode])
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += GlobalVar.get_curtain_id()
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
    def broadcast_air_status():
        mode = GlobalVar.get_mode()
        str1 = '{\"event\": \"air_conditioner\", \"data\":'
        str1 += json.dumps(_AIR_CONDITIONER_[mode])
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += GlobalVar.get_air_conditioner_id()
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
    def broadcast_tv_status():
        mode = GlobalVar.get_mode()
        str1 = '{\"event\": \"tv\", \"data\":'
        str1 += json.dumps(_TV_[mode])
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += GlobalVar.get_tv_id()
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
    def broadcast_plugin_status():
        mode = GlobalVar.get_mode()
        str1 = '{\"event\": \"plugin\", \"data\":'
        str1 += json.dumps(_PLUGIN_[mode])
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += GlobalVar.get_plugin_id()
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 