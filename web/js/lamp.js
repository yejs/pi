document.write('<script type="text/javascript" src="js/mymath.js"></script>');

lamp = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0};//初始状态都为0（熄灭）
docommand = function(dev_id, id, command){
	var btn = document.getElementById(id.toString());

	btn.style.backgroundColor = '#ee0';
	
	if('lamp' == dev_id){
		if(lamp[id] === 0)
			command = 'on';
		else
			command = 'off';
	}
	
	param = "dev_id=" + dev_id + "&id=" + id + "&command=" + command;

	loadXMLDoc("/control",function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			console.log(base64decode(xmlhttp.responseText));	
			var json = JSON.parse(base64decode(xmlhttp.responseText));
			var command = json.command;
			if('lamp' == dev_id){
				var id = parseInt(json.id);
				if(command === 'on'){
					lamp[id] = 1;
					btn.style.backgroundColor = '#e00';
				}						
				else{
					lamp[id] = 0;
					btn.style.backgroundColor = '#0a0';
				}
				if(id === 12){
					for(var i=1;i<13;i++){
						lamp[i] = lamp[id];
						if(lamp[id])
							document.getElementById(i.toString()).style.backgroundColor = '#e00';
						else
							document.getElementById(i.toString()).style.backgroundColor = '#0a0';
					}
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