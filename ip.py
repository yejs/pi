import os
res = os.popen('arp -a').readlines()
#res = os.popen("arp -a")
for I in res:
    #if "c8-1f-66-0e-2d-f1" in I:
    #if "f8-bc-12-7b-e5-8c" in I:
    if "b8-27-eb-f0-f9-47" in I:
        print(I[:18])
		
		#curl "https://raw.github.com/ma6174/speak_raspi_ip/master/setup.sh" | bash
		#http://bbs.elecfans.com/forum.php?mod=viewthread&tid=440126 基于motion视频捕捉软件的树莓派视频拍照系统
		#http://www.cnblogs.com/peida/archive/2013/03/25/2980121.html 自动删除n天前日志
		
		#http://blog.csdn.net/bona020/article/details/51034043#comments
		#http://blog.csdn.net/Bobsweetie/article/details/50814849
		#http://blog.sina.com.cn/s/blog_abd39cc70102vrdt.html
		#LD_LIBRARY_PATH=/home/pi/mjpg-streamer-master/mjpg-streamer-experimental ./mjpg_streamer -i "./input_uvc.so -y -d /dev/video0 -r 640x480 -f 12" -o "./output_http.so -w ./www"
		''' 
		http://blog.csdn.net/lwei_998/article/details/6637912
		http://blog.sina.com.cn/s/blog_688077cf01013qrk.html
		'''