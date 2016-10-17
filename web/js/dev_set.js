document.write('<script type="text/javascript" src="js/js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/js/websocket.js"></script>');
document.write('<script type="text/javascript" src="js/js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/js/data.js"></script>');

_dev_set = null;

window.onload = function(){

	if(document.getElementById('lamp')){
		_dev_set = new dev_set();
	}
	
	var url = location.search;
	pos = url.indexOf('dev_id');
	if(pos>=0){
		_dev_set.dev_id = url.substr(pos+7);
		if(_dev_set.dev_id == 'curtain')
			document.getElementById('d_length').style.display = 'block';
		else if(_dev_set.dev_id == 'tv' || _dev_set.dev_id == 'air_conditioner')
			document.getElementById('d_brand').style.display = 'block';

		if(_dev_set.dev_id == 'lamp' || _dev_set.dev_id == 'curtain' || _dev_set.dev_id == 'tv' || _dev_set.dev_id == 'air_conditioner' || _dev_set.dev_id == 'input' || _dev_set.dev_id == 'medea')
			document.getElementById('d_GPIO').style.display = 'none';
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


	var input_titles = ["door", "window", "humiture", "flammable", "fire", "ir_in"];
	
		//websocket 处理函数
	this.onmessage = function(evt){
		var json = JSON.parse(evt);
		if(!json)
			return;
		if( json.event === "device" || json.event === "the_device"){
			if(json.event === "device")
				_DEVICE_ = json.data;
			else if(json.event === "the_device")
				_DEVICE_[json.dev_id] = json.data;
		//	window.parent.postMessage({'msg':'device' , 'data':json.data},'*');
		//	console.log('device:' + json.event);
			
			if(json.event === "device"){
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
				else if('input' == _dev_set.dev_id){//燃气检测、火警检测、温湿度检测、门窗检测等输入设备
					document.getElementById('all').style.display = 'none';

					for(var i=1;i<20;i++){
						if(document.getElementById(i.toString())){
							var obj = this.getInput_id(i);
							if(obj)
								document.getElementById(i.toString()).innerText = _DEVICE_[obj.dev_id][obj.id.toString()]['name'];	
							else
								document.getElementById(i.toString()).style.display = 'none';
						}
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
	}
	
	this.getInput_id = function(id){
		var dev_id = this.dev_id;

		if('input' == this.dev_id){//燃气检测、火警检测、温湿度检测、门窗检测等输入设备
			
			var j = 0, index = 0;
			dev_id = input_titles[index];

			for(var i=1;i<20;i++){
				j++;
				if(document.getElementById(i.toString())){
					if(!_DEVICE_[dev_id].hasOwnProperty(j.toString())){
						
						if(index < input_titles.length-1){
							j = 0;
							i--;
							index++;
							dev_id = input_titles[index];
						}
					}
					else{
						if(i == id){
							id = j;
							return {'dev_id':dev_id, 'id':id};
							break;
						}
					}
				}
			}
			return null;
		}

		return {'dev_id':dev_id, 'id':id};
	}
	
	this.docommand = function(id){
		if(!_DEVICE_.hasOwnProperty(this.dev_id) && 'input' != this.dev_id)
			return;

		this.id = id;
		
		var obj = this.getInput_id(id);
		var dev_id = obj.dev_id;
		id = obj.id;

	//	document.getElementById('dev_title').innerText = document.getElementById(id).innerText + '设置';
		if(_DEVICE_[dev_id][id].hasOwnProperty('name'))
			document.getElementById('name').value = _DEVICE_[dev_id][id]['name'];
		else
			document.getElementById('name').value = '';
		
		if(_DEVICE_[dev_id][id].hasOwnProperty('ip'))
			document.getElementById('IP').value = _DEVICE_[dev_id][id]['ip'];
		else
			document.getElementById('IP').value = '';
		
		if(_DEVICE_[dev_id][id].hasOwnProperty('pin')){
			value = _DEVICE_[dev_id][id]['pin'];
			var obj = document.getElementById('GPIO'); 
			for(var i=0;i<2;i++){
				if(obj.options[i].value.indexOf(value)>=0){
					obj.selectedIndex = i;
					break;
				}
			}
		}
		else
			document.getElementById('GPIO').value = '';
		
		if(_DEVICE_[dev_id][id].hasOwnProperty('length'))
			document.getElementById('length').value = _DEVICE_[dev_id][id]['length'];
		else
			document.getElementById('length').value = '';
		
		if(_DEVICE_[dev_id][id].hasOwnProperty('brand'))
			document.getElementById('brand').value = _DEVICE_[dev_id][id]['brand'];
		else
			document.getElementById('brand').value = '';
		
		ii = parseInt(id);
		var count = (dev_id == 'lamp' || dev_id == 'curtain' || dev_id == 'plugin') ? 12 : 6;
		if((_DEVICE_[dev_id][id].hasOwnProperty('hide') && (ii < count && _DEVICE_[dev_id][(ii+1).toString()]['hide'] === 'false') || (ii > 1 && _DEVICE_[dev_id][(ii-1).toString()]['hide'] === 'true'))  || !_DEVICE_[dev_id][id].hasOwnProperty('hide')){
		//	document.getElementById('hide').setAttribute("disabled","disabled");
			document.getElementById('d_hide').style.display = 'none';
		}
		else{
		//	document.getElementById('hide').removeAttribute("disabled");
			document.getElementById('d_hide').style.display = 'block';
		}
		
		if(dev_id == 'humiture'){
			document.getElementById('d_humiture').style.display = 'block';
			document.getElementById('t_min').value = _DEVICE_[dev_id][id]['t_min'];
			document.getElementById('t_max').value = _DEVICE_[dev_id][id]['t_max'];
			document.getElementById('h_min').value = _DEVICE_[dev_id][id]['h_min'];
			document.getElementById('h_max').value = _DEVICE_[dev_id][id]['h_max'];
		}
		else
			document.getElementById('d_humiture').style.display = 'none';
		
		if(_DEVICE_[dev_id][id].hasOwnProperty('hide'))
			document.getElementById('hide').checked = _DEVICE_[dev_id][id]['hide'] == 'true' ? true : false;
		else
			document.getElementById('hide').checked = false;
		
		if('all' === id){
			document.getElementById('all').style.backgroundColor = '#e00';
			document.getElementById('IP').setAttribute("disabled","disabled");
			document.getElementById('GPIO').setAttribute("disabled","disabled");
			document.getElementById('length').setAttribute("disabled","disabled");
		}
		else{
			document.getElementById('IP').removeAttribute("disabled");
			document.getElementById('GPIO').removeAttribute("disabled");
			document.getElementById('length').removeAttribute("disabled");
		}
		
		

		for(var i=0;i<20;i++){
			if(document.getElementById(i.toString())){
				if(i.toString() === this.id){
					document.getElementById(i).style.backgroundColor = '#e00';
					document.getElementById('all').style.backgroundColor = '#aaa';
				}
				else
					document.getElementById(i).style.backgroundColor = '#aaa';	
			}
		}
	}

	this.dosubmit = function(){
		var id = this.id;
		
		var obj = this.getInput_id(id);
		var dev_id = obj.dev_id;
		id = obj.id;
		
		_DEVICE_[dev_id][id]['name'] = encodeURIComponent(document.getElementById('name').value); 
		if(document.getElementById('IP').value.length>0)
			_DEVICE_[dev_id][id]['ip'] = document.getElementById('IP').value; 
		
		if(document.getElementById('GPIO').value.length>0 && _DEVICE_[dev_id][id].hasOwnProperty('pin')){
			value = parseInt(document.getElementById('GPIO').options[document.getElementById('GPIO').selectedIndex].value);
			_DEVICE_[dev_id][id]['pin'] = String(value); 
		//	console.log(value);
		}
		
		if(document.getElementById('brand').value.length>0 && _DEVICE_[dev_id][id].hasOwnProperty('brand'))
			_DEVICE_[dev_id][id]['brand'] = encodeURIComponent(document.getElementById('brand').value); 
		
		if(document.getElementById('length').value.length>0 && _DEVICE_[dev_id][id].hasOwnProperty('length'))
			_DEVICE_[dev_id][id]['length'] = parseFloat(document.getElementById('length').value); 
		
		if(_DEVICE_[dev_id][id].hasOwnProperty('hide'))
			_DEVICE_[dev_id][id]['hide'] = document.getElementById('hide').checked ? 'true' : 'false';
		
		if(dev_id == 'humiture'){
			_DEVICE_[dev_id][id]['t_min'] = parseFloat(document.getElementById('t_min').value);
			_DEVICE_[dev_id][id]['t_max'] = parseFloat(document.getElementById('t_max').value);
			_DEVICE_[dev_id][id]['h_min'] = parseFloat(document.getElementById('h_min').value);
			_DEVICE_[dev_id][id]['h_max'] = parseFloat(document.getElementById('h_max').value);
		}
		
		param = "device_set=" + (JSON.stringify(_DEVICE_[dev_id][id])) + "&dev_id=" + dev_id + "&id=" + id;
		

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

