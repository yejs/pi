document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/data.js"></script>');
document.write('<script type="text/javascript" src="js/jquery.min.js"></script>');

var _header = null;

var _font_family = "'Hiragino Sans GB','Microsoft Yahei',Helvetica,STHeiti";

var _font56 = "bold 56px " + _font_family;
var _font36 = "36px " + _font_family;
var _font25 = "25px " + _font_family;
var _font23 = "23px " + _font_family;
var _font20 = "20px " + _font_family;
var _font18 = "18px " + _font_family;
var _font16 = "16px " + _font_family;
var _font14 = "14px " + _font_family;
var _font12 = "12px " + _font_family;


doInitHeader = function(canvas, index)
{
	_header = new header(index);
	_header.doInit(canvas);	
}

function header(index)
{
	this.rect;
	this.canvasReport = this.canvas = this.contextReport = this.ctx = null;
	this.index = index;
	this.arrayBtn = new Array();
	this.city = null;
	this.weather = null;
	
	this.doInit = function(canvas)
	{
		this.canvasReport = document.createElement("canvas");
		this.canvas = document.getElementById(canvas);//显示画布

		this.onresize();
		
		this.getWeather();
	}
	
	this.getWeather = function()
	{
		var cityUrl = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js';
		$.getScript(cityUrl, function (script, textStatus, jqXHR) {
			_header.city = remote_ip_info.city; // 获取城市

			var url = "http://php.weather.sina.com.cn/iframe/index/w_cl.php?code=js&city=" + remote_ip_info.city + "&day=0&dfc=3";
			$.ajax({
				url: url,
				dataType: "script",
				scriptCharset: "gbk",
				success: function (data) {
					var _w = window.SWther.w[_header.city][0];
					_header.weather = {s1:_w.s1,s2:_w.s2,f1:_w.f1,f2:_w.f2,t1:_w.t1,t2:_w.t2,p1:_w.p1,p2:_w.p2,d1:_w.d1,d2:_w.d2};
					_header.doDraw();
				}
			});
		});
	}
	
	this.onresize = function()
	{
		this.rect = getWinRect();
		this.rect.height = '180';
		this.rect.width = Math.min(1080, this.rect.width) - 2;
		this.canvas.width = this.canvasReport.width = this.rect.width;  
		this.canvas.height = this.canvasReport.height = this.rect.height;
		this.contextReport = this.canvasReport.getContext("2d");
		this.ctx = this.canvas.getContext("2d");

		this.doDraw();
	}

	this.doDraw = function()
	{
		this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
		this.contextReport.clearRect(0, 0, this.rect.width, this.rect.height);

		this.contextReport.fillStyle = "rgb(100, 100, 100)";
		this.contextReport.fillRect(0, 0, this.rect.width, this.rect.height);
		
		var rect = {x:0, y:0, width:this.rect.width*2/3, height:this.rect.height};
		this.drawWeather(this.contextReport, rect);

		this.drawDoor(this.contextReport);

		this.ctx.drawImage(this.canvasReport, 0, 0);
	}
	
	this.drawDoor = function(ctx)
	{
		ctx.font = _font36;
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 255)";
		var title = _DEVICE_.door['1'].name + '：' + (_DEVICE_.door['1'].status == 'open' ? '开' : '关');
		ctx.fillText(_DEVICE_.door['1'].name + '：', this.rect.width*5/6 - ctx.measureText(title).width/2, 36);
		
		if(_DEVICE_.door['1'].status == 'open')
			ctx.fillStyle = ctx.strokeStyle = "rgb(255, 50, 50)";
		else
			ctx.fillStyle = ctx.strokeStyle = "rgb(50, 255, 50)";
		ctx.fillText((_DEVICE_.door['1'].status == 'open' ? '开' : '关'), this.rect.width*5/6 - ctx.measureText(title).width/2 + ctx.measureText(_DEVICE_.door['1'].name + '：').width, 36);
	}
	
	this.drawWeather = function(ctx, rect)
	{
		if(!this.weather)
			return;
		var _w = this.weather;
		
		ctx.textBaseline="middle";
		
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 150)";
		ctx.font = _font36;
		var title = "今日天气";
		ctx.fillText(title, rect.width/4 - ctx.measureText(title).width/2, 36);
		
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 150)";
		ctx.font = _font56;
		title = this.city;
		ctx.fillText(title, rect.width/4 - ctx.measureText(title).width/2, 95);
		
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 255)";
		ctx.font = _font36;
		if(_w.d2 + _w.p1 !== _w.d1 + _w.p1)
			title = _w.d1 + _w.p1 + " 转 " + _w.d2 + _w.p1;
		else
			title = _w.d1 + _w.p1;
		ctx.fillText(title, rect.width/4 - ctx.measureText(title).width/2, 150);
		
	
		var _f = _w.f1 + "_0.png";
		if (new Date().getHours() > 17) 
			_f = _w.f2 + "_1.png";
		//http://i2.sinaimg.cn/dy/main/weather/weatherplugin/wthIco/20_20/zhenyu_0.png
		var img=new Image();
		img.src = 'http://i2.sinaimg.cn/dy/main/weather/weatherplugin/wthIco/20_20/' + _f;
		img.onload = function(){
			var ratio = getPixelRatio();
			ctx.drawImage(img, 0, 0, img.width, img.height, (_header.rect.width/2 - img.width*1.5)*ratio, 5, img.width*3*ratio, img.height*3*ratio);
			_header.ctx.drawImage(_header.canvasReport, 0, 0);
		};
		
		if(parseInt(_w.t1) > 24)
			ctx.fillStyle = ctx.strokeStyle = "rgb(255, 50, 50)";
		else
			ctx.fillStyle = ctx.strokeStyle = "rgb(50, 255, 50)";
		ctx.font = _font56;
		title = _w.t1 + "～" + _w.t2 + "℃ ";
		ctx.fillText(title, rect.width*3/4 - ctx.measureText(title).width/2, 95);
		
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 255)";
		ctx.font = _font36;
		title = _w.s1 + "转" + _w.s2;
		ctx.fillText(title, rect.width*3/4 - ctx.measureText(title).width/2, 150);
	}
}