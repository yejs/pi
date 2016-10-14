//plugin类
_MEDEA_BTN_ = {'mute':0, 'play':1, 'pre':2, 'next':3};

function medea()
{
	device.apply(this,arguments);
	this._medea_data = null;
	this._current_index = null;
	this.arrayFiles = new Array();
	
	this.do_medea_files = function(data, index){
		this._medea_data = data;
		this._current_index = index;

		this.arrayFiles = [];
		for(var i=0;i<Math.min(120, this._medea_data.length);i++){
			this.arrayFiles[i] = new tagRECT(this.imageRect.x+35,this.imageRect.y + 40 + (i-1)*55,this.rect.width == 0 ? 800:this.rect.width ,this.imageRect.y + 40 + (i)*55,'');
		}
	}
	
	this.initIt = function(){
		for(var i=0;i<20;i++){
			if(document.getElementById(i.toString())){
				document.getElementById(i.toString()).style.display = 'none';
			}
		}
		document.getElementById('all').style.display = 'none';
		document.getElementById('scene_title').innerText = _MODE_SET_[mode] + '-- 音乐';

		for(var i=0;i<4;i++)
		{
			switch(i){
				case _MEDEA_BTN_.mute:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'静音');
				break;
				case _MEDEA_BTN_.play:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'播放');
				break;
				case _MEDEA_BTN_.pre:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'上一首');
				break;
				case _MEDEA_BTN_.next:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'下一首');
				break;
			}
		}
		this.docommand(this.id, 'next');
	}
	this.initDraw = function(){
		this.contextImage.clearRect(0, 0, this.rect.width, this.rect.height);
	
		this.imageRect = {x:25, y:5, width:this.rect.width-50 , height:(this.rect.width-50)};
		var btn_w = 160, btn_h = 80, offset_x = 20, offset_y = 40;
		var y = this.imageRect.y + this.imageRect.height + offset_y;
		this.arrayBtn[_MEDEA_BTN_.mute].doResize(this.rect.width/2 - btn_w/2, y, this.rect.width/2 + btn_w/2, y + btn_h);

		var s = ((this.imageRect.x + this.imageRect.width - offset_x - btn_w) - (this.imageRect.x + offset_x))/2;
		y += 130;
		for(var i=_MEDEA_BTN_.play;i<=_MEDEA_BTN_.next;i++){
			this.arrayBtn[i].doResize(this.imageRect.x + offset_x + (i-_MEDEA_BTN_.play)*s, y, this.imageRect.x + offset_x + (i-_MEDEA_BTN_.play)*s + btn_w, y + btn_h);
		}
		
		this.contextImage.fillStyle = "rgb(141, 178, 159)";
		this.contextImage.roundRect(this.imageRect.x, this.imageRect.y, this.imageRect.width, this.imageRect.height, 20, 1, 0);
	}
	//人机交互处理
	this.doIt = function(loc, down, up){
		if(down){
			var touchBtn = -1;
			for(var i=0;i<this.arrayBtn.length;i++){
				if(this.arrayBtn[i].IsInRect(loc, 0)){
					this.arrayBtn[i].istouch = true;
					this.doMedeaKey(loc);
				}
			}

			start = Math.max(parseInt(this._current_index)-8, 0);
			end = Math.min(start+16, this._medea_data.length);

			for(var i=start;i<end;i++){
				if(this.arrayFiles[i-start].IsInRect(loc, 0)){
					this.arrayFiles[i-start].istouch = true;
					this.docommand(this.id, i.toString());
				}
			}
		}
		else if(up){
			for(var i=0;i<this.arrayBtn.length;i++){
				this.arrayBtn[i].istouch = false;
			}
			for(var i=0;i<this.arrayFiles.length;i++){
				this.arrayFiles[i].istouch = false;
			}
		}
		this.doDraw();
	}

	this.doMedeaKey = function(loc) { 

		if(this.arrayBtn[_MEDEA_BTN_.mute].IsInRect(loc, 0)){//mute
			this.docommand(this.id, 'mute');
			this.doBtnFocus(_MEDEA_BTN_.power);
		}
		else if(this.arrayBtn[_MEDEA_BTN_.play].IsInRect(loc, 0)){//play
			this.docommand(this.id, 'play');
			this.doBtnFocus(_MEDEA_BTN_.play);
		}
		
		else if(this.arrayBtn[_MEDEA_BTN_.pre].IsInRect(loc, 0)){//pre
			this.docommand(this.id, 'pre');
			this.doBtnFocus(_MEDEA_BTN_.pre);
		}
		else if(this.arrayBtn[_MEDEA_BTN_.next].IsInRect(loc, 0)){//next
			this.docommand(this.id, 'next');
			this.doBtnFocus(_MEDEA_BTN_.next);
		}
	}
	
	this.drawIt = function(ctx){
		ctx.drawImage(this.canvasImage, 0, 0);
		if(this._medea_data){
			ctx.font = _font38;

			start = Math.max(parseInt(this._current_index)-8, 0);
			end = Math.min(start+16, this._medea_data.length);
			for(var f in this._medea_data){
				var index = parseInt(f);
				if(index>=start && index < end){
					ctx.fillStyle = ctx.strokeStyle = (index == this._current_index ? "rgb(247, 82, 67)" : "rgb(47, 82, 67)");
					ctx.fillText((index).toString() + '.  ' + this._medea_data[index].file, this.arrayFiles[index-start].left, this.arrayFiles[index-start].bottom);
				}
			}
		}
		//画按钮
		for(var i=0;i<this.arrayBtn.length;i++){
			if(this.arrayBtn[i].istouch)
				ctx.fillStyle = "rgb(230, 100, 100)";
			else
				ctx.fillStyle = "rgb(170, 170, 170)";
			

			this.arrayBtn[i].drawBtn(ctx, _font38, "rgb(0, 0, 0)", 10);
		}
		//画电源按钮
		ctx.strokeStyle = "rgb(250, 20, 20)";
		ctx.lineWidth = 5;
		powerBtn = this.arrayBtn[_MEDEA_BTN_.power];
	//	ctx.arcEx(powerBtn.left + powerBtn.width/2, powerBtn.top + powerBtn.height/2, 20, 1.4*Math.PI, 1.6*Math.PI, 1, 0, 1, false);
	//	ctx.drawLine(powerBtn.left + powerBtn.width/2,powerBtn.top + 15,powerBtn.left + powerBtn.width/2,powerBtn.top + 30);
	}
	
	this.doParam = function(id, commandEx){
		if(commandEx){
			param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + commandEx;
			return param;
		}
	}
}