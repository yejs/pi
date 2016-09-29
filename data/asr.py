from data.g_data import GlobalVar
from data.data import *
import threading
import time
#https://item.taobao.com/item.htm?spm=a230r.1.14.247.QR52p6&id=521526993206&ns=1&abbucket=18#detail
#https://item.taobao.com/item.htm?spm=a230r.1.14.26.QR52p6&id=35649968818&ns=1&abbucket=18#detail
class asr:
	addr_set = set(['卧室', '主卧', '次卧', '客厅', '餐厅', '厨房', '书房']) 

	dev_set = {'灯':'lamp', '窗帘':'curtain', '空调':'air_conditioner', '电视':'tv', '插座':'plugin'}

	mode_set = {'回家':'normal', '离家':'leave', '睡觉':'night', '起夜':'getup', '会客':'guests', '吃饭':'diner'}

	asr_set = {1:'开', 2:'关', 3:'停止', 4:'音量增加', 5:'音量减小', 6:'上一频道', 7:'下一频道', 8:'10', 9:'30', 10:'50', 11:'70', 12:'90', 13:'温度增加', 14:'温度减小', 15:'白色', 16:'红色', 17:'绿色', 18:'蓝色', 19:'黄色', 20:'卧室', 21:'主卧', 22:'次卧', 23:'客厅', 24:'餐厅', 25:'厨房', 26:'书房', 27:'回家', 28:'离家', 29:'睡觉', 30:'起夜', 31:'会客', 32:'吃饭', 33:'灯', 34:'窗帘', 35:'空调', 36:'电视', 37:'插座', 38:'开', 39:'关', 40:'开灯', 41:'关灯', 42:'开窗帘', 43:'关窗帘', 44:'开电视', 45:'关电视', 46:'开空调', 47:'关空调', 48:'开插座', 49:'关插座', 50:'开客厅灯'}
	#38、39是方言
	do_post = None
	addr = None
	command = None
	dev_id = GlobalVar.get_dev_id()
	timer = None
	
	def do_recv(data): 
		idata = int(data, 16)#16进制转为10进制
		#if False == data.isdigit() or (data.isdigit() and None == asr.asr_set.get(int(data))):
		if None == asr.asr_set.get(idata):
			print('asr_set not found %s' %data)
			return
		
		post_data = {}
		id = None

		asr_cmd = asr.asr_set.get(idata)
		
		print('asr, id: %d, cmd:%s' %(idata, asr_cmd))
		
		if asr.mode_set.get(asr_cmd):			#模式指令27~33
			post_data['mode'] = [asr.mode_set.get(asr_cmd)]
			
		elif asr.dev_set.get(asr_cmd):			#指令中带有设备种类如灯、窗帘、空调、电视、插座34~38
			asr.dev_id = asr.dev_set.get(asr_cmd)
			if asr.addr:
				id = asr.get_id(asr.dev_id, asr.addr)
				
		elif asr.get_addr(asr.addr_set, asr_cmd):#指令中带有设备名称如卧室（灯）、客厅（灯）、 餐厅（灯）、 厨房（灯）、 书房（灯）20~26
			asr.addr = asr.get_addr(asr.addr_set, asr_cmd)
			id = asr.get_id(asr.dev_id, asr.addr)
			
			
		elif idata < 20:
			if '开' == asr_cmd or '关' == asr_cmd:#灯、窗帘、空调、电视共用开、关指令
				if 'lamp' == asr.dev_id or 'plugin' == asr.dev_id:
					asr.command = ('on' if '开' == asr_cmd else 'off')
				elif 'curtain' == asr.dev_id:
					asr.command = ('open' if '开' == asr_cmd else 'close')
				elif 'tv' == asr.dev_id:
					asr.command = ('power_on' if '开' == asr_cmd else 'power_off')
				elif 'air_conditioner' == asr.dev_id:
					asr.command = ('power_on' if '开' == asr_cmd else 'power_off')
			elif '音量增加' == asr_cmd or '音量减小' == asr_cmd or '上一频道' == asr_cmd or '下一频道' == asr_cmd or '10' == asr_cmd or '30' == asr_cmd or '50' == asr_cmd or '70' == asr_cmd or '90' == asr_cmd:#电视专用指令
				if 'tv' != asr.dev_id:
					return
				asr.command = None
				if '音量增加' == asr_cmd or '音量减小' == asr_cmd:
					post_data['command'] = ('vol_up' if '音量增加' == asr_cmd else 'vol_down')
				elif '上一频道' == asr_cmd or '下一频道' == asr_cmd:
					post_data['command'] = ('up' if '上一频道' == asr_cmd else 'down')
				elif '10' == asr_cmd or '30' == asr_cmd or '50' == asr_cmd or '70' == asr_cmd or '90' == asr_cmd:
					if '10' == asr_cmd:
						post_data['command'] = ['1']
					elif '30' == asr_cmd:
						post_data['command'] = ['3']
					elif '50' == asr_cmd:
						post_data['command'] = ['5']
					elif '70' == asr_cmd:
						post_data['command'] = ['7']
					elif '90' == asr_cmd:
						post_data['command'] = ['9']

					if asr.timer:
						asr.timer.cancel()
					asr.timer = threading.Timer(1, asr.do_send_ir_0)#发送'0'处理
					asr.timer.start()
			elif '温度增加' == asr_cmd or '温度减小' == asr_cmd:#空调专用指令
				if 'air_conditioner' == asr.dev_id:
					asr.command = None
					post_data['command'] = ('temp_inc' if '温度增加' == asr_cmd else 'temp_dec')
				else:
					return
			elif '白色' == asr_cmd or '红色' == asr_cmd or '绿色' == asr_cmd or '蓝色' == asr_cmd or '紫色' == asr_cmd or '黄色' == asr_cmd:#灯专用指令
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
				
		elif idata >= 40:				#复合指令，如开灯（开+灯）、关灯...
			if asr.get_addr(asr.addr_set, asr_cmd, True):#复合指令中带有设备名称如卧室、客厅、 餐厅、 厨房、 书房
				asr.addr = asr.get_addr(asr.addr_set, asr_cmd, True)

			for k in asr.dev_set.keys():
				if asr_cmd.find(k) != -1:
					asr.dev_id = asr.dev_set[k]
					break
					
			if asr.addr:
				id = asr.get_id(asr.dev_id, asr.addr)
				
			if 'lamp' == asr.dev_id or 'plugin' == asr.dev_id:
				asr.command = ('on' if asr_cmd.find('开') != -1 else 'off')
			elif 'curtain' == asr.dev_id:
				asr.command = ('open' if asr_cmd.find('开') != -1 else 'close')
			elif 'tv' == asr.dev_id:
				asr.command = ('power_on' if asr_cmd.find('开') != -1 else 'power_off')
			elif 'air_conditioner' == asr.dev_id:
				asr.command = ('power_on' if asr_cmd.find('开') != -1 else 'power_off')
					
		if None == asr.mode_set.get(asr_cmd):	#非模式指令，补足余下的参数
			post_data['mode'] = [GlobalVar.get_mode()]
			post_data['dev_id'] = [asr.dev_id]
			print('do_recv, mode:%s, addr:%s, dev_id:%s' %(post_data['mode'], asr.addr, asr.dev_id))
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
		post_data['dev_id'] = [asr.dev_id]#tv
		post_data['id'] = [GlobalVar.get_tv_id()]
		post_data['command'] = ['0']
		asr.do_post(None, post_data)
	
	def get_id(dev_id, addr): 
		for id in _DEVICE_[dev_id]:
			if _DEVICE_[dev_id][id].get('name') and _DEVICE_[dev_id][id]['name'].find(addr) != -1:
				return id
				
		return None
		
	def get_addr(addr_set, addr, like = False): 
		for id in addr_set:
			if (True == like and addr.find(id) != -1) or (False == like and addr == id):
				return id
				
		return None