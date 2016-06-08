document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/websocket.js"></script>');

_LAMP_ = {'1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0, '10':0, '11':0, 'all':0};//初始状态都为0（熄灭）
_lamp = null;
_port = 8000;

window.onload = function(){
	if(document.getElementById('lamp')){
		_lamp = new lamp();
		_lamp.ws = websocket.prototype.connect(document.domain, _port, _lamp.onmessage, _lamp.onopen, _lamp.onclose, null);
	}
}

function lamp()
{
	this.timer = null;
	this.ws = null;

	//websocket 处理函数
	this.onmessage = function(evt)
	{
		var json = JSON.parse(evt.data);
		if(!json)
			return;
		
		
		if( json.event === "lamp" ){
		//	console.log(JSON.stringify(json.data));
			ret = json.data;
			for(var i=1;i<12;i++){
				if(ret[i.toString()] === 'on'){
					_LAMP_[i.toString()] = 1;
					document.getElementById(i.toString()).style.backgroundColor = '#e00';
				}						
				else{
					_LAMP_[i.toString()] = 0;
					document.getElementById(i.toString()).style.backgroundColor = '#0a0';
				}
			}

			for(var i=1;i<12;i++){
				if(_LAMP_['1'] !== _LAMP_[i.toString()]){
					_LAMP_['all'] = 0;
					document.getElementById('all').style.backgroundColor = '#0a0';
					return;
				}
			}
			if(_LAMP_['1'] === 1){
				_LAMP_['all'] = 1;
				document.getElementById('all').style.backgroundColor = '#e00';		
			}				
			else{
				_LAMP_['all'] = 0;
				document.getElementById('all').style.backgroundColor = '#0a0';
			}
		} 
		else if( json.event === "msg" ){
			console.log(json.data);
		}
	}
	this.onopen = function()
	{
		if(_lamp.timer)
			clearInterval(_lamp.timer);
		
		_lamp.ws.handshake = true;
		
	}
	
	this.onclose = function()
	{
		_lamp.ws.handshake = false;
		
		if(_lamp.timer)
			clearInterval(_lamp.timer);
		_lamp.timer = setInterval(function(){
			_lamp.ws = websocket.prototype.connect(document.domain, _port, _lamp.onmessage, _lamp.onopen, _lamp.onclose, null);
			}, 5000);
	}
}

docommand = function(dev_id, id, command){
	var btn = document.getElementById(id.toString());

	btn.style.backgroundColor = '#ee0';
	
	if('lamp' == dev_id){
		if(_LAMP_[id] === 0)
			command = 'on';
		else
			command = 'off';
	}
	
	param = "dev_id=" + dev_id + "&id=" + id + "&command=" + command;

	//页面ajax请求
	loadXMLDoc("/control",function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
		//	console.log(base64decode(xmlhttp.responseText));	
			var json = JSON.parse(base64decode(xmlhttp.responseText));
			var command = json.command;
			if('lamp' == dev_id){
				var id = json.id;//parseInt(json.id);
				if(command === 'on'){
					_LAMP_[id] = 1;
					document.getElementById(id).style.backgroundColor = '#e00';
				}						
				else{
					_LAMP_[id] = 0;
					document.getElementById(id).style.backgroundColor = '#0a0';
				}
				if(id === 'all'){
					for(var i=1;i<12;i++){
						_LAMP_[i] = _LAMP_[id];
						if(_LAMP_[id])
							document.getElementById(i.toString()).style.backgroundColor = '#e00';
						else
							document.getElementById(i.toString()).style.backgroundColor = '#0a0';
					}
					if(_LAMP_[id])
						document.getElementById(id).style.backgroundColor = '#e00';
					else
						document.getElementById(id).style.backgroundColor = '#0a0';
				}
			}
			else if('car' == dev_id){
				keys = ['car_1', 'car_2', 'car_3', 'car_4', 'car_5'];
				for(index in keys){
					if(keys[index] != json.id){
						document.getElementById(keys[index]).style.backgroundColor = '#0a0';
					}
				}
			}
		}	
		xmlhttp.oncallback(xmlhttp.readyState);	
	}, param);
}