from data.g_data import GlobalVar
from data.data import *
import threading
import time

class gesture:
	do_post = None
	
	def do_recv(data, ip): 
		post_data = {}
		post_data['mode'] = [GlobalVar.get_mode()]
		
		for k,v in _DEVICE_['lamp'].items():
			if v.get('ip') == ip:
				post_data['dev_id'] = ['lamp']
				post_data['id'] = [k]
				post_data['command'] = ['on'] if _LAMP_[post_data['mode']][k]['status'] == 'off' else ['off']
				gesture.do_post(None, post_data)
				return
				
		for k,v in _DEVICE_['plugin'].items():
			if v.get('ip') == ip:
				post_data['dev_id'] = ['plugin']
				post_data['id'] = [k]
				post_data['command'] = ['on'] if _PLUGIN_[post_data['mode']][k]['status'] == 'off' else ['off']
				gesture.do_post(None, post_data)
				return
				
		for k,v in _DEVICE_['air_conditioner'].items():
			if v.get('ip') == ip:
				post_data['dev_id'] = ['air_conditioner']
				post_data['id'] = [k]
				post_data['command'] = ['on'] if _AIR_CONDITIONER_[post_data['mode']][k]['status'] == 'off' else ['off']
				gesture.do_post(None, post_data)
				return
				
		for k,v in _DEVICE_['curtain'].items():
			if v.get('ip') == ip:
				post_data['dev_id'] = ['curtain']
				post_data['id'] = [k]
				post_data['command'] = ['open'] if _CURTAIN_[post_data['mode']][k]['status'] == 'close' else ['close']
				gesture.do_post(None, post_data)
				return
				
		for k,v in _DEVICE_['tv'].items():
			if v.get('ip') == ip:
				post_data['dev_id'] = ['tv']
				post_data['id'] = [k]
				post_data['command'] = ['on'] if _TV_[post_data['mode']][k]['status'] == 'off' else ['off']
				gesture.do_post(None, post_data)
				return