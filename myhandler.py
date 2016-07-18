#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 命令处理模块 
"""

__author__ = 'yejs'
__version__ = '1.0'


import os
import tornado.web
import json
import base64
import urllib
import logging
import threading
import time

from my_gpio import RPi_GPIO
from my_socket import SocketServer, Connection
from my_websocket import WebSocket
from data import _DEVICE_, _LAMP_ , _CURTAIN_, _AIR_CONDITIONER_, _TV_
from g_data import GlobalVar

#客户端ajax请求处理
class WebHandler(tornado.web.RequestHandler):
    def post(self, *args, **kwargs):
        post_data = {}

        for key in self.request.arguments:
            post_data[key] = self.get_arguments(key)
			
        if post_data.get('mode'):
            if GlobalVar.get_mode() != post_data['mode'][0]:
                GlobalVar.set_last_mode(GlobalVar.get_mode())
            GlobalVar.set_mode(post_data['mode'][0])
        else:
            GlobalVar.set_mode("normal")
			
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
            str1 = '{\"mode\":\"'+GlobalVar.get_mode() + '\"}'
        			
        self.write(str1)#base64.encodestring(str1.encode('gbk')))#响应页面post请求（数据base64简单加密处理）

        if post_data.get('device_set') == None:#设备控制指令
            if dev_id == 'lamp':
                WebHandler.lamp(post_data)
            elif dev_id == 'curtain':
                WebHandler.curtain(post_data) 
            elif dev_id == 'air_conditioner':
                WebHandler.air_conditioner(post_data) 
            elif dev_id == 'tv':
                WebHandler.tv(post_data) 
            elif dev_id == 'car':
                WebHandler.car(post_data) 
            elif dev_id == None:
                WebHandler.lamp(post_data)
                WebHandler.curtain(post_data)

            timer = threading.Timer(5, WebHandler.perform_save)#延时5秒保存
            timer.start()
        else:										#设备参数设定指令
            WebHandler.device_set(post_data)
            WebHandler.perform_save()
        post_data.clear()

    def perform_save(): 
        f = open('data.py','w')            
        f.write('_DEVICE_ = ' + json.dumps(_DEVICE_) + '\n')  
        f.write('_LAMP_ = ' + json.dumps(_LAMP_) + '\n')  
        f.write('_CURTAIN_ = ' + json.dumps(_CURTAIN_) + '\n')  
        f.write('_AIR_CONDITIONER_ = ' + json.dumps(_AIR_CONDITIONER_) + '\n')  
        f.write('_TV_ = ' + json.dumps(_TV_) + '\n')  
        f.close
		
	
    #硬件层输出（GPIO 或 socket到硬件终端）
    def output(dev_id, id, key, value):
        mode = GlobalVar.get_mode()
		
        if dev_id == 'lamp':#灯
            item = _LAMP_[mode][id]
            if key == 'color':		                        #调光调色指令
                key = 'command'
                value = item['status']
        else:
            item = None


        if key == None:    							#模式指令
            key = 'command'
            value = item['status']
		
        Connection.check_output()
        if _DEVICE_[dev_id].get(id):
	
            if _DEVICE_[dev_id][id].get('pin') and key:
                RPi_GPIO.output(int(_DEVICE_[dev_id][id]['pin']), key, value)

            if Connection.sock != None and _DEVICE_[dev_id][id].get('ip') and _DEVICE_[dev_id][id]['hide'] == 'false':
                Connection.sock.output(dev_id, _DEVICE_[dev_id][id]['ip'], _DEVICE_[dev_id][id]['pin'] if _DEVICE_[dev_id][id].get('pin') else None, key, value, item)
				
	#灯业务逻辑模块处理,协议：	mode=normal&dev_id=lamp&id=1&command=on（开关指令） 或 mode=normal&dev_id=lamp&id=1&color=aabbcc（调光调色指令）
    def lamp(post_data):
        last_mode = GlobalVar.get_last_mode()
        mode = GlobalVar.get_mode()
		
        key = None
        value = None
		
        if post_data.get('id'):
            GlobalVar.set_lamp_id(post_data['id'][0])
        else :
            GlobalVar.set_lamp_id('1')
        id = GlobalVar.get_lamp_id()

        item = _LAMP_[mode][id]
		
        if post_data.get('command'):#开关指令
            key = 'command'
            value = post_data[key][0]
            item['status'] = value
        elif post_data.get('color'):#调光调色指令
            key = 'color'
            value = post_data[key][0]

            r, g, b = RPi_GPIO.get_color(value)
            item['color']['r'], item['color']['g'], item['color']['b'] = int(r*100/255 + 0.5), int(g*100/255 + 0.5), int(b*100/255 + 0.5)

        if None == _LAMP_.get(mode):		
            return
			
        if id == 'all' or key == None:
            for k in _LAMP_[mode].keys():
                WebHandler.output('lamp', k, key, value)

        WebHandler.output('lamp', id, key, value)
        WebSocket.broadcast_lamp_status()
        #Connection.test()
		
	#窗帘业务逻辑模块处理,协议：	mode=normal&dev_id=curtain&id=1&command=open&progress=1
    def curtain(post_data):
        last_mode = GlobalVar.get_last_mode()
        mode = GlobalVar.get_mode()
        key = None
        value = None
		
        if post_data.get('id'):
            GlobalVar.set_curtain_id(post_data['id'][0])
        else :
            GlobalVar.set_curtain_id('1')
			
        id = GlobalVar.get_curtain_id()
		

        if post_data.get('command'):#开关指令
            key = 'command'
			
            item = _CURTAIN_[mode][id]
            item['status'] = post_data[key][0]
			

        if post_data.get('progress'):#前端通知当前窗帘开合进度
            _CURTAIN_[mode][id]['progress'] = int(post_data['progress'][0])
			
        if key != None:		
            value = post_data[key][0]
			
        if None == _CURTAIN_.get(mode):		
            return
        
        '''
        TODO:窗帘模式指令下切换有个问题，如果用户在当前模式下开合窗帘过程中按下stop停止指令，窗帘将会停在某个中间状态，
        当用户按下模式指令从别的模式切换回该模式时，会自动执行最后stop指令前的开合指令到结束而不会回到用户态的中间状态,
		而与界面显示的状态不一致
        '''
        if id == 'all' or key == None:
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
            WebHandler.output('curtain', id, key, value)

        WebSocket.broadcast_curtain_status()
		
	#空调业务逻辑模块处理,协议：	mode=normal&dev_id=air_conditioner&id=1&command=power_on
    def air_conditioner(post_data):
        mode = GlobalVar.get_mode()
        last_mode = GlobalVar.get_last_mode()
        key = None
        value = None
		
        if post_data.get('id'):
            GlobalVar.set_air_conditioner_id(post_data['id'][0])
        else :
            GlobalVar.set_air_conditioner_id('1')
		
        if None == _AIR_CONDITIONER_.get(mode):		
            return
			
        id = GlobalVar.get_air_conditioner_id()

        if post_data.get('command'):#解析command指令为具体的空调指令
            key = 'command'
            value = post_data['command'][0]
            item = _AIR_CONDITIONER_[mode][id]
			
            if value.find('power_') != -1:#电源开关指令
                if value.find('power_on') != -1:
                    item['power_on'] = 'true'
                elif value.find('power_off') != -1:
                    item['power_on'] = 'false'
            elif value.find('temp_') != -1:#温度+ 、-指令
                if value.find('temp_inc') != -1:
                    item['temp_set'] += 1
                elif value.find('temp_dec') != -1:
                    item['temp_set'] -= 1
            elif value.find('mode_') != -1:#调整模式指令
                if value.find('mode_heat') != -1:
                    item['mode'] = 'heat'
                elif value.find('mode_cold') != -1:
                    item['mode'] = 'cold'
                elif value.find('mode_dehumidify') != -1:
                    item['mode'] = 'dehumidify'
                elif value.find('mode_blowing') != -1:
                    item['mode'] = 'blowing'
                elif value.find('mode_sleep') != -1:
                    item['mode'] = 'sleep'
                elif value.find('mode_energy') != -1:
                    item['mode'] = 'energy'
                elif value.find('mode_health') != -1:
                    item['mode'] = 'health'
            elif value.find('speed_') != -1:#调整风速指令
                item['speed'] = int(value[6:])
            elif value.find('up_down_swept_') != -1:#调整上下风向指令（扫风、定向吹风）
                item['up_down_swept'] = int(value[14:])
            elif value.find('left_right_swept_') != -1:#调整左右风向指令（扫风、定向吹风）
                item['left_right_swept'] = int(value[17:])
            #print("air_conditioner, key:%s value:%s item:%s" %(key, value, json.dumps(item)))
		
        if id == 'all' or key == None:
            for k in _AIR_CONDITIONER_[mode].keys():
                last_value = _AIR_CONDITIONER_[last_mode][id]['power_on']
                now_value = _AIR_CONDITIONER_[mode][id]['power_on']
                if last_value != now_value:
                    WebHandler.output('air_conditioner', id, 'power_on', now_value)#TODO:模式指令时只关注电源开关，其它指令太复杂，待后续完善

        WebHandler.output('air_conditioner', id, key, value)

        WebSocket.broadcast_air_status()
		
	#电视业务逻辑模块处理,协议：	mode=normal&dev_id=tv&id=1&command=power_on	
    def tv(post_data):
        mode = GlobalVar.get_mode()
        last_mode = GlobalVar.get_last_mode()
        key = None
        value = None

        if post_data.get('id'):
            GlobalVar.set_tv_id(post_data['id'][0])
        else :
            GlobalVar.set_tv_id('1')
		
        if None == _TV_.get(mode):		
            return
			
        id = GlobalVar.get_tv_id()

        if post_data.get('command'):#解析command指令为具体的电视指令
            key = 'command'
            value = post_data['command'][0]
            item = _TV_[mode][id]
            if value == 'power_on':
                item['status'] = 'on'
            elif value == 'power_off':
                item['status'] = 'off'
            #print("tv, key:%s value:%s item:%s" %(key, value, json.dumps(item)))

		
        if id == 'all' or key == None:
            for k in _TV_[mode].keys():
                last_value = _TV_[last_mode][id]['status']
                now_value = _TV_[mode][id]['status']
                if last_value != now_value:
                    WebHandler.output('tv', id, 'power_on', now_value)#TODO:模式指令时只关注电源开关，其它指令太复杂，待后续完善

        WebHandler.output('tv', id, key, value)

        WebSocket.broadcast_tv_status()
		
		
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