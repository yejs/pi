document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/websocket.js"></script>');
document.write('<script type="text/javascript" src="js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/data.js"></script>');

_dev_set = null;

window.onload = function(){

	if(document.getElementById('lamp')){
		_dev_set = new dev_set();
	}
	
	var url = location.search;
	pos = url.indexOf('dev_id');
	if(pos>=0){
		_dev_set.dev_id = url.substr(pos+7);
	//	console.log('onload:' + location.search);
	}
}

refresh = function(){
	location.reload();
}

window.addEventListener('message',function(e){
	if('onmessage'===e.data.msg){
		_dev_set.onmessage(e.data.data);
	//	console.log(e.data.data);
	}
},false);

function dev_set()
{
	this.dev_id = null;
	this.id = '1';


		//websocket 处理函数
	this.onmessage = function(evt){
		var json = JSON.parse(evt);
		if(!json)
			return;
		
		if( json.event === "device" ){
			_DEVICE_ = json.data;
			window.parent.postMessage({'msg':'device' , 'data':json.data},'*');
			
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
			_dev_set.docommand(_dev_set.id);
		} 
	}
	
	this.docommand = function(id){
		if(!_DEVICE_.hasOwnProperty(this.dev_id))
			return;

		this.id = id;
	//	document.getElementById('dev_title').innerText = document.getElementById(id).innerText + '设置';
		if(_DEVICE_[this.dev_id][id].hasOwnProperty('name'))
			document.getElementById('name').value = _DEVICE_[this.dev_id][id]['name'];
		else
			document.getElementById('name').value = '';
		
		if(_DEVICE_[this.dev_id][id].hasOwnProperty('ip'))
			document.getElementById('IP').value = _DEVICE_[this.dev_id][id]['ip'];
		else
			document.getElementById('IP').value = '';
		
		if(_DEVICE_[this.dev_id][id].hasOwnProperty('pin'))
			document.getElementById('GPIO').value = _DEVICE_[this.dev_id][id]['pin'];
		else
			document.getElementById('GPIO').value = '';
		
		ii = parseInt(id);
		if((ii < (this.dev_id == 'lamp' ? 12 : 6) && _DEVICE_[this.dev_id][(ii+1).toString()]['hide'] === 'false') || (ii > 1 && _DEVICE_[this.dev_id][(ii-1).toString()]['hide'] === 'true'))
			document.getElementById('hide').setAttribute("disabled","disabled");
		else
			document.getElementById('hide').removeAttribute("disabled");
		
		if(_DEVICE_[this.dev_id][id].hasOwnProperty('hide'))
			document.getElementById('hide').checked = _DEVICE_[this.dev_id][id]['hide'] == 'true' ? true : false;
		else
			document.getElementById('hide').checked = false;
		
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

	this.dosubmit = function(){
		_DEVICE_[this.dev_id][this.id]['name'] = encodeURIComponent(document.getElementById('name').value); 
		if(document.getElementById('IP').value.length>0)
			_DEVICE_[this.dev_id][this.id]['ip'] = document.getElementById('IP').value; 
		
		if(document.getElementById('GPIO').value.length>0)
			_DEVICE_[this.dev_id][this.id]['pin'] = document.getElementById('GPIO').value; 
		
		_DEVICE_[this.dev_id][this.id]['hide'] = document.getElementById('hide').checked ? 'true' : 'false';
		
		param = "device_set=" + (JSON.stringify(_DEVICE_[this.dev_id][this.id])) + "&dev_id=" + this.dev_id + "&id=" + this.id;
	//	console.log(param);

		//页面ajax请求
		loadXMLDoc("/control",function()
		{
			if (xmlhttp.readyState==4 && xmlhttp.status==200){
				str = ((xmlhttp.responseText))	
				var json = JSON.parse(str);
			//	console.log(decodeURIComponent(json.device_set.name));
			}	
			xmlhttp.oncallback(xmlhttp.readyState);	
		}, param);
	}
}

