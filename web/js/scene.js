document.write('<script type="text/javascript" src="js/js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/js/websocket.js"></script>');
document.write('<script type="text/javascript" src="js/js/data.js"></script>');
var param=null;//work, set

window.onload = function(){
	var url = location.search;
	pos = url.indexOf('param');
	if(pos>=0)
		param = url.substr(pos+6);
//	console.log(param);
	
	for(var i=1;i<13;i++){
		var btn = document.getElementById(i.toString());
		if(btn)
			btn.style.backgroundColor = '#aaa';
	}
	
	setTimeout(function() {window.parent.postMessage({'msg':'getmode'},'*');},200);
}

refresh = function(){
}

_SCENE_ = {'1':'normal', '2':'leave', '3':'night', '4':'getup', '5':'guests', '6':'diner'}
_id_ = '1'

window.addEventListener('message',function(e){
	if('mode'===e.data.msg){
		for(var id in _SCENE_){
			if(_SCENE_[id] == e.data.data){
				setFocus(id);
			}
		}
		if(e.data.hasOwnProperty('auto_mode')){
			if('true' == e.data.auto_mode)
				document.getElementById('auto_mode').checked = true;
			else
				document.getElementById('auto_mode').checked = false;
		}
	//	console.log('mode:' + e.origin);
	}
},false);

setFocus = function(id){
	_id_ = id;
	for(var i=1;i<7;i++){
		var btn = document.getElementById(i.toString());
		btn.style.backgroundColor = '#aaa';
	}
	
	var btn = document.getElementById(id.toString());
	btn.style.backgroundColor = '#e00';
}

domodel = function(id){

	setFocus(id);
	
	var auto_mode = document.getElementById('auto_mode').checked ? 'true' : 'false';
		
	params = "mode=" + _SCENE_[id] + "&auto_mode=" + auto_mode;

	//页面ajax请求
	loadXMLDoc("/control",function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
		//	console.log(base64decode(xmlhttp.responseText));	
			var json = JSON.parse((xmlhttp.responseText));
		}	
		xmlhttp.oncallback(xmlhttp.readyState);	
	}, params);
}
