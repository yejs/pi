document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/websocket.js"></script>');
document.write('<script type="text/javascript" src="js/canvas.js"></script>');

_LAMP_ = {'1':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, '2':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, '3':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, '4':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, '5':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, '6':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, '7':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, '8':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, '9':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, '10':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, '11':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}, 'all':{'status' : 'off', 'color' : {'r' : 50, 'g' : 50, 'b' : 50}}};//初始状态都为0（熄灭）
_lamp = null;
_port = 8000;

window.onload = function(){
	if(document.getElementById('lamp')){
		_lamp = new lamp();
		_lamp.ws = websocket.prototype.connect(document.domain, _port, _lamp.onmessage, _lamp.onopen, _lamp.onclose, null);
	}
}

window.onresize = function(){
	_lamp.onresize();
	console.log('onresize');
}

function lamp()
{
	this.isOnBar = function(x, y, bar)
	{
		if(x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height)
			return true;
		return false;
	}
	this.getPos = function(x, bar)
	{
		return parseInt((x - bar.x)*100/bar.width);
	}
	
	this.doDraw = function()
	{
		this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
		this.contextReport.clearRect(0, 0, this.rect.width, this.rect.height);
		this.contextReport.fillStyle = "rgb(220, 0, 0)";
		this.contextReport.fillRect(this.bar1.x, this.bar1.y+this.bar1.height/2 - 2, this.bar1.width, 5);
		this.contextReport.fillStyle = "rgb(0, 220, 0)";
		this.contextReport.fillRect(this.bar2.x, this.bar2.y+this.bar1.height/2 - 2, this.bar2.width, 5);
		this.contextReport.fillStyle = "rgb(0, 0, 220)";
		this.contextReport.fillRect(this.bar3.x, this.bar3.y+this.bar1.height/2 - 2, this.bar3.width, 5);
		
		
		var r = this.bar1.height/2;
		this.contextReport.fillStyle = "rgba(120, 0, 0, 0.5)";
		this.contextReport.roundRect(this.bar1.x + this.bar1.pos*this.bar1.width/100 - r, this.bar1.y, r*2, r*2, r, 1, 0);
		this.contextReport.fillStyle = "rgba(0, 120, 0, 0.5)";
		this.contextReport.roundRect(this.bar2.x + this.bar2.pos*this.bar2.width/100 - r, this.bar2.y, r*2, r*2, r, 1, 0);
		this.contextReport.fillStyle = "rgba(0, 0, 120, 0.5)";
		this.contextReport.roundRect(this.bar3.x + this.bar3.pos*this.bar3.width/100 - r, this.bar3.y, r*2, r*2, r, 1, 0);
	//	console.log(_LAMP_[i.toString()]['color']['b']);
		this.ctx.drawImage(this.canvasReport, 0, 0);
	}
	this.onresize = function()
	{
		this.rect = getWinRect();
		this.rect.height = '300';
		this.canvas.width = this.canvasReport.width = this.rect.width;  
		this.canvas.height = this.canvasReport.height = this.rect.height;
		offset = 60;
		var width = this.rect.width-offset*2;
		this.bar1 = {x:offset, y: 10, width:width, height:80, pos:0, isdown:false};
		this.bar2 = {x:offset, y: 110, width:width, height:80, pos:50, isdown:false};
		this.bar3 = {x:offset, y: 210, width:width, height:80, pos:0, isdown:false};
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
		this.bar1.pos = _LAMP_[this.id]['color']['r'];
		this.bar2.pos = _LAMP_[this.id]['color']['g'];
		this.bar3.pos = _LAMP_[this.id]['color']['b'];
		console.log(this.id);
	}
	
	this.timer = null;
	this.ws = null;
	this.rect = null;
	this.bar1 = null;
	this.bar2 = null;
	this.bar3 = null;
	this.id = '1';
	//创建双缓存
	this.canvasReport = document.createElement("canvas");
	this.canvas = document.getElementById('msg');//显示画布
	this.onresize();
	
//	if(isPC())
	{
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
/*	else{
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
	}*/


	
	this.doMouse = function(event, mouse, down, up) { 
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

		r = _LAMP_[this.id]['color']['r']*255/100, g = _LAMP_[this.id]['color']['g']*255/100, b = _LAMP_[this.id]['color']['b']*255/100;
		
		if(up){
			this.bar1.isdown = false;
			this.bar2.isdown = false;
			this.bar3.isdown = false;
		}
		
		if(this.isOnBar(loc.x, loc.y, this.bar1)){
			if(down)
				this.bar1.isdown = true;
			
			var pos = this.getPos(loc.x, this.bar1);
			if(pos == this.bar1.pos)
				return;
			if(this.bar1.isdown){
				this.bar1.pos = pos;
				r = pos*255/100;
			}
			else
				return;
		}
		else if(this.isOnBar(loc.x, loc.y, this.bar2)){
			if(down)
				this.bar2.isdown = true;

			var pos = this.getPos(loc.x, this.bar2);
			if(pos == this.bar2.pos)
				return;
			
			if(this.bar2.isdown){
				this.bar2.pos = pos;
				g = pos*255/100;
			}
			else
				return;
		}
		else if(this.isOnBar(loc.x, loc.y, this.bar3)){
			if(down)
				this.bar3.isdown = true;

			var pos = this.getPos(loc.x, this.bar3);
			if(pos == this.bar3.pos)
				return;
			
			if(this.bar3.isdown){
				this.bar3.pos = pos;
				b = pos*255/100;
			}
			else
				return;
		}
		else
			return;
		
		this.doDraw();
		
		color = parseInt(r/16).toString(16) + parseInt(r%16).toString(16) + parseInt(g/16).toString(16) + parseInt(g%16).toString(16) + parseInt(b/16).toString(16) + parseInt(b%16).toString(16);
		console.log(color + ',r:' + r + ',g:' + g + ',b:' + b);
		docommand('lamp', this.id, color)
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
		var json = JSON.parse(evt.data);
		if(!json)
			return;
		
		
		if( json.event === "lamp" ){
		//	console.log(JSON.stringify(json.data));
			ret = json.data;//这里是服务端所有灯的同步状态信息，即所有客户端显示的灯的状态必需与服务端的状态一致，
							//否则一个客户端发送命令，服务端的状态发生改变，另一个客户端收不到同样的状态将显示不一致的信息
							//真正的命令信息是由ajax发出的（docommand）
			for(var i=1;i<13;i++){
				if(i == 12)
					i = 'all';
				_LAMP_[i.toString()]['status'] = ret[i.toString()]['status'];
				_LAMP_[i.toString()]['color']['r'] = ret[i.toString()]['color']['r'];
				_LAMP_[i.toString()]['color']['g'] = ret[i.toString()]['color']['g'];
				_LAMP_[i.toString()]['color']['b'] = ret[i.toString()]['color']['b'];
				
				if(ret[i.toString()]['status'] === 'on'){
					r = _LAMP_[i.toString()]['color']['r']*255/100, g = _LAMP_[i.toString()]['color']['g']*255/100, b = _LAMP_[i.toString()]['color']['b']*255/100;
					color = '#' + parseInt(r/16).toString(16) + parseInt(r%16).toString(16) + parseInt(g/16).toString(16) + parseInt(g%16).toString(16) + parseInt(b/16).toString(16) + parseInt(b%16).toString(16);
					document.getElementById(i.toString()).style.backgroundColor = color;	
				}					
				else
					document.getElementById(i.toString()).style.backgroundColor = '#aaa';
			}

			for(var i=1;i<12;i++){
				if(_LAMP_['1']['status'] !== _LAMP_[i.toString()]['status']){
					_LAMP_['all']['status'] = 'off';
					document.getElementById('all').style.backgroundColor = '#aaa';
					break;
				}
			}
		/*	if(same){
				_LAMP_['all']['status'] = _LAMP_['1']['status'];
				if(_LAMP_['1']['status'] === 'on'){
					i = 1;
					r = _LAMP_[i.toString()]['color']['r']*255/100, g = _LAMP_[i.toString()]['color']['g']*255/100, b = _LAMP_[i.toString()]['color']['b']*255/100;
					color = '#' + parseInt(r/16).toString(16) + parseInt(r%16).toString(16) + parseInt(g/16).toString(16) + parseInt(g%16).toString(16) + parseInt(b/16).toString(16) + parseInt(b%16).toString(16);
					document.getElementById('all').style.backgroundColor = color;	
				}				
				else
					document.getElementById('all').style.backgroundColor = '#aaa';
			}*/
		} 
		_lamp.setPos();
		_lamp.doDraw();
	}
	this.onopen = function()
	{
		if(_lamp.timer)
			clearInterval(_lamp.timer);
		
		_lamp.ws.handshake = true;
	}
	
	this.onclose = function()
	{
		_lamp.ws.handshake = false;
		
		if(_lamp.timer)
			clearInterval(_lamp.timer);
		_lamp.timer = setInterval(function(){
			_lamp.ws = websocket.prototype.connect(document.domain, _port, _lamp.onmessage, _lamp.onopen, _lamp.onclose, null);
			}, 5000);
	}
}

docommand = function(dev_id, id, color){
	var btn = document.getElementById(id.toString());

	btn.style.backgroundColor = '#ee0';
	
	if(color == undefined){
		if('lamp' == dev_id){
			if(_LAMP_[id]['status'] === 'on')
				command = 'off';
			else
				command = 'on';
		}
		_lamp.setID(id);
		param = "dev_id=" + dev_id + "&id=" + id + "&command=" + command;
	}
	else
		param = "dev_id=" + dev_id + "&id=" + id + "&color=" + color;
	
	//页面ajax请求
	loadXMLDoc("/control",function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
		//	console.log(base64decode(xmlhttp.responseText));	
			var json = JSON.parse(base64decode(xmlhttp.responseText));
			var command = json.command;
			if('lamp' == dev_id){
			/*	var id = json.id;//parseInt(json.id);
				_LAMP_[id]['status'] = command;
				if(command === 'on')
					document.getElementById(id).style.backgroundColor = '#e00';					
				else
					document.getElementById(id).style.backgroundColor = '#aaa';
				if(id === 'all'){
					for(var i=1;i<12;i++){
						_LAMP_[i]['status'] = _LAMP_[id]['status'];
						if(_LAMP_[id]['status'] == 'on')
							document.getElementById(i.toString()).style.backgroundColor = '#e00';
						else
							document.getElementById(i.toString()).style.backgroundColor = '#aaa';
					}
					if(_LAMP_[id]['status'] == 'on')
						document.getElementById(id).style.backgroundColor = '#e00';
					else
						document.getElementById(id).style.backgroundColor = '#aaa';
				}*/
			}
			else if('car' == dev_id){
				keys = ['car_1', 'car_2', 'car_3', 'car_4', 'car_5'];
				for(index in keys){
					if(keys[index] != json.id){
						document.getElementById(keys[index]).style.backgroundColor = '#0a0';
					}
				}
			}
		}	
		xmlhttp.oncallback(xmlhttp.readyState);	
	}, param);
}