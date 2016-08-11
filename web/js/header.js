document.write('<script type="text/javascript" src="js/js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/js/data.js"></script>');
document.write('<script type="text/javascript" src="js/js/jquery.min.js"></script>');

var _font_family = "'Hiragino Sans GB','Microsoft Yahei',Helvetica,STHeiti";
var _font36 = "36px " + _font_family;

var _header = null;

doInitHeader = function(canvas, index)
{
	_header = new header(index);
	_header.doInit(canvas);	
	
	var url = location.search;
	pos = url.indexOf('header');
	if(pos>=0){
		show = url.substr(pos+7);
		_header.doUI(show);
	}
}

function header(index)
{
	this.rect;
	this.canvasReport = this.canvas = this.contextReport = this.ctx = null;
	this.index = index;
	this.arrayBtn = new Array();
	this.city = null;
	this.weather = null;
	
	this.doUI = function(show)
	{
		if((show === undefined && document.getElementById('header').style.display === 'none') || show === 'show'){
			document.getElementById('header').style.display = 'block';
			document.getElementById('_header').style.display = 'block';
			document.getElementById('header_btn').innerText = '∧';
			show = 'show';
		}
		else{
			document.getElementById('header').style.display = 'none';
			document.getElementById('_header').style.display = 'none';
			document.getElementById('header_btn').innerText = '∨';
			show = 'hide';
		}
		window.frames['flamp'].postMessage({'msg':'header_ui' , 'data':show},'*');
		window.frames['fcurtain'].postMessage({'msg':'header_ui' , 'data':show},'*');
		window.frames['fair_conditioner'].postMessage({'msg':'header_ui' , 'data':show},'*');
		window.frames['ftv'].postMessage({'msg':'header_ui' , 'data':show},'*');
		window.frames['fplugin'].postMessage({'msg':'header_ui' , 'data':show},'*');

		var evObj = document.createEvent('HTMLEvents');
        evObj.initEvent( 'resize', true, false );
     //   window.dispatchEvent(evObj);
	}
	
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

		var grd=this.contextReport.createLinearGradient(0, 0, 0, this.rect.height); //绘背景色
		grd.addColorStop(0, "rgba(5, 39, 175, 255)"); 
		grd.addColorStop(0.5, "rgba(5, 89, 175, 255)");
		grd.addColorStop(1, "rgba(5, 139, 175, 255)");
		
		this.contextReport.fillStyle = grd;//"rgb(5, 39, 175)";
		this.contextReport.fillRect(0, 0, this.rect.width, this.rect.height);
		
		var rect = {x:0, y:0, width:this.rect.width*2/3, height:this.rect.height};
		this.drawWeather(this.contextReport, rect);

		this.drawSecurity(this.contextReport);

		this.ctx.drawImage(this.canvasReport, 0, 0);
	}
	
	//遍历指定设备状态是否等于指定关键字
	this.checkInput = function(dev_id, key){
		var id = null;
		for(var i=1;i<12;i++){
			if(_DEVICE_[dev_id].hasOwnProperty(i.toString())){
				if(_DEVICE_[dev_id][i.toString()].status == key){
					id = i.toString();
					break;
				}
			}
			else
				break;
		}
		return id;
	}
	
	this.drawSecurity = function(ctx)
	{
		var x = this.rect.width*5/6 - ctx.measureText('所有燃气检测：安全').width/2 + ctx.measureText('所有燃气检测：').width - 10;
		
		//1.处理门、窗开闭检测设备
		var id = this.checkInput('door', 'open');//先检测门
		var dev_id = null;
		if(id)
			dev_id = 'door';
		else{									//门全部关着，再检测窗
			id = this.checkInput('window', 'open');
			if(id)
				dev_id = 'window';
		}
		if(!dev_id){//没有找到打开的门、窗（所有门窗都处于关闭状态）
			dev_id = 'door';
			id = '1';
			var title = '所有门窗：';
		}
		else
			var title = _DEVICE_[dev_id][id].name + '：';
		
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 150)";
		ctx.fillText(title, x - ctx.measureText(title).width, 36);
		ctx.fillStyle = ctx.strokeStyle = (_DEVICE_[dev_id][id].status == 'open') ? "rgb(255, 50, 50)" : "rgb(50, 255, 50)";
		ctx.fillText((_DEVICE_[dev_id][id].status == 'open' ? '开' : '关'), x, 36);
		
		//2.处理燃气检测设备
		id = this.checkInput('flammable', 'alert');
		if(!id){//所有燃气检测设备都处于安全状态
			id = '1';
			title = '所有燃气检测：';
		}
		else
			title = _DEVICE_.flammable[id].name + '：';
		
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 150)";
		ctx.fillText(title, x - ctx.measureText(title).width, 91);
		ctx.fillStyle = ctx.strokeStyle = (_DEVICE_.flammable[id].status == 'alert') ? "rgb(255, 50, 50)" : "rgb(50, 255, 50)";
		ctx.fillText((_DEVICE_.flammable[id].status == 'alert' ? '警报' : '安全'), x, 91);

		//3.处理火警检测设备
		id = this.checkInput('fire', 'alert');
		if(!id){//所有火警检测设备都处于安全状态
			id = '1';
			title = '所有火警检测：';
		}
		else
			title = _DEVICE_.fire[id].name + '：';
		
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 150)";
		ctx.fillText(title, x - ctx.measureText(title).width, 146);
		ctx.fillStyle = ctx.strokeStyle = (_DEVICE_.fire[id].status == 'alert') ? "rgb(255, 50, 50)" : "rgb(50, 255, 50)";
		ctx.fillText((_DEVICE_.fire[id].status == 'alert' ? '警报' : '安全'), x, 146);
	}
	
	this.drawWeather = function(ctx, rect)
	{
		if(!this.weather)
			return;
		var _w = this.weather;
		
		ctx.textBaseline="middle";
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 150)";
		ctx.font = _font36;
		
	/*	var title = "今日天气";
		ctx.fillText(title, rect.width/4 - ctx.measureText(title).width/2, 36);
		
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 150)";
		ctx.font = _font56;
		title = this.city;
		ctx.fillText(title, rect.width/4 - ctx.measureText(title).width/2, 95);
		*/

		var status = _DEVICE_.humiture['1'].status;
		pos = status.indexOf(':');
		
		if(pos>=0){
			temperature = status.substr(0, pos);
			humidity = status.substr(pos+1);
		}
		else
			return;

		var x = Math.max(rect.width/4 - ctx.measureText('室内温度：35.6℃').width/2 + 10, 0) + ctx.measureText('室内温度：').width;
		ctx.fillText('室内温度：', x - ctx.measureText('室内温度：').width, 36);
		ctx.fillStyle = ctx.strokeStyle = (parseInt(temperature) >= 24) ? "rgb(255, 50, 50)" : "rgb(50, 255, 50)";
		ctx.fillText(temperature + '℃', x, 36);

		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 150)";
		ctx.fillText('相对湿度：', x - ctx.measureText('相对湿度：').width, 91);
		ctx.fillStyle = ctx.strokeStyle = (parseInt(humidity) >= 24) ? "rgb(255, 50, 50)" : "rgb(50, 255, 50)";
		ctx.fillText(humidity + '%', x, 91);
		
		
		ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 255)";
		ctx.font = _font36;
		if(_w.d2 + _w.p1 !== _w.d1 + _w.p1)
			var title = _w.d1 + _w.p1 + " 转 " + _w.d2 + _w.p1;
		else
			var title = _w.d1 + _w.p1;
		ctx.fillText(title, rect.width/4 - ctx.measureText(title).width/2, 150);
		
	
		var _f = _w.f1 + "_0.png";
		if (new Date().getHours() > 17) 
			_f = _w.f2 + "_1.png";
		//http://i2.sinaimg.cn/dy/main/weather/weatherplugin/wthIco/20_20/zhenyu_0.png
		var img=new Image();
		img.src = 'http://i2.sinaimg.cn/dy/main/weather/weatherplugin/wthIco/20_20/' + _f;
		
		img.onload = function(){
			var ratio = getPixelRatio();
			r = 9/ratio;
			ctx.drawImage(img, 0, 0, img.width, img.height, (_header.rect.width - (img.width*r))*ratio/2, 5, img.width*r*ratio, img.height*r*ratio);
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
		if(_w.s1 !== _w.s2)
			title = _w.s1 + "转" + _w.s2;
		else
			title = _w.s1;
		ctx.fillText(title, rect.width*3/4 - ctx.measureText(title).width/2, 150);
	}
}