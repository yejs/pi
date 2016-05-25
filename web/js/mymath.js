var _readyState_ = 4;
var _last_timer = null;

function loadXMLDoc(url,cfunc,param){
/*	if (url.indexOf("t=") < 0){
		var timeStamp = (new Date()).valueOf();
		if (url.indexOf("?") >= 0)
			url = url + "&t=" + timeStamp ;
		else 
			url = url + "?t=" + timeStamp ;
	}*/

	if(_last_timer)
		clearTimeout(_last_timer);
	
	if(4 != _readyState_){
		_last_timer = setTimeout(function(){
			loadXMLDoc(url,cfunc,param);
		}, 1000);
		return;
	}
	_readyState_ = 0;
	_last_timer = null;

	
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.oncallback = function(readyState){
		_readyState_ = readyState;
	};
	setTimeout(function(){
		_readyState_ = 4;
	}, 1000);

	xmlhttp.onreadystatechange=cfunc;

	if(param == undefined){
		xmlhttp.open("GET",url,true);
		xmlhttp.send();
	}
	else{
		xmlhttp.open("POST",url,true);
		//post请求要自己设置请求头
		xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
		//发送数据，开始与服务器进行交互
		//post发送请求
		xmlhttp.send(param);
	}
}

var base64encodechars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; 
var base64decodechars = new Array( 
-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 
-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 
-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 
52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, 
-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 
15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, 
-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 
41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1); 

function base64encode(str) { 
var out, i, len; 
var c1, c2, c3; 
len = str.length; 
i = 0; 
out = ""; 
while (i < len) { 
c1 = str.charCodeAt(i++) & 0xff; 
if (i == len) { 
out += base64encodechars.charAt(c1 >> 2); 
out += base64encodechars.charAt((c1 & 0x3) << 4); 
out += "=="; 
break; 
} 
c2 = str.charCodeAt(i++); 
if (i == len) { 
out += base64encodechars.charAt(c1 >> 2); 
out += base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4)); 
out += base64encodechars.charAt((c2 & 0xf) << 2); 
out += "="; 
break; 
} 
c3 = str.charCodeAt(i++); 
out += base64encodechars.charAt(c1 >> 2); 
out += base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4)); 
out += base64encodechars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6)); 
out += base64encodechars.charAt(c3 & 0x3f); 
} 
return out; 
} 

function base64decode(str) { 
var c1, c2, c3, c4; 
var i, len, out; 

len = str.length; 

i = 0; 
out = ""; 
while (i < len) { 

do { 
c1 = base64decodechars[str.charCodeAt(i++) & 0xff]; 
} while (i < len && c1 == -1); 
if (c1 == -1) 
break; 

do { 
c2 = base64decodechars[str.charCodeAt(i++) & 0xff]; 
} while (i < len && c2 == -1); 
if (c2 == -1) 
break; 

out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4)); 

do { 
c3 = str.charCodeAt(i++) & 0xff; 
if (c3 == 61) 
return out; 
c3 = base64decodechars[c3]; 
} while (i < len && c3 == -1); 
if (c3 == -1) 
break; 

out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2)); 

do { 
c4 = str.charCodeAt(i++) & 0xff; 
if (c4 == 61) 
return out; 
c4 = base64decodechars[c4]; 
} while (i < len && c4 == -1); 
if (c4 == -1) 
break; 
out += String.fromCharCode(((c3 & 0x03) << 6) | c4); 
} 
return out; 
} 

var create_element = function(parant, _element, _class, _id, _text) 
{ 
	var ele = document.createElement(_element); 
	if(_text)
		ele.innerHTML = _text; 
	if(_class)
		ele.setAttribute("class", _class);
	//	ele.className=_class;
	if(_id)
		ele.setAttribute("id", _id);
	//	ele.id = _id;
	if(parant)
		parant.appendChild(ele); 
	return ele;
} 

function getMenuImg(i)
{ 
	var img = 'transparent url(/';

	if(i == 0)
		img += 'web/images/menu_bk0.png) top left no-repeat';
	else
		img += 'web/images/menu_bk1.png) top left no-repeat';

	return img;
}