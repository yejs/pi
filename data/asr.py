from data.g_data import GlobalVar
from data.data import *
import threading
import time
#https://item.taobao.com/item.htm?spm=a230r.1.14.247.QR52p6&id=521526993206&ns=1&abbucket=18#detail
#https://item.taobao.com/item.htm?spm=a230r.1.14.26.QR52p6&id=35649968818&ns=1&abbucket=18#detail
class asr:
	name_set = set(['卧室', '主卧', '次卧', '客厅', '餐厅', '厨房', '书房']) 

	dev_set = {'灯':'lamp', '窗帘':'curtain', '空调':'air_conditioner', '电视':'tv', '插座':'plugin'}

	mode_set = {'回家':'normal', '离家':'leave', '睡眠':'night', '睡觉':'night', '起夜':'getup', '会客':'guests', '用餐':'diner', '吃饭':'diner'}

	asr_set = {0:'开', 1:'关', 2:'停止', 3:'音量增加', 4:'音量减小', 5:'上一频道', 6:'下一频道', 7:'', 8:'', 9:'20', 10:'40', 11:'60', 12:'80', 13:'温度增加', 14:'温度减小', 15:'白色', 16:'红色', 17:'绿色', 18:'蓝色', 18:'紫色', 19:'黄色', 20:'卧室', 21:'主卧', 22:'次卧', 23:'客厅', 24:'餐厅', 25:'厨房', 26:'书房', 27:'回家', 28:'离家', 29:'睡觉', 30:'起夜', 31:'会客', 32:'用餐', 33:'吃饭', 34:'灯', 35:'窗帘', 36:'空调', 37:'电视', 38:'插座', 39:'', 40:'开灯', 41:'关灯', 42:'开窗帘', 43:'关窗帘', 44:'开关电视', 45:'开关空调', 46:'开插座', 47:'关插座',48:'开主卧灯',49:'关主卧灯',50:'开客厅灯'}

	do_post = None
	name = None
	command = None
	dev_id = GlobalVar.get_dev_id()
	timer = None
	
	def do_recv(data): 
		if None == asr.asr_set.get(int(data)):
			print('asr_set not found %s' %data)
			return
		post_data = {}
		id = None

		asr_cmd = asr.asr_set.get(int(data))
		if asr.mode_set.get(asr_cmd):			#模式指令27~33
			post_data['mode'] = [asr.mode_set.get(asr_cmd)]
			
		elif asr.dev_set.get(asr_cmd):			#指令中带有设备种类如灯、窗帘、空调、电视、插座34~38
			asr.dev_id = asr.dev_set.get(asr_cmd)
			if asr.name:
				id = asr.get_id(asr.dev_id, asr.name)
				
		elif asr.get_name(asr.name_set, asr_cmd):#指令中带有设备名称如卧室（灯）、客厅（灯）、 餐厅（灯）、 厨房（灯）、 书房（灯）20~26
			asr.name = asr.get_name(asr.name_set, asr_cmd)
			id = asr.get_id(asr.dev_id, asr.name)
			
			
		elif int(data) < 20:
			if '开' == asr_cmd or '关' == asr_cmd:
				if 'lamp' == asr.dev_id or 'tv' == asr.dev_id or 'plugin' == asr.dev_id:
					asr.command = ('on' if '开' == asr_cmd else 'off')
				elif 'curtain' == asr.dev_id:
					asr.command = ('open' if '开' == asr_cmd else 'close')
				elif 'air_conditioner' == asr.dev_id:
					asr.command = ('power_on' if '开' == asr_cmd else 'power_off')
			elif '音量增加' == asr_cmd or '音量减小' == asr_cmd:
				if 'tv' == asr.dev_id:
					asr.command = None
					post_data['command'] = ('vol_up' if '音量增加' == asr_cmd else 'vol_down')
				else:
					return
			elif '上一频道' == asr_cmd or '下一频道' == asr_cmd:
				if 'tv' == asr.dev_id:
					asr.command = None
					post_data['command'] = ('up' if '上一频道' == asr_cmd else 'down')
				else:
					return
			elif '20' == asr_cmd or '40' == asr_cmd or '60' == asr_cmd or '80' == asr_cmd:
				if 'tv' == asr.dev_id:
					asr.command = None
					if '20' == asr_cmd:
						post_data['command'] = ['2']
					elif '40' == asr_cmd:
						post_data['command'] = ['4']
					elif '60' == asr_cmd:
						post_data['command'] = ['6']
					elif '80' == asr_cmd:
						post_data['command'] = ['8']
						
					if asr.timer:
						asr.timer.cancel()
					asr.timer = threading.Timer(1, asr.do_send_ir_0)#发送'0'处理
					asr.timer.start()
				else:
					return
			elif '温度增加' == asr_cmd or '温度减小' == asr_cmd:
				if 'air_conditioner' == asr.dev_id:
					asr.command = None
					post_data['command'] = ('temp_inc' if '温度增加' == asr_cmd else 'temp_dec')
				else:
					return
			elif '白色' == asr_cmd or '红色' == asr_cmd or '绿色' == asr_cmd or '蓝色' == asr_cmd or '紫色' == asr_cmd or '黄色' == asr_cmd:
				if 'lamp' == asr.dev_id:
					asr.command = None
					if '白色' == asr_cmd:
						post_data['color'] = ['ffffff']
					elif '红色' == asr_cmd:
						post_data['color'] = ['ff0000']
					elif '绿色' == asr_cmd:
						post_data['color'] = ['00ff00']
					elif '蓝色' == asr_cmd:
						post_data['color'] = ['0000ff']
					elif '紫色' == asr_cmd:
						post_data['color'] = ['ff00ff']
					elif '黄色' == asr_cmd:
						post_data['color'] = ['ffff00']
				else:
					return
				
		elif int(data) >= 40:				#复合指令，如开灯（开+灯）、关灯...
			if asr.get_name(asr.name_set, asr_cmd, True):#复合指令中带有设备名称如卧室、客厅、 餐厅、 厨房、 书房
				asr.name = asr.get_name(asr.name_set, asr_cmd, True)

			for k in asr.dev_set.keys():
				if asr_cmd.find(k) != -1:
					asr.dev_id = asr.dev_set[k]
					break
					
			if asr.name:
				id = asr.get_id(asr.dev_id, asr.name)
				
			if 'lamp' == asr.dev_id or 'tv' == asr.dev_id or 'plugin' == asr.dev_id:
				asr.command = ('on' if asr_cmd.find('开') != -1 else 'off')
			elif 'curtain' == asr.dev_id:
				asr.command = ('open' if asr_cmd.find('开') != -1 else 'close')
			elif 'air_conditioner' == asr.dev_id:
				asr.command = ('power_on' if asr_cmd.find('开') != -1 else 'power_off')
					
		if None == asr.mode_set.get(asr_cmd):	#非模式指令，补足余下的参数
			post_data['mode'] = [GlobalVar.get_mode()]
			post_data['dev_id'] = [asr.dev_id]
			print('do_recv, mode:%s, name:%s, dev_id:%s' %(post_data['mode'], asr.name, asr.dev_id))
			if None == id:
				if 'lamp' == asr.dev_id:
					post_data['id'] = [GlobalVar.get_lamp_id()]
				elif 'curtain' == asr.dev_id:
					post_data['id'] = [GlobalVar.get_curtain_id()]
				elif 'air_conditioner' == asr.dev_id:
					post_data['id'] = [GlobalVar.get_air_conditioner_id()]
				elif 'tv' == asr.dev_id:
					post_data['id'] = [GlobalVar.get_tv_id()]
				elif 'plugin' == asr.dev_id:
					post_data['id'] = [GlobalVar.get_plugin_id()]
			else:
				post_data['id'] = [id]
				
			if asr.command:
				post_data['command'] = [asr.command]
			elif None == (asr.command or post_data.get('color')):
				print('do_recv, post_data: %s' %post_data)
				return
			
		asr.do_post(None, post_data)
	
	def do_send_ir_0(): 
		post_data = {}
		post_data['mode'] = [GlobalVar.get_mode()]
		post_data['dev_id'] = [asr.dev_id]
		print('do_send_ir_0, %s' %(post_data['mode']))

		post_data['id'] = [GlobalVar.get_tv_id()]
		post_data['command'] = ['0']
		asr.do_post(None, post_data)
	
	def get_id(dev_id, name): 
		for id in _DEVICE_[dev_id]:
			if _DEVICE_[dev_id][id].get('name') and _DEVICE_[dev_id][id]['name'].find(name) != -1:
				return id
				
		return None
		
	def get_name(name_set, name, like = False): 
		for id in name_set:
			if (True == like and name.find(id) != -1) or (False == like and name == id):
				return id
				
		return None