//plugin类

function plugin()
{
	device.apply(this,arguments);
	
	this.initIt = function(){
	}
	this.initDraw = function(){
	}
	//人机交互处理
	this.doIt = function(loc, down, up){

	}
	

	
	this.drawIt = function(ctx){

	}
	
	this.docommandIt = function(id, commandEx){
		if(commandEx == undefined){
			if(_PLUGIN_[mode][id]['status'] === 'on')
				command = 'off';
			else
				command = 'on';
			
			param = "mode=" + mode + "&dev_id=" + dev_id + "&id=" + id + "&command=" + command;
			document.getElementById(id.toString()).style.backgroundColor = '#ee0';
		}

		return param;
	}
}
