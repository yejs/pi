#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 命令处理模块 
"""
__author__ = 'yejs'
__version__ = '1.0'

__all__ = ["WebHandler", "RPi_GPIO"]

import os
#import RPi.GPIO as GPIO
import tornado.web
import tornado.websocket
from tornado.tcpserver import TCPServer 
import json
import base64
import urllib
import logging
from data import _DEVICE_, _LAMP_ , _CURTAIN_
import threading
import time

sock = None #声明一个socket全局变量，否则调用Connection.output时会有断言错误 assert isinstance
mode = 'normal'
id = '1'

def set_dev_item(dev, ip, status):    
    for id in _DEVICE_[dev]:    
        if _DEVICE_[dev][id].get('ip') == ip:
            _DEVICE_[dev][id]['status'] = status
    return None
	
def get_dev_index(ip):    
    for dev in _DEVICE_:
        for id in _DEVICE_[dev]:    
            if _DEVICE_[dev][id].get('ip') == ip:
                return dev, id
    return None, None
	
def get_status_item(ip):    
    global mode
    dev, id = get_dev_index(ip)
    if dev and id:
        if dev == 'lamp':
            return _LAMP_[mode][id]
        elif dev == 'curtain':#TODO
            return None
    return None
				
class RPi_GPIO():
	_is_exist = False;
	
	def is_exist(modules, module): 
		for m in modules:
			if m == module:
				return True;
		return False;
		
	def init(modules):
		if RPi_GPIO.is_exist(modules, 'GPIO'):
			print ("RPi.GPIO init...")
			RPi_GPIO._is_exist = True
			GPIO.setmode(GPIO.BOARD)
			for k,v in _DEVICE_['lamp'].items():
				GPIO.setup(int(v['pin']), GPIO.OUT)
				GPIO.output(int(v['pin']), GPIO.HIGH)

	def cleanup():
		if RPi_GPIO._is_exist:
			GPIO.cleanup()
			
	# '7f7f7f'字符串转为 {'r' : 50, 'g' : 50, 'b' : 50}
	def get_color(color):
		r = int('0x' + color[0:2], 16)
		g = int('0x' + color[2:4], 16)
		b = int('0x' + color[4:6], 16)
		return r, g, b
		
	#{'r' : 50, 'g' : 50, 'b' : 50} 转为'7f7f7f'字符串
	def get_colors(item):
		r, g, b = int(item['color']['r']*255/100), int(item['color']['g']*255/100), int(item['color']['b']*255/100)
		color = hex(int(r/16))[2:] + hex(int(r%16))[2:] + hex(int(g/16))[2:] + hex(int(g%16))[2:] + hex(int(b/16))[2:] + hex(int(b%16))[2:]
		return color
		
	def output(pin, key, value):
		if RPi_GPIO._is_exist == False:
			return;

		if key == 'command':#开关指令
			if value == 'on':	
				command = False
			elif value == 'off':
				command = True
			GPIO.output(pin, command)
		elif key == 'color':#调光调色指令
			r, g, b = RPi_GPIO.get_color(value)
		#	GPIO.output(pin, value)

		
class Connection(object):    
    heart_beat_init = False
    heart_beat_timer = None
    clients = set()    
    output_param = list()#{"ip": "", "pin": "", "item": None}
    time_tick = 0
    timer = None
    def __init__(self, stream, address):   
        global sock
        sock = self
        Connection.clients.add(self)   
        self._stream = stream    
        self._address = address    
        self._stream.set_close_callback(self.on_close)    
        self.read_message()    
        print("New connection: %s, " % address[0])

        if False == Connection.heart_beat_init:
            Connection.heart_beat_init = True
            Connection.heart_beat()
  
    def read_message(self):    
        self._stream.read_bytes(1024, self.doRecv, partial=True)

    def doRecv(self, data):    
        obj = json.loads(data[:-1].decode())
        if obj and obj.get('event') == 'report':    
            set_dev_item(obj['dev_id'], self._address[0], obj['status'])
            print("recv from %s: %s" % (self._address[0], data[:-1].decode()))   
            WebSocket.broadcast_device();
        #self._stream.write(data)  	
        self.read_message()
		
    '''
    def broadcast_messages(self, data):    
        print("recv from %s: %s" % (self._address[0], data[:-1].decode()))  
        for conn in Connection.clients:    
            conn._stream.write(data)  	
    '''
    def on_close(self):    
        Connection.clients.remove(self)    
        print("%s closed, connection num %d" % (self._address[0], len(Connection.clients)))  
        for k,v in _DEVICE_['lamp'].items():#当连接断开后，需要将设备的状态设为off,并广播到客户端同步
            if v.get('ip') == self._address[0]:
                _LAMP_[mode][k]['status'] = 'off'

        WebSocket.broadcast_lamp_status()
        WebSocket.broadcast_curtain_status()
	
    def check_output():
        l = len(Connection.output_param)
        if l > 10:
            Connection.output_param = Connection.output_param[l-4:-1]
			
    def output(self, dev_id, ip, pin, item):
        param = {"dev_id": dev_id, "ip": ip, "pin": pin, "item": item}
        Connection.output_param.append(param)  

        if Connection.timer:
            Connection.timer.cancel()
        #输出优化处理，当单位时间内输出很多信息到ESP时，ESP会挂掉，所以这里用定时器做过滤处理，每秒顶多输出10个信息（0.1秒定时）
        if time.time() - Connection.time_tick > 2:
            Connection.output_ex()
        else :
            Connection.timer = threading.Timer(0.1, Connection.output_ex)#延时0.3秒输出
            Connection.timer.start()


    def output_ex():
        Connection.time_tick = time.time()

        if len(Connection.output_param) == 0:
            Connection.timer.cancel()
            Connection.timer = None
            return;
			
        Connection.timer = threading.Timer(0.1, Connection.output_ex)#延时0.3秒输出
        Connection.timer.start()
        param = Connection.output_param.pop()
        dev_id = param['dev_id']
        ip = param['ip']
        pin = param['pin']
        status = param['item']['status']
        if dev_id.find('lamp') != -1:
            color = RPi_GPIO.get_colors(param['item'])#{'r' : 50, 'g' : 50, 'b' : 50} 转为'7f7f7f'字符串
        else:
            color = None
	
        l = len(Connection.output_param)

        if color:
            msg = "{\"event\":\"msg\", \"dev_id\":\"%s\", \"pin\":\"%s\", \"status\":\"%s\", \"color\":\"%s\"}" %(dev_id, pin, status, color)
        else:
            msg = "{\"event\":\"msg\", \"dev_id\":\"%s\", \"pin\":\"%s\", \"status\":\"%s\"}" %(dev_id, pin, status)
			
        for conn in Connection.clients:
            if conn._address[0].find(ip) != -1:
                try:
                    print('outputex: %s , len: %d' % (pin, l))
                    conn._stream.write(msg.encode())
                except:
                    logging.error('Error sending message', exc_info=True)	
		
    #发送心跳包到ESP,因为ESP断电后socket服务检测不到socket断开的动作，这里通过发送心跳检测客户端socket是否已经断开	
    def heart_beat():
        if Connection.heart_beat_timer != None:
            Connection.heart_beat_timer.cancel()
        Connection.heart_beat_timer = threading.Timer(5, Connection.heart_beat)#5秒心跳输出
        Connection.heart_beat_timer.start()
		
        msg = "{\"event\":\"heart_beat\"}"

        for conn in Connection.clients:
            try:
                conn._stream.write(msg.encode())
            except:
                logging.error('Error sending message', exc_info=True)	

    
class SocketServer(TCPServer):    
    def handle_stream(self, stream, address):   
        Connection(stream, address)   
        print("connection num is:", len(Connection.clients))
		
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
        global mode
        global id
        str1 = '{\"event\": \"device\", \"data\":'
        str1 += json.dumps(_DEVICE_)
        str1 += '}'

        WebSocket.broadcast_messages(str1) 
		
    def broadcast_lamp_status():
        global mode
        global id
        str1 = '{\"event\": \"lamp\", \"data\":'
        str1 += json.dumps(_LAMP_[mode])
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += id
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
    def broadcast_curtain_status():
        global mode
        global id
        str1 = '{\"event\": \"curtain\", \"data\":'
        str1 += json.dumps(_CURTAIN_[mode])
        str1 += ', \"mode\":\"'
        str1 += mode
        str1 += '\", \"id\":\"'
        str1 += id
        str1 += '\"}'

        WebSocket.broadcast_messages(str1) 
		
class WebHandler(tornado.web.RequestHandler):
    def post(self, *args, **kwargs):
        global mode
        global id

        post_data = {}

        for key in self.request.arguments:
            post_data[key] = self.get_arguments(key)
			
        if post_data.get('mode'):		
            mode = post_data['mode'][0]
        else:
            mode = "normal"
			
        if post_data.get('dev_id'):
            dev_id = post_data['dev_id'][0]
        else :
            dev_id = None
			
        if post_data.get('id'):
            id = post_data['id'][0]
        else :
            id = '1'
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
                print('dev_id is none')
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
        global sock
		
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
            #print("get_colors: %s  %s  %d  %d" %(value, RPi_GPIO.get_colors(item), r, item['color']['r']))
        elif key == None:    							#模式指令
            key = 'command'
            value = item['status']
		
        Connection.check_output()
        if _DEVICE_[dev_id].get(id):
	
            if _DEVICE_[dev_id][id].get('pin'):
                RPi_GPIO.output(int(_DEVICE_[dev_id][id]['pin']), key, value)

            if sock != None and _DEVICE_[dev_id][id].get('ip') and _DEVICE_[dev_id][id]['hide'] == 'false':
                sock.output(dev_id, _DEVICE_[dev_id][id]['ip'], _DEVICE_[dev_id][id]['pin'], item)

		
    def lamp(post_data):
        global mode
        global id

        key = None
        value = None

        if post_data.get('command'):#开关指令
            key = 'command'
        elif post_data.get('color'):#调光调色指令
            key = 'color'

        if key != None:		
            value = post_data[key][0]
 	

			
        if None == _LAMP_.get(mode):		
            return
			
        if id == 'all' or key == None:
            for k in _LAMP_[mode].keys():
                WebHandler.output('lamp', k, key, value)

        WebHandler.output('lamp', id, key, value)

        WebSocket.broadcast_lamp_status()
		
    def curtain(post_data):
        global mode
        global id

        key = None
        value = None

        if post_data.get('command'):#开关指令
            key = 'command'

        if key != None:		
            value = post_data[key][0]
			
        if None == _LAMP_.get(mode):		
            return
			
        if id == 'all' or key == None:
            for k in _CURTAIN_[mode].keys():
                WebHandler.output('curtain', k, key, value)

        WebHandler.output('curtain', id, key, value)

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