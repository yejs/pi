#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
 pygame.init() 进行全部模块的初始化，
pygame.mixer.init() 或者只初始化音频部分
pygame.mixer.music.load('xx.mp3') 使用文件名作为参数载入音乐 ,音乐可以是ogg、mp3等格式。载入的音乐不会全部放到内容中，而是以流的形式播放的，即在播放的时候才会一点点从文件中读取。
pygame.mixer.music.play()播放载入的音乐。该函数立即返回，音乐播放在后台进行。
play方法还可以使用两个参数
pygame.mixer.music.play(loops=0, start=0.0) loops和start分别代表重复的次数和开始播放的位置。
pygame.mixer.music.stop() 停止播放，
pygame.mixer.music.pause() 暂停播放。
pygame.mixer.music.unpause() 取消暂停。
pygame.mixer.music.fadeout(time) 用来进行淡出，在time毫秒的时间内音量由初始值渐变为0，最后停止播放。
pygame.mixer.music.set_volume(value) 来设置播放的音量，音量value的范围为0.0到1.0。
pygame.mixer.music.get_busy() 判断是否在播放音乐,返回1为正在播放。
pygame.mixer.music.set_endevent(pygame.USEREVENT + 1) 在音乐播放完成时，用事件的方式通知用户程序，设置当音乐播放完成时发送pygame.USEREVENT+1事件给用户程序。 
pygame.mixer.music.queue(filename) 使用指定下一个要播放的音乐文件，当前的音乐播放完成后自动开始播放指定的下一个。一次只能指定一个等待播放的音乐文件。
"""
__author__ = 'yejs'
__version__ = '1.0'

import os, threading, sys
import time
import signal
import logging
import json
import queue
import urllib.request
import re

import pygame
import eyed3#pip install eyeD3

import pyaudio
from pyaudio import PyAudio, paInt16 
import numpy as np
import wave

from scipy import fftpack
from scipy import signal as sg

CHUNK = 1024
FORMAT = paInt16
CHANNELS = 1
RATE = 44100
counter=1
ad_rdy_ev=threading.Event()

def signal_handler2(signum, frame):
	print('signal_handler2')
	mymedea.playing = False
	mymedea.close()
	
class mymedea():
	track = None
	music_files = None	#文件列表
	TRACK_END = None
	root_path = None	#本地音乐文件根路径
	current_index = 0	#当前播放文件的索引
	paused = False		#暂停标志
	playing = False		#播放标志
	can_play = False	#当前文件是否能够播放标志
	timer = None
	last_str = None
	
	do_fft_callback = None
	do_chg_index_callback = None
	pa = None
	q = queue.Queue()
	stream = None
	last = {'r':0, 'g':0, 'b':0, 'count':0}

	def __init__(self, path):
		mymedea.root_path = path
		mymedea.get_music_files()
	
		pygame.mixer.init()
		#pygame.init()
		
		pygame.mixer.music.set_volume(0.9)
		mymedea.TRACK_END = pygame.USEREVENT + 1
		#pygame.mixer.music.set_endevent(mymedea.TRACK_END)
	
	def getID3(filename):
		file = os.path.join(mymedea.root_path, filename)

		tag  = ''
		title  = ''
		artist = ''
		album  = ''
		anno  = ''
		if filename.lower().endswith('.mp3'):
			pass
			'''
			fp = open(file, 'rb', 0)
			fp.seek(128,-2)
			tag  = fp.read(3) # TAG iniziale
			title  = fp.read(30)
			artist = fp.read(30)
			album  = fp.read(30)
			anno  = fp.read(4)
			comment = fp.read(28)
			fp.close()
			'''
		return {'file':filename, 'tag':tag, 'title':title, 'artist':artist, 'album':album}
		
	#获取本地音乐文件列表
	def get_music_files():
    # 从文件夹来读取所有的音乐文件
		raw_filenames = os.listdir(mymedea.root_path)
		mymedea.music_files = []
		for filename in raw_filenames:
			# 不是Windows的话，还是去掉mp3吧
			if filename.lower().endswith('.ogg') or filename.lower().endswith('.mp3') or filename.lower().endswith('.wav'):
				#mymedea.music_files.append(os.path.join(mymedea.root_path, filename))
				mymedea.music_files.append(mymedea.getID3(filename))
		return mymedea.music_files#sorted(mymedea.music_files)
		
	#播放音乐文件，外部接口
	def play_music(index):
		mymedea.current_index = index
		mymedea.load(mymedea.get_filepath(mymedea.current_index)) 
		mymedea.play()
			
	#加载音乐文件
	def load(file):
		try:
			if file:
				mymedea.track = pygame.mixer.music.load(file.encode('utf-8'))
				mymedea.can_play = True
				
				#pygame.mixer.music.set_endevent(mymedea.TRACK_END)
				#print('load, file:%s, current_index:%d' %(file, mymedea.current_index))
		except pygame.error:
			mymedea.can_play = False
			print("load File {} error! {}".format(file, pygame.get_error()))
		finally:
			if mymedea.do_chg_index_callback:
				mymedea.do_chg_index_callback()
			
		return file
			
	def playDaemon():
		while mymedea.get_busy() and mymedea.can_play: #still playing
	
			if mymedea.last_str:
				n = 0;
				while n < len(mymedea.last_str) + 10:
					sys.stdout.write ('\b')
					n += 1
			pos = int(pygame.mixer.music.get_pos()/1000)
			m = int(pos/60) 
			s = int(pos%60)

			mymedea.last_str = '...still playing ' + mymedea.get_file(mymedea.current_index) + ', time:  ' + str(m) + ':' + str(s) +'  ...'
			sys.stdout.write (mymedea.last_str)
			sys.stdout.flush()
			pygame.time.wait(1000)
			

		if mymedea.playing:
			mymedea.get_music_files()
			mymedea.play_next()
		
	#播放音乐文件
	def play(loops=0, start=0.0):
		if mymedea.paused:
			pygame.mixer.music.unpause()
			mymedea.paused = False

		try:
			if mymedea.can_play:
				pygame.mixer.music.play(loops, start)
				mymedea.playing = True
				#print ('play %s...' %(mymedea.get_file(mymedea.current_index)))
				#mymedea.track.play()
		except pygame.error:
			print("play error! {}".format(pygame.get_error()))
		finally:
			pass

		if mymedea.timer:
			mymedea.timer.cancel()
			mymedea.timer = None
			
		mymedea.timer = threading.Timer(0.5, mymedea.playDaemon)
		mymedea.timer.start()
			
		'''
		next_file = mymedea.get_filepath((mymedea.current_index + 1) % len(mymedea.music_files))
		if next_file:
			pygame.mixer.music.queue(next_file)#使用指定下一个要播放的音乐文件，当前的音乐播放完成后自动开始播放指定的下一个。一次只能指定一个等待播放的音乐文件
		'''
		
	#播放下一首音乐 
	def play_next():
		mymedea.current_index = (mymedea.current_index + 1) % len(mymedea.music_files)
		mymedea.load(mymedea.get_filepath(mymedea.current_index)) 
		mymedea.play()
			
	#播放上一首音乐
	def play_pre():
		# prev的处理方法：
        # 已经播放超过3秒，从头开始，否则就播放上一曲
		if pygame.mixer.music.get_pos() > 3000:
			pygame.mixer.music.stop()
			pygame.mixer.music.play()
		else:
			mymedea.current_index = (mymedea.current_index - 1) if  mymedea.current_index>0 else len(mymedea.music_files) - 1
			mymedea.load(mymedea.get_filepath(mymedea.current_index)) 
			mymedea.play()
			
	def pause():
		if mymedea.paused:
			pygame.mixer.music.unpause()
			mymedea.paused = False
		else:
			pygame.mixer.music.pause()
			mymedea.paused = True
		
	def stop():
		if not mymedea.music_files:
			return
		pygame.mixer.music.stop()
		mymedea.paused = False
		mymedea.playing = False
		if mymedea.timer:
			mymedea.timer.cancel()
			mymedea.timer = None
		
	def fadeout(time):
		pygame.mixer.music.fadeout(time)
		mymedea.paused = False
		mymedea.playing = False
		
		if mymedea.timer:
			mymedea.timer.cancel()
			mymedea.timer = None
			
	def get_busy():
		return pygame.mixer.music.get_busy()
		
	def set_volume(value):
		pygame.mixer.music.set_volume(value)
		
	def get_volume():
		return pygame.mixer.music.get_volume()

	def get_file(file_index = None):
		if len(mymedea.music_files):
			if file_index == None or file_index >= len(mymedea.music_files):
				file_index = 0
			return mymedea.music_files[file_index]['file']
		else:
			return None
			
	def get_filepath(file_index = None):
		file = mymedea.get_file(file_index)
		if file:
			return os.path.join(mymedea.root_path, file)
		else:
			return None
			
	#http://blog.sina.com.cn/s/blog_40793e970102w3m2.html
	#http://old.sebug.net/paper/books/scipydoc/wave_pyaudio.html
	def do_fft(): 

		if mymedea.stream:
			# 读入NUM_SAMPLES个取样
			string_audio_data = mymedea.stream.read(CHUNK) 
			
			# 将读入的数据转换为数组
			audio_data = np.fromstring(string_audio_data, dtype=np.short)

			
			audio_data.shape = -1, 2
			audio_data = audio_data.T

			# 采样点数，修改采样点数和起始位置进行不同位置和长度的音频波形分析
		
			start=0 #开始采样位置
			df = 1 # 分辨率
			freq = [df*n for n in range(0,RATE)] #N个元素
			wave_data2=audio_data[0][start:start+RATE]
			value=np.fft.fft(wave_data2)*2/RATE
			
			mymedea.fft2color(freq, value)
			
		
	def fft2color(freq, value):
		#下面将fft频谱数据转为color数据
		n = 10
		s = n*100 #hz
		i = 0
		r = 0
		g = 0
		b = 0

		df = len(freq)/len(value)
		for v in value:#简化处理，只处理1000~4000hz间的数据
			ff = freq[int(i*df)]
			if ff >= s and ff <= 6000:
				tmp = int(np.power(np.power(v.real, 2) + np.power(v.imag, 2),0.5));

				if n <= 18:
					r += tmp
				elif n > 18 and n <= 40:
					g += tmp
				elif n > 40 and n <= 60:
					b += tmp
				n+=1
			i += 1
			
		r = r if r>500000 else 0
		g = g if g>500000 else 0
		b = b if b>500000 else 0
		
		m = max(r, g, b, 5000000)
		
		#print('fft_temp_data.size:%d %d r:%d g:%d b:%d' %(len(freq), len(value), r, g, b))
		
		r = r*255/m
		g = g*255/m
		b = b*255/m
		'''
		diff = 15
		#ESP8266的性能太差，这里只能采取过虑相近的数据，减少ESP8266的网络压力，否则ESP会长时间不响应收数据导致丢包
		if not(abs(r - mymedea.last['r'])>diff or abs(g - mymedea.last['g'])>diff or abs(b - mymedea.last['b'])>diff) and mymedea.last['count']<2:
			mymedea.last['count'] += 1;
			#print('ddddddddddddddddddddddddd')
			pass#return
		mymedea.last['r'] = r
		mymedea.last['g'] = g
		mymedea.last['b'] = b
		mymedea.last['count'] = 0
		'''
		color = hex(int(r/16))[2:] + hex(int(r%16))[2:] + hex(int(g/16))[2:] + hex(int(g%16))[2:] + hex(int(b/16))[2:] + hex(int(b%16))[2:]
		
		if mymedea.do_fft_callback:
			mymedea.do_fft_callback(color)
	
	#https://github.com/licheegh/dig_sig_py_study/blob/master/Analyse_Microphone/audio_fft.py
	def read_audio_thead(q,stream,ad_rdy_ev):
		global rt_data
		global fft_data

		while stream.is_active():
			ad_rdy_ev.wait(timeout=1000)
			if not q.empty():
				#process audio data here
				data=q.get()
				while not q.empty():
					q.get()
				rt_data = np.frombuffer(data,np.dtype('<i2'))
				rt_data = rt_data * sg.hamming(CHUNK)
				fft_temp_data=fftpack.fft(rt_data,rt_data.size,overwrite_x=True)
				fft_data=np.abs(fft_temp_data)[0:fft_temp_data.size/2+1]
				freq = [n for n in range(0,RATE)] #N个元素
				mymedea.fft2color(freq, fft_data)

			ad_rdy_ev.clear()
	
	def audio_callback(in_data, frame_count, time_info, status):
		global ad_rdy_ev

		mymedea.q.put(in_data)
		ad_rdy_ev.set()
		if counter <= 0:
			return (None, pyaudio.paComplete)
		else:
			return (None, pyaudio.paContinue)
	
	def start(fft_callback = None, chg_index_callback = None):
		mymedea(os.getcwd() + "\\music")

		for f in mymedea.music_files:
			print('filename:%s' %(f['file']))
	
		mymedea.do_fft_callback = fft_callback;
		mymedea.do_chg_index_callback = chg_index_callback;
		
		# 开启声音输入
		mymedea.pa = PyAudio() 


		for i in range(mymedea.pa.get_device_count()):
			dev = mymedea.pa.get_device_info_by_index(i)
			#print((i,dev))
			if dev['maxInputChannels'] and 2 == i:
				#mymedea.stream = mymedea.pa.open(format=paInt16, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK, input_device_index=dev['index']) 
				mymedea.stream = mymedea.pa.open(format=paInt16,channels=CHANNELS,rate=RATE,input=True,frames_per_buffer=CHUNK,stream_callback=mymedea.audio_callback)
				mymedea.stream.start_stream()
				

				t=threading.Thread(target=mymedea.read_audio_thead,args=(mymedea.q,mymedea.stream,ad_rdy_ev))
				t.daemon=True
				t.start()
				print("maxInputChannels")

		mymedea.load(mymedea.get_filepath(0)) 
		mymedea.play()
	
		if mymedea.do_chg_index_callback:
			mymedea.do_chg_index_callback()
				
	def close(): 
		mymedea.stop()
		if mymedea.pa and mymedea.stream:
			mymedea.stream.stop_stream()
			mymedea.stream.close()
			mymedea.pa.terminate()
		
if __name__ == "__main__":
	try:
		signal.signal(signal.SIGINT, signal_handler2)       

		mymedea.start()

		while mymedea.playing:
			pygame.time.wait(1000)
	
	except KeyboardInterrupt:
		mymedea.close()
		print('exit.........')
	finally:
		mymedea.close()
		print('exit.........')
		pass
