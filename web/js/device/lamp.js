//灯类

function lamp()
{
	device.apply(this,arguments);
	
	this.initIt = function(){
	}
	this.initDraw = function(){
	}
	//人机交互处理
	this.doIt = function(loc, down, up){
		if(up){
			this.bar0.isdown = false;
			this.bar1.isdown = false;
			this.bar2.isdown = false;
			this.bar3.isdown = false;
		}
		
		if("lamp" == dev_id && (_LAMP_[mode][this.id]['status'] === 'off' || _DEVICE_['lamp'][this.id]['pin'] == '0'))
			return;
		
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
		
		if(_DEVICE_['lamp'][this.id]['pin'] != '0')
			color = parseInt(r/16).toString(16) + parseInt(r%16).toString(16) + parseInt(g/16).toString(16) + parseInt(g%16).toString(16) + parseInt(b/16).toString(16) + parseInt(b%16).toString(16);
		else{
			color = 'ffffff';
			console.log('pin:' + _DEVICE_['lamp'][this.id]['pin']);
		}
		this.docommand(this.id, color);
	//	window.parent.postMessage({'msg':'send' , 'data':'dsdsfdfdf'},'*');
		
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
		var c = 100.0/6.0;

		if(pos>=0 && pos<parseInt(c)){
			color.r = 255, color.g = pos*255/c, color.b = 0; 
		}
		else if(pos>=parseInt(c) && pos<parseInt(c*2.0)){
			color.r = Math.min((parseInt(c*2.0)-pos)*255/c, 255), color.g = 255, color.b = 0; 
		}
		else if(pos>=parseInt(c*2.0) && pos<parseInt(c*3.0)){
			color.r = 0, color.g = 255, color.b = Math.min((pos-parseInt(c*2.0))*255/c, 255); 
		}
		else if(pos>=parseInt(c*3.0) && pos<=parseInt(c*4.0)){
			color.r = 0, color.g = Math.min((parseInt(c*4.0)-pos)*255/c, 255), color.b = 255; 
		}
		
		else if(pos>=parseInt(c*4.0) && pos<parseInt(c*5.0)){
			color.r = Math.min((pos-parseInt(c*4.0))*255/c, 255), color.g = 0, color.b = 255; 
		}
		else if(pos>=parseInt(c*5.0) && pos<=parseInt(c*6.0)){
			color.r = 255, color.g = 0, color.b = Math.min((parseInt(c*6.0)-pos)*255/c, 255); 
		}

		return color;
	}
	
	this.drawIt = function(ctx){
		var pos1 = this.bar1.pos*this.bar1.width/100, pos2 = this.bar2.pos*this.bar2.width/100, pos3 = this.bar3.pos*this.bar3.width/100;
		var offset = this.bar1.height/2 - 5, r = 5, h = 10;
		var on = _LAMP_[mode][this.id]['status'] === 'on' && _DEVICE_['lamp'][this.id]['pin'] != '0';
		//滚动条的左半部分
		ctx.fillStyle = on ? "rgb(220, 0, 0)" : "rgb(220, 220, 220)";
		ctx.roundRect(this.bar1.x, this.bar1.y+offset, pos1, h, r, 1, 0);
		ctx.fillStyle = on ? "rgb(0, 220, 0)" : "rgb(220, 220, 220)";
		ctx.roundRect(this.bar2.x, this.bar2.y+offset, pos2, h, r, 1, 0);
		ctx.fillStyle = on ? "rgb(0, 0, 220)" : "rgb(220, 220, 220)";
		ctx.roundRect(this.bar3.x, this.bar3.y+offset, pos3, h, r, 1, 0);
		
		//滚动条的右半部分
		ctx.fillStyle = "rgb(220, 220, 220)";
		ctx.roundRect(this.bar1.x + pos1, this.bar1.y+offset, this.bar1.width - pos1, h, r, 1, 0);
		ctx.roundRect(this.bar2.x + pos2, this.bar2.y+offset, this.bar2.width - pos2, h, r, 1, 0);
		ctx.roundRect(this.bar3.x + pos3, this.bar3.y+offset, this.bar3.width - pos3, h, r, 1, 0);
		
		//滚动条的拖动按钮部分
		r = this.bar1.height/4;
		ctx.fillStyle = on ? "rgba(120, 0, 0, 0.5)" : "rgb(120, 120, 120, 0.5)";
		ctx.roundRect(this.bar1.x + pos1 - r, this.bar1.y+r, r*2, r*2, r, 1, 0);
		ctx.fillStyle = on ? "rgba(0, 120, 0, 0.5)" : "rgb(120, 120, 120, 0.5)";
		ctx.roundRect(this.bar2.x + pos2 - r, this.bar2.y+r, r*2, r*2, r, 1, 0);
		ctx.fillStyle = on ? "rgba(0, 0, 120, 0.5)" : "rgb(120, 120, 120, 0.5)";
		ctx.roundRect(this.bar3.x + pos3 - r, this.bar3.y+r, r*2, r*2, r, 1, 0);
		
		//七彩条状滚动条
		ctx.beginPath();
		var width = this.bar0.width/45;
		for(var i=0;i<45;i++)
			ctx.roundRect2(this.bar0.x + i*width, this.bar0.y, width - 4, this.bar0.height, 8, 0, 0);
		ctx.closePath();
		var grd=ctx.createLinearGradient(this.bar0.x,this.bar0.y,this.bar0.width,0); //颜色渐变的起始坐标和终点坐标
		grd.addColorStop(0, "rgba(255, 0, 0, 1)"); //0表示起点..0.1 0.2 ...1表示终点，配置颜色
		grd.addColorStop(0.17, "rgba(255, 255, 0, 1)");
		grd.addColorStop(0.33, "rgba(0, 255, 0, 1)");
		grd.addColorStop(0.50, "rgba(0, 255, 255, 1)");
		grd.addColorStop(0.67, "rgba(0, 0, 255, 1)");
		grd.addColorStop(0.83, "rgba(255, 0, 255, 1)");
		grd.addColorStop(1, "rgba(255, 0, 0, 1)");
		ctx.fillStyle = on ? grd : "rgb(220, 220, 220)";
		ctx.fill();
	}
	
	this.doParam = function(id, commandEx){
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
			document.getElementById(id.toString()).style.backgroundColor = '#ee0';

		}
		else{
			//调光调色
			param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&color=" + commandEx;
		}
		return param;
	}
}
