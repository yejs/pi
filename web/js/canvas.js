CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {
	var pos = 0;
	for(var n = 0; n < text.length; n++) {
      var line = text.substr(pos, n - pos);
      var metrics = this.measureText(line);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        this.fillText(line, x, y);
        pos = n;
        y += lineHeight;
      }
    }
	if(pos < text.length)
		this.fillText(text.substr(pos, text.length - pos), x, y);
}

CanvasRenderingContext2D.prototype.clipEx = function(left, top, width, height)
{ 
	this.beginPath();
	this.rect(left, top, width, height);
	this.clearRect(left, top, width, height);
	this.clip();
}
	
function drawObj(type, start_loc, offset, color)
{ 
	this.type = type;
	this.start_loc = { x: start_loc.x, y: start_loc.y}; 
	this.last = { x: start_loc.x, y: start_loc.y};
	this.cp1 = { x: start_loc.x, y: start_loc.y};
	this.cp2 = { x: start_loc.x, y: start_loc.y};
	this.offset = { x: offset.x, y: offset.y}; 
    this.color = color;
	this.index = 0;
	this.finish = 0;
	this.arrayPoint = new Array();
	
	this.pushLoc = function(loc)
	{ 
		this.arrayPoint.push(loc);
	}
	
	this.setLoc = function(loc)
	{ 
		if(this.index == 0)
		{
			this.last.x = loc.x;
			this.last.y = loc.y;
			
			this.cp2.x = this.cp1.x = loc.x + (this.start_loc.x - loc.x)/2;
			this.cp2.y = this.cp1.y = loc.y + (this.start_loc.y - loc.y)/2;
			
			if(this.type == line || this.type == arc || this.type >= triangle  || this.type == -1)
			{
				this.finish = 1;
			}
		}
		else if(this.index == 1)
		{
			this.cp1.x = loc.x;
			this.cp1.y = loc.y;
			this.cp2.x = loc.x;
			this.cp2.y = loc.y;
			
			if(this.type == curve)
				this.finish = 1;
		}
		else if(this.index == 2)
		{
			this.cp2.x = loc.x;
			this.cp2.y = loc.y;
			
			this.finish = 1;
		}
		this.index++;
	}
}

CanvasRenderingContext2D.prototype.getPixelRatio = function () {
  var backingStore = this.backingStorePixelRatio ||
	this.webkitBackingStorePixelRatio ||
	this.mozBackingStorePixelRatio ||
	this.msBackingStorePixelRatio ||
	this.oBackingStorePixelRatio ||
	this.backingStorePixelRatio || 1;
   return (window.devicePixelRatio || 1) / backingStore;
};

function getPixelRatio(){
	canvasReport = document.createElement("canvas"); //报价牌缓存
	contextReport = canvasReport.getContext("2d");
	return contextReport.getPixelRatio();
}

CanvasRenderingContext2D.prototype.getPoint = function (x, y, r, sAngle)
{
	return {x:x+Math.cos(sAngle)*r, y:y+Math.sin(sAngle)*r};  
}

CanvasRenderingContext2D.prototype.arcEx = function (x, y, r, sAngle, eAngle, counterclockwise, fill, stroke) {
	this.save(); 
//	this.translate(0.5,0.5); 
	this.beginPath(); 
	var pt = this.getPoint(x, y, r, sAngle);

	this.moveTo(pt.x, pt.y); 
	this.arc(x, y, r, sAngle, eAngle, counterclockwise);
	if(eAngle - sAngle < Math.PI*2){
		this.lineTo(x, y);
		this.closePath();
	}
		
	if (stroke) {  
		this.stroke();  
	}  
	if (fill) {  
		this.fill();  
	} 
	this.restore(); 
}

CanvasRenderingContext2D.prototype.drawLine = function (fromX, fromY, toX, toY) {
	this.save(); 
	this.translate(0.5,0.5); 
	this.beginPath(); 
	this.moveTo(parseInt(fromX), parseInt(fromY)); 
	this.lineTo(parseInt(toX), parseInt(toY)); 
	this.stroke(); 
	this.restore(); 
}

String.prototype.ltrim = function () {
	this.replace(/(^s*)/g,"");
}

CanvasRenderingContext2D.prototype.drawLineEx = function (point) {
	this.save(); 
	this.translate(0.5,0.5); 
	this.beginPath(); 
	this.moveTo(parseInt(point[0].x), parseInt(point[0].y)); 
	for(var i=1;i<point.length;i++)
	{
		this.lineTo(parseInt(point[i].x), parseInt(point[i].y));
	}
	this.stroke(); 
	this.restore(); 
}

CanvasRenderingContext2D.prototype.strokeRectEx = function (x, y, w, h) {
	this.save(); 
	this.translate(0.5,0.5); 
	this.strokeRect(parseInt(x), parseInt(y), parseInt(w), parseInt(h));
	this.restore(); 
}

//圆角矩形
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r, fill, stroke) {
    this.save(); 
	this.translate(0.5,0.5); 
	
    this.beginPath();
    this.moveTo(parseInt(x+r), parseInt(y));
    this.arcTo(parseInt(x+w), parseInt(y), parseInt(x+w), parseInt(y+h), parseInt(r));
    this.arcTo(parseInt(x+w), parseInt(y+h), parseInt(x), parseInt(y+h), parseInt(r));
    this.arcTo(parseInt(x), parseInt(y+h), parseInt(x), parseInt(y), parseInt(r));
    this.arcTo(parseInt(x), parseInt(y), parseInt(x+w), parseInt(y), parseInt(r));

    this.closePath();
	if (stroke) {  
		this.stroke();  
	}  
	if (fill) {  
		this.fill();  
	} 
	this.restore(); 
}

CanvasRenderingContext2D.prototype.roundRect2 = function (x, y, w, h, r) {
    this.save(); 
	this.translate(0.5,0.5); 

    this.moveTo(parseInt(x), parseInt(y+r));
    this.arcTo(parseInt(x), parseInt(y), parseInt(x+w), parseInt(y), parseInt(r));
	this.arcTo(parseInt(x+w), parseInt(y), parseInt(x+w), parseInt(y+h), parseInt(r));
    this.arcTo(parseInt(x+w), parseInt(y+h), parseInt(x), parseInt(y+h), parseInt(r));
    this.arcTo(parseInt(x), parseInt(y+h), parseInt(x), parseInt(y), parseInt(r));
	this.restore(); 
}

CanvasRenderingContext2D.prototype.roundRectEx = function (x, y, w, h, r, fill, stroke, left_top, right_top, right_bottom, left_bottom) {
	this.save(); 
	this.translate(0.5,0.5); 
	this.beginPath();
	if(left_top)
		this.moveTo(parseInt(x+r), parseInt(y));
	else
		this.moveTo(parseInt(x), parseInt(y));
	
	if(right_top)
		this.arcTo(parseInt(x+w), parseInt(y), parseInt(x+w), parseInt(y+h), parseInt(r));
	else
		this.lineTo(parseInt(x+w), parseInt(y));
	
	if(right_bottom)
		this.arcTo(parseInt(x+w), parseInt(y+h), parseInt(x), parseInt(y+h), parseInt(r));
	else
		this.lineTo(parseInt(x+w), parseInt(y+h));
	
	if(left_bottom)
		this.arcTo(parseInt(x), parseInt(y+h), parseInt(x), parseInt(y), parseInt(r));
	else
		this.lineTo(parseInt(x), parseInt(y+h));
	
	if(left_top)
		this.arcTo(parseInt(x), parseInt(y), parseInt(x+w), parseInt(y), parseInt(r));
	else
		this.lineTo(parseInt(x), parseInt(y));

	this.closePath();
	
	if (fill) {  
		this.fill();  
	} 
	if (stroke) {  
		this.stroke();  
	}  
	this.restore(); 
}

CanvasRenderingContext2D.prototype.drawPath = function (x, y, n, r, fill, stroke) {

	var i,ang;
   ang = Math.PI*2/n //旋转的角度
   this.save();//保存状态
   this.fillStyle ='rgba(255,0,0,.9)';//填充红色，半透明
   this.strokeStyle ='rgba(255,0,0,.9)';//填充绿色
   this.lineWidth = 1;//设置线宽
   this.translate(x, y);//原点移到x,y处，即要画的多边形中心
   this.moveTo(0, -r);//据中心r距离处画点
   this.beginPath();
   for(i = 0;i < n; i ++)
   {
     this.rotate(ang)//旋转
     this.lineTo(0, -r);//据中心r距离处连线
   }
    this.closePath();
	if (stroke) {  
		this.stroke();  
	}  
	if (fill) {  
		this.fill();  
	} 
    this.restore();//返回原始状态
}

//虚线
CanvasRenderingContext2D.prototype.dashedLineTo = function (fromX, fromY, toX, toY, pattern) {  
    // default interval distance -> 5px  
    if (typeof pattern === "undefined") {  
        pattern = 5;  
    }  
  
    // calculate the delta x and delta y  
    var dx = (toX - fromX);  
    var dy = (toY - fromY);  
    var distance = Math.floor(Math.sqrt(dx*dx + dy*dy));  
    var dashlineInteveral = (pattern <= 0) ? distance : (distance/pattern);  
    var deltay = (dy/distance) * pattern;  
    var deltax = (dx/distance) * pattern;  
     
	this.save(); 
	this.translate(0.5,0.5); 

    // draw dash line  
    this.beginPath();  
    for(var dl=0; dl<dashlineInteveral; dl++) {  
        if(dl%2) {  
            this.lineTo(parseInt(fromX + dl*deltax), parseInt(fromY + dl*deltay));  
        } else {                      
            this.moveTo(parseInt(fromX + dl*deltax), parseInt(fromY + dl*deltay));                    
        }                 
    }  
    this.stroke(); 
	this.restore(); 	
};

function getPointOnCanvas(canvas, x, y) { 
	var loc = GetPageScroll();
	var bbox = canvas.getBoundingClientRect(); 
	return { x: x - bbox.left,
	y: y - bbox.top - loc.top
	}; 
} 



function tagRECT(left, top, right, bottom, title1, title2, tips)
{ 
	this.width = right - left; 
	this.height = bottom - top; 

	this.left = left;
	this.right = right;
	this.top = top;
	this.bottom = bottom;
	
	this.title = new Array();
	this.title[0] = title1 == undefined ? '' : title1;
	this.title[1] = title2 == undefined ? '' : title2;
	this.tips = tips == undefined ? '' : tips;

	this.onclick = false;
	this.istouch = false;
	this.start_loc = { x: 0, y: 0, left: 0, top: 0}; 
//	this.last = { x: 0, y: 0};
	
	this.drawBtn = function(ctx, font, textColor, r)
	{ 
		ctx.save();//保存状态
		ctx.roundRect(this.left, this.top, this.width, this.height, r, 1, 0);
		ctx.fillStyle = ctx.strokeStyle = textColor;
		s = this.title[this.onclick && this.title[1] != ''? 1 : 0];
		ctx.font = font;
		ctx.textBaseline="middle";
		ctx.fillText(s, this.left + this.width/2 - ctx.measureText(s).width/2, this.top + this.height/2);
		ctx.restore(); 	
	}
	
	this.doResize = function(left, top, right, bottom)
	{ 
		this.width = right - left; 
		this.height = bottom - top; 

		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
	}
	this.IsInRect = function(loc, down_up)
	{ 
		var left = parseInt(document.body.style.left);//初始化时必需要设定document.body.style.left属性才行

		if(isNaN(left))
			left = document.body.style.left = 0;
		
		if(loc.x >= this.left && loc.x <= this.right && loc.y >= this.top && loc.y <= this.bottom && this.top < this.bottom && Math.abs(left)<1){
			if(down_up == 1){//1：按下判断
				this.istouch = true;
				this.start_loc.x = loc.x;
				this.start_loc.y = loc.y;
				var scroll = GetPageScroll();
				this.start_loc.left = scroll.left;
				this.start_loc.top = scroll.top;
			}
			else if(down_up == 2 || down_up == 20){//2：松开判断并设置onclick，20：松开判断但不设置onclick
				var scroll = GetPageScroll();
				loc.x = loc.x + (this.start_loc.left - scroll.left);
				loc.y = loc.y + (this.start_loc.top - scroll.top);
				if(this.istouch && loc.x >= this.left && loc.x <= this.right && loc.y >= this.top && loc.y <= this.bottom){
					if(down_up == 2)
						this.onclick = this.onclick ? false : true;

					return true;
				}
				else
					return false;
			}
			else if(down_up == 0){}//0：只判断范围
			return true;
		}

		return false;
	}
}

function ltrim(str){ //删除左边的空格
　　return str.replace(/(^s*)/g,"");
}

String.prototype.trim=function(){
   return this.replace(/(^\s*)|(\s*$)/g,'');
}
String.prototype.ltrim=function(){
   return this.replace(/(^\s*)/g,"");
}
String.prototype.rtrim=function(){
   return this.replace(/(\s*$)/g,"");
}

function getByteLen(val) {
//	val = ltrim(val);
    var len = 0;
    for (var i = 0; i < val.length; i++) {
         var a = val.charAt(i);
         if (a.match(/[^\x00-\xff]/ig) != null) 
        {
            len += 2;
        }
        else
        {
            len += 1;
        }
    }
    return len;
}
