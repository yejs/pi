document.write('<script type="text/javascript" src="js/js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/js/websocket.js"></script>');
document.write('<script type="text/javascript" src="js/js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/js/data.js"></script>');
document.write('<script src="js/js/hidpi-canvas.min.js?ver=1"></script>');

ws = null;
timer = null;
_port = 8000;

window.onload = function(){
	document.getElementById("wrap").style.display="block";
	var _title = ['&nbsp&nbsp灯光&nbsp&nbsp', '&nbsp&nbsp插座&nbsp&nbsp', '&nbsp&nbsp窗帘&nbsp&nbsp', '&nbsp&nbsp空调&nbsp&nbsp', '&nbsp&nbsp电视&nbsp&nbsp', '&nbsp&nbsp媒体&nbsp&nbsp', '&nbsp&nbsp随心听&nbsp&nbsp', '&nbsp&nbsp场景模式&nbsp&nbsp', '视频监控&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'];
	var news=document.getElementById("news_ul");
	for(var i=0;i<_title.length;i++){
		var li = create_element(news, 'li', null, null, null);
		var a = create_element(li, 'a', null, null, _title[i]);
		a.setAttribute("href", 'javascript:onNewsTitle(' + i + ');');
		li.style.border = "0px";
		li.style.borderBottomStyle ="none";
	}

	setTimeout(function() {onNewsTitle(0);},200);
	
	doInitHeader('header', 0);
	doInitFooter('footer', 0);
	
//	if(_header)
//		_header.onresize();
//	if(_footer)
//		_footer.onresize();
	
	ws = websocket.prototype.connect(document.domain, _port, onmessage, onopen, onclose, null);
}

var titles = ["lamp", "plugin", "curtain", "air_conditioner", "tv", "media", "fm", "scene", "video"];
showPage = function(title){
	for(var i in titles){
		if(titles[i] === title)
			document.getElementById(titles[i]).style.display="block";
		else
			document.getElementById(titles[i]).style.display="none";
	}
}

window.onresize = function(){
	location.reload(false);
}

onNewsTitle = function(i){
	var news=document.getElementById("news_ul");
	var elem_child = news.getElementsByTagName("li"); 
	for(var j=0;j<elem_child.length;j++)
	{
		var a = elem_child[j].getElementsByTagName("a")[0]; 
		if(i == j){
			a.style.color = '#f00';
			a.style.background = getMenuImg(0);
		}
		else{
			a.style.color = '#000';
			a.style.background = 'transparent';
		}
	}
	
	showPage(titles[i]);
	
	var video=document.getElementById("video");
	if(video){
		var elem_child = video.getElementsByTagName("iframe"); 
		if(elem_child){
			if('video' != titles[i]){
				if(elem_child[0].src.indexOf("fake.html") < 0)//关闭视频页面
					elem_child[0].src = "fake.html";
				
				if('fm' != titles[i])
					window.frames['f' + titles[i]].window.refresh();
			}
			else if('video' == titles[i]){
				var src = window.location.host;
				var npos = src.indexOf(":");

				if(npos >= 0)
					src = src.substr(0,npos);
				src += ":8080/javascript_simple.html";
				elem_child[0].src = "http://" + src;
			}
		}
	}
	
	var fm=document.getElementById("fm");
	if(fm){
		var elem_child = fm.getElementsByTagName("iframe"); 
		if(elem_child){
			if('fm' == titles[i] && "http://fm.baidu.com/" != elem_child[0].src){
				elem_child[0].src = "http://fm.baidu.com/";
			}
		}
	}
	
	
	
	if('tv' != titles[i])
		document.getElementById("div_footer_btn").style.display = 'none';
	else
		document.getElementById("div_footer_btn").style.display = 'block';
}

doShowNumber = function()
{
	if(document.getElementById('footer_btn').innerText == '∨'){
		document.getElementById('footer_btn').innerText = '∧';
		window.frames['ftv'].postMessage({'msg':'foot_ui' , 'data':'hide'},'*');
	}
	else{
		document.getElementById('footer_btn').innerText = '∨';
		window.frames['ftv'].postMessage({'msg':'foot_ui' , 'data':'show'},'*');
	}
}
	
var mode='';
var auto_mode='';
window.addEventListener('message',function(e){
	if('http://' + window.location.host !== e.origin)
		return;
		
	if('getmode'===e.data.msg && window.frames['fscene']){
		window.frames['fscene'].postMessage({'msg':'mode' , 'data':mode},'*');
	}
	else if('send'===e.data.msg){
		ws.send(e.data.data)
	}
},false);

	//语音识别处理
	doSpeech = function(speech){
		if(speech.indexOf('灯') >=0)
			window.frames['flamp'].postMessage({'msg':'doSpeech' , 'data':speech},'*');
		else if(speech.indexOf('窗帘') >=0)
			window.frames['fcurtain'].postMessage({'msg':'doSpeech' , 'data':speech},'*');
		else if(speech.indexOf('空调') >=0)
			window.frames['fair_conditioner'].postMessage({'msg':'doSpeech' , 'data':speech},'*');
		else if(speech.indexOf('电视') >=0 || speech.indexOf('频道') >=0 || speech.indexOf('台') >=0)
			window.frames['ftv'].postMessage({'msg':'doSpeech' , 'data':speech},'*');
		else if(speech.indexOf('插座') >=0)
			window.frames['fplugin'].postMessage({'msg':'doSpeech' , 'data':speech},'*');
	}
	
	//websocket 处理函数
	onmessage = function(evt)
	{
		if(typeof evt.data != 'string')
			return;
		var json = JSON.parse(evt.data);
		if(!json)
			return;
		
		if( json.event === "ack" ){
			if( json.dev_id === "lamp" && window.frames['flamp'])
				window.frames['flamp'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if( json.dev_id === "curtain" && window.frames['flamp'] )
				window.frames['fcurtain'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if( json.dev_id === "air_conditioner"  && window.frames['flamp'])
				window.frames['fair_conditioner'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if( json.dev_id === "tv"  && window.frames['flamp'])
				window.frames['ftv'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if( json.dev_id === "media"  && window.frames['flamp'])
				window.frames['fmedia'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if( json.dev_id === "plugin"  && window.frames['flamp'])
				window.frames['fplugin'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
		}
		else if( json.event === "asr" ){//自动语音识别
			var speech = json.data;
			if(speech.indexOf('灯') >=0 && window.frames['flamp'])
				window.frames['flamp'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if(speech.indexOf('窗帘') >=0  && window.frames['fcurtain'])
				window.frames['fcurtain'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if(speech.indexOf('空调') >=0 && window.frames['fair_conditioner'])
				window.frames['fair_conditioner'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if((speech.indexOf('电视') >=0 || speech.indexOf('频道') >=0 || speech.indexOf('台') >=0) && window.frames['ftv'])
				window.frames['ftv'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if((speech.indexOf('歌') >=0 || speech.indexOf('音乐') >=0 || speech.indexOf('首') >=0) && window.frames['fmedia'])
				window.frames['fmedia'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if(speech.indexOf('插座') >=0 && window.frames['fplugin'])
				window.frames['fplugin'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
		}
		else if( json.event === "device" || json.event === "the_device"){
			if(json.event === "device")
				_DEVICE_ = json.data;
			else if(json.event === "the_device")
				_DEVICE_[json.dev_id] = json.data;
			
			if(_header)
				_header.doDraw();
			if(window.frames['flamp'])
				window.frames['flamp'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			if(window.frames['fcurtain'])
				window.frames['fcurtain'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			if(window.frames['fair_conditioner'])
				window.frames['fair_conditioner'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			if(window.frames['ftv'])
				window.frames['ftv'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			if(window.frames['fplugin'])
				window.frames['fplugin'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
		} 
		else{
			var tmp = auto_mode;
			if(json.hasOwnProperty('auto_mode'))//自动模式控制
				tmp = json.auto_mode;
			if((mode != json.mode || auto_mode != tmp) && window.frames['fscene']){
				mode = json.mode;
				auto_mode = tmp;
				window.frames['fscene'].postMessage({'msg':'mode', 'data':mode, 'auto_mode':tmp},'*');
			}
			if( json.event === "lamp" && window.frames['lamp']){
				_LAMP_[json.mode] = json.data;
				window.frames['flamp'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			} 
			else if( json.event === "curtain" && window.frames['fcurtain']){
				_CURTAIN_[json.mode] = json.data;
				window.frames['fcurtain'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			}
			else if( json.event === "air_conditioner" && window.frames['fair_conditioner']){
				_AIR_CONDITIONER_[json.mode] = json.data;
				window.frames['fair_conditioner'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			}
			else if( json.event === "tv"  && window.frames['ftv']){
				_TV_[json.mode] = json.data;
				window.frames['ftv'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			}
			else if( json.event === "media"  && window.frames['fmedia']){
				window.frames['fmedia'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			}
			else if( json.event === "plugin" && window.frames['fplugin']){
				_PLUGIN_[json.mode] = json.data;
				window.frames['fplugin'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			}
		}
		

		
	//	window.frames['fscene'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
	}
	onopen = function()
	{
		if(timer)
			clearInterval(timer);
		
		ws.handshake = true;
	}
	
	onclose = function()
	{
		ws.handshake = false;
		
		if(timer)
			clearInterval(timer);
		
		timer = setInterval(function(){
			ws = websocket.prototype.connect(document.domain, _port, onmessage, onopen, onclose, null);
			}, 5000);
	}
	
	
