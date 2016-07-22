_AIR_BTN_ = {'power':0, 'temp_inc':1, 'temp_dec':2, 'mode':3, 'speed':4, 'up_down':5, 'left_right':6};
//空调类

function air_conditioner()
{
	device.apply(this,arguments);

	this.air = {'up_down':{'direction':1, 'swept_flag':0, 'timer':null}, 'left_right':{'direction':1, 'swept_flag':0, 'timer':null}};
	
	this.imageRect = {x:0, y:0, width:0, height:0};
	
	this.initIt = function(){
		for(var i=0;i<7;i++)
		{
			switch(i){
				case _AIR_BTN_.power:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'');
				break;
				case _AIR_BTN_.temp_inc:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'+');
				break;
				case _AIR_BTN_.temp_dec:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'-');
				break;
				case _AIR_BTN_.mode:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'模式');
				break;
				case _AIR_BTN_.speed:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'风速');
				break;
				case _AIR_BTN_.up_down:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'风向');
				break;
				case _AIR_BTN_.left_right:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'扫风');
				break;
			}
		}
	}

	this.initDraw = function()
	{
		this.contextImage.clearRect(0, 0, this.rect.width, this.rect.height);
	
		this.imageRect = {x:25, y:5, width:this.rect.width-50 , height:(this.rect.width-50)*9/18};
		var btn_w = 160, btn_h = 80, offset_x = 20, offset_y = 40;
		var y = this.imageRect.y + this.imageRect.height + offset_y;
		this.arrayBtn[_AIR_BTN_.power].doResize(this.rect.width/2 - btn_w/2, y, this.rect.width/2 + btn_w/2, y + btn_h);
		this.arrayBtn[_AIR_BTN_.temp_inc].doResize(this.imageRect.x + offset_x, y, this.imageRect.x + offset_x + btn_w, y+ btn_h);
		this.arrayBtn[_AIR_BTN_.temp_dec].doResize(this.imageRect.x + this.imageRect.width - offset_x - btn_w, y, this.imageRect.x + this.imageRect.width - offset_x, y + btn_h);
		
		var s = ((this.imageRect.x + this.imageRect.width - offset_x - btn_w) - (this.imageRect.x + offset_x))/3;
		y += 130;
		for(var i=_AIR_BTN_.mode;i<this.arrayBtn.length;i++){
			this.arrayBtn[i].doResize(this.imageRect.x + offset_x + (i-3)*s, y, this.imageRect.x + offset_x + (i-3)*s + btn_w, y + btn_h);
		}
		
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


	//人机交互处理
	this.doIt = function(loc, down, up){
		var air_item = _AIR_CONDITIONER_[mode][this.id];
		var power_on = air_item.power_on == 'false' ? false : true;
		
		if(down){
			var touchBtn = -1;
			for(var i=0;i<this.arrayBtn.length;i++){
				if(this.arrayBtn[i].IsInRect(loc, 0) && (i == _AIR_BTN_.power || (i != _AIR_BTN_.power && power_on))){
					if((_AIR_BTN_.temp_inc == i && air_item.temp_set == 30) || (_AIR_BTN_.temp_dec == i && air_item.temp_set == 16))
						return;
					this.arrayBtn[i].istouch = true;
					touchBtn = i;
				//	break;
				}
			}

			//与普通按键不同，按键按下时处理，非松开处理
			//与电视按键不同，空调按键不需要连续按的功能
			if(this.ack && touchBtn > -1){
				this.ack = false;
				this.doAirKey(loc);
		
				time_ack = setTimeout(function() {//空调终端没返回应答时的超时处理
					_device.ack = true; 
					time_ack = null;
				},1000);
			}
		}
		else if(up){
			for(var i=0;i<this.arrayBtn.length;i++){
				this.arrayBtn[i].istouch = false;
			}
			if(this.time_ack){
				clearTimeout(this.time_ack);
				this.time_ack = null;
			}
		}
		this.doDraw();
	}
	
	this.doAirKey = function(loc) { 
		var air_item = _AIR_CONDITIONER_[mode][this.id];
		var power_on = air_item.power_on == 'false' ? false : true;
		
		if(this.arrayBtn[_AIR_BTN_.power].IsInRect(loc, 0)){//power
			power_on = power_on ? false : true;

			this.docommand(this.id, power_on ? 'power_on' : 'power_off');
			this.doBtnFocus(_AIR_BTN_.power);
		}
		else if(this.arrayBtn[_AIR_BTN_.temp_inc].IsInRect(loc, 0) && power_on){//+
			if(air_item.temp_set < 30){
				air_item.temp_set++;
				this.docommand(this.id, 'temp_inc');
			}
			else
				return;
		}
		else if(this.arrayBtn[_AIR_BTN_.temp_dec].IsInRect(loc, 0) && power_on){//-
			if(air_item.temp_set > 16){
				air_item.temp_set--;
				this.docommand(this.id, 'temp_dec');
			}
			else
				return;
		}
		else if(this.arrayBtn[_AIR_BTN_.mode].IsInRect(loc, 0) && power_on){//mode
			if(air_item.mode == 'heat')
				air_item.mode = 'cold';
			else if(air_item.mode == 'cold')
				air_item.mode = 'dehumidify';
			else if(air_item.mode == 'dehumidify')
				air_item.mode = 'blowing';
			else if(air_item.mode == 'blowing')
				air_item.mode = 'sleep';
			else if(air_item.mode == 'sleep')
				air_item.mode = 'energy';
			else if(air_item.mode == 'energy')
				air_item.mode = 'health';
			else if(air_item.mode == 'health')
				air_item.mode = 'heat';
			this.docommand(this.id, 'mode_' + air_item.mode);
			this.doBtnFocus(_AIR_BTN_.mode);
		}
		
		else if(this.arrayBtn[_AIR_BTN_.speed].IsInRect(loc, 0) && power_on){//speed
			if(air_item.speed < 5)
				air_item.speed++;
			else if(air_item.speed == 5)
				air_item.speed = 1;
			this.docommand(this.id, 'speed_' + air_item.speed);
			this.doBtnFocus(_AIR_BTN_.speed);
		}
		else if(this.arrayBtn[_AIR_BTN_.up_down].IsInRect(loc, 0) && power_on){//up_down
			air_item.up_down_swept = air_item.up_down_swept ? 0 : 1;
			this.docommand(this.id, 'up_down_swept_' + air_item.up_down_swept);
			this.doSwept();
			this.doBtnFocus(_AIR_BTN_.up_down);
		}
		else if(this.arrayBtn[_AIR_BTN_.left_right].IsInRect(loc, 0) && power_on){//left_right
			air_item.left_right_swept = air_item.left_right_swept ? 0 : 1;
			this.docommand(this.id, 'left_right_swept_' + air_item.left_right_swept);
			this.doSwept();
			this.doBtnFocus(_AIR_BTN_.left_right);
		}
	}
	
	this.doSwept = function(){
		if(this.air.up_down.timer)
			clearInterval(this.air.up_down.timer);
		if(this.air.left_right.timer)
			clearInterval(this.air.left_right.timer);
		
		air_item = _AIR_CONDITIONER_[mode][this.id];
		
		if(air_item.up_down_swept){
			this.air.up_down.timer = setInterval(function() {
				if(_device.air.up_down.swept_flag == 0){
					if(_device.air.up_down.direction < 4)
						_device.air.up_down.direction++;
					else if(_device.air.up_down.direction == 4){
						_device.air.up_down.direction = 3;
						_device.air.up_down.swept_flag = 1;
					}
				}
				else{
					if(_device.air.up_down.direction > 1)
						_device.air.up_down.direction--;
					else if(_device.air.up_down.direction == 1){
						_device.air.up_down.direction = 2;
						_device.air.up_down.swept_flag = 0;
					}
				}
				_device.doDraw();
			},1000);
		}
		if(air_item.left_right_swept){
			this.air.left_right.timer = setInterval(function() {
				if(_device.air.left_right.swept_flag == 0){
					if(_device.air.left_right.direction < 5)
						_device.air.left_right.direction++;
					else if(_device.air.left_right.direction == 5){
						_device.air.left_right.direction = 4;
						_device.air.left_right.swept_flag = 1;
					}
				}
				else{
					if(_device.air.left_right.direction > 1)
						_device.air.left_right.direction--;
					else if(_device.air.left_right.direction == 1){
						_device.air.left_right.direction = 2;
						_device.air.left_right.swept_flag = 0;
					}
				}
				_device.doDraw();
			},1000);
		}
	}
	
	this.drawIt = function(ctx){
		ctx.drawImage(this.canvasImage, 0, 0);

		air_item = _AIR_CONDITIONER_[mode][this.id];
		
		air_mode = {heat:'制热模式', cold:'制冷模式', dehumidify:'除湿模式', blowing:'通风模式', sleep:'睡眠模式', energy:'节能模式', health:'健康模式'};
		if(air_item.power_on == 'true'){//电源打开显示，画液晶屏
			ctx.fillStyle = ctx.strokeStyle = "rgb(47, 82, 67)";
			
			ctx.font = _font106;
			var tmp = air_item.temp_true;	//实际温度
			ctx.fillText(tmp, this.imageRect.x + this.imageRect.width*2/5 + this.imageRect.width*3/10 -ctx.measureText(tmp).width/2, this.imageRect.y + this.imageRect.height/2);
			ctx.font = _font38;
			tmp = air_item.temp_set;		//设定温度
			ctx.fillText(tmp, this.imageRect.x + this.imageRect.width-25- ctx.measureText(tmp + '   ℃').width, this.imageRect.y + 60);
			tmp = air_mode[air_item.mode];	//模式选择
			ctx.fillText(tmp, this.imageRect.x + this.imageRect.width*2/5 + this.imageRect.width*3/10 -ctx.measureText(tmp).width/2, this.imageRect.y + this.imageRect.height/2 + 120);
			
			var offset = this.imageRect.height*2/9 + 13, step = 12;
			var x = this.imageRect.x + this.imageRect.width/5, y = this.imageRect.y + offset;
			//画风速
			ctx.lineWidth = 2;
			for(var i=0;i<5;i++){
				if(air_item.speed>i)
					ctx.fillRect(x + i*20, y - (i+1)*step, 12, (i+1)*step);
				else
					ctx.strokeRectEx(x + i*20, y - (i+1)*step + 2, 10, (i+1)*step - 4);
			//	ctx.fillStyle = ctx.strokeStyle = (air_item.speed>i ? "rgb(47, 82, 67)" : "rgb(150, 150, 150)");
			//	ctx.drawLine(x + i*20, y, x + i*20, y - (i+1)*step);
			}

			//画上下风向
			y += this.imageRect.height/3;

			ctx.save();//保存状态
			ctx.translate(x + 80, y - 80);//原点移到x,y处，即要画的多边形中心
			
			for(var i=1;i<=4;i++){
				var ang = (180-(i-1)*30)*Math.PI*2/360;
				ctx.rotate(ang);//旋转
				ctx.beginPath();
				ctx.fillStyle = ctx.strokeStyle = (i == this.air.up_down.direction ? "rgb(47, 82, 67)" : "rgb(150, 150, 150)");
				ctx.lineWidth = 5;
				ctx.moveTo(20, 0);//据中心r距离处画点
				ctx.lineTo(78, 0);//据中心r距离处连线
				ctx.stroke(); 
				
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.moveTo(70, -5);
				ctx.lineTo(70, 5);
				ctx.lineTo(80, 0);
				ctx.lineTo(70, -5);
				ctx.stroke(); 
				ctx.rotate(-ang);
			}
			ctx.restore();//返回原始状态
			
			//画左右扫风
			x = this.imageRect.x + this.imageRect.width/6;
			y += this.imageRect.height/3;
			ctx.lineWidth = 5;
			ctx.drawLine(x + 20, y - 80, x + 140, y - 80);

			ctx.save();//保存状态
			ctx.translate(x + 80, y - 80);//原点移到x,y处，即要画的多边形中心
			
			for(var i=1;i<=5;i++){
				var ang = (180-(i)*30)*Math.PI*2/360;
				ctx.rotate(ang);//旋转
				ctx.beginPath();
				ctx.fillStyle = ctx.strokeStyle = (i == this.air.left_right.direction ? "rgb(47, 82, 67)" : "rgb(150, 150, 150)");
				ctx.lineWidth = 5;
				ctx.moveTo(20, 0);//据中心r距离处画点
				ctx.lineTo(78, 0);//据中心r距离处连线
				ctx.stroke(); 
				
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.moveTo(70, -5);
				ctx.lineTo(70, 5);
				ctx.lineTo(80, 0);
				ctx.lineTo(70, -5);
				ctx.stroke(); 
				ctx.rotate(-ang);
			}
			ctx.restore();//返回原始状态
		}
		else{//电源关闭显示
			ctx.fillStyle = "rgba(10, 10, 10, .3)";
			ctx.roundRect(this.imageRect.x, this.imageRect.y, this.imageRect.width, this.imageRect.height, 20, 1, 0);
		}

		//画按钮
		for(var i=0;i<this.arrayBtn.length;i++){
			if(this.arrayBtn[i].istouch)
				ctx.fillStyle = "rgb(230, 100, 100)";
			else
				ctx.fillStyle = "rgb(170, 170, 170)";
			
			if(i == _AIR_BTN_.temp_inc || i == _AIR_BTN_.temp_dec)
				this.arrayBtn[i].drawBtn(ctx, _font56, "rgb(0, 0, 0)", 10);
			else
				this.arrayBtn[i].drawBtn(ctx, _font38, "rgb(0, 0, 0)", 10);
		}
		//画电源按钮
		ctx.strokeStyle = air_item.power_on == 'true' ? "rgb(250, 20, 20)" : "rgb(0, 140, 0)";
		ctx.lineWidth = 5;
		powerBtn = this.arrayBtn[_AIR_BTN_.power];
		ctx.arcEx(powerBtn.left + powerBtn.width/2, powerBtn.top + powerBtn.height/2, 20, 1.4*Math.PI, 1.6*Math.PI, 1, 0, 1, false);
		ctx.drawLine(powerBtn.left + powerBtn.width/2,powerBtn.top + 15,powerBtn.left + powerBtn.width/2,powerBtn.top + 30);
	}
	
	this.docommandIt = function(id, commandEx){
		if(commandEx == undefined){

			document.getElementById('color_title').innerText = '\"' + document.getElementById(id).innerText + '\"调节';
			this.setFocus(id);
			this.setID(id);
			this.setPos();
			this.doDraw();
			
			this.doSwept();
			
			return null;
		}
		else{
			param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + commandEx;
		}
		return param;
	}
}
