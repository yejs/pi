import os
res = os.popen('arp -a').readlines()
#res = os.popen("arp -a")
for I in res:
    #if "c8-1f-66-0e-2d-f1" in I:
    #if "f8-bc-12-7b-e5-8c" in I:
    if "b8-27-eb-f0-f9-47" in I:
        print(I[:18])
		
		#curl "https://raw.github.com/ma6174/speak_raspi_ip/master/setup.sh" | bash