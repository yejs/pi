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
	var _title = ['灯光', '窗帘', '空调', '电视', '插座', '场景模式', '视频监控&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'];
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
	
	window.onresize();
	
	ws = websocket.prototype.connect(document.domain, _port, onmessage, onopen, onclose, null);
}

var titles = ["lamp", "curtain", "air_conditioner", "tv", "plugin", "scene", "video"];
showPage = function(title){
	for(var i in titles){
		if(titles[i] === title)
			document.getElementById(titles[i]).style.display="block";
		else
			document.getElementById(titles[i]).style.display="none";
	}
}

window.onresize = function(){
	_header.onresize();
	_footer.onresize();
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
			a.style.color = '#fff';
			a.style.background = 'transparent';
		}
	}
	var news=document.getElementById("video");
	var elem_child = news.getElementsByTagName("iframe"); 
	showPage(titles[i]);
	
	if('video' != titles[i]){
		if(elem_child[0].src.indexOf("fake.html") < 0)//关闭视频页面
			elem_child[0].src = "fake.html";
			
		window.frames['f' + titles[i]].window.refresh();
	}
	else if('video' == titles[i]){//video
		var src = window.location.host;
		var npos = src.indexOf(":");

		if(npos >= 0)
			src = src.substr(0,npos);
		src += ":8080/javascript_simple.html";
		elem_child[0].src = "http://" + src;
	}
}
var mode='normal';
window.addEventListener('message',function(e){
	if('http://' + window.location.host !== e.origin)
		return;
		
	if('getmode'===e.data.msg){
		window.frames['fscene'].postMessage({'msg':'mode' , 'data':mode},'*');
	}
},false);

	//websocket 处理函数
	onmessage = function(evt)
	{
		if(typeof evt.data != 'string')
			return;
		var json = JSON.parse(evt.data);
		if(!json)
			return;
		
		if( json.event === "ack" ){
			if( json.dev_id === "lamp" )
				window.frames['flamp'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if( json.dev_id === "curtain" )
				window.frames['fcurtain'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if( json.dev_id === "air_conditioner" )
				window.frames['fair_conditioner'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if( json.dev_id === "tv" )
				window.frames['ftv'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			else if( json.dev_id === "plugin" )
				window.frames['fplugin'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
		}
		else if( json.event === "device" ){
			_DEVICE_ = json.data;
			
			if(_header)
				_header.doDraw();
			
			window.frames['flamp'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			window.frames['fcurtain'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			window.frames['fair_conditioner'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			window.frames['ftv'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			window.frames['fplugin'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
		} 
		else{
			mode = json.mode;
			if( json.event === "lamp" ){
				_LAMP_[json.mode] = json.data;
				window.frames['flamp'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			} 
			else if( json.event === "curtain" ){
				_CURTAIN_[json.mode] = json.data;
				window.frames['fcurtain'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			}
			else if( json.event === "air_conditioner" ){
				_AIR_CONDITIONER_[json.mode] = json.data;
				window.frames['fair_conditioner'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			}
			else if( json.event === "tv" ){
				_TV_[json.mode] = json.data;
				window.frames['ftv'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			}
			else if( json.event === "plugin" ){
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
