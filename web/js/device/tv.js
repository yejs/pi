_TV_BTN_ = {'vol_prog':0, 'vol':1, 'prog':2, 'power':3, 'mute':4, 'av':5, 'home':6, 'back':7};
//电视类
function tv()
{
	device.apply(this,arguments);
	this.time_series = null;
	this.p = null;

	this.initIt = function(){
		for(var i=0;i<8;i++)
		{
			switch(i){
				case 0://机顶盒音量、频道、确认组合键
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'');
				break;
				case 1://电视音量组合键
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'');
				break;
				case 2://电视频道组合键
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'');
				break;
				case 3:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'');
				break;
				case 4:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'静音');
				break;
				case 5:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'AV/TV');
				break;
				case 6:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'Home');
				break;
				case 7:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'回看');
				break;
				
			}
		}
	}
	
	this.initDraw = function()
	{
		var btn_w = 160, btn_h = 80, offset_x = 20, offset_y = 20;
		r = 350;
		this.arrayBtn[_TV_BTN_.vol_prog].doResize(this.rect.width/2 - r/2, offset_y + btn_h + 30, this.rect.width/2 + r/2, offset_y + btn_h + 30 + r);
		o1 = offset_x + 120, o2 = offset_y + btn_h + 230;
		this.arrayBtn[_TV_BTN_.vol].doResize(o1, o2, o1 + 100, o2 + 260);
		this.arrayBtn[_TV_BTN_.prog].doResize(this.rect.width - o1 - 100, o2, this.rect.width - o1, o2 + 260);

		this.arrayBtn[_TV_BTN_.power].doResize(offset_x, offset_y, offset_x + btn_w, offset_y + btn_h);
		this.arrayBtn[_TV_BTN_.mute].doResize(this.rect.width - offset_x - btn_w, offset_y, this.rect.width - offset_x, offset_y + btn_h);
		
		var s = ((this.rect.width - offset_x - btn_w) - (offset_x))/2;
		y = offset_y + btn_h + 540;
		st = _TV_BTN_.av;
		for(var i=st;i<this.arrayBtn.length;i++){
			this.arrayBtn[i].doResize(offset_x + (i-st)*s, y, offset_x + (i-st)*s + btn_w, y + btn_h);
		}
	}

	//人机交互处理
	this.doIt = function(loc, down, up){
		var tv_item = _TV_[mode][this.id];
		var power_on = tv_item.status == 'off' ? false : true;
		
		if(down){
			this.p = loc; 
			for(var i=0;i<this.arrayBtn.length;i++){
				if(this.arrayBtn[i].IsInRect(loc, 0)){
					if(i == _TV_BTN_.power || (i!= _TV_BTN_.power && power_on))
						this.arrayBtn[i].istouch = true;
					else
						return;
				}
			}
			//与普通按键不同，按键按下时处理，非松开处理
			this.doTVEx(loc);
		}
		else if(up){
			this.p = null; 
			for(var i=0;i<this.arrayBtn.length;i++){
				this.arrayBtn[i].istouch = false;
			}

			if(this.time_series){
				clearTimeout(this.time_series);
				this.time_series = null;
			}
		//	this.ack = true; 
		}
		this.doDraw();
	}
	
	//这里处理电视遥控按键的连续点击
	this.doTVEx = function(loc) {
		if(this.ack){
			this.ack = false;
			this.doTVKey(loc);

			time_ack = setTimeout(function() {//电视终端没返回应答时的超时处理
				_device.ack = true; 
				time_ack = null;
			},1000);
		}
		this.time_series = setTimeout(function(){_device.doTVEx(loc);}, 100);
	}
	//真正的TV按键处理
	this.doTVKey = function(loc) { 
		var tv_item = _TV_[mode][this.id];
		var power_on = tv_item.status == 'off' ? false : true;
		
		if(this.arrayBtn[_TV_BTN_.power].IsInRect(loc, 0)){//power
			power_on = power_on ? false : true;

			this.docommand(this.id, power_on ? 'power_on' : 'power_off');
			this.doBtnFocus(_TV_BTN_.power);
		}
		else if(this.arrayBtn[_TV_BTN_.mute].IsInRect(loc, 0) && power_on){//mute
			this.docommand(this.id, 'mute');
			this.doBtnFocus(_TV_BTN_.mute);
		}
		else if(this.arrayBtn[_TV_BTN_.av].IsInRect(loc, 0) && power_on){//av/tv
			this.docommand(this.id, 'av/tv');
			this.doBtnFocus(_TV_BTN_.av);
		}
		else if(this.arrayBtn[_TV_BTN_.home].IsInRect(loc, 0) && power_on){//home
			this.docommand(this.id, 'home');
			this.doBtnFocus(_TV_BTN_.home);
		}
		else if(this.arrayBtn[_TV_BTN_.back].IsInRect(loc, 0) && power_on){//back
			this.docommand(this.id, 'back');
			this.doBtnFocus(_TV_BTN_.back);
		}

		else if(power_on){
			var x = this.rect.width/2;
			var y = parseInt(this.arrayBtn[_TV_BTN_.vol_prog].top + this.arrayBtn[_TV_BTN_.vol_prog].height/2);
			var r = parseInt(this.arrayBtn[_TV_BTN_.vol_prog].height/2);

			var r1 = 0;
			if(loc)
				r1 = Math.sqrt((loc.x-x)*(loc.x-x) + (loc.y-y)*(loc.y-y));
			for(var i=0;i<4;i++){
				if(r1 < r-10 && r1 > r/2 && IsInRange(x, y, loc, -Math.PI/4 + i*Math.PI/2, Math.PI/4 + i*Math.PI/2)){
					if(0 == i)//volume +
						this.docommand(this.id, 'vol_up');
					else if(1 == i)//channel_up
						this.docommand(this.id, 'channel_up');
					else if(2 == i)//volume -
						this.docommand(this.id, 'vol_down');
					else if(3 == i)//channel_down
						this.docommand(this.id, 'channel_down');
				}
			}
			if(r1 && r1 < r/2)
				this.docommand(this.id, 'ok');
			
			for(var index=_TV_BTN_.vol;index<=_TV_BTN_.prog;index++){
				var left = this.arrayBtn[index].left + 10, right = this.arrayBtn[index].right - 10;
				for(var i=0;i<2;i++){//电视音量、频道组合键
					var top = this.arrayBtn[index].top + (i == 0 ? 10 : 5) + i*this.arrayBtn[index].height/2;
					var bottom = top + this.arrayBtn[index].height/2 - 15;
					if(loc.x >= left && loc.x <= right && loc.y >= top && loc.y <= bottom){
						if(index==_TV_BTN_.vol && 0 == i)
							this.docommand(this.id, 'vol_up');
						else if(index==_TV_BTN_.vol && 1 == i)
							this.docommand(this.id, 'vol_down');
						else if(index==_TV_BTN_.prog && 0 == i)
							this.docommand(this.id, 'channel_up');
						else if(index==_TV_BTN_.prog && 1 == i)
							this.docommand(this.id, 'channel_down');
					}
				}
			}
		}
	}
	
	this.drawIt = function(ctx){
		if(this.rect.width == 0 || this.arrayBtn[2].height == 0)
			return;

		tv_item = _TV_[mode][this.id];

		var x = this.rect.width/2;
		var y = parseInt(this.arrayBtn[_TV_BTN_.vol_prog].top + this.arrayBtn[_TV_BTN_.vol_prog].height/2);
		var r = parseInt(this.arrayBtn[_TV_BTN_.vol_prog].height/2);

		var grd=new Array();
		for(var i=0;i<2;i++){
			grd[i]=ctx.createRadialGradient(x,y,0,x,y,r);
			switch(i){
				case 0:
				grd[i].addColorStop(0,'rgba(120, 120, 120, 0.1)');
				grd[i].addColorStop(0.5,'rgba(120, 120, 120, 0.2)');
				grd[i].addColorStop(0.9,'rgba(120, 120, 120, 0.25)');
				grd[i].addColorStop(1,'rgba(120, 120, 120, 0.9)');
				break;
				case 1:
				grd[i].addColorStop(0,'rgba(250, 60, 60, 0.6)');
				grd[i].addColorStop(0.5,'rgba(250, 60, 60, 0.7)');
				grd[i].addColorStop(0.9,'rgba(250, 60, 60, 0.8)');
				grd[i].addColorStop(1,'rgba(250, 60, 60, 0.9)');
				break;
			}
		}
		
		ctx.strokeStyle = 'rgba(120, 120, 120, 0.5)';
		ctx.lineWidth = 5;
		
		//----------------------画机顶盒音量、频道、确认组合键-----------------------------
		ctx.fillStyle = bgColor;
		ctx.arcEx(x, y, r,  0, Math.PI * 2, true, 1, 1);//最外层圆

		var r1 = 0;
		if(this.p)
			r1 = Math.sqrt((this.p.x-x)*(this.p.x-x) + (this.p.y-y)*(this.p.y-y));
		for(var i=0;i<4;i++){//画机顶盒音量、频道组合键
			if(r1 < r-10 && r1 > r/2 && IsInRange(x, y, this.p, -Math.PI/4 + i*Math.PI/2, Math.PI/4 + i*Math.PI/2))
				ctx.fillStyle = grd[1];
			else
				ctx.fillStyle = grd[0];
			
			ctx.arcEx(x, y, r-10,  -Math.PI/4 + i*Math.PI/2 + Math.PI/100, Math.PI/4 + i*Math.PI/2 - Math.PI/100, false, 1, 1);
			
			//画机顶盒音量、频道组合键标识（四个方向标识）
			ctx.fillStyle = 'rgba(20, 20, 20, 1)';
			a = i*Math.PI/2;
			r2 = r*3/4;
			x1 = x + Math.cos(a) * r2;
			y1 = y + Math.sin(a) * r2;
			ctx.beginPath(); 
			if(0 == i){
				x1 -= r/8;
				ctx.moveTo(x1, y1 - 20); 
				ctx.lineTo(x1, y1 + 20); 
				ctx.lineTo(x1 + 40, y1); 
			}
			else if(1 == i){
				y1 -= r/8;
				ctx.moveTo(x1 - 20, y1); 
				ctx.lineTo(x1 + 20, y1); 
				ctx.lineTo(x1, y1 + 40); 
			}
			if(2 == i){
				x1 += r/8;
				ctx.moveTo(x1, y1 - 20); 
				ctx.lineTo(x1, y1 + 20); 
				ctx.lineTo(x1 - 40, y1); 
			}
			else if(3 == i){
				y1 += r/8;
				ctx.moveTo(x1 - 20, y1); 
				ctx.lineTo(x1 + 20, y1); 
				ctx.lineTo(x1, y1 - 40); 
			}
			ctx.closePath();
			ctx.stroke();  
			ctx.fill();
		}
		
		ctx.fillStyle = bgColor;
		ctx.arcEx(x, y, r/2,  0, Math.PI * 2, true, 1, 0);//画里层圆
		
		//画机顶盒确认键
		if(r1 && r1 < r/2-10)
			ctx.fillStyle = grd[1];
		else
			ctx.fillStyle = grd[0];
		ctx.arcEx(x, y, r/2-10,  0, Math.PI * 2, true, 1, 1);
		
		ctx.fillStyle = 'rgba(20, 20, 20, 1)';
		ctx.font = _font56;
		ctx.fillText('ok', x-ctx.measureText('ok').width/2, y + 20);
		//----------------------画机顶盒音量、频道、确认组合键-----------------------------
		
		//画按钮
		for(var i=3;i<this.arrayBtn.length;i++){
			if(this.arrayBtn[i].istouch)
				ctx.fillStyle = "rgb(230, 100, 100)";
			else
				ctx.fillStyle = "rgb(170, 170, 170)";
			
			this.arrayBtn[i].drawBtn(ctx, _font38, "rgb(0, 0, 0)", 10);
		}
		//画电源按钮图标
		ctx.strokeStyle = tv_item.status == 'on' ? "rgb(250, 20, 20)" : "rgb(0, 140, 0)";
		ctx.lineWidth = 5;
		ctx.arcEx(this.arrayBtn[_TV_BTN_.power].left + this.arrayBtn[_TV_BTN_.power].width/2, this.arrayBtn[_TV_BTN_.power].top + this.arrayBtn[_TV_BTN_.power].height/2, 20, 1.4*Math.PI, 1.6*Math.PI, 1, 0, 1, false);
		ctx.drawLine(this.arrayBtn[_TV_BTN_.power].left + this.arrayBtn[_TV_BTN_.power].width/2,this.arrayBtn[_TV_BTN_.power].top + 15,this.arrayBtn[_TV_BTN_.power].left + this.arrayBtn[_TV_BTN_.power].width/2,this.arrayBtn[_TV_BTN_.power].top + 30);
		
		this.drawTV(ctx, _TV_BTN_.vol);
		this.drawTV(ctx, _TV_BTN_.prog);
	}
	
	this.drawTV = function(ctx, index){
		if(this.rect.width == 0 || this.arrayBtn[2].height == 0)
			return;

		tv_item = _TV_[mode][this.id];

		var x = parseInt(this.arrayBtn[index].left + this.arrayBtn[index].width/2);
		var y = parseInt(this.arrayBtn[index].top + this.arrayBtn[index].height/2);

		ctx.strokeStyle = 'rgba(120, 120, 120, 0.5)';
		ctx.lineWidth = 5;

		ctx.fillStyle = bgColor;
		ctx.roundRect(this.arrayBtn[index].left, this.arrayBtn[index].top, this.arrayBtn[index].width, this.arrayBtn[index].height, this.arrayBtn[index].width/2, 1, 0);//最外层圆

		loc = {x:0, y:0};
		if(this.p)
			loc = this.p;
		for(var i=0;i<2;i++){//画机顶盒音量、频道组合键
			var left = this.arrayBtn[index].left + 10, right = this.arrayBtn[index].right - 10;
			var top = this.arrayBtn[index].top + (i == 0 ? 10 : 5) + i*this.arrayBtn[index].height/2;
			var bottom = top + this.arrayBtn[index].height/2 - 15;
			if(loc.x >= left && loc.x <= right && loc.y >= top && loc.y <= bottom)
				ctx.fillStyle = 'rgba(230, 100, 100, 1)';
			else
				ctx.fillStyle = 'rgba(170, 170, 170, 0.3)';

			if(0 == i)
				ctx.roundRectEx(left, top, right - left, bottom - top, (right - left)/2, 1, 1, 1, 1, 0, 0);
			else
				ctx.roundRectEx(left, top, right - left, bottom - top, (right - left)/2, 1, 1, 0, 0, 1, 1);

			//画机顶盒音量、频道组合键标识
			ctx.fillStyle = 'rgba(20, 20, 20, 1)';
			x1 = left + (right - left)/2;
			y1 = top + (bottom - top)/2;
			ctx.beginPath(); 

			if(0 == i){
				y1 += 20;
				ctx.moveTo(x1 - 20, y1); 
				ctx.lineTo(x1 + 20, y1); 
				ctx.lineTo(x1, y1 - 40); 
			}
			else if(1 == i){
				y1 -= 20;
				ctx.moveTo(x1 - 20, y1); 
				ctx.lineTo(x1 + 20, y1); 
				ctx.lineTo(x1, y1 + 40); 
			}

			ctx.closePath();
			ctx.stroke();  
			ctx.fill();
		}
		
		if(_TV_BTN_.vol == index){
			ctx.strokeStyle = 'rgba(10, 10, 10, 0.6)';
			ctx.beginPath(); 
			y1 = this.arrayBtn[index].top + 20 + this.arrayBtn[index].height/2;
			ctx.moveTo(left - 90, y1); 
			ctx.lineTo(left - 30, y1); 
			ctx.lineTo(left - 30, y1 - 30); 
			ctx.closePath();
			ctx.stroke();  
		}
		else if(_TV_BTN_.prog == index){
			ctx.fillStyle = ctx.strokeStyle = 'rgba(10, 10, 10, 0.6)';
			y1 = this.arrayBtn[index].top + 15 + this.arrayBtn[index].height/2;
			ctx.fillText('P',this.arrayBtn[index].right + 20 , y1);
		}
	}
	
	this.docommandIt = function(id, commandEx){
		if(commandEx == undefined){

			document.getElementById('color_title').innerText = '\"' + document.getElementById(id).innerText + '\"调节';
			this.setFocus(id);
			this.setID(id);
			this.setPos();
			this.doDraw();
			
			return null;
		}
		else{
			param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + commandEx;
		}
		return param;
	}
}

