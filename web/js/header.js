document.write('<script type="text/javascript" src="js/mymath.js"></script>');
document.write('<script type="text/javascript" src="js/canvas.js"></script>');
document.write('<script type="text/javascript" src="js/data.js"></script>');

var _header = null;

var _font_family = "'Hiragino Sans GB','Microsoft Yahei',Helvetica,STHeiti";

var _font42 = "42px " + _font_family;
var _font30 = "30px " + _font_family;
var _font25 = "25px " + _font_family;
var _font23 = "23px " + _font_family;
var _font20 = "20px " + _font_family;
var _font18 = "18px " + _font_family;
var _font16 = "16px " + _font_family;
var _font14 = "14px " + _font_family;
var _font12 = "12px " + _font_family;


doInitHeader = function(canvas, index)
{
	_header = new header(index);
	_header.doInit(canvas);	
}

function header(index)
{
	this.rect;
	this.canvasReport = this.canvas = this.contextReport = this.ctx = null;
	this.index = index;
	this.arrayBtn = new Array();

	this.doInit = function(canvas)
	{
		this.canvasReport = document.createElement("canvas");
		this.canvas = document.getElementById(canvas);//显示画布
		
		this.onresize();
	}
	
	this.onresize = function()
	{
		this.rect = getWinRect();
		this.rect.height = '180';
		this.rect.width = Math.min(1080, this.rect.width) - 2;
		this.canvas.width = this.canvasReport.width = this.rect.width;  
		this.canvas.height = this.canvasReport.height = this.rect.height;
		this.contextReport = this.canvasReport.getContext("2d");
		this.ctx = this.canvas.getContext("2d");

		this.doDraw();
	}

	this.doDraw = function()
	{
		this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
		this.contextReport.clearRect(0, 0, this.rect.width, this.rect.height);

		this.contextReport.fillStyle = "rgb(255, 255, 255)";
		this.contextReport.fillRect(0, 0, this.rect.width, this.rect.height);
		
		this.contextReport.fillStyle = this.contextReport.strokeStyle = "rgb(255, 0, 0)";
		this.contextReport.font = _font42;
		this.contextReport.textBaseline="middle";

		var title = _DEVICE_.door['1'].status;
		this.contextReport.fillText(title, this.rect.width/2 - this.contextReport.measureText(title).width/2, this.rect.height/2);


		this.ctx.drawImage(this.canvasReport, 0, 0);
	}
}