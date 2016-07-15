class GlobalVar:
	mode = 'normal'
	last_mode = 'normal'
	lamp_id = '1'
	curtain_id = '1'
	air_conditioner_id = '1'
	tv_id = '1'
	def set_mode(value):
		GlobalVar.mode = value
	def get_mode():
		return GlobalVar.mode
	def set_last_mode(value):
		GlobalVar.last_mode = value
	def get_last_mode():
		return GlobalVar.last_mode
	def set_lamp_id(value):
		GlobalVar.lamp_id = value
	def get_lamp_id():
		return GlobalVar.lamp_id
	def set_curtain_id(value):
		GlobalVar.curtain_id = value
	def get_curtain_id():
		return GlobalVar.curtain_id
	def set_air_conditioner_id(value):
		GlobalVar.air_conditioner_id = value
	def get_air_conditioner_id():
		return GlobalVar.air_conditioner_id
	def set_tv_id(value):
		GlobalVar.tv_id = value
	def get_tv_id():
		return GlobalVar.tv_id