document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/data.js"></script>');

_lamp = null;
_port = 8000;
dev_id = 'lamp';
mode = "normal";

_MODE_SET_ = {'normal':'回家模式', 'leave':'离家模式', 'night':'睡眠模式', 'getup':'晨起模式', 'guests':'会客模式', 'diner':'用餐模式'}
window.onload = function(){

	if(document.getElementById('lamp')){
		_lamp = new lamp();
		
		
	}

	var url = location.search;
	pos = url.indexOf('dev_id');
	if(pos>=0){
		dev_id = url.substr(pos+7);
	}
}

window.onresize = function(){
	_lamp.onresize();
}

refresh = function(){
	if(this.getmessaged){
		if("lamp" == dev_id)
			_LAMP_[mode][_lamp.id]['status'] = _LAMP_[mode][_lamp.id]['status'] == 'on' ? 'off' : 'on';
		else
			_CURTAIN_[mode][_lamp.id]['status'] = _CURTAIN_[mode][_lamp.id]['status'] == 'on' ? 'off' : 'on';
		
		_lamp.docommand(_lamp.id);
	}
}

window.addEventListener('message',function(e){
	if('onmessage'===e.data.msg){
		_lamp.onmessage(e.data.data);
	//	console.log(e.data.data);
	}
},false);

function lamp()
{
	this.isOnBar = function(x, y, bar)
	{
		if(x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height)
			return true;
		return false;
	}

	this.doDraw = function()
	{
		this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
		this.contextReport.clearRect(0, 0, this.rect.width, this.rect.height);

		if("lamp" == dev_id){
			var pos1 = this.bar1.pos*this.bar1.width/100, pos2 = this.bar2.pos*this.bar2.width/100, pos3 = this.bar3.pos*this.bar3.width/100;
			var offset = this.bar1.height/2 - 5, r = 5, h = 10;
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgb(220, 0, 0)" : "rgb(220, 220, 220)";
			this.contextReport.roundRect(this.bar1.x, this.bar1.y+offset, pos1, h, r, 1, 0);
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgb(0, 220, 0)" : "rgb(220, 220, 220)";
			this.contextReport.roundRect(this.bar2.x, this.bar2.y+offset, pos2, h, r, 1, 0);
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgb(0, 0, 220)" : "rgb(220, 220, 220)";
			this.contextReport.roundRect(this.bar3.x, this.bar3.y+offset, pos3, h, r, 1, 0);
			
			this.contextReport.fillStyle = "rgb(220, 220, 220)";
			this.contextReport.roundRect(this.bar1.x + pos1, this.bar1.y+offset, this.bar1.width - pos1, h, r, 1, 0);
			this.contextReport.roundRect(this.bar2.x + pos2, this.bar2.y+offset, this.bar2.width - pos2, h, r, 1, 0);
			this.contextReport.roundRect(this.bar3.x + pos3, this.bar3.y+offset, this.bar3.width - pos3, h, r, 1, 0);
			
			
			r = this.bar1.height/4;
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgba(120, 0, 0, 0.5)" : "rgb(120, 120, 120, 0.5)";
			this.contextReport.roundRect(this.bar1.x + pos1 - r, this.bar1.y+r, r*2, r*2, r, 1, 0);
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgba(0, 120, 0, 0.5)" : "rgb(120, 120, 120, 0.5)";
			this.contextReport.roundRect(this.bar2.x + pos2 - r, this.bar2.y+r, r*2, r*2, r, 1, 0);
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgba(0, 0, 120, 0.5)" : "rgb(120, 120, 120, 0.5)";
			this.contextReport.roundRect(this.bar3.x + pos3 - r, this.bar3.y+r, r*2, r*2, r, 1, 0);
			

			this.contextReport.beginPath();
			var width = this.bar0.width/45;
			for(var i=0;i<45;i++)
				this.contextReport.roundRect2(this.bar0.x + i*width, this.bar0.y, width - 4, this.bar0.height, 8, 0, 0);
			this.contextReport.closePath();
			var grd=this.contextReport.createLinearGradient(this.bar0.x,this.bar0.y,this.bar0.width,0); //颜色渐变的起始坐标和终点坐标
			grd.addColorStop(0, "rgba(255, 0, 0, 1)"); //0表示起点..0.1 0.2 ...1表示终点，配置颜色
			grd.addColorStop(0.25, "rgba(255, 255, 0, 1)");
			grd.addColorStop(0.5, "rgba(0, 255, 0, 1)");
			grd.addColorStop(0.75, "rgba(0, 255, 255, 1)");
			grd.addColorStop(1, "rgba(0, 0, 255, 1)");
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? grd : "rgb(220, 220, 220)";
			this.contextReport.fill();
		}
		this.ctx.drawImage(this.canvasReport, 0, 0);
	}
	this.onresize = function()
	{
		this.rect = getWinRect();
		this.rect.height = '420';
		this.canvas.width = this.canvasReport.width = this.rect.width;  
		this.canvas.height = this.canvasReport.height = this.rect.height;
		offset = 20;
		var width = this.rect.width-offset*2;
		this.bar0 = {x:offset, y: 5, width:width, height:90, pos:0, isdown:false};
		this.bar1 = {x:offset, y: 105, width:width, height:90, pos:0, isdown:false};
		this.bar2 = {x:offset, y: 205, width:width, height:90, pos:50, isdown:false};
		this.bar3 = {x:offset, y: 305, width:width, height:90, pos:0, isdown:false};
		this.contextReport = this.canvasReport.getContext("2d");
		this.ctx = this.canvas.getContext("2d");
		this.doDraw();
	}
	this.setID = function(id)
	{
		this.id = id;
	}
	this.setPos = function()
	{
		this.bar1.pos = _LAMP_[mode][this.id]['color']['r'];
		this.bar2.pos = _LAMP_[mode][this.id]['color']['g'];
		this.bar3.pos = _LAMP_[mode][this.id]['color']['b'];
	//	console.log(this.id);
	}
	
	this.rect = null;
	this.bar0 = null;
	this.bar1 = null;
	this.bar2 = null;
	this.bar3 = null;
	this.id = '1';
	this.getmessaged = false;
	//创建双缓存
	this.canvasReport = document.createElement("canvas");
	this.canvas = document.getElementById('msg');//显示画布
	this.onresize();
	
	if(isPC()){
		this.canvas.addEventListener('mousedown', function(event) { 
			_lamp.doMouseDown(event, true);//不能用this
			}, false);
		this.canvas.addEventListener('mouseup', function(event) { 
		    _lamp.doMouseUp(event, true);
			}, false);
		this.canvas.addEventListener('mousemove', function(event) { 
		    _lamp.doMouseMove(event, true);
			}, false);
	}
	else{
		this.canvas.addEventListener('touchstart', function(event) { 
			event.preventDefault();
			if (event.targetTouches.length == 1) { 
			_lamp.doMouseDown(event, false);
			} 
			}, false);
		this.canvas.addEventListener('touchend', function(event) { 
		    event.preventDefault();
			_lamp.doMouseUp(event, false);
			}, false);
		this.canvas.addEventListener('touchcancel', function(event) { 
		    event.preventDefault();
			_lamp.doMouseUp(event, false);
			}, false);
		this.canvas.addEventListener('touchmove', function(event) { 
		    event.preventDefault();
			if (event.targetTouches.length == 1) { 
			_lamp.doMouseMove(event, false);
			} 
			}, false);
	}

	this.doColor = function(x, bar, down) { 
		if(down)
			bar.isdown = true;

		var pos = parseInt((x - bar.x)*100/bar.width);
		if(pos == bar.pos || !bar.isdown)
			return -1;

		bar.pos = pos;

		return pos*255/100;
	}
	this.doColors = function(x, bar, down) { 
		if(down)
			bar.isdown = true;

		var pos = parseInt((x - bar.x)*100/bar.width);
		if(pos == bar.pos || !bar.isdown)
			return -1;
		
		bar.pos = pos;
		color = {r:0, g:0, b:0};
		if(pos>=0 && pos<25){
			color.r = 255, color.g = pos*255/25, color.b = 0; 
		}
		else if(pos>=25 && pos<50){
			color.r = (50-pos)*255/25, color.g = 255, color.b = 0; 
		}
		else if(pos>=50 && pos<75){
			color.r = 0, color.g = 255, color.b = (pos-50)*255/25; 
		}
		else if(pos>=75 && pos<=100){
			color.r = 0, color.g = (100-pos)*255/25, color.b = 255; 
		}

		return color;
	}
	
	this.doMouse = function(event, mouse, down, up) { 
		if(_LAMP_[mode][this.id]['status'] === 'off')
			return;
		
		if(up){
			this.bar0.isdown = false;
			this.bar1.isdown = false;
			this.bar2.isdown = false;
			this.bar3.isdown = false;
			return;
		}
		if(mouse){
			var x = event.pageX; 
			var y = event.pageY; 
			var canvas = event.target; 
		}
		else if(!mouse){
			var touch = event.targetTouches[0];
			var x = touch.pageX; 
			var y = touch.pageY; 
			var canvas = touch.target; 
		}

		var loc = getPointOnCanvas(canvas, x, y); 
		
		if("lamp" == dev_id){
			if(loc.x > this.bar1.x + this.bar1.width || loc.x < this.bar1.x)
				return;

			r = _LAMP_[mode][this.id]['color']['r']*255/100, g = _LAMP_[mode][this.id]['color']['g']*255/100, b = _LAMP_[mode][this.id]['color']['b']*255/100;
			
			if((this.isOnBar(loc.x, loc.y, this.bar0) && !this.bar1.isdown && !this.bar2.isdown && !this.bar3.isdown) || this.bar0.isdown){
				color = this.doColors(loc.x, this.bar0, down);
				if(-1 == color)
					return;
				r = color.r, g = color.g, b = color.b;
			}
			else if((this.isOnBar(loc.x, loc.y, this.bar1) && !this.bar0.isdown && !this.bar2.isdown && !this.bar3.isdown) || this.bar1.isdown)
				r = this.doColor(loc.x, this.bar1, down);
			else if((this.isOnBar(loc.x, loc.y, this.bar2) && !this.bar0.isdown && !this.bar1.isdown && !this.bar3.isdown) || this.bar2.isdown)
				g = this.doColor(loc.x, this.bar2, down);
			else if((this.isOnBar(loc.x, loc.y, this.bar3) && !this.bar0.isdown && !this.bar1.isdown && !this.bar2.isdown) || this.bar3.isdown)
				b = this.doColor(loc.x, this.bar3, down);
			else
				return;
			
			if(-1 == r || -1 == g || -1 == b)
				return;
			
			color = parseInt(r/16).toString(16) + parseInt(r%16).toString(16) + parseInt(g/16).toString(16) + parseInt(g%16).toString(16) + parseInt(b/16).toString(16) + parseInt(b%16).toString(16);
		//	console.log(color + ',r:' + r + ',g:' + g + ',b:' + b);
			this.docommand(this.id, color)
		}
		
		this.doDraw();
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
		
		if( json.event === "device" ){
		//	console.log('device:' + JSON.stringify(json));
			_DEVICE_ = json.data;

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
		} 
		else if( json.event === "lamp" ){
		//	console.log('lamp:' + JSON.stringify(json));
		//这里是服务端所有灯的同步状态信息，即所有客户端显示的灯的状态必需与服务端的状态一致，
		//否则一个客户端发送命令，服务端的状态发生改变，另一个客户端收不到同样的状态将显示不一致的信息
		//真正的命令信息是由ajax发出的（docommand）

			_LAMP_[json.mode] = json.data;

			mode = json.mode;
			document.getElementById('scene_title').innerText = _MODE_SET_[mode];

			_lamp.setID(json.id);
			document.getElementById('color_title').innerText = '\"' + document.getElementById(json.id).innerText + (_LAMP_[mode][json.id]['status'] === 'off' ? '\" 关闭' : '\" 调色调光');	

			for(var id in _LAMP_[mode]){
				if(_DEVICE_["lamp"].hasOwnProperty(id.toString())){
					if(_LAMP_[mode][id]['status'] === 'on'){
						r = _LAMP_[mode][id]['color']['r']*255/100, g = _LAMP_[mode][id]['color']['g']*255/100, b = _LAMP_[mode][id]['color']['b']*255/100;
						color = '#' + parseInt(r/16).toString(16) + parseInt(r%16).toString(16) + parseInt(g/16).toString(16) + parseInt(g%16).toString(16) + parseInt(b/16).toString(16) + parseInt(b%16).toString(16);
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
				if(_LAMP_[mode]['1']['status'] !== _LAMP_[mode][id]['status']){
					_LAMP_[mode]['all']['status'] = 'off';
					document.getElementById('all').style.backgroundColor = '#aaa';
					break;
				}
			}
		} 
		else if( json.event === "curtain" ){
			_CURTAIN_[json.mode] = json.data;
			
			var id = json.id;
			if(!_DEVICE_["curtain"].hasOwnProperty(json.id)){
				id = '1';
				console.log(json.id);
			}

			mode = json.mode;
			document.getElementById('scene_title').innerText = _MODE_SET_[mode];

			_lamp.setID(id);
			document.getElementById('color_title').innerText = '\"' + document.getElementById(id).innerText + (_CURTAIN_[mode][id]['status'] === 'off' ? '\" 关闭' : '\" 打开');	

			for(var id in _CURTAIN_[mode]){
				if(_DEVICE_["curtain"].hasOwnProperty(id.toString())){
					if(_CURTAIN_[mode][id]['status'] === 'on')
						document.getElementById(id).style.backgroundColor = '#e00';						
					else
						document.getElementById(id).style.backgroundColor = '#aaa';
				}
			}

			//检查是不是所有灯的状态一样且为全开，如是则‘所有’灯的状态设为全开，否则为关的状态
			for(var id in _CURTAIN_[mode]){
				if(id == "all")
					break;
				if(_CURTAIN_[mode]['1']['status'] !== _CURTAIN_[mode][id]['status']){
					_CURTAIN_[mode]['all']['status'] = 'off';
					document.getElementById('all').style.backgroundColor = '#aaa';
					break;
				}
			}
		} 
		_lamp.setPos();
		_lamp.doDraw();
	}
	
	this.docommand = function(id, color){
		var btn = document.getElementById(id.toString());

		if('lamp' == dev_id){
			if(color == undefined){
				if(_LAMP_[mode][id]['status'] === 'on'){
					if(this.id != id){
						this.id = id;
						command = 'on';
					}
					else
						command = 'off';
				}
				else
					command = 'on';
				
				param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + command;
				btn.style.backgroundColor = '#ee0';
			}
			else{
				//调光调色
				param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&color=" + color;
				
			}
		}
		else if('curtain' == dev_id){
			if(_CURTAIN_[mode][id]['status'] === 'on'){
				if(this.id != id){
					this.id = id;
					command = 'on';
				}
				else
					command = 'off';
			}
			else
				command = 'on';
			
			param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + command;
			btn.style.backgroundColor = '#ee0';
		}


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

