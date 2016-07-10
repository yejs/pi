#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 命令处理模块 
"""

__author__ = 'yejs'
__version__ = '1.0'


import os
import tornado.web
import tornado.websocket
from tornado.tcpserver import TCPServer 
import json
import base64
import urllib
import logging
import threading
import time

from my_gpio import RPi_GPIO
from my_socket import SocketServer, Connection
from data import _DEVICE_, _LAMP_ , _CURTAIN_
from g_data import mode, last_mode , lamp_id, curtain_id

		
class WebSocket(tornado.websocket.WebSocketHandler):
    socket_handlers = set()
    def open(self):
        #print( "%s" % (self.request))#.method, self.request.uri, self.request.remote_ip))
        WebSocket.socket_handlers.add(self)
        WebSocket.broadcast_device()
        WebSocket.broadcast_lamp_status()
        WebSocket.broadcast_curtain_status()
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
		
    def broadcast_lamp_status():
        global mode
        global lamp_id
        str1 = '{\"event\": \"lamp\", \"data\":'
        str1 += json.dumps(_LAMP_[mode])
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += lamp_id
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
    def broadcast_curtain_status():
        global mode
        global curtain_id
        str1 = '{\"event\": \"curtain\", \"data\":'
        str1 += json.dumps(_CURTAIN_[mode])
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += curtain_id
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
#客户端ajax请求处理
class WebHandler(tornado.web.RequestHandler):
    def post(self, *args, **kwargs):
        global mode
        global last_mode
        post_data = {}

        for key in self.request.arguments:
            post_data[key] = self.get_arguments(key)
			
        if post_data.get('mode'):
            if mode != post_data['mode'][0]:
                last_mode = mode
            mode = post_data['mode'][0]
        else:
            mode = "normal"
			
        if post_data.get('dev_id'):
            dev_id = post_data['dev_id'][0]
        else :
            dev_id = None
			
        ''' 
        post 参数示例: /control?dev_id=lamp&id=1&command=on
        '''
        #print(json.dumps(post_data))
        if post_data.get('device_set'):	#设定指令
            str1 = '{\"dev_id\":\"'+dev_id+'\", \"id\":\"'+post_data['id'][0]+'\", \"device_set\":'+post_data['device_set'][0]+'}'
        elif post_data.get('command'):	#开关指令
            str1 = '{\"dev_id\":\"'+dev_id+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['command'][0]+'\"}'
        elif post_data.get('color'):	#调光调色指令
            str1 = '{\"dev_id\":\"'+dev_id+'\", \"id\":\"'+post_data['id'][0]+'\", \"command\":\"'+post_data['color'][0]+'\"}'
        elif dev_id == None:			#模式指令
            str1 = '{\"mode\":\"'+mode + '\"}'
        			
        self.write(str1)#base64.encodestring(str1.encode('gbk')))#响应页面post请求（数据base64简单加密处理）

        if post_data.get('device_set') == None:
            if dev_id == 'lamp':
                WebHandler.lamp(post_data)
            elif dev_id == 'curtain':
                WebHandler.curtain(post_data) 
            elif dev_id == 'car':
                WebHandler.car(post_data) 
            elif dev_id == None:
                WebHandler.lamp(post_data)
                WebHandler.curtain(post_data)

            timer = threading.Timer(5, WebHandler.perform_save)#延时5秒保存
            timer.start()
        else:
            WebHandler.device_set(post_data)
            WebHandler.perform_save()
        post_data.clear()

    def perform_save(): 
        f = open('data.py','w')            
        f.write('_DEVICE_ = ' + json.dumps(_DEVICE_) + '\n')  
        f.write('_LAMP_ = ' + json.dumps(_LAMP_) + '\n')  
        f.write('_CURTAIN_ = ' + json.dumps(_CURTAIN_) + '\n')  
        f.close
		
	
    #硬件层输出（GPIO 或 socket到硬件终端）
    def output(dev_id, id, key, value):

        if dev_id == 'lamp':
            item = _LAMP_[mode][id]
        elif dev_id == 'curtain':
            item = _CURTAIN_[mode][id]
        else:#TODO:其它设备待完成
            return;

        if key == 'command':							#开关指令
            item['status'] = value
        elif key == 'color' and dev_id == 'lamp':		#调光调色指令
            r, g, b = RPi_GPIO.get_color(value)
            item['color']['r'], item['color']['g'], item['color']['b'] = int(r*100/255 + 0.5), int(g*100/255 + 0.5), int(b*100/255 + 0.5)
        elif key == None:    							#模式指令
            key = 'command'
            value = item['status']
		
        Connection.check_output()
        if _DEVICE_[dev_id].get(id):
	
            if _DEVICE_[dev_id][id].get('pin'):
                RPi_GPIO.output(int(_DEVICE_[dev_id][id]['pin']), key, value)

            if Connection.sock != None and _DEVICE_[dev_id][id].get('ip') and _DEVICE_[dev_id][id]['hide'] == 'false':
                Connection.sock.output(dev_id, _DEVICE_[dev_id][id]['ip'], _DEVICE_[dev_id][id]['pin'], item)
				
    def lamp(post_data):
        global mode
        global lamp_id

        key = None
        value = None

        if post_data.get('command'):#开关指令
            key = 'command'
        elif post_data.get('color'):#调光调色指令
            key = 'color'
			
        if post_data.get('id'):
            lamp_id = post_data['id'][0]
        else :
            lamp_id = '1'

        if key != None:		
            value = post_data[key][0]
			
        if None == _LAMP_.get(mode):		
            return
			
        if lamp_id == 'all' or key == None:
            for k in _LAMP_[mode].keys():
                WebHandler.output('lamp', k, key, value)

        WebHandler.output('lamp', lamp_id, key, value)

        WebSocket.broadcast_lamp_status()
		
    def curtain(post_data):
        global mode
        global last_mode
        global curtain_id

        key = None
        value = None

        if post_data.get('command'):#开关指令
            key = 'command'
			
        if post_data.get('id'):
            curtain_id = post_data['id'][0]
        else :
            curtain_id = '1'
			
        if post_data.get('progress'):#前端通知当前窗帘开合进度
            _CURTAIN_[mode][curtain_id]['progress'] = int(post_data['progress'][0])
			
        if key != None:		
            value = post_data[key][0]
			
        if None == _CURTAIN_.get(mode):		
            return
        '''
        TODO:窗帘模式指令下切换有个问题，如果用户在当前模式下开合窗帘过程中按下stop停止指令，窗帘将会停在某个中间状态，
        当用户按下模式指令从别的模式切换回该模式时，会自动执行最后stop指令前的开合指令到结束而不会回到用户态的中间状态,
		而与界面显示的状态不一致
        '''
        if curtain_id == 'all' or key == None:
            for id in _CURTAIN_[mode].keys():
                #WebHandler.output('curtain', id, key, value)
                last_progress = _CURTAIN_[last_mode][id]['progress']
                progress = _CURTAIN_[mode][id]['progress']
                if last_progress > progress:
                    command = 'open';
                elif last_progress < progress:
                    command  =  'close';
                else :
                    continue
                WebHandler.output('curtain', id, 'command', command)
				
                length = float(_DEVICE_['curtain'][id]['length']);
                n = float(abs(last_progress - progress)*length/100)/0.2
                #print("last_progress:%s progress:%s length:%s, f:%s" %(last_progress, progress, length, n))
                timer = threading.Timer(n, WebHandler.output, ('curtain', id, 'command', 'stop', ))#延时停止输出
                timer.start()
        else:
            WebHandler.output('curtain', curtain_id, key, value)

        WebSocket.broadcast_curtain_status()
		
    def car(post_data):
        command = post_data['command'][0]
        _CAR_ = {'INT1':11, 'INT2':12, 'INT3':13, 'INT4':15}
        if command == 'front':
            RPi_GPIO.output(_CAR_['INT1'], True)
            RPi_GPIO.output(_CAR_['INT2'], False)
            RPi_GPIO.output(_CAR_['INT3'], True)
            RPi_GPIO.output(_CAR_['INT4'], False)
        elif command == 'back':
            RPi_GPIO.output(_CAR_['INT1'], False)
            RPi_GPIO.output(_CAR_['INT2'], True)
            RPi_GPIO.output(_CAR_['INT3'], False)
            RPi_GPIO.output(_CAR_['INT4'], True)
        elif command == 'stop':
            RPi_GPIO.output(_CAR_['INT1'], False)
            RPi_GPIO.output(_CAR_['INT2'], False)
            RPi_GPIO.output(_CAR_['INT3'], False)
            RPi_GPIO.output(_CAR_['INT4'], False)

    def device_set(post_data):
        if post_data.get('dev_id') == None or post_data.get('id') == None:
            return
        obj = json.loads(post_data['device_set'][0])
        obj['name'] = urllib.parse.unquote(obj['name'])
        _DEVICE_[post_data['dev_id'][0]][post_data['id'][0]] = obj
        WebSocket.broadcast_device()
			
if __name__ == "__main__":
    pass