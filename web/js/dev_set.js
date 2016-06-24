document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/websocket.js"></script>');
document.write('<script type="text/javascript" src="js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/data.js"></script>');

_dev_set = null;
_port = 8000;
window.onload = function(){

	if(document.getElementById('lamp')){
		_dev_set = new dev_set();
		_dev_set.ws = websocket.prototype.connect(document.domain, _port, _dev_set.onmessage, _dev_set.onopen, _dev_set.onclose, null);
	}
	
	var url = location.search;
	pos = url.indexOf('dev_id');
	if(pos>=0){
		is_mode_set = true;
		_dev_set.dev_id = url.substr(pos+7);
	//	console.log('onload:' + location.search);
	}
}

refresh = function(){
	location.reload();
}

function dev_set()
{
	this.dev_id = null;
	this.id = '1';

	this.timer = null;
	this.ws = null;
		//websocket 处理函数
	this.onmessage = function(evt){
		var json = JSON.parse(evt.data);
		if(!json)
			return;
		
		if( json.event === "device" ){
			_DEVICE_ = json.data;
			if(_DEVICE_.hasOwnProperty(_dev_set.dev_id)){
				for(var i=0;i<20;i++){
					if(document.getElementById(i.toString())){
						if(!_DEVICE_[_dev_set.dev_id].hasOwnProperty(i.toString()))
							document.getElementById(i.toString()).style.display = 'none';
						else
							document.getElementById(i.toString()).innerText = _DEVICE_[_dev_set.dev_id][i.toString()]['name'];	
					}
				}
				if(document.getElementById('all')){
					if(_DEVICE_[_dev_set.dev_id].hasOwnProperty('all'))
						document.getElementById('all').innerText = _DEVICE_[_dev_set.dev_id]['all']['name'];
					else
						document.getElementById('all').style.display = 'none';
				}	
			}
			else{
				for(var i=0;i<20;i++){
					if(document.getElementById(i.toString()))
						document.getElementById(i.toString()).style.display = 'none';
				}
				if(document.getElementById('all'))
					document.getElementById('all').style.display = 'none';	
			}
			docommand('1');
		} 
	}
	this.onopen = function(){
		if(_dev_set.timer)
			clearInterval(_dev_set.timer);
		
		_dev_set.ws.handshake = true;
	}
	this.onclose = function(){
		_dev_set.ws.handshake = false;
		
		if(_dev_set.timer)
			clearInterval(_dev_set.timer);
		
		_dev_set.timer = setInterval(function(){
			_dev_set.ws = websocket.prototype.connect(document.domain, _port, _dev_set.onmessage, _dev_set.onopen, _dev_set.onclose, null);
			}, 5000);
	}
}

docommand = function(id){
	if(!_DEVICE_.hasOwnProperty(_dev_set.dev_id))
		return;

	_dev_set.id = id;
	document.getElementById('dev_title').innerText = document.getElementById(id).innerText + '设置';
	if(_DEVICE_[_dev_set.dev_id][id].hasOwnProperty('name'))
		document.getElementById('name').value = _DEVICE_[_dev_set.dev_id][id]['name'];
	else
		document.getElementById('name').value = '';
	
	if(_DEVICE_[_dev_set.dev_id][id].hasOwnProperty('ip'))
		document.getElementById('IP').value = _DEVICE_[_dev_set.dev_id][id]['ip'];
	else
		document.getElementById('IP').value = '';
	
	if(_DEVICE_[_dev_set.dev_id][id].hasOwnProperty('pin'))
		document.getElementById('GPIO').value = _DEVICE_[_dev_set.dev_id][id]['pin'];
	else
		document.getElementById('GPIO').value = '';
	
	if('all' === id)
		document.getElementById('all').style.backgroundColor = '#e00';

	for(var i=0;i<20;i++){
		if(document.getElementById(i.toString())){
			if(i.toString() === id){
				document.getElementById(i).style.backgroundColor = '#e00';
				document.getElementById('all').style.backgroundColor = '#aaa';
			}
			else
				document.getElementById(i).style.backgroundColor = '#aaa';	
		}
	}
}

dosubmit = function(){
	_DEVICE_[_dev_set.dev_id][_dev_set.id]['name'] = encodeURIComponent(document.getElementById('name').value); 
	if(document.getElementById('IP').value.length>0)
		_DEVICE_[_dev_set.dev_id][_dev_set.id]['ip'] = (document.getElementById('IP').value); 
	if(document.getElementById('GPIO').value.length>0)
		_DEVICE_[_dev_set.dev_id][_dev_set.id]['pin'] = (document.getElementById('GPIO').value); 
	param = "device_set=" + (JSON.stringify(_DEVICE_[_dev_set.dev_id][_dev_set.id])) + "&dev_id=" + _dev_set.dev_id + "&id=" + _dev_set.id;
//	console.log(param);

	//页面ajax请求
	loadXMLDoc("/control",function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			str = ((xmlhttp.responseText))	
			var json = JSON.parse(str);
			console.log(decodeURIComponent(json.device_set.name));
		}	
		xmlhttp.oncallback(xmlhttp.readyState);	
	}, param);
}