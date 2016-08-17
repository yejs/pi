#!/usr/bin/env python  
#coding=utf-8  
import subprocess   
import sys  
import os  
import time  
import upgrade.upgrade
import platform
import signal
import logging

is_closing = False
check_time = time.time()
'''
这是一个看守进程兼升级监护进程，当被看守主进程（IOT）挂掉后会自动重启该主进程，当监测到有升级新版本代码时，会更新新的代码，并重启主进程
'''
def signal_handler(signum, frame):
    global is_closing
    logging.info('exiting...')
    is_closing = True

def open(name):
    programPath = sys.path[0] +  name
	#注意！如果传递带参数的命令，则需要在Popen中的列表内填写“参数”，  
    #例如本例传递命令是： python IOT.py
    prog = subprocess.Popen(['python', programPath], shell=False, stdout=True)  
    print('Current PID: ', prog.pid)  
    return prog
	
if __name__ == '__main__' :  
    signal.signal(signal.SIGINT, signal_handler)       
    
    try:
        prog = open('/IOT.py')
		
        while (True):   
            time.sleep(1)  
            retCode = subprocess.Popen.poll(prog)   

            restart = False
            if time.time() - check_time > 10:#60分钟检测一次升级版本filelist
                check_time = time.time()
                if upgrade.upgrade.doUpgrade():#更新后，重启IOT 主进程
                    if platform.system().find('Linux')>=0:
                        cmd = "kill " + str(prog.pid)
                    elif platform.system().find('Windows')>=0:
                        print(platform.system())
                        cmd = 'taskkill -PID ' + str(prog.pid) + ' -F'
                    if subprocess.call(cmd, shell=True) == 0:
                        print(" | ".join(["Stop OK", "PID:%d" % prog.pid]))
                    restart = True
				
            if retCode is not None or restart:  
                print('Process will reset ...')  
                prog = open('/IOT.py')
			
    except KeyboardInterrupt:
        pass
    finally:
        pass