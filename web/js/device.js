document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/data.js"></script>');
//这个文件是灯和窗帘合用的，分别用dev_id区别
_device = null;
_port = 8000;
dev_id = 'lamp';
mode = "normal";

_MODE_SET_ = {'normal':'回家模式', 'leave':'离家模式', 'night':'睡眠模式', 'getup':'晨起模式', 'guests':'会客模式', 'diner':'用餐模式'}
window.onload = function(){

	if(document.getElementById('lamp')){
		_device = new device();
	}
		
	
	var url = location.search;
	pos = url.indexOf('dev_id');
	if(pos>=0){
		dev_id = url.substr(pos+7);
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
		document.getElementById('scene_title').innerText = _MODE_SET_[mode];

		document.getElementById('color_title').innerText = '';
		if('lamp' == dev_id)
			document.getElementById('color_title').innerText = '\"' + document.getElementById(_device.id).innerText + '\"调光调色';
		else if('curtain' == dev_id)
			document.getElementById('color_title').innerText = '\"' + document.getElementById(_device.id).innerText + '\"调节开合进度';
		else
			document.getElementById('color_title').innerText = '\"' + document.getElementById(_device.id).innerText + '\"调节';
		
		if('air_conditioner' == dev_id || 'TV' == dev_id)
			_device.setFocus(_device.id);
	}
}

window.addEventListener('message',function(e){
	if('onmessage'===e.data.msg){
		_device.onmessage(e.data.data);
	//	console.log(e.data.data);
	}
},false);

function device()
{
	this.isOnBar = function(x, y, bar)
	{
		if(x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height)
			return true;
		return false;
	}

	this.initDraw = function()
	{
		if('curtain' == dev_id){
			var img=new Image();
			img.src = 'images//curtain.png';
			img.onload = function(){
				var offset = _device.bar1.height/2 - 5
				_device.contextImage.drawImage(img, 0, 0, img.width, img.height, _device.bar1.x, _device.bar1.y + 30 + offset, _device.bar1.width, 500);
				_device.drawCurtain();
			};
		}
		else if('air_conditioner' == dev_id){
			this.contextImage.clearRect(0, 0, this.rect.width, this.rect.height);
	
			this.imageRect = {x:25, y:5, width:this.rect.width-50 , height:(this.rect.width-50)*5/9};
			var btn_w = 200, btn_h = 100, offset_x = 20, offset_y = 20;
			var y = this.imageRect.y + this.imageRect.height + offset_y;
			this.arrayBtn[0].doResize(this.rect.width/2 - btn_w/2, y, this.rect.width/2 + btn_w/2, y + btn_h);
			this.arrayBtn[1].doResize(this.imageRect.x + offset_x, y, this.imageRect.x + offset_x + btn_w, y+ btn_h);
			this.arrayBtn[2].doResize(this.imageRect.x + this.imageRect.width - offset_x - btn_w, y, this.imageRect.x + this.imageRect.width - offset_x, y + btn_h);
			
			
			this.contextImage.fillStyle = "rgb(141, 178, 159)";
			this.contextImage.roundRect(this.imageRect.x, this.imageRect.y, this.imageRect.width, this.imageRect.height, 20, 1, 0);

			
			this.contextImage.strokeStyle = "rgb(47, 82, 67)";
			this.contextImage.lineWidth = 3;
			this.contextImage.drawLine(this.imageRect.x + this.imageRect.width*2/5, this.imageRect.y, this.imageRect.x + this.imageRect.width*2/5, this.imageRect.y + this.imageRect.height);
			this.contextImage.drawLine(this.imageRect.x, this.imageRect.y + this.imageRect.height/3, this.imageRect.x + this.imageRect.width*2/5, this.imageRect.y + this.imageRect.height/3);
			this.contextImage.drawLine(this.imageRect.x, this.imageRect.y + this.imageRect.height*2/3, this.imageRect.x + this.imageRect.width*2/5, this.imageRect.y + this.imageRect.height*2/3);
			
			this.contextImage.font = _font38;
			this.contextImage.fillStyle = this.contextImage.strokeStyle = "rgb(47, 82, 67)";
			this.contextImage.fillText('风速', this.imageRect.x+25, this.imageRect.y + 60);
			this.contextImage.fillText('风向', this.imageRect.x+25, this.imageRect.y + 60 + this.imageRect.height/3);
			this.contextImage.fillText('扫风', this.imageRect.x+25, this.imageRect.y + 60 + this.imageRect.height*2/3);
			
			this.contextImage.font = _font56;
			this.contextImage.fillText('℃', this.imageRect.x + this.imageRect.width-25-this.contextImage.measureText('℃').width, this.imageRect.y + 60);
		}
	}
	
	this.drawCurtain = function()
	{
		var w = this.bar1.pos*this.bar1.width/200;
		var offset = this.bar1.height/2 + 25;
			
		var h = parseInt(this.rect.height) - 20;
		this.ctx.drawImage(this.canvasImage, this.bar1.x, this.bar1.y + offset, w, h, this.bar1.x, this.bar1.y + offset, w, h);
			
		this.ctx.drawImage(this.canvasImage, this.bar1.x + this.bar1.width - w, this.bar1.y + offset, w, h, this.bar1.x + this.bar1.width - w, this.bar1.y + offset, w, h);
	}
	
	this.doDraw = function()
	{
		this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
		this.contextReport.clearRect(0, 0, this.rect.width, this.rect.height);

		if("lamp" == dev_id){
			var pos1 = this.bar1.pos*this.bar1.width/100, pos2 = this.bar2.pos*this.bar2.width/100, pos3 = this.bar3.pos*this.bar3.width/100;
			var offset = this.bar1.height/2 - 5, r = 5, h = 10;
			//滚动条的左半部分
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgb(220, 0, 0)" : "rgb(220, 220, 220)";
			this.contextReport.roundRect(this.bar1.x, this.bar1.y+offset, pos1, h, r, 1, 0);
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgb(0, 220, 0)" : "rgb(220, 220, 220)";
			this.contextReport.roundRect(this.bar2.x, this.bar2.y+offset, pos2, h, r, 1, 0);
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgb(0, 0, 220)" : "rgb(220, 220, 220)";
			this.contextReport.roundRect(this.bar3.x, this.bar3.y+offset, pos3, h, r, 1, 0);
			
			//滚动条的右半部分
			this.contextReport.fillStyle = "rgb(220, 220, 220)";
			this.contextReport.roundRect(this.bar1.x + pos1, this.bar1.y+offset, this.bar1.width - pos1, h, r, 1, 0);
			this.contextReport.roundRect(this.bar2.x + pos2, this.bar2.y+offset, this.bar2.width - pos2, h, r, 1, 0);
			this.contextReport.roundRect(this.bar3.x + pos3, this.bar3.y+offset, this.bar3.width - pos3, h, r, 1, 0);
			
			//滚动条的拖动按钮部分
			r = this.bar1.height/4;
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgba(120, 0, 0, 0.5)" : "rgb(120, 120, 120, 0.5)";
			this.contextReport.roundRect(this.bar1.x + pos1 - r, this.bar1.y+r, r*2, r*2, r, 1, 0);
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgba(0, 120, 0, 0.5)" : "rgb(120, 120, 120, 0.5)";
			this.contextReport.roundRect(this.bar2.x + pos2 - r, this.bar2.y+r, r*2, r*2, r, 1, 0);
			this.contextReport.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgba(0, 0, 120, 0.5)" : "rgb(120, 120, 120, 0.5)";
			this.contextReport.roundRect(this.bar3.x + pos3 - r, this.bar3.y+r, r*2, r*2, r, 1, 0);
			
			//七彩条状滚动条
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
		else if('curtain' == dev_id){
			var pos1 = this.bar1.pos*this.bar1.width/200;
			var offset = this.bar1.height/2 - 5, r = 5, h = 10;
			
			//滚动条的左半部分
			this.contextReport.fillStyle = "rgb(220, 0, 0)";
			this.contextReport.roundRect(this.bar1.x, this.bar1.y+offset, pos1, h, r, 1, 0);

			//滚动条的右半部分
			this.contextReport.fillStyle = "rgb(220, 220, 220)";
			this.contextReport.roundRect(this.bar1.x + pos1, this.bar1.y+offset, this.bar1.width - pos1, h, r, 1, 0);

			//滚动条的拖动按钮部分
			r = this.bar1.height/4;
			this.contextReport.fillStyle = "rgba(120, 0, 0, 0.5)";
			
			this.drawCurtain();
			
			this.contextReport.roundRect(this.bar1.x + pos1 - r, this.bar1.y+r, r*2, r*2, r, 1, 0);
		}
		else if('air_conditioner' == dev_id){
			this.contextReport.drawImage(this.canvasImage, 0, 0);

			if(this.power_on){
				this.contextReport.font = _font106;
				var tmp = '33'
				this.contextReport.fillStyle = this.contextReport.strokeStyle = "rgb(47, 82, 67)";
				this.contextReport.fillText(tmp, this.imageRect.x + this.imageRect.width*2/5 + this.imageRect.width*3/10 -this.contextReport.measureText(tmp).width/2, this.imageRect.y + this.imageRect.height/2);
			}
			else{
				this.contextReport.fillStyle = "rgba(10, 10, 10, .3)";
				this.contextReport.roundRect(this.imageRect.x, this.imageRect.y, this.imageRect.width, this.imageRect.height, 20, 1, 0);
			}
			
			this.contextReport.fillStyle = "rgb(170, 170, 170)";
			this.arrayBtn[0].drawBtn(this.contextReport, _font38, "rgb(0, 0, 0)", 10);
			this.arrayBtn[1].drawBtn(this.contextReport, _font106, "rgb(0, 0, 0)", 10);
			this.arrayBtn[2].drawBtn(this.contextReport, _font106, "rgb(0, 0, 0)", 10);
			this.contextReport.strokeStyle = "rgb(170, 0, 0)";
			this.contextReport.lineWidth = 5;
			this.contextReport.arcEx(this.arrayBtn[0].left + this.arrayBtn[0].width/2, this.arrayBtn[0].top + this.arrayBtn[0].height/2, 20, 1.4*Math.PI, 1.6*Math.PI, 1, 0, 1);
			this.contextReport.drawLine(this.arrayBtn[0].left + this.arrayBtn[0].width/2,this.arrayBtn[0].top + 20,this.arrayBtn[0].left + this.arrayBtn[0].width/2,this.arrayBtn[0].top + 50);
		}
		this.ctx.drawImage(this.canvasReport, 0, 0);
	}
	this.onresize = function()
	{
		this.rect = getWinRect();
		this.rect.height = '720';
		this.canvas.width = this.canvasReport.width = this.canvasImage.width = this.rect.width;  
		this.canvas.height = this.canvasReport.height = this.canvasImage.height = this.rect.height;
		offset = 20;
		var width = this.rect.width-offset*2;
		this.bar0 = {x:offset, y: 5, width:width, height:90, pos:0, isdown:false};
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
	this.setID = function(id)
	{
		this.id = id;
	}
	this.setPos = function()
	{
		if('lamp' == dev_id){
			this.bar1.pos = _LAMP_[mode][this.id]['color']['r'];
			this.bar2.pos = _LAMP_[mode][this.id]['color']['g'];
			this.bar3.pos = _LAMP_[mode][this.id]['color']['b'];
		}
		else if('curtain' == dev_id){
			this.bar1.pos = _CURTAIN_[mode][this.id]['progress'];
		}
	}
	
	this.rect = null;
	this.bar0 = null;
	this.bar1 = null;
	this.bar2 = null;
	this.bar3 = null;
	this.id = '1';
	this.getmessaged = false;
	this.Progress = {timer:null, tick:null, pos:0};
	this.Progress_timer = null;
	this.Progress_tick = null;
	
	this.power_on = true;
	this.imageRect = {x:0, y:0, width:0, height:0};
	
	this.arrayBtn = new Array();
	for(var i=0;i<7;i++)
	{
		switch(i){
			case 0:
			this.arrayBtn[i] = new tagRECT(0,0,0,0,'');
			break;
			case 1:
			this.arrayBtn[i] = new tagRECT(0,0,0,0,'+');
			break;
			case 2:
			this.arrayBtn[i] = new tagRECT(0,0,0,0,'-');
			break;
			case 3:
			this.arrayBtn[i] = new tagRECT(0,0,0,0,'模式');
			break;
			case 4:
			this.arrayBtn[i] = new tagRECT(0,0,0,0,'风速');
			break;
			case 5:
			this.arrayBtn[i] = new tagRECT(0,0,0,0,'风向');
			break;
			case 6:
			this.arrayBtn[i] = new tagRECT(0,0,0,0,'扫风');
			break;
		}
		
	}

	//创建双缓存
	this.canvasReport = document.createElement("canvas");
	this.canvasImage = document.createElement("canvas");
	this.canvas = document.getElementById('msg');//显示画布
	this.onresize();
	
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
		    event.preventDefault();
			_device.doMouseUp(event, false);
			}, false);
		this.canvas.addEventListener('touchcancel', function(event) { 
		    event.preventDefault();
			_device.doMouseUp(event, false);
			}, false);
		this.canvas.addEventListener('touchmove', function(event) { 
		    event.preventDefault();
			if (event.targetTouches.length == 1) { 
			_device.doMouseMove(event, false);
			} 
			}, false);
	}

	this.doCurtain = function(x, bar, down) { 
		if(down)
			bar.isdown = true;

		if(x < bar.x + bar.width/2)
			var pos = parseInt((x - bar.x)*200/bar.width);
		else
			var pos = parseInt((bar.x + bar.width - x)*200/bar.width);
			
		if(pos == bar.pos || !bar.isdown)
			return -1;

		var command = null;
		if(this.Progress.timer){//如果当前运行中，则中止
			window.clearInterval(this.Progress.timer);
			this.Progress.timer = null;
			_CURTAIN_[mode][this.id]['progress'] = bar.pos = parseInt(bar.pos);
			command = 'stop';
		}
		else{					//根据当前位置与点击位置判断是开还是关
			if(bar.pos > pos)
				command = 'open';
			else
				command  =  'close';

			this.Progress.timer = setInterval(function() {_device.doProgress(bar, command);},40);
			this.Progress.tick = (new Date()).getTime();
			this.Progress.pos = bar.pos;
			this.Progress.count = 0;
		}
		return command;
	}
	
	//显示窗帘开关的进度
	this.doProgress = function(bar, command) { 
		//重要，此处是决定界面显示的进度是否与实际轨道运行是否同步的关键
		var length = _DEVICE_['curtain'][this.id]['length'];
		var tick = (new Date()).getTime() - this.Progress.tick;
		var me_per_ms = 0.0002;					//每秒20cm
		var pos = tick * me_per_ms *100/length;

		if(command == 'open' && bar.pos>0)
			bar.pos = (this.Progress.pos >= pos ? this.Progress.pos - pos : 0);
		else if(command == 'close' && bar.pos<100)
			bar.pos = (this.Progress.pos + pos <= 100 ? this.Progress.pos + pos : 100);
		if((command == 'open' && bar.pos<=0) || (command == 'close' && bar.pos>=100)){
			window.clearInterval(this.Progress.timer);
			this.Progress.timer = null;
			_CURTAIN_[mode][this.id]['progress'] = bar.pos = parseInt(bar.pos);
			this.docommand(this.id, 'stop');//将当前进度通知到其它客户端
		}
		this.doDraw();
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
		if("lamp" == dev_id && _LAMP_[mode][this.id]['status'] === 'off')
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
			this.docommand(this.id, color);
		}
		else if('curtain' == dev_id){
			if(loc.x > this.bar1.x + this.bar1.width || loc.x < this.bar1.x || !down)
				return;

			command = this.doCurtain(loc.x, this.bar1, down);
			
			if(-1 == command)
				return;

			this.docommand(this.id, command);
		}
		else if('air_conditioner' == dev_id){
			if(this.arrayBtn[0].IsInRect(loc, 0) && down){
				this.power_on = this.power_on ? false : true;
			}
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

			_device.setID(json.id);
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
				if(_LAMP_[mode]['1']['status'] !== _LAMP_[mode][id]['status'] && _DEVICE_[dev_id][id]['hide'] == 'false'){
					_LAMP_[mode]['all']['status'] = 'off';
					document.getElementById('all').style.backgroundColor = '#aaa';
					break;
				}
			}
			
		} 
		else if( json.event === "curtain" ){
			_CURTAIN_[json.mode] = json.data;

			var id = json.id;
			if(!_DEVICE_["curtain"].hasOwnProperty(json.id))
				id = '1';

			mode = json.mode;
			document.getElementById('scene_title').innerText = _MODE_SET_[mode];

			_device.setID(id);
			_device.setFocus(id);
		} 
		_device.setPos();
		_device.doDraw();
	}
	
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
		var btn = document.getElementById(id.toString());

		if('lamp' == dev_id){
			if(commandEx == undefined){
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
				param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&color=" + commandEx;
				
			}
		}
		else if('curtain' == dev_id){
			if(commandEx == undefined){
				
				if(this.Progress.timer)
					return;
				
				document.getElementById('color_title').innerText = '\"' + document.getElementById(id).innerText + '\"调节开合进度';
				this.setFocus(id);
				this.setID(id);
				this.setPos();
				this.doDraw();
				return;
			}
			else{
				//调窗帘开合进度
				param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + commandEx + "&progress=" + _CURTAIN_[mode][this.id]['progress'];
			}
		}
		else if('air_conditioner' == dev_id){
			if(commandEx == undefined){

				document.getElementById('color_title').innerText = '\"' + document.getElementById(id).innerText + '\"调节';
				this.setFocus(id);
				this.setID(id);
				this.setPos();
				this.doDraw();
				return;
			}
			else{
		
			//	param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + commandEx + "&progress=" + _CURTAIN_[mode][this.id]['progress'];
			return;//TODO
			}
		}
		else if('TV' == dev_id){
			if(commandEx == undefined){

				document.getElementById('color_title').innerText = '\"' + document.getElementById(id).innerText + '\"调节';
				this.setFocus(id);
				this.setID(id);
				this.setPos();
				this.doDraw();
				return;
			}
			else{
				//调窗帘开合进度
			//	param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + commandEx + "&progress=" + _CURTAIN_[mode][this.id]['progress'];
			return;//TODO
			}
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

