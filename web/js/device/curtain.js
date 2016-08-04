//窗帘类

function curtain()
{
	device.apply(this,arguments);
	
	this.Progress = {timer:null, tick:null, pos:0, time_out:null};
	
	this.initIt = function(){
	}
	
		
	this.initDraw = function()
	{
		var img=new Image();
		img.src = 'images//curtain.png';
		img.onload = function(){
			var offset = _device.bar1.height/2 - 5
			_device.contextImage.drawImage(img, 0, 0, img.width, img.height, _device.bar1.x, _device.bar1.y + 30 + offset, _device.bar1.width, 500);
			_device.drawCurtainImage();
		};
	}
	
	//人机交互处理
	this.doIt = function(loc, down, up){
		if(up){
			this.bar0.isdown = false;
			this.bar1.isdown = false;
			this.bar2.isdown = false;
			this.bar3.isdown = false;
		}
		
		if(loc.x > this.bar1.x + this.bar1.width || loc.x < this.bar1.x || !down)
			return;

		command = this.doCurtain(loc.x, this.bar1, down);//根据点击位置判断窗帘是开还是关的动作
		
		if(-1 == command)
			return;

		this.docommand(this.id, command);
		
		this.doDraw();
	}
	
	this.doCurtain = function(x, bar, down) { 
		if(down)
			bar.isdown = true;

		if(x < bar.x + bar.width/2)
			var pos = parseInt((x - bar.x)*200/bar.width);
		else
			var pos = parseInt((bar.x + bar.width - x)*200/bar.width);

		if(pos == bar.pos || !bar.isdown || this.Progress.time_out)
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
		this.Progress.time_out = setTimeout(function() {_device.Progress.time_out = null;},500);//由于继电器反应有时间差，快速点击继电器来不及响应，所以这里限制点击速度
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
	
	this.drawIt = function(ctx){
		var pos1 = this.bar1.pos*this.bar1.width/200;
		var offset = this.bar1.height/2 - 5, r = 5, h = 10;
		
		//滚动条的左半部分
		ctx.fillStyle = "rgb(220, 0, 0)";
		ctx.roundRect(this.bar1.x, this.bar1.y+offset, pos1, h, r, 1, 0);

		//滚动条的右半部分
		ctx.fillStyle = "rgb(220, 220, 220)";
		ctx.roundRect(this.bar1.x + pos1, this.bar1.y+offset, this.bar1.width - pos1, h, r, 1, 0);

		//滚动条的拖动按钮部分
		r = this.bar1.height/4;
		ctx.fillStyle = "rgba(120, 0, 0, 0.5)";

		ctx.roundRect(this.bar1.x + pos1 - r, this.bar1.y+r, r*2, r*2, r, 1, 0);
		
		this.drawCurtainImage();
	}
	
	this.drawCurtainImage = function(){
		var w = this.bar1.pos*this.bar1.width/200;
		var offset = this.bar1.height/2 + 25;
			
		var h = parseInt(this.rect.height) - 20;
		this.ctx.drawImage(this.canvasImage, this.bar1.x, this.bar1.y + offset, w, h, this.bar1.x, this.bar1.y + offset, w, h);
		this.ctx.drawImage(this.canvasImage, this.bar1.x + this.bar1.width - w, this.bar1.y + offset, w, h, this.bar1.x + this.bar1.width - w, this.bar1.y + offset, w, h);
	}
	
	this.docommandIt = function(id, commandEx){
		if(commandEx == undefined){
			
			if(this.Progress.timer)
				return null;
			
			document.getElementById('scene_title').innerText = _MODE_SET_[mode] + '-- \"' + document.getElementById(id).innerText + '\"调节开合进度';
			this.setFocus(id);
			this.setID(id);
			this.setPos();
			this.doDraw();
			return null;
		}
		else{
			//调窗帘开合进度
			param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + commandEx + "&progress=" + _CURTAIN_[mode][this.id]['progress'];
		}
		return param;
	}
}
