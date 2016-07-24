document.write('<script type="text/javascript" src="js/js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/js/canvas.js"></script>');

var _footer = null;

footer_title = ['首页', '设置', '关于'];

doInitFooter = function(canvas, index)
{
	_footer = new footer(index);
	_footer.doInit(canvas);	
	
}

function footer(index)
{
	this.rect;
	this.canvasReport = this.canvas = this.contextReport = this.ctx = null;
	this.index = index;
	this.arrayBtn = new Array();
//	console.log('footer' + this.index);
	this.doInit = function(canvas)
	{
		this.canvasReport = document.createElement("canvas");
		this.canvas = document.getElementById(canvas);//显示画布
		
		if(isPC()){
			this.canvas.addEventListener('mousedown', function(event) { 
				_footer.doMouseDown(event, true);//不能用this
				}, false);
			this.canvas.addEventListener('mouseup', function(event) { 
				_footer.doMouseUp(event, true);
				}, false);
			this.canvas.addEventListener('mousemove', function(event) { 
				_footer.doMouseMove(event, true);
				}, false);
		}
		else{
			this.canvas.addEventListener('touchstart', function(event) { 
				event.preventDefault();
				if (event.targetTouches.length == 1) { 
				_footer.doMouseDown(event, false);
				} 
				}, false);
			this.canvas.addEventListener('touchend', function(event) { 
				event.preventDefault();
				_footer.doMouseUp(event, false);
				}, false);
			this.canvas.addEventListener('touchcancel', function(event) { 
				event.preventDefault();
				_footer.doMouseUp(event, false);
				}, false);
			this.canvas.addEventListener('touchmove', function(event) { 
				event.preventDefault();
				if (event.targetTouches.length == 1) { 
				_footer.doMouseMove(event, false);
				} 
				}, false);
		}
		
		for(var i=0;i<footer_title.length;i++){
			btn=new tagRECT(0,0,0,0);
			this.arrayBtn.push(btn);
			
		}
		
		this.onresize();
	}
	
	this.onresize = function()
	{
		this.rect = getWinRect();
		this.rect.height = '80';
		this.rect.width = Math.min(1080, this.rect.width) - 2;
		this.canvas.width = this.canvasReport.width = this.rect.width;  
		this.canvas.height = this.canvasReport.height = this.rect.height;
		this.contextReport = this.canvasReport.getContext("2d");
		this.ctx = this.canvas.getContext("2d");
		
		var width = (this.rect.width-2)/footer_title.length;
		for(var i=0;i<footer_title.length;i++){
			this.arrayBtn[i].doResize(i*width,0,(i+1)*width,this.rect.height);
		}
		
		this.doDraw();
	}

	this.doDraw = function()
	{
		this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
		this.contextReport.clearRect(0, 0, this.rect.width, this.rect.height);

		this.contextReport.fillStyle = "rgb(43, 164, 235)";
		this.contextReport.fillRect(0, 0, this.rect.width, this.rect.height);

		var width = (this.rect.width-2)/footer_title.length;
		this.contextReport.fillStyle = "rgb(255, 255, 255)";
		this.contextReport.strokeStyle = "rgb(220, 0, 0)";
		this.contextReport.lineWidth = 4;
		this.contextReport.fillRect(this.index*width, 0, width, this.rect.height);
		this.contextReport.drawLine(this.index*width, this.rect.height-4, (this.index+1)*width, this.rect.height-4);

		this.contextReport.fillStyle = this.contextReport.strokeStyle = "rgb(255, 255, 255)";
		this.contextReport.font = _font42;
		this.contextReport.textBaseline="middle";
		for(var i=0;i<footer_title.length;i++){
			
			if(i == this.index)
				this.contextReport.fillStyle = this.contextReport.strokeStyle = "rgb(255, 0, 0)";
			else
				this.contextReport.fillStyle = this.contextReport.strokeStyle = "rgb(255, 255, 255)";
			this.contextReport.fillText(footer_title[i], i*width + width/2 - this.contextReport.measureText(footer_title[i]).width/2, this.rect.height/2);
		}
		this.ctx.drawImage(this.canvasReport, 0, 0);
	}
	
	this.doMouseDown = function(event, mouse) { 
	//	this.doMouse(event, mouse, true, false);
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
		
		for(var i=0;i<footer_title.length;i++){
			if(this.arrayBtn[i].IsInRect(loc, 0) && this.index != i){
				console.log(i);
				if(i == 0)
					window.location.href = 'index.html';
				else if(i == 1)
					window.location.href = 'setting.html';
				break;
			}
		}
	}
	this.doMouseUp = function(event, mouse) { 
	//	this.doMouse(event, mouse, false, true);

	}
	this.doMouseMove = function(event, mouse) { 
	//	this.doMouse(event, mouse, false, false);
	}
}