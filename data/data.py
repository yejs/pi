__all__ = ["_DEVICE_", "_LAMP_", "_CURTAIN_", "_AIR_CONDITIONER_", "_TV_", "_PLUGIN_"]
_DEVICE_ = {"lamp": {"all": {"hide": "false", "name": "\u6240\u6709\u706f"}, "1": {"hide": "false", "pin": "0", "ip": "192.168.1.121", "name": "\u4e3b\u5367\u706f"}, "10": {"hide": "true", "pin": "5", "ip": "192.168.1.111", "name": "\u706f10"}, "11": {"hide": "true", "pin": "0", "ip": "192.168.1.111", "name": "\u706f11"}, "3": {"hide": "false", "pin": "0", "ip": "192.168.1.112", "name": "\u5ba2\u5385\u706f"}, "5": {"hide": "false", "pin": "15", "ip": "192.168.1.110", "name": "\u53a8\u623f\u706f"}, "6": {"hide": "false", "pin": "15", "ip": "192.168.1.111", "name": "\u4e66\u623f\u706f"}, "9": {"hide": "true", "pin": "13", "ip": "192.168.1.111", "name": "\u706f9"}, "8": {"hide": "true", "pin": "13", "ip": "192.168.1.111", "name": "\u706f8"}, "2": {"hide": "false", "pin": "0", "ip": "192.168.1.113", "name": "\u6b21\u5367\u706f"}, "12": {"hide": "true", "pin": "0", "ip": "192.168.1.111", "name": "\u706f12"}, "7": {"hide": "true", "pin": "0", "ip": "192.168.1.111", "name": "\u706f7"}, "4": {"hide": "false", "pin": "15", "ip": "192.168.1.110", "name": "\u9910\u5385\u706f"}}, "ir_in": {"1": {"status": "alert", "ip": "192.168.1.121", "name": "\u7ea2\u59161"}, "4": {"status": "security", "ip": "192.168.1.111", "name": "\u7ea2\u59164"}, "3": {"status": "security", "ip": "192.168.1.120", "name": "\u7ea2\u59163"}, "2": {"status": "security", "ip": "192.168.1.111", "name": "\u7ea2\u59162"}}, "door": {"1": {"status": "open", "ip": "192.168.1.121", "name": "\u95e81"}, "4": {"status": "close", "ip": "192.168.1.112", "name": "\u95e84"}, "3": {"status": "close", "ip": "192.168.1.112", "name": "\u95e83"}, "2": {"status": "close", "ip": "192.168.1.111", "name": "\u95e82"}}, "tv": {"5": {"hide": "false", "brand": "\u6d77\u4fe1", "ip": "192.168.1.111", "name": "\u53a8\u623f\u7535\u89c6"}, "6": {"hide": "false", "brand": "\u6d77\u4fe1", "ip": "192.168.1.111", "name": "\u4e66\u623f\u7535\u89c6"}, "2": {"hide": "false", "brand": "\u6d77\u4fe1", "ip": "192.168.1.113", "name": "\u6b21\u5367\u7535\u89c6"}, "1": {"hide": "false", "brand": "\u6d77\u4fe1", "ip": "192.168.1.120", "name": "\u4e3b\u5367\u7535\u89c6"}, "4": {"hide": "false", "brand": "\u6d77\u4fe1", "ip": "192.168.1.111", "name": "\u9910\u5385\u7535\u89c6"}, "3": {"hide": "false", "brand": "\u6d77\u4fe1", "ip": "192.168.1.111", "name": "\u5ba2\u5385\u7535\u89c6"}}, "curtain": {"all": {"hide": "false", "name": "\u6240\u6709\u7a97\u5e18"}, "1": {"hide": "false", "pin": "0", "ip": "192.168.1.121", "name": "\u4e3b\u5367\u7a97\u5e18", "length": 1.5}, "10": {"hide": "true", "pin": "15", "ip": "192.168.1.111", "name": "\u7a97\u5e1810", "length": 3}, "11": {"hide": "true", "pin": "15", "ip": "192.168.1.111", "name": "\u7a97\u5e1811", "length": 3}, "3": {"hide": "false", "pin": "0", "ip": "192.168.1.111", "name": "\u5ba2\u5385\u7a97\u5e18", "length": 3}, "5": {"hide": "false", "pin": "15", "ip": "192.168.1.111", "name": "\u53a8\u623f\u7a97\u5e18", "length": 3}, "6": {"hide": "false", "pin": "15", "ip": "192.168.1.111", "name": "\u4e66\u623f\u7a97\u5e18", "length": 3}, "9": {"hide": "true", "pin": "15", "ip": "192.168.1.111", "name": "\u7a97\u5e189", "length": 3}, "8": {"hide": "true", "pin": "15", "ip": "192.168.1.111", "name": "\u7a97\u5e188", "length": 9}, "2": {"hide": "false", "pin": "0", "ip": "192.168.1.111", "name": "\u6b21\u5367\u7a97\u5e18", "length": 3}, "12": {"hide": "true", "pin": "15", "ip": "192.168.1.111", "name": "\u7a97\u5e1812", "length": 3}, "7": {"hide": "true", "pin": "15", "ip": "192.168.1.101", "name": "\u7a97\u5e187", "length": 3}, "4": {"hide": "false", "pin": "15", "ip": "192.168.1.111", "name": "\u9910\u5385\u7a97\u5e18", "length": 3}}, "flammable": {"1": {"status": "security", "ip": "192.168.1.121", "name": "\u53ef\u71c3\u6c141"}, "2": {"status": "security", "ip": "192.168.1.111", "name": "\u53ef\u71c3\u6c142"}}, "air_conditioner": {"5": {"hide": "false", "brand": "\u683c\u529b", "ip": "192.168.1.111", "name": "\u53a8\u623f\u7a7a\u8c03"}, "6": {"hide": "false", "brand": "\u683c\u529b", "ip": "192.168.1.111", "name": "\u4e66\u623f\u7a7a\u8c03"}, "2": {"hide": "false", "brand": "\u683c\u529b", "ip": "192.168.1.111", "name": "\u6b21\u5367\u7a7a\u8c03"}, "1": {"hide": "false", "brand": "\u683c\u529b", "ip": "192.168.1.120", "name": "\u4e3b\u5367\u7a7a\u8c03"}, "4": {"hide": "false", "brand": "\u683c\u529b", "ip": "192.168.1.111", "name": "\u9910\u5385\u7a7a\u8c03"}, "3": {"hide": "false", "brand": "\u683c\u529b", "ip": "192.168.1.111", "name": "\u5ba2\u5385\u7a7a\u8c03"}}, "humiture": {"1": {"status": "31.0:45.0", "t_max": 30, "ip": "192.168.1.121", "h_max": 90, "t_min": 0, "name": "\u6e29\u6e7f\u5ea61", "h_min": 40}, "2": {"status": "30:70", "t_max": 30, "ip": "192.168.1.111", "h_max": 90, "t_min": 5, "name": "\u6e29\u6e7f\u5ea62", "h_min": 40}}, "window": {"1": {"status": "close", "ip": "192.168.1.110", "name": "\u7a971"}, "4": {"status": "close", "ip": "192.168.1.113", "name": "\u7a974"}, "3": {"status": "close", "ip": "192.168.1.112", "name": "\u7a973"}, "2": {"status": "close", "ip": "192.168.1.111", "name": "\u7a972"}}, "fire": {"1": {"status": "security", "ip": "192.168.1.121", "name": "\u706b\u8b661"}, "2": {"status": "security", "ip": "192.168.1.111", "name": "\u706b\u8b662"}}, "plugin": {"all": {"hide": "true", "name": "\u6240\u6709\u63d2\u5ea7"}, "1": {"hide": "false", "pin": "15", "ip": "192.168.1.121", "name": "\u4e3b\u5367\u63d2\u5ea7"}, "10": {"hide": "true", "pin": "15", "ip": "192.168.1.111", "name": "\u63d2\u5ea710"}, "11": {"hide": "true", "pin": "24", "ip": "192.168.1.111", "name": "\u63d2\u5ea711"}, "3": {"hide": "false", "pin": "15", "ip": "192.168.1.110", "name": "\u5ba2\u5385\u63d2\u5ea7"}, "5": {"hide": "false", "pin": "15", "ip": "192.168.1.110", "name": "\u53a8\u623f\u63d2\u5ea7"}, "6": {"hide": "false", "pin": "15", "ip": "192.168.1.111", "name": "\u4e66\u623f\u63d2\u5ea7"}, "9": {"hide": "true", "pin": "15", "ip": "192.168.1.111", "name": "\u63d2\u5ea79"}, "8": {"hide": "true", "pin": "15", "ip": "192.168.1.111", "name": "\u63d2\u5ea78"}, "2": {"hide": "false", "pin": "15", "ip": "192.168.1.120", "name": "\u6b21\u5367\u63d2\u5ea7"}, "12": {"hide": "true", "pin": "2", "ip": "192.168.1.111", "name": "\u63d2\u5ea712"}, "7": {"hide": "true", "pin": "15", "ip": "192.168.1.111", "name": "\u63d2\u5ea77"}, "4": {"hide": "false", "pin": "15", "ip": "192.168.1.110", "name": "\u9910\u5385\u63d2\u5ea7"}}}
_LAMP_ = {"night": {"all": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "1": {"color": {"r": 1, "b": 2, "g": 58}, "status": "on"}, "10": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "11": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "3": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "5": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "6": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "9": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "8": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "2": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "12": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "7": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "4": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}}, "leave": {"all": {"color": {"r": 0, "b": 96, "g": 100}, "status": "off"}, "1": {"color": {"r": 5, "b": 44, "g": 3}, "status": "off"}, "10": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "11": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "3": {"color": {"r": 100, "b": 0, "g": 88}, "status": "off"}, "5": {"color": {"r": 0, "b": 100, "g": 48}, "status": "off"}, "6": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "9": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "8": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "2": {"color": {"r": 0, "b": 96, "g": 100}, "status": "off"}, "12": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "7": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "4": {"color": {"r": 0, "b": 92, "g": 100}, "status": "off"}}, "getup": {"all": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "1": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "10": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "11": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "3": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "5": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "6": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "9": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "8": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "2": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "12": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "7": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "4": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}}, "normal": {"all": {"color": {"r": 30, "b": 100, "g": 0}, "status": "off"}, "1": {"color": {"r": 51, "b": 0, "g": 0}, "status": "on"}, "10": {"color": {"r": 0, "b": 100, "g": 76}, "status": "off"}, "11": {"color": {"r": 40, "b": 0, "g": 100}, "status": "off"}, "3": {"color": {"r": 100, "b": 0, "g": 0}, "status": "off"}, "5": {"color": {"r": 0, "b": 100, "g": 76}, "status": "off"}, "6": {"color": {"r": 0, "b": 100, "g": 40}, "status": "off"}, "9": {"color": {"r": 0, "b": 100, "g": 76}, "status": "off"}, "8": {"color": {"r": 0, "b": 100, "g": 76}, "status": "off"}, "2": {"color": {"r": 0, "b": 100, "g": 30}, "status": "off"}, "12": {"color": {"r": 0, "b": 100, "g": 76}, "status": "off"}, "7": {"color": {"r": 0, "b": 100, "g": 80}, "status": "off"}, "4": {"color": {"r": 100, "b": 0, "g": 44}, "status": "off"}}, "guests": {"all": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "1": {"color": {"r": 44, "b": 3, "g": 5}, "status": "off"}, "10": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "11": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "3": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "5": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "6": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "9": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "8": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "2": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "12": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "7": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "4": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}}, "diner": {"all": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "1": {"color": {"r": 0, "b": 0, "g": 100}, "status": "on"}, "10": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "11": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "3": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "5": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "6": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "9": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "8": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "2": {"color": {"r": 100, "b": 100, "g": 100}, "status": "on"}, "12": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "7": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}, "4": {"color": {"r": 100, "b": 100, "g": 100}, "status": "off"}}}
_CURTAIN_ = {"night": {"all": {"status": "open", "progress": 0}, "1": {"status": "open", "progress": 0}, "10": {"status": "open", "progress": 0}, "11": {"status": "open", "progress": 0}, "3": {"status": "open", "progress": 0}, "5": {"status": "open", "progress": 0}, "6": {"status": "open", "progress": 0}, "9": {"status": "open", "progress": 0}, "8": {"status": "open", "progress": 0}, "2": {"status": "open", "progress": 0}, "12": {"status": "open", "progress": 0}, "7": {"status": "open", "progress": 0}, "4": {"status": "open", "progress": 0}}, "leave": {"all": {"status": "open", "progress": 0}, "1": {"status": "close", "progress": 0}, "10": {"status": "close", "progress": 0}, "11": {"status": "close", "progress": 0}, "3": {"status": "close", "progress": 0}, "5": {"status": "close", "progress": 0}, "6": {"status": "close", "progress": 0}, "9": {"status": "close", "progress": 0}, "8": {"status": "close", "progress": 0}, "2": {"status": "close", "progress": 0}, "12": {"status": "close", "progress": 0}, "7": {"status": "open", "progress": 0}, "4": {"status": "close", "progress": 0}}, "getup": {"all": {"status": "open", "progress": 0}, "1": {"status": "open", "progress": 0}, "10": {"status": "open", "progress": 0}, "11": {"status": "open", "progress": 0}, "3": {"status": "open", "progress": 0}, "5": {"status": "open", "progress": 0}, "6": {"status": "open", "progress": 0}, "9": {"status": "open", "progress": 0}, "8": {"status": "open", "progress": 0}, "2": {"status": "open", "progress": 0}, "12": {"status": "open", "progress": 0}, "7": {"status": "open", "progress": 0}, "4": {"status": "open", "progress": 0}}, "normal": {"all": {"status": "stop", "progress": 100}, "1": {"status": "close", "progress": 63}, "10": {"status": "stop", "progress": 8}, "11": {"status": "open", "progress": 0}, "3": {"status": "stop", "progress": 48}, "5": {"status": "stop", "progress": 91}, "6": {"status": "open", "progress": 0}, "9": {"status": "stop", "progress": 20}, "8": {"status": "open", "progress": 0}, "2": {"status": "stop", "progress": 9}, "12": {"status": "stop", "progress": 8}, "7": {"status": "open", "progress": 0}, "4": {"status": "open", "progress": 0}}, "guests": {"all": {"status": "open", "progress": 0}, "1": {"status": "open", "progress": 0}, "10": {"status": "open", "progress": 0}, "11": {"status": "open", "progress": 0}, "3": {"status": "open", "progress": 0}, "5": {"status": "open", "progress": 0}, "6": {"status": "open", "progress": 0}, "9": {"status": "open", "progress": 0}, "8": {"status": "open", "progress": 0}, "2": {"status": "open", "progress": 0}, "12": {"status": "open", "progress": 0}, "7": {"status": "open", "progress": 0}, "4": {"status": "open", "progress": 0}}, "diner": {"all": {"status": "open", "progress": 0}, "1": {"status": "open", "progress": 0}, "10": {"status": "open", "progress": 0}, "11": {"status": "open", "progress": 0}, "3": {"status": "open", "progress": 0}, "5": {"status": "open", "progress": 0}, "6": {"status": "open", "progress": 0}, "9": {"status": "open", "progress": 0}, "8": {"status": "open", "progress": 0}, "2": {"status": "open", "progress": 0}, "12": {"status": "open", "progress": 0}, "7": {"status": "open", "progress": 0}, "4": {"status": "open", "progress": 0}}}
_AIR_CONDITIONER_ = {"night": {"5": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "6": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "2": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "1": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "4": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "3": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}}, "leave": {"5": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "6": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "2": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "1": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 27, "mode": "heat", "power_on": "true", "temp_true": 24}, "4": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "3": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}}, "getup": {"5": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "6": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "2": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "1": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "4": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "3": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}}, "normal": {"5": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "6": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "2": {"left_right_swept": 0, "speed": 3, "up_down_swept": 0, "temp_set": 23, "mode": "heat", "power_on": "true", "temp_true": 24}, "1": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 28, "mode": "health", "power_on": "false", "temp_true": 24}, "4": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "3": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}}, "guests": {"5": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "6": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "2": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "1": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "4": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "3": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}}, "diner": {"5": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "6": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "2": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "1": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "4": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}, "3": {"left_right_swept": 0, "speed": 1, "up_down_swept": 0, "temp_set": 24, "mode": "heat", "power_on": "true", "temp_true": 24}}}
_TV_ = {"night": {"5": {"status": "off"}, "6": {"status": "off"}, "2": {"status": "off"}, "1": {"status": "off"}, "all": {"status": "off"}, "4": {"status": "off"}, "3": {"status": "off"}}, "leave": {"5": {"status": "off"}, "6": {"status": "off"}, "2": {"status": "off"}, "1": {"status": "on"}, "all": {"status": "off"}, "4": {"status": "off"}, "3": {"status": "off"}}, "getup": {"5": {"status": "off"}, "6": {"status": "off"}, "2": {"status": "off"}, "1": {"status": "off"}, "all": {"status": "off"}, "4": {"status": "off"}, "3": {"status": "off"}}, "normal": {"5": {"status": "off"}, "6": {"status": "on"}, "2": {"status": "on"}, "1": {"status": "on"}, "all": {"status": "off"}, "4": {"status": "on"}, "3": {"status": "on"}}, "guests": {"5": {"status": "off"}, "6": {"status": "off"}, "2": {"status": "off"}, "1": {"status": "on"}, "all": {"status": "off"}, "4": {"status": "off"}, "3": {"status": "off"}}, "diner": {"5": {"status": "off"}, "6": {"status": "off"}, "2": {"status": "off"}, "1": {"status": "on"}, "all": {"status": "off"}, "4": {"status": "off"}, "3": {"status": "off"}}}
_PLUGIN_ = {"night": {"all": {"status": "on"}, "1": {"status": "off"}, "10": {"status": "off"}, "11": {"status": "off"}, "3": {"status": "off"}, "5": {"status": "off"}, "6": {"status": "off"}, "9": {"status": "off"}, "8": {"status": "off"}, "2": {"status": "off"}, "12": {"status": "on"}, "7": {"status": "off"}, "4": {"status": "off"}}, "leave": {"all": {"status": "off"}, "1": {"status": "off"}, "10": {"status": "off"}, "11": {"status": "off"}, "3": {"status": "off"}, "5": {"status": "off"}, "6": {"status": "off"}, "9": {"status": "off"}, "8": {"status": "off"}, "2": {"status": "off"}, "12": {"status": "off"}, "7": {"status": "off"}, "4": {"status": "off"}}, "getup": {"all": {"status": "off"}, "1": {"status": "on"}, "10": {"status": "off"}, "11": {"status": "off"}, "3": {"status": "off"}, "5": {"status": "off"}, "6": {"status": "off"}, "9": {"status": "off"}, "8": {"status": "off"}, "2": {"status": "on"}, "12": {"status": "off"}, "7": {"status": "off"}, "4": {"status": "off"}}, "normal": {"all": {"status": "off"}, "1": {"status": "off"}, "10": {"status": "off"}, "11": {"status": "off"}, "3": {"status": "off"}, "5": {"status": "off"}, "6": {"status": "off"}, "9": {"status": "off"}, "8": {"status": "off"}, "2": {"status": "off"}, "12": {"status": "off"}, "7": {"status": "off"}, "4": {"status": "off"}}, "guests": {"all": {"status": "off"}, "1": {"status": "off"}, "10": {"status": "off"}, "11": {"status": "off"}, "3": {"status": "off"}, "5": {"status": "off"}, "6": {"status": "off"}, "9": {"status": "off"}, "8": {"status": "off"}, "2": {"status": "off"}, "12": {"status": "off"}, "7": {"status": "off"}, "4": {"status": "off"}}, "diner": {"all": {"status": "off"}, "1": {"status": "off"}, "10": {"status": "off"}, "11": {"status": "off"}, "3": {"status": "off"}, "5": {"status": "off"}, "6": {"status": "off"}, "9": {"status": "off"}, "8": {"status": "off"}, "2": {"status": "off"}, "12": {"status": "off"}, "7": {"status": "off"}, "4": {"status": "off"}}}
