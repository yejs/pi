from data.g_data import GlobalVar
from data.data import *

class asr:
	name_set = set(['卧室', '客厅', '餐厅', '厨房', '书房']) 

	dev_set = {'灯':'lamp', '窗帘':'curtain', '空调':'air_conditioner', '电视':'tv', '插座':'plugin'}

	mode_set = {'回家':'normal', '离家':'leave', '睡眠':'night', '睡觉':'night', '起夜':'getup', '会客':'guests', '用餐':'diner', '就餐':'diner'}

	asr_set = {0:'0', 1:'1', 2:'2', 3:'3', 4:'4', 5:'5', 6:'6', 7:'7', 8:'8', 9:'9', 10:'10', 11:'开', 12:'关', 13:'音量增加', 14:'音量减小', 15:'上一频道', 16:'下一频道', 17:'红色', 18:'绿色', 19:'蓝色', 20:'卧室', 21:'卧室', 22:'客厅', 23:'餐厅', 24:'厨房', 25:'书房', 26:'回家', 27:'离家', 28:'睡眠', 29:'睡觉', 30:'起夜', 31:'会客', 32:'用餐', 33:'就餐', 34:'灯', 35:'窗帘', 36:'空调', 37:'电视', 38:'插座', 39:'', 40:'开灯', 41:'关灯', 42:'开窗帘', 43:'关窗帘', 44:'开关电视', 45:'开关空调', 46:'开插座', 47:'关插座',48:'开卧室灯',49:'开客厅灯',50:'开卧室电视'}

	asr_callback = None
	name = None
	command = None
	dev_id = GlobalVar.get_dev_id()
	
	def do_recv(data): 
		if None == asr.asr_set.get(int(data)):
			print('asr_set not found %s' %data)
			return
		post_data = {}
		id = None

		asr_cmd = asr.asr_set.get(int(data))
		if asr.mode_set.get(asr_cmd):			#模式指令
			post_data['mode'] = [asr.mode_set.get(asr_cmd)]
			
		elif asr.dev_set.get(asr_cmd):			#指令中带有设备种类如灯、窗帘、空调、电视、插座
			asr.dev_id = asr.dev_set.get(asr_cmd)
			if asr.name:
				id = asr.get_id(asr.dev_id, asr.name)
				
		elif asr.get_name(asr.name_set, asr_cmd):#指令中带有设备名称如卧室、客厅、 餐厅、 厨房、 书房
			asr.name = asr.get_name(asr.name_set, asr_cmd)
			id = asr.get_id(asr.dev_id, asr.name)
			
			
		elif '开' == asr_cmd or '关' == asr_cmd:
			if 'lamp' == asr.dev_id or 'tv' == asr.dev_id or 'plugin' == asr.dev_id:
				asr.command = ('on' if '开' == asr_cmd else 'off')
			elif 'curtain' == asr.dev_id:
				asr.command = ('open' if '开' == asr_cmd else 'close')
			elif 'air_conditioner' == asr.dev_id:
				asr.command = ('power_on' if '开' == asr_cmd else 'power_off')
				
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
			print('do_recv, %s, %s' %(asr.name, post_data['mode']))
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
			else:
				print('do_recv, post_data: %s' %post_data)
				return
			
		asr.asr_callback(None, post_data)
		
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