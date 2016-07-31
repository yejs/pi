var _owner = {timer:0, sign:-1, height:-1, obj:null};

function scroll()
{
	this.start = {x: -1, y: -1, t:-1, scrollTop:-1, scrollLeft:-1};
	this.do_scroll_x = false;
	this.do_scroll_y = false;
	this.parentNode = null;
	this.ispc = isPC();
	this.inner_scroll = false;

	this.doStart = function(x, y, parentNode) {
		this.start.x = x;
		this.start.y = y;
		this.parentNode = parentNode;
		this.start.t = new Date().getTime();
		this.start.scrollTop = document.body.scrollTop;
		this.start.scrollTop2 = parentNode ? parentNode.scrollTop : null;
		this.start.scrollLeft = parentNode ? parentNode.parentNode.scrollLeft : document.body.scrollLeft;//wrap
		this.do_scroll_x = false;
		this.do_scroll_y = false;
	
		_owner.obj = this;
		clearInterval(_owner.timer);
		
		var w = getWinRect().width;
		if(parentNode && parentNode.scrollWidth > w)
			this.inner_scroll = true;
		else
			this.inner_scroll = false;
		
	//	this.setScrollPos(0);
	}
	
	this.doEnd = function(x, y){
		if(this.start.x == -1 || this.start.y == -1)
			return;

		var w = getWinRect().width;
		var parentNode = this.parentNode ? this.parentNode : document.body;
		
		if(this.do_scroll_x){//左右滑屏翻页
			if(this.inner_scroll){
				this.doScrollEx(x, y);
			}
			else{
				if(Math.abs(x - this.start.x)>w/4){
					clearInterval(_owner.timer);
					_owner.timer = setInterval(function(){
						
						var left = parseInt(document.body.style.left);
						if(w > Math.abs(left)){
							if(left<0)
								left -= 10;
							else
								left += 10;
							_owner.obj.setScrollPos(left);
						}
						else{
							clearInterval(_owner.timer);
							_owner.timer = setTimeout(function(){

						
								clearInterval(_owner.timer);
								_owner.timer = setTimeout(function(){
									_owner.obj.setScrollPos(0);
								}, 500);
							}, 50);
						}
					}, 5);
				}
				else{
					this.setScrollPos(0);
				}
			}
			
		}
		else if(this.do_scroll_y){//上下滑屏滚动
			this.doScrollEx(x, y);
		}
		
		this.start.x = -1;
		this.start.y = -1;
	}
	
	this.doScrollEx = function(x, y){
		var parentNode = this.parentNode ? this.parentNode : document.body;
		if(this.do_scroll_y)
			parentNode = document.body;
		var t = new Date().getTime();
		if(t - this.start.t < 300 && ((this.do_scroll_y && Math.abs(this.start.scrollTop - parentNode.scrollTop)>50) || (this.do_scroll_x && Math.abs(this.start.scrollLeft - parentNode.scrollLeft)>50)))
		{
			if(this.do_scroll_y)
				_owner.height = (parentNode.scrollTop - this.start.scrollTop)*200/(t - this.start.t == 0 ? 1 : t - this.start.t);
			else
				_owner.height = (parentNode.scrollLeft - this.start.scrollLeft)*200/(t - this.start.t == 0 ? 1 : t - this.start.t);
			
			_owner.sign = (_owner.height>0) ? 1 : -1;

			clearInterval(_owner.timer);
			_owner.timer = setInterval(function(){
				
				var h = (Math.abs(_owner.height) > 50 ? 40 : (Math.abs(_owner.height) > 30 ? 20 : 5));
				h = _owner.sign*h;
				_owner.height -=  h;

				if((_owner.sign > 0 && _owner.height<=0) || (_owner.sign < 0 && _owner.height>=0))
					clearInterval(_owner.timer);
				else{
					if(this.do_scroll_y)
						parentNode.scrollTop = parentNode.scrollTop + h;
					else
						parentNode.scrollLeft = parentNode.scrollLeft + h;
				}
			}, 20);
		}
	}
	
	this.doScroll = function(x, y){
		if(this.start.y > -1)
		{
			var parentNode = this.parentNode ? this.parentNode : document.body;
			var winHeight = getWinRect().height - 300;
			if(!this.do_scroll_x && (this.inner_scroll || (!this.inner_scroll && parentNode.scrollHeight > winHeight))){
				if((Math.abs(y - this.start.y)>4 && Math.abs(x - this.start.x)<4) || Math.abs(y - this.start.y)>10)
					this.do_scroll_y = true;
			}
			if(!this.do_scroll_y && Math.abs(x - this.start.x)>10){
				this.do_scroll_x = true;
			}

			if(this.do_scroll_x){
				this.setScrollPos(x - this.start.x);
			}
			else if(this.do_scroll_y){
				parentNode.scrollTop = (this.parentNode ? this.start.scrollTop2 : parentNode.scrollTop) + this.start.y - y;
			}
		}
	}
	
	this.setScrollPos = function(x){

		document.body.style.left = x + 'px';			
	}
}