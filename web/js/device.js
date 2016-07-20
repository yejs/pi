document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/data.js"></script>');
//这个文件是灯和窗帘合用的，分别用dev_id区别
_device = null;
_port = 8000;
dev_id = 'lamp';
mode = "normal";
bgColor = 'rgba(180, 180, 180, 1)';
_TV_BTN_ = {'vol_prog':0, 'vol':1, 'prog':2, 'power':3, 'mute':4, 'av':5, 'home':6, 'back':7};
_MODE_SET_ = {'normal':'回家模式', 'leave':'离家模式', 'night':'睡眠模式', 'getup':'晨起模式', 'guests':'会客模式', 'diner':'用餐模式'}
window.onload = function(){
	var url = location.search;
	pos = url.indexOf('dev_id');
	if(pos>=0){
		dev_id = url.substr(pos+7);
		
	}
	
	if(document.getElementById('lamp')){
		_device = new device();
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
		
		if('air_conditioner' == dev_id || 'tv' == dev_id)
			_device.setFocus(_device.id);
	}
}

window.addEventListener('message',function(e){
	if('onmessage'===e.data.msg){
		_device.onmessage(e.data.data);
		//console.log(e.data.data);
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
				_device.drawCurtainImage();
			};
		}
		else if('air_conditioner' == dev_id){
			this.contextImage.clearRect(0, 0, this.rect.width, this.rect.height);
	
			this.imageRect = {x:25, y:5, width:this.rect.width-50 , height:(this.rect.width-50)*9/18};
			var btn_w = 160, btn_h = 80, offset_x = 20, offset_y = 40;
			var y = this.imageRect.y + this.imageRect.height + offset_y;
			this.arrayBtn[0].doResize(this.rect.width/2 - btn_w/2, y, this.rect.width/2 + btn_w/2, y + btn_h);
			this.arrayBtn[1].doResize(this.imageRect.x + offset_x, y, this.imageRect.x + offset_x + btn_w, y+ btn_h);
			this.arrayBtn[2].doResize(this.imageRect.x + this.imageRect.width - offset_x - btn_w, y, this.imageRect.x + this.imageRect.width - offset_x, y + btn_h);
			
			var s = ((this.imageRect.x + this.imageRect.width - offset_x - btn_w) - (this.imageRect.x + offset_x))/3;
			y += 130;
			for(var i=3;i<this.arrayBtn.length;i++){
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
		else if('tv' == dev_id){
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
	}
	
	this.drawCurtainImage = function(){
		var w = this.bar1.pos*this.bar1.width/200;
		var offset = this.bar1.height/2 + 25;
			
		var h = parseInt(this.rect.height) - 20;
		this.ctx.drawImage(this.canvasImage, this.bar1.x, this.bar1.y + offset, w, h, this.bar1.x, this.bar1.y + offset, w, h);
			
		this.ctx.drawImage(this.canvasImage, this.bar1.x + this.bar1.width - w, this.bar1.y + offset, w, h, this.bar1.x + this.bar1.width - w, this.bar1.y + offset, w, h);
	}
	
	this.doDraw = function(){
		this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
		this.contextReport.clearRect(0, 0, this.rect.width, this.rect.height);

		if("lamp" == dev_id){
			this.drawLamp(this.contextReport);
		}
		else if('curtain' == dev_id){
			this.drawCurtain(this.contextReport);
		}
		else if('air_conditioner' == dev_id){
			this.drawAir(this.contextReport);
		}
		else if('tv' == dev_id){
			this.drawTV(this.contextReport);
		}
		this.ctx.drawImage(this.canvasReport, 0, 0);
	}
	
	this.drawLamp = function(ctx){
		var pos1 = this.bar1.pos*this.bar1.width/100, pos2 = this.bar2.pos*this.bar2.width/100, pos3 = this.bar3.pos*this.bar3.width/100;
		var offset = this.bar1.height/2 - 5, r = 5, h = 10;
		//滚动条的左半部分
		ctx.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgb(220, 0, 0)" : "rgb(220, 220, 220)";
		ctx.roundRect(this.bar1.x, this.bar1.y+offset, pos1, h, r, 1, 0);
		ctx.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgb(0, 220, 0)" : "rgb(220, 220, 220)";
		ctx.roundRect(this.bar2.x, this.bar2.y+offset, pos2, h, r, 1, 0);
		ctx.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgb(0, 0, 220)" : "rgb(220, 220, 220)";
		ctx.roundRect(this.bar3.x, this.bar3.y+offset, pos3, h, r, 1, 0);
		
		//滚动条的右半部分
		ctx.fillStyle = "rgb(220, 220, 220)";
		ctx.roundRect(this.bar1.x + pos1, this.bar1.y+offset, this.bar1.width - pos1, h, r, 1, 0);
		ctx.roundRect(this.bar2.x + pos2, this.bar2.y+offset, this.bar2.width - pos2, h, r, 1, 0);
		ctx.roundRect(this.bar3.x + pos3, this.bar3.y+offset, this.bar3.width - pos3, h, r, 1, 0);
		
		//滚动条的拖动按钮部分
		r = this.bar1.height/4;
		ctx.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgba(120, 0, 0, 0.5)" : "rgb(120, 120, 120, 0.5)";
		ctx.roundRect(this.bar1.x + pos1 - r, this.bar1.y+r, r*2, r*2, r, 1, 0);
		ctx.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgba(0, 120, 0, 0.5)" : "rgb(120, 120, 120, 0.5)";
		ctx.roundRect(this.bar2.x + pos2 - r, this.bar2.y+r, r*2, r*2, r, 1, 0);
		ctx.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? "rgba(0, 0, 120, 0.5)" : "rgb(120, 120, 120, 0.5)";
		ctx.roundRect(this.bar3.x + pos3 - r, this.bar3.y+r, r*2, r*2, r, 1, 0);
		
		//七彩条状滚动条
		ctx.beginPath();
		var width = this.bar0.width/45;
		for(var i=0;i<45;i++)
			ctx.roundRect2(this.bar0.x + i*width, this.bar0.y, width - 4, this.bar0.height, 8, 0, 0);
		ctx.closePath();
		var grd=ctx.createLinearGradient(this.bar0.x,this.bar0.y,this.bar0.width,0); //颜色渐变的起始坐标和终点坐标
		grd.addColorStop(0, "rgba(255, 0, 0, 1)"); //0表示起点..0.1 0.2 ...1表示终点，配置颜色
		grd.addColorStop(0.25, "rgba(255, 255, 0, 1)");
		grd.addColorStop(0.5, "rgba(0, 255, 0, 1)");
		grd.addColorStop(0.75, "rgba(0, 255, 255, 1)");
		grd.addColorStop(1, "rgba(0, 0, 255, 1)");
		ctx.fillStyle = _LAMP_[mode][this.id]['status'] === 'on' ? grd : "rgb(220, 220, 220)";
		ctx.fill();
	}
	
	this.drawCurtain = function(ctx){
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
	
	this.drawAir = function(ctx){
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
			
			if(i == 1 || i == 2)
				this.arrayBtn[i].drawBtn(ctx, _font56, "rgb(0, 0, 0)", 10);
			else
				this.arrayBtn[i].drawBtn(ctx, _font38, "rgb(0, 0, 0)", 10);
		}
		//画电源按钮
		ctx.strokeStyle = air_item.power_on == 'true' ? "rgb(250, 20, 20)" : "rgb(0, 140, 0)";
		ctx.lineWidth = 5;
		ctx.arcEx(this.arrayBtn[0].left + this.arrayBtn[0].width/2, this.arrayBtn[0].top + this.arrayBtn[0].height/2, 20, 1.4*Math.PI, 1.6*Math.PI, 1, 0, 1, false);
		ctx.drawLine(this.arrayBtn[0].left + this.arrayBtn[0].width/2,this.arrayBtn[0].top + 15,this.arrayBtn[0].left + this.arrayBtn[0].width/2,this.arrayBtn[0].top + 30);
	}
	
	this.drawTV = function(ctx){
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
		
		this.drawTV2(ctx, _TV_BTN_.vol);
		this.drawTV2(ctx, _TV_BTN_.prog);
	}
	
	this.drawTV2 = function(ctx, index){
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
	
	this.onresize = function()
	{
		this.rect = getWinRect();
		this.rect.height = '720';
		this.canvas.width = this.canvasReport.width = this.canvasImage.width = this.rect.width;  
		this.canvas.height = this.canvasReport.height = this.canvasImage.height = this.rect.height;
		offset = 20;
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
	this.touch_tmp = null;
	this.rect = null;
	this.bar0 = null;
	this.bar1 = null;
	this.bar2 = null;
	this.bar3 = null;
	this.id = '1';
	this.getmessaged = false;
	this.Progress = {timer:null, tick:null, pos:0, time_out:null, time_series:null, time_ack:null};
	this.Progress_timer = null;
	this.Progress_tick = null;
	this.ack = true;
	
	this.air = {'up_down':{'direction':1, 'swept_flag':0, 'timer':null}, 'left_right':{'direction':1, 'swept_flag':0, 'timer':null}};

	this.imageRect = {x:0, y:0, width:0, height:0};
	this.p = null;
	
	this.arrayBtn = new Array();
	if('air_conditioner' == dev_id){
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
	}
	else if('tv' == dev_id){
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

	this.doAir = function(loc) { 
		if(this.arrayBtn[0].IsInRect(loc, 0)){//power
			power_on = power_on ? false : true;

			this.docommand(this.id, power_on ? 'power_on' : 'power_off');
			this.doBtnFocus(0);
		}
		else if(this.arrayBtn[1].IsInRect(loc, 0) && power_on){//+
			if(air_item.temp_set < 30){
				air_item.temp_set++;
				this.docommand(this.id, 'temp_inc');
			}
			else
				return;
		}
		else if(this.arrayBtn[2].IsInRect(loc, 0) && power_on){//-
			if(air_item.temp_set > 16){
				air_item.temp_set--;
				this.docommand(this.id, 'temp_dec');
			}
			else
				return;
		}
		else if(this.arrayBtn[3].IsInRect(loc, 0) && power_on){//mode
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
			this.doBtnFocus(3);
		}
		
		else if(this.arrayBtn[4].IsInRect(loc, 0) && power_on){//speed
			if(air_item.speed < 5)
				air_item.speed++;
			else if(air_item.speed == 5)
				air_item.speed = 1;
			this.docommand(this.id, 'speed_' + air_item.speed);
			this.doBtnFocus(4);
		}
		else if(this.arrayBtn[5].IsInRect(loc, 0) && power_on){//up_down
			air_item.up_down_swept = air_item.up_down_swept ? 0 : 1;
			this.docommand(this.id, 'up_down_swept_' + air_item.up_down_swept);
			this.doSwept();
			this.doBtnFocus(5);
		}
		else if(this.arrayBtn[6].IsInRect(loc, 0) && power_on){//left_right
			air_item.left_right_swept = air_item.left_right_swept ? 0 : 1;
			this.docommand(this.id, 'left_right_swept_' + air_item.left_right_swept);
			this.doSwept();
			this.doBtnFocus(6);
		}
	}
	
	//这里处理电视遥控按键的连续点击
	this.doTVEx = function(loc) {
		if(this.ack){
			this.ack = false;
			this.doTV(loc);
			if(this.Progress.time_ack)
				clearTimeout(this.Progress.time_ack);
			this.Progress.time_ack = setTimeout(function() {//电视终端没返回应答时的超时处理
				_device.ack = true; 
				_device.Progress.time_ack = null;
			},1000);
		}

		this.Progress.time_series = setTimeout(function(){_device.doTVEx(loc);}, 100);
	}
	
	this.doTV = function(loc) { 
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
				for(var i=0;i<2;i++){//电视音量、频道组合键
					var left = this.arrayBtn[index].left + 10, right = this.arrayBtn[index].right - 10;
					var top = this.arrayBtn[index].top + (i == 0 ? 10 : 5) + i*this.arrayBtn[index].height/2;
					var bottom = top + this.arrayBtn[index].height/2 - 15;
					if(loc.x >= left && loc.x <= right && loc.y >= top && loc.y <= bottom){
						if(index==1 && 0 == i)
							this.docommand(this.id, 'vol_up');
						else if(index==1 && 1 == i)
							this.docommand(this.id, 'vol_down');
						else if(index==2 && 0 == i)
							this.docommand(this.id, 'channel_up');
						else if(index==2 && 1 == i)
							this.docommand(this.id, 'channel_down');
					}
				}
			}
		}
	}
	
	this.doMouse = function(event, mouse, down, up) { 
		if("lamp" == dev_id && _LAMP_[mode][this.id]['status'] === 'off')
			return;
		
		if(up){
			this.bar0.isdown = false;
			this.bar1.isdown = false;
			this.bar2.isdown = false;
			this.bar3.isdown = false;
			this.p = null; 
		}
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
		
		if(down)
			this.p = loc; 
		
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
				
			air_item = _AIR_CONDITIONER_[mode][this.id];
			power_on = air_item.power_on == 'false' ? false : true;
			
			if(down){
				for(var i=0;i<this.arrayBtn.length;i++){
					if(this.arrayBtn[i].IsInRect(loc, 0) && (i == 0 || (i!= 0 && power_on))){
						if((1 == i && air_item.temp_set == 30) || (2 == i && air_item.temp_set == 16))
							return;
						this.arrayBtn[i].istouch = true;
					//	break;
					}
				}

			//与电视按键不同，空调按键不需要连续按的功能
				if(this.ack){
					this.ack = false;
					this.doAir(loc);
					if(this.Progress.time_ack)
						clearTimeout(this.Progress.time_ack);
					this.Progress.time_ack = setTimeout(function() {//空调终端没返回应答时的超时处理
						_device.ack = true; 
						_device.Progress.time_ack = null;
					},1000);
				}
			}
			else if(up){
				for(var i=0;i<this.arrayBtn.length;i++){
					this.arrayBtn[i].istouch = false;
				}
				if(this.Progress.time_ack){
					clearTimeout(this.Progress.time_ack);
					this.Progress.time_ack = null;
				}
			}
		}
		else if('tv' == dev_id){
			tv_item = _TV_[mode][this.id];
			power_on = tv_item.status == 'off' ? false : true;
			
			if(down){
				for(var i=0;i<this.arrayBtn.length;i++){
					if(this.arrayBtn[i].IsInRect(loc, 0)){
						if(i == 3 || (i!= 3 && power_on))
							this.arrayBtn[i].istouch = true;
						else
							return;
					}
				}
				
				this.doTVEx(loc);
			}
			else if(up){
				for(var i=0;i<this.arrayBtn.length;i++){
					this.arrayBtn[i].istouch = false;
				}

				if(this.Progress.time_series){
					clearTimeout(this.Progress.time_series);
					this.Progress.time_series = null;
				}
			//	this.ack = true; 
			}
		}
		this.doDraw();
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
			setTimeout(function(){_device.ack = true;}, 100);//每个命令的响应与下个命令之间留出100ms的时间间隔
			console.log('ack:' + JSON.stringify(json));
		}
		else if( json.event === "device" ){
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
			return;
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
			if(!_DEVICE_[json.event].hasOwnProperty(json.id))
				id = '1';

			mode = json.mode;
			document.getElementById('scene_title').innerText = _MODE_SET_[mode];

			_device.setID(id);
			_device.setFocus(id);
		} 
		else if( json.event === "air_conditioner" ){
			_AIR_CONDITIONER_[json.mode] = json.data;
			this.doSwept();
			
			var id = json.id;
			if(!_DEVICE_[json.event].hasOwnProperty(json.id))
				id = '1';

			mode = json.mode;
			document.getElementById('scene_title').innerText = _MODE_SET_[mode];

			_device.setID(id);
			_device.setFocus(id);
		} 
		else if( json.event === "tv" ){
			_TV_[json.mode] = json.data;

			var id = json.id;
			if(!_DEVICE_[json.event].hasOwnProperty(json.id))
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
				
				this.doSwept();
				
				return;
			}
			else{
				param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + commandEx;
			}
		}
		else if('tv' == dev_id){
			if(commandEx == undefined){

				document.getElementById('color_title').innerText = '\"' + document.getElementById(id).innerText + '\"调节';
				this.setFocus(id);
				this.setID(id);
				this.setPos();
				this.doDraw();
				
				return;
			}
			else{
				param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + commandEx;
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

