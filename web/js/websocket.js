
//windows 版本的safari只支持老版本的websocket 

websocket.prototype.connect = function(domain, port, onmessage, onopen, onclose, onerror){
	return new websocket("ws://" + domain + ":" + port + "/socket",  onmessage, onopen, onclose, onerror);
}

function websocket(strHost, onmessage, onopen, onclose, onerror)
{ 
	this.ws=new WebSocket(strHost);
    this.ws.binaryType="arraybuffer";

	this.handshake = false;
	
	this.send = function(string){
		if(this.handshake)
			this.ws.send(string);
	};
	
	this.ws.onopen = function(){
		console.log("握手成功");
		
		if(onopen)
			onopen();
	};
	this.ws.onclose = function(){
		console.log("关闭");

		if(onclose)
			onclose();
	};
	this.ws.onerror = function(evt){
		for ( var p in evt) {
		//	console.log(p + "=" + evt[p] + ";");
		}
		if(onerror)
			onerror();
	};
	this.ws.onmessage = function(evt){
		if(onmessage)
			onmessage(evt);
	};

}