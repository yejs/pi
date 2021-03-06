document.write('<script type="text/javascript" src="js/js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/js/data.js"></script>');
document.write('<script type="text/javascript" src="js/js/scroll.js"></script>');
document.write('<script type="text/javascript" src="js/device/lamp.js"></script>');
document.write('<script type="text/javascript" src="js/device/curtain.js"></script>');
document.write('<script type="text/javascript" src="js/device/air_conditioner.js"></script>');
document.write('<script type="text/javascript" src="js/device/tv.js"></script>');
document.write('<script type="text/javascript" src="js/device/media.js"></script>');
document.write('<script type="text/javascript" src="js/device/plugin.js"></script>');

_device = null;//设备对象

dev_id = 'lamp';//设备类别

mode = "normal";//当前模式，取值参照下面的_MODE_SET_

bgColor = 'rgba(180, 180, 180, 1)';


_MODE_SET_ = {'normal':'回家模式', 'leave':'离家模式', 'night':'睡眠模式', 'getup':'晨起模式', 'guests':'会客模式', 'diner':'用餐模式'}
window.onload = function(){
	var url = location.search;
	pos = url.indexOf('dev_id');
	if(pos>=0){
		dev_id = url.substr(pos+7);
	} 
	if(document.getElementById('lamp')){
		if(dev_id == 'lamp'){
		//	lamp.prototype = new device();
		//	lamp.prototype.constructor = lamp;
			_device = new lamp();
		}
		else if(dev_id == 'curtain'){
			_device = new curtain();
		}
		else if(dev_id == 'air_conditioner'){
			_device = new air_conditioner();
		} 
		else if(dev_id == 'tv'){
			_device = new tv();
		}
		else if(dev_id == 'media'){
			_device = new media();
		}
		else if(dev_id == 'plugin'){
			_device = new plugin();
		}
		_device.initIt();
		_device.onresize();
	}
}

window.onresize = function(){
	if(_device)
		_device.onresize();
}

//浏览器为了效率，在页面隐藏的情况下，节点元素值改变了，显示时不会反映到界面上来，
//这里做了个简单处理，在页面显示时重新刷新下节点元素，但是，在改为中文时也会有些问题，
//这里先刷为别的任意值，再改为真正的元素值，看来浏览器也不是万能的，谁让咱比较聪明呢
refresh = function(){
	if(_device && _device.getmessaged){
		document.getElementById('scene_title').innerText = mode;

		if('lamp' == dev_id)
			document.getElementById('scene_title').innerText = _MODE_SET_[mode] + '-- \"' + document.getElementById(_device.id).innerText + (_LAMP_[mode][_device.id]['status'] === 'off' ? '\" 关闭' : (_DEVICE_['lamp'][_device.id]['pin'] != '0' ? '\" 调光调色' : '\" 打开'));	
		else if('curtain' == dev_id)
			document.getElementById('scene_title').innerText = _MODE_SET_[mode] + '-- \"' + document.getElementById(_device.id).innerText + '\"调节开合进度';
		else if('plugin' == dev_id)
			document.getElementById('scene_title').innerText = _MODE_SET_[mode] + '-- \"' + document.getElementById(_device.id).innerText + (_PLUGIN_[mode][_device.id]['status'] === 'off' ? '\" 关闭' : '\" 打开');	
		else if('media' == dev_id)
			document.getElementById('scene_title').innerText = _MODE_SET_[mode] + '-- 音乐';
		else
			document.getElementById('scene_title').innerText = _MODE_SET_[mode] + '-- \"' + document.getElementById(_device.id).innerText + '\"调节';
		
		if('air_conditioner' == dev_id || 'tv' == dev_id)
			_device.setFocus(_device.id);
		
		setTimeout(function() {
		//	_device.doDraw();
		},100);
	}
}


window.addEventListener('message',function(e){
	if('onmessage'===e.data.msg){
		_device.onmessage(e.data.data);
		//console.log(e.data.data);
	}
	else if( 'header_ui' === e.data.msg ){
		_device.onresize();
	}
	else if( 'foot_ui' === e.data.msg ){
		if(e.data.data === 'show')
			document.getElementById('div_number').style.display = 'block';
		else
			document.getElementById('div_number').style.display = 'none';
	}
},false);

//所有设备的父类，所有设备类继承于它
function device()
{
	this.touch_tmp = null;
	this.rect = null;
	this.bar0 = null;
	this.bar1 = null;
	this.bar2 = null;
	this.bar3 = null;
	this.id = '1';
	this.getmessaged = false;

	this.ack = true;
	this.time_ack = null;
	
	this.scrolls = new scroll();


	this.arrayBtn = new Array();

	//创建双缓存
	this.canvasReport = document.createElement("canvas");
	this.canvasImage = document.createElement("canvas");
	this.canvas = document.getElementById('msg');//显示画布

	if(isPC()){
		this.canvas.addEventListener('mousedown', function(event) { 
			_device.doMouseDown(event, true);//不能用this
			}, false);
		this.canvas.addEventListener('mouseup', function(event) { 
		    _device.doMouseUp(event, true);
			}, false);
		this.canvas.addEventListener('mousemove', function(event) { 
		    _device.doMouseMove(event, true);
			}, false);
	}
	else{
		this.canvas.addEventListener('touchstart', function(event) { 
			event.preventDefault();
			if (event.targetTouches.length == 1) { 
			_device.doMouseDown(event, false);
			} 
			}, false);
		this.canvas.addEventListener('touchend', function(event) { 
		//    event.preventDefault();
			_device.doMouseUp(event, false);
			}, false);
		this.canvas.addEventListener('touchcancel', function(event) { 
		//    event.preventDefault();
			_device.doMouseUp(event, false);
			}, false);
		this.canvas.addEventListener('touchmove', function(event) { 
		 //   event.preventDefault();
			if (event.targetTouches.length == 1) { 
			_device.doMouseMove(event, false);
			} 
			}, false);
	}

	//终端语音识别处理
	this.doSpeech = function(speech){
		console.log('语音识别处理指令:' + speech);
		if(speech.indexOf('开')>=0 || speech.indexOf('关')>=0){//开关指令
			for(var i=0;i<20;i++){
				if(document.getElementById(i.toString())){
					if(_DEVICE_[dev_id].hasOwnProperty(i.toString()) && _DEVICE_[dev_id][i.toString()]['hide'] === 'false'){
						var name = document.getElementById(i.toString()).innerText;
						var pos = speech.indexOf(name);
						if(pos >= 0 && speech.length == pos + name.length){
							if(dev_id == 'lamp'){
								_LAMP_[mode][i]['status'] = speech.indexOf('开')>=0 ? 'off' : 'on';//先将终端状态置反，docommand会将此状态重置
								this.docommand(i);
							}
							else if(dev_id == 'curtain'){
								this.docommand(i);
								var loc = {x:this.bar1.x, y:this.bar1.y};
								this.doIt(loc, 1, 0);
							}
							else if(dev_id == 'air_conditioner' || dev_id == 'tv'){					//暂时先只处理电源开、关
								this.docommand(i, speech.indexOf('开')>=0 ? 'power_on' : 'power_off');
							}
							else if(dev_id == 'plugin'){
								_PLUGIN_[mode][i]['status'] = speech.indexOf('开')>=0 ? 'off' : 'on';//先将终端状态置反，docommand会将此状态重置
								this.docommand(i);
							}
						}
					}
				}
			}
		}
		else{
			if(dev_id == 'tv'){//电视频道调节指令
				var g = 0, s = 0, b = 0;
				if(speech.indexOf('十一')>=0)
					g = 1;
				else if(speech.indexOf('十二')>=0)
					g = 2;
				else if(speech.indexOf('十三')>=0)
					g = 3;
				else if(speech.indexOf('十四')>=0)
					g = 4;
				else if(speech.indexOf('十五')>=0)
					g = 5;
				else if(speech.indexOf('十六')>=0)
					g = 6;
				else if(speech.indexOf('十七')>=0)
					g = 7;
				else if(speech.indexOf('十八')>=0)
					g = 8;
				else if(speech.indexOf('十九')>=0)
					g = 9;
				
				else if(speech.indexOf('一十')<0 && speech.indexOf('二十')<0 && speech.indexOf('三十')<0 && speech.indexOf('四十')<0 && speech.indexOf('五十')<0
				 && speech.indexOf('六十')<0 && speech.indexOf('七十')<0 && speech.indexOf('八十')<0 && speech.indexOf('九十')<0){
					s = 0;
					if(speech.indexOf('一')>=0)
						g = 1;
					else if(speech.indexOf('二')>=0)
						g = 2;
					else if(speech.indexOf('三')>=0)
						g = 3;
					else if(speech.indexOf('四')>=0)
						g = 4;
					else if(speech.indexOf('五')>=0)
						g = 5;
					else if(speech.indexOf('六')>=0)
						g = 6;
					else if(speech.indexOf('七')>=0)
						g = 7;
					else if(speech.indexOf('八')>=0)
						g = 8;
					else if(speech.indexOf('九')>=0)
						g = 9;
					
				}
				
				if(speech.indexOf('一十')>=0)
					s = 1;
				else if(speech.indexOf('二十')>=0)
					s = 2;
				else if(speech.indexOf('三十')>=0)
					s = 3;
				else if(speech.indexOf('四十')>=0)
					s = 4;
				else if(speech.indexOf('五十')>=0)
					s = 5;
				else if(speech.indexOf('六十')>=0)
					s = 6;
				else if(speech.indexOf('七十')>=0)
					s = 7;
				else if(speech.indexOf('八十')>=0)
					s = 8;
				else if(speech.indexOf('九十')>=0)
					s = 9;
				else if(speech.indexOf('十')>=0)
					s = 1;
				
				if(speech.indexOf('一百')>=0)
					b = 1;
				else if(speech.indexOf('二百')>=0)
					b = 2;
				else if(speech.indexOf('三百')>=0)
					b = 3;
				else if(speech.indexOf('四百')>=0)
					b = 4;
				else if(speech.indexOf('五百')>=0)
					b = 5;
				else if(speech.indexOf('六百')>=0)
					b = 6;
				else if(speech.indexOf('七百')>=0)
					b = 7;
				else if(speech.indexOf('八百')>=0)
					b = 8;
				else if(speech.indexOf('九百')>=0)
					b = 9;
				console.log('电视频道调节指令:' + b);
				if(b>0){
					this.docommand(this.id, b);
					setTimeout(function(){
						_device.docommand(_device.id, s);
						console.log('电视频道调节指令:' + s);
						setTimeout(function(){
							_device.docommand(_device.id, g);
							console.log('电视频道调节指令:' + g);
						}, 100);
					}, 100);
				}
				else if(b>0){
					this.docommand(this.id, s);
					setTimeout(function(){
						_device.docommand(_device.id, g);
					}, 100);
				}
				else
					this.docommand(this.id, g);
			}
			
		}
	}
	
	this.doMouse = function(event, mouse, down, up) { 
		if(mouse){
			var x = event.pageX; 
			var y = event.pageY; 
			var canvas = event.target; 
		}
		else if(!mouse){
			var touch = event.targetTouches[0];
			
			if(event.targetTouches.length == 0 && up)
				var touch = this.touch_tmp;
			else
				this.touch_tmp = touch;

			var x = touch.pageX; 
			var y = touch.pageY; 
			var canvas = touch.target; 
		}

		var loc = getPointOnCanvas(canvas, x, y); 

		this.doIt(loc, down, up);
		
		if(down)
			this.scrolls.doStart(x, y, null);
		else if(up)
			this.scrolls.doEnd(x, y);
		else
			this.scrolls.doScroll(x, y);
	}
	
	this.isOnBar = function(x, y, bar){
		if(x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height)
			return true;
		return false;
	}

	this.doDraw = function(){
		this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
		this.contextReport.clearRect(0, 0, this.rect.width, this.rect.height);
		
	//	this.contextReport.fillStyle = 'rgba(120, 120, 220, 1)';
	//	this.contextReport.fillRect(0, 0, this.rect.width, this.rect.height);

		this.drawIt(this.contextReport);
		
		this.ctx.drawImage(this.canvasReport, 0, 0);
	}

	this.onresize = function(){
		var h = (window.parent.document.getElementById('header').style.display == 'block') ? 180 : 80;
		this.rect = getWinRect();
		this.rect.height = Math.max(getWinRect().height - 140 - h - this.canvas.offsetTop, 1000);

		this.canvas.width = this.canvasReport.width = this.canvasImage.width = this.rect.width;  
		this.canvas.height = this.canvasReport.height = this.canvasImage.height = this.rect.height;
		var offset = 20;
		var width = this.rect.width-offset*2;
		this.bar0 = {x:offset, y: 5, width:width, height:90, pos:0, isdown:false};
		this.bar1 = {x:offset, y: 205, width:width, height:90, pos:50, isdown:false};
		if('lamp' == dev_id)
			this.bar1 = {x:offset, y: 105, width:width, height:90, pos:0, isdown:false};
		else if('curtain' == dev_id)
			this.bar1 = {x:offset, y: 5, width:width, height:90, pos:0, isdown:false};
		this.bar2 = {x:offset, y: 205, width:width, height:90, pos:50, isdown:false};
		this.bar3 = {x:offset, y: 305, width:width, height:90, pos:0, isdown:false};
		this.contextReport = this.canvasReport.getContext("2d");
		this.contextImage = this.canvasImage.getContext("2d");
		this.ctx = this.canvas.getContext("2d");

		this.setPos();
		this.initDraw();
		this.doDraw();
	}
	this.setID = function(id){
		this.id = id;
	}
	this.setPos = function(){
		if('lamp' == dev_id){
			this.bar1.pos = _LAMP_[mode][this.id]['color']['r'];
			this.bar2.pos = _LAMP_[mode][this.id]['color']['g'];
			this.bar3.pos = _LAMP_[mode][this.id]['color']['b'];
		}
		else if('curtain' == dev_id){
			this.bar1.pos = _CURTAIN_[mode][this.id]['progress'];
			
		}
	}

	
	this.doBtnFocus = function(id) { 
		for(var i=0;i<this.arrayBtn.length;i++){
			if(i == id)
				this.arrayBtn[i].onclick = true;
			else
				this.arrayBtn[i].onclick = false;
		}
	}

	this.doMouseDown = function(event, mouse) { 
		this.doMouse(event, mouse, true, false);
	}
	this.doMouseUp = function(event, mouse) { 
		this.doMouse(event, mouse, false, true);
	}
	this.doMouseMove = function(event, mouse) { 
		this.doMouse(event, mouse, false, false);
	}
	
	//websocket 处理函数
	this.onmessage = function(evt)
	{
		this.getmessaged = true;

		var json = JSON.parse(evt);
		if(!json)
			return;

		if( json.event === "ack" ){
			setTimeout(function(){_device.ack = true;}, 50);//每个命令的响应与下个命令之间留出100ms的时间间隔
		//	console.log('ack:' + JSON.stringify(json));
			return;
		}
		else if( json.event === "asr" ){//自动语音识别
			this.doSpeech(json.data);
		}
		else if( json.event === "device" || json.event === "the_device"){
			
			if(json.event === "device")
				_DEVICE_ = json.data;
			else if(json.event === "the_device")
				_DEVICE_[json.dev_id] = json.data;

			var index = -1;
			for(var i=0;i<20;i++){
				if(document.getElementById(i.toString())){
					if(!_DEVICE_[dev_id].hasOwnProperty(i.toString()) || (_DEVICE_[dev_id].hasOwnProperty(i.toString()) && _DEVICE_[dev_id][i.toString()]['hide'] === 'true')){
						if(-1 == index || (i-1)%3 == 0)
							index = i-1;
						if(index % 3 == 0)
							document.getElementById(i.toString()).style.display = 'none';
						else
							document.getElementById(i.toString()).style.visibility = 'hidden';
					}
					else
						document.getElementById(i.toString()).innerText = _DEVICE_[dev_id][i.toString()]['name'];	
				}
			}
			if(document.getElementById('all')){
				if(_DEVICE_[dev_id].hasOwnProperty('all') && _DEVICE_[dev_id]['all']['hide'] === 'false')
					document.getElementById('all').innerText = _DEVICE_[dev_id]['all']['name'];
				else
					document.getElementById('all').style.display = 'none';
			}
			return;
		} 
		else{

			var id = json.id;
			if(json.event != 'media' && !_DEVICE_[json.event].hasOwnProperty(json.id))
				id = '1';

			mode = json.mode;

			this.setID(id);
			if( json.event != "lamp"  && json.event != "plugin")
				this.setFocus(id);
			
			if( json.event === "lamp" ){
			//	console.log('lamp:' + JSON.stringify(json));
			//这里是服务端所有灯的同步状态信息，即所有客户端显示的灯的状态必需与服务端的状态一致，
			//否则一个客户端发送命令，服务端的状态发生改变，另一个客户端收不到同样的状态将显示不一致的信息
			//真正的命令信息是由ajax发出的（docommand）

				_LAMP_[json.mode] = json.data;

				document.getElementById('scene_title').innerText = _MODE_SET_[mode] + '-- \"' + document.getElementById(json.id).innerText + (_LAMP_[mode][json.id]['status'] === 'off' ? '\" 关闭' : (_DEVICE_['lamp'][id]['pin'] != '0' ? '\" 调光调色' : '\" 打开'));	

				for(var id in _LAMP_[mode]){
					if(_DEVICE_["lamp"].hasOwnProperty(id.toString())){
						if(_LAMP_[mode][id]['status'] === 'on'){
							if(_DEVICE_['lamp'][id]['pin'] != '0'){
								r = _LAMP_[mode][id]['color']['r']*255/100, g = _LAMP_[mode][id]['color']['g']*255/100, b = _LAMP_[mode][id]['color']['b']*255/100;
								color = '#' + parseInt(r/16).toString(16) + parseInt(r%16).toString(16) + parseInt(g/16).toString(16) + parseInt(g%16).toString(16) + parseInt(b/16).toString(16) + parseInt(b%16).toString(16);
							}
							else
								color = '#fcc';
							document.getElementById(id).style.backgroundColor = color;	
						}					
						else
							document.getElementById(id).style.backgroundColor = '#aaa';
					}
				}

				//检查是不是所有灯的状态一样且为全开，如是则‘所有’灯的状态设为全开，否则为关的状态
				for(var id in _LAMP_[mode]){
					if(id == "all")
						break;
					if(_LAMP_[mode]['1']['status'] !== _LAMP_[mode][id]['status'] && _DEVICE_[dev_id][id]['hide'] == 'false'){
						_LAMP_[mode]['all']['status'] = 'off';
						document.getElementById('all').style.backgroundColor = '#aaa';
						break;
					}
				}
				
			} 
			else if( json.event === "curtain" ){
				_CURTAIN_[json.mode] = json.data;
				
			} 
			else if( json.event === "air_conditioner" ){
				_AIR_CONDITIONER_[json.mode] = json.data;
				this.doSwept();
			} 
			else if( json.event === "tv" ){
				_TV_[json.mode] = json.data;
			}
			else if( json.event === "media" ){
				this.do_media_files(json.data, id, json.vol, json.play);
			}
			else if( json.event === "plugin" ){
				_PLUGIN_[json.mode] = json.data;
				
				document.getElementById('scene_title').innerText = _MODE_SET_[mode] + '-- \"' + document.getElementById(json.id).innerText + (_PLUGIN_[mode][json.id]['status'] === 'off' ? '\" 关闭' : '\" 打开');	
				
				for(var id in _PLUGIN_[mode]){
					if(_DEVICE_["plugin"].hasOwnProperty(id.toString())){
						if(_PLUGIN_[mode][id]['status'] === 'on')
							document.getElementById(id).style.backgroundColor = '#e00';					
						else{
							document.getElementById(id).style.backgroundColor = '#aaa';
						}
					}
				}

				//检查是不是所有灯的状态一样且为全开，如是则‘所有’灯的状态设为全开，否则为关的状态
				for(var id in _PLUGIN_[mode]){
					if(id == "all")
						break;
					if(_PLUGIN_[mode]['1']['status'] !== _PLUGIN_[mode][id]['status'] && _DEVICE_[dev_id][id]['hide'] == 'false'){
						_PLUGIN_[mode]['all']['status'] = 'off';
						document.getElementById('all').style.backgroundColor = '#aaa';
						break;
					}
				}
			}
		}

		this.setPos();
		this.doDraw();
	}
	
	//使按钮显示为处于焦点状态（指示当前的设备号）
	this.setFocus = function(id){
		for(var i=0;i<20;i++){
			if(document.getElementById(i.toString())){
				if(i.toString() === id){
					document.getElementById(i).style.backgroundColor = '#e00';
					document.getElementById('all').style.backgroundColor = '#aaa';
				}
				else
					document.getElementById(i).style.backgroundColor = '#aaa';	
			}
		}
	}
	this.docommand = function(id, commandEx){

		param = this.doParam(id, commandEx);
		if(!param)
			return;

		//页面ajax请求
		loadXMLDoc("/control",function()
		{
			if (xmlhttp.readyState==4 && xmlhttp.status==200){
				str = ((xmlhttp.responseText))	
				var json = JSON.parse(str);
			//	var device_set = json.device_set;
			//	console.log(decodeURIComponent(device_set.name));

			}	
			xmlhttp.oncallback(xmlhttp.readyState);	
		}, param);
	}
}
