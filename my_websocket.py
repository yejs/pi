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
        pass#print(message)#WebSocket.broadcast_messages(message)
	
    def broadcast_messages(message):
        for handler in WebSocket.socket_handlers:
            try:
                handler.write_message(message)
            except:
                logging.error('Error sending message', exc_info=True)
				
    #向其它页面客户端广播状态消息(用于各客户端间同步，一个客户端发送命令，其它客户端同时此看到命令)
    def broadcast_device():
        str = '{\"event\": \"device\", \"data\": %s}' %(json.dumps(_DEVICE_))
        WebSocket.broadcast_messages(str) 
		
    def broadcast_the_device(dev_id):
        if _DEVICE_.get(dev_id) == None:
            return

        str = '{\"event\": \"the_device\", \"data\": %s, \"dev_id\":\"%s\"}' %(json.dumps(_DEVICE_[dev_id]), dev_id)
        WebSocket.broadcast_messages(str) 
		
    def broadcast_lamp_status():
        mode = GlobalVar.get_mode()
        str = '{\"event\": \"lamp\", \"data\": %s, \"mode\":\"%s\", \"auto_mode\":\"%s\", \"id\":\"%s\"}' %(json.dumps(_LAMP_[mode]), mode, GlobalVar.get_auto_mode(), GlobalVar.get_lamp_id())
        WebSocket.broadcast_messages(str) 
		
    def broadcast_curtain_status():
        mode = GlobalVar.get_mode()
        str = '{\"event\": \"curtain\", \"data\": %s, \"mode\":\"%s\", \"auto_mode\":\"%s\", \"id\":\"%s\"}' %(json.dumps(_CURTAIN_[mode]), mode, GlobalVar.get_auto_mode(), GlobalVar.get_curtain_id())
        WebSocket.broadcast_messages(str) 
		
    def broadcast_air_status():
        mode = GlobalVar.get_mode()
        str = '{\"event\": \"air_conditioner\", \"data\": %s, \"mode\":\"%s\", \"auto_mode\":\"%s\", \"id\":\"%s\"}' %(json.dumps(_AIR_CONDITIONER_[mode]), mode, GlobalVar.get_auto_mode(), GlobalVar.get_air_conditioner_id())
        WebSocket.broadcast_messages(str) 
		
    def broadcast_tv_status():
        mode = GlobalVar.get_mode()
        str = '{\"event\": \"tv\", \"data\": %s, \"mode\":\"%s\", \"auto_mode\":\"%s\", \"id\":\"%s\"}' %(json.dumps(_TV_[mode]), mode, GlobalVar.get_auto_mode(), GlobalVar.get_tv_id())
        WebSocket.broadcast_messages(str) 
		
    def broadcast_media_status(data, index, mute, play):
        mode = GlobalVar.get_mode()
        str = '{\"event\": \"media\", \"data\": %s, \"mode\":\"%s\", \"auto_mode\":\"%s\", \"id\":\"%s\", \"mute\":\"%s\", \"play\":\"%s\"}' %(data, mode, GlobalVar.get_auto_mode(), index, mute, play)
        WebSocket.broadcast_messages(str) 
		
    def broadcast_plugin_status():
        mode = GlobalVar.get_mode()
        str = '{\"event\": \"plugin\", \"data\": %s, \"mode\":\"%s\", \"auto_mode\":\"%s\", \"id\":\"%s\"}' %(json.dumps(_PLUGIN_[mode]), mode, GlobalVar.get_auto_mode(), GlobalVar.get_plugin_id())
        WebSocket.broadcast_messages(str) 