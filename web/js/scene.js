document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/websocket.js"></script>');
var param=null;//work, set

window.onload = function(){
	var url = location.search;
	pos = url.indexOf('param');
	if(pos>=0)
		param = url.substr(pos+6);
//	console.log(param);
	
	for(var i=1;i<13;i++){
		var btn = document.getElementById(i.toString());
		btn.style.backgroundColor = '#aaa';
	}
}

refresh = function(){
}

_SCENE_ = {'1':'normal', '2':'leave', '3':'night', '4':'getup', '5':'guests', '6':'diner'}
domodel = function(id){
	if(parseInt(id) < 7){
		for(var i=1;i<7;i++){
			var btn = document.getElementById(i.toString());
			btn.style.backgroundColor = '#aaa';
		}
		
		var btn = document.getElementById(id.toString());
		btn.style.backgroundColor = '#e00';
		
		params = "mode=" + _SCENE_[id] + "&dev_id=lamp";
		//页面ajax请求
		loadXMLDoc("/control",function()
		{
			if (xmlhttp.readyState==4 && xmlhttp.status==200){
			//	console.log(base64decode(xmlhttp.responseText));	
				var json = JSON.parse(base64decode(xmlhttp.responseText));
			}	
			xmlhttp.oncallback(xmlhttp.readyState);	
		}, params);
	}
	else{
		window.location.href = 'lamp.html?mode=' + _SCENE_[(parseInt(id) - 6).toString()];
	}

}