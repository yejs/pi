document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/websocket.js"></script>');
document.write('<script type="text/javascript" src="js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/data.js"></script>');

ws = null;
timer = null;
_port = 8000;

window.onload = function(){
	document.getElementById("wrap").style.display="block";
	var _title = ['灯光控制', '窗帘', '场景模式', '小车', '视频监控'];
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

var titles = ["lamp", "curtain", "scene", "car", "video"];
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
	if(0 == i){
		showPage("lamp");
		if(elem_child[0].src.indexOf("fake.html") < 0)//关闭视频页面
			elem_child[0].src = "fake.html";

		window.frames['flamp'].window.refresh();//location.reload();
	}
	else if(1 == i){
		showPage("curtain");
		if(elem_child[0].src.indexOf("fake.html") < 0)//关闭视频页面
			elem_child[0].src = "fake.html";
		window.frames['fcurtain'].window.refresh();//location.reload();
	}
	else if(2 == i){
		showPage("scene");
		if(elem_child[0].src.indexOf("fake.html") < 0)//关闭视频页面
			elem_child[0].src = "fake.html";
		window.frames['fscene'].window.refresh();//location.reload();
	}
	else if(3 == i){
		showPage("car");
		if(elem_child[0].src.indexOf("fake.html") < 0)//关闭视频页面
			elem_child[0].src = "fake.html";
	}
	else if(4 == i){
		showPage("video");
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
		
		if( json.event === "device" ){
			_DEVICE_ = json.data;
			
			if(_header)
				_header.doDraw();
			
			window.frames['flamp'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
			window.frames['fcurtain'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
		} 
		else if( json.event === "lamp" ){

			_LAMP_[json.mode] = json.data;

			mode = json.mode;
			
			window.frames['flamp'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
		} 
		else if( json.event === "curtain" ){

			_CURTAIN_[json.mode] = json.data;

			mode = json.mode;
			
			window.frames['fcurtain'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
		}

		
		window.frames['fscene'].postMessage({'msg':'onmessage' , 'data':evt.data},'*');
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
