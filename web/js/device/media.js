//plugin类
_MEDEA_BTN_ = {'mute':0,  'vol_add':1, 'vol_dec':2, 'play':3, 'pre':4, 'next':5};

function media()
{
	device.apply(this,arguments);
	this._media_data = null;
	this._current_index = null;
	this.arrayFiles = new Array();
	this.vol = 0;
	this.mute = false;
	this.play = false;
	this.mute_img1 = null;
	this.mute_img2 = null;
	this.play_img1 = null;
	this.play_img2 = null;
	this.vol_img1 = null;
	this.vol_img2 = null;
		
	this.do_media_files = function(data, index, vol, play){
		
		this._media_data = data;
		this._current_index = index;
		this.vol = vol;
		this.mute = (this.vol == 0 ? true : false);
		this.play = (play == 'false' ? false : true);
		
		this.arrayFiles = [];
		for(var i=0;i<Math.min(120, this._media_data.length);i++){
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

		for(var i=0;i<6;i++)
		{
			switch(i){
				case _MEDEA_BTN_.mute:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'静音','静音');
				break;
				case _MEDEA_BTN_.vol_add:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'音量+');
				break;
				case _MEDEA_BTN_.vol_dec:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'音量-');
				break;
				case _MEDEA_BTN_.play:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'播放','暂停');
				break;
				case _MEDEA_BTN_.pre:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'上一首');
				break;
				case _MEDEA_BTN_.next:
				this.arrayBtn[i] = new tagRECT(0,0,0,0,'下一首');
				break;
			}
		}
		this.docommand(this.id, '0');
	}
	this.initDraw = function(){
		this.contextImage.clearRect(0, 0, this.rect.width, this.rect.height);
	
		this.imageRect = {x:25, y:5, width:this.rect.width-50 , height:(this.rect.width-50)};
		var btn_w = 160, btn_h = 80, offset_x = 20, offset_y = 40;
		var y = this.imageRect.y + this.imageRect.height + offset_y;
		var s = ((this.imageRect.x + this.imageRect.width - offset_x - btn_w) - (this.imageRect.x + offset_x))/2;

		for(var i=_MEDEA_BTN_.mute;i<=_MEDEA_BTN_.next;i++){
			if(i == _MEDEA_BTN_.play)
				y += 130;
			this.arrayBtn[i].doResize(this.imageRect.x + offset_x + ((i-_MEDEA_BTN_.mute)%3)*s, y, this.imageRect.x + offset_x + ((i-_MEDEA_BTN_.mute)%3)*s + btn_w, y + btn_h);
		}
		
		this.contextImage.fillStyle = "rgb(141, 178, 159)";
		this.contextImage.roundRect(this.imageRect.x, this.imageRect.y, this.imageRect.width, this.imageRect.height, 20, 1, 0);
		
		this.mute_img1=new Image();
		this.mute_img1.src = 'images//mute1.png';
		this.mute_img1.onload = function(){
			_device.doDraw();
		}
		this.mute_img2=new Image();
		this.mute_img2.src = 'images//mute2.png';
		this.mute_img2.onload = function(){
			_device.doDraw();
		}
		this.play_img1=new Image();
		this.play_img1.src = 'images//play1.png';
		this.play_img1.onload = function(){
			_device.doDraw();
		}
		this.play_img2=new Image();
		this.play_img2.src = 'images//play2.png';
		this.play_img2.onload = function(){
			_device.doDraw();
		}
		this.vol_img1=new Image();
		this.vol_img1.src = 'images//vol1.png';
		this.vol_img1.onload = function(){
			_device.doDraw();
		}
		this.vol_img2=new Image();
		this.vol_img2.src = 'images//vol2.png';
		this.vol_img2.onload = function(){
			_device.doDraw();
		}
	}
	//人机交互处理
	this.doIt = function(loc, down, up){
		start = Math.max(parseInt(this._current_index)-8, 0);
		end = Math.min(start+16, this._media_data.length);
			
		if(down){
			for(var i=0;i<this.arrayBtn.length;i++){
				if(this.arrayBtn[i].IsInRect(loc, 0)){
					this.arrayBtn[i].istouch = true;
				}
			}

			for(var i=start;i<end;i++){
				if(this.arrayFiles[i-start].IsInRect(loc, 0)){
					this.arrayFiles[i-start].istouch = true;
				}
			}
			this.istouch = true;
		}
		else if(up){
			for(var i=0;i<this.arrayBtn.length;i++){
				if(this.arrayBtn[i].IsInRect(loc, 0)){
					this.doMedeaKey(loc);
				}
				this.arrayBtn[i].istouch = false;
			}

			for(var i=start;i<end;i++){
				if(this.arrayFiles[i-start].IsInRect(loc, 0)){
					this.docommand(this.id, i.toString());
					this._current_index = i;
				}
				this.arrayFiles[i].istouch = false;
			}
			this.istouch = false;
		}

		this.doDraw();
	}

	this.doMedeaKey = function(loc) { 

		if(this.arrayBtn[_MEDEA_BTN_.mute].IsInRect(loc, 0)){//mute
			this.docommand(this.id, 'mute');
			this.doBtnFocus(_MEDEA_BTN_.power);
		}
		else if(this.arrayBtn[_MEDEA_BTN_.vol_add].IsInRect(loc, 0)){//vol_add
			this.docommand(this.id, 'vol_add');
			this.doBtnFocus(_MEDEA_BTN_.vol_add);
		}
		else if(this.arrayBtn[_MEDEA_BTN_.vol_dec].IsInRect(loc, 0)){//vol_dec
			this.docommand(this.id, 'vol_dec');
			this.doBtnFocus(_MEDEA_BTN_.vol_dec);
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
		if(this.rect.width == 0)
			return;
		ctx.drawImage(this.canvasImage, 0, 0);
		if(this._media_data){
			ctx.font = _font38;

			start = Math.max(parseInt(this._current_index)-8, 0);
			end = Math.min(start+16, this._media_data.length);
			for(var f in this._media_data){
				var index = parseInt(f);
				if(index>=start && index < end){
					ctx.fillStyle = ctx.strokeStyle = (index == this._current_index ? "rgb(247, 82, 67)" : "rgb(47, 82, 67)");
					var tmp = (index+1).toString() + '.  ' + this._media_data[index].file;
					if(ctx.measureText(tmp).width > (this.rect.width - 150)){
						while(ctx.measureText(tmp).width > (this.rect.width - 150)){
							tmp = tmp.substr(0, tmp.length - 2);
						}
						tmp = tmp + '...'
					}
					ctx.fillText(tmp, this.arrayFiles[index-start].left, this.arrayFiles[index-start].bottom);
				}
			}
		}
		//画按钮
		for(var i=0;i<this.arrayBtn.length;i++){
			if(this.arrayBtn[i].istouch)
				ctx.fillStyle = "rgb(230, 100, 100)";
			else
				ctx.fillStyle = "rgb(170, 170, 170)";
			
			if(i == _MEDEA_BTN_.mute){
				if(this.mute && this.mute_img2){
					ctx.drawImage(this.mute_img2, 0, 0, this.mute_img2.width, this.mute_img2.height, _device.arrayBtn[i].left + _device.arrayBtn[i].width/2 - this.mute_img2.width/2, _device.arrayBtn[i].top, this.mute_img2.width, this.mute_img2.height);
				}
				else if(!this.mute && this.mute_img1){
					ctx.drawImage(this.mute_img1, 0, 0, this.mute_img1.width, this.mute_img1.height, _device.arrayBtn[i].left + _device.arrayBtn[i].width/2 - this.mute_img1.width/2, _device.arrayBtn[i].top, this.mute_img1.width, this.mute_img1.height);
				}
			}
			else if(i == _MEDEA_BTN_.play){
				if(this.play && this.play_img1){
					ctx.drawImage(this.play_img1, 0, 0, this.play_img1.width, this.play_img1.height, _device.arrayBtn[i].left + _device.arrayBtn[i].width/2 - this.play_img1.width/2, _device.arrayBtn[i].top, this.play_img1.width, this.play_img1.height);
				}
				else if(!this.play && this.play_img2){
					ctx.drawImage(this.play_img2, 0, 0, this.play_img2.width, this.play_img2.height, _device.arrayBtn[i].left + _device.arrayBtn[i].width/2 - this.play_img2.width/2, _device.arrayBtn[i].top, this.play_img2.width, this.play_img2.height);
				}
			}
			else if(i == _MEDEA_BTN_.vol_dec && this.vol_img1){
				ctx.drawImage(this.vol_img1, 0, 0, this.vol_img1.width, this.vol_img1.height, _device.arrayBtn[i].left + _device.arrayBtn[i].width/2 - this.vol_img1.width/2, _device.arrayBtn[i].top, this.vol_img1.width, this.vol_img1.height);
				
				this.vol
			}
			else if(i == _MEDEA_BTN_.vol_add && this.vol_img2){
				ctx.drawImage(this.vol_img2, 0, 0, this.vol_img2.width, this.vol_img2.height, _device.arrayBtn[i].left + _device.arrayBtn[i].width/2 - this.vol_img2.width/2, _device.arrayBtn[i].top, this.vol_img2.width, this.vol_img2.height);
			}
			else
				this.arrayBtn[i].drawBtn(ctx, _font38, "rgb(0, 0, 0)", 10);
		}
		
		ctx.fillStyle = ctx.strokeStyle = this.istouch ? "rgb(255, 30, 30)" : "rgb(30, 30, 30)";
		ctx.font = _font38;
		ctx.textBaseline="middle";
		s = '音量:' + (parseInt(this.vol*100)).toString() + '%';
		left = (_device.arrayBtn[_MEDEA_BTN_.vol_add].right + _device.arrayBtn[_MEDEA_BTN_.vol_dec].left)/2 - ctx.measureText(s).width/2;
		ctx.fillText(s, left, _device.arrayBtn[_MEDEA_BTN_.vol_add].top + _device.arrayBtn[_MEDEA_BTN_.vol_add].height/2);

	}
	
	this.doParam = function(id, commandEx){
		if(commandEx){
			param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + commandEx;
			return param;
		}
	}
}
