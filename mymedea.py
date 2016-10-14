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

import urllib.request
import re

import pygame
import eyed3#pip install eyeD3

from pyaudio import PyAudio, paInt16 
import numpy as np
import wave

def signal_handler2(signum, frame):
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
	stream = None
	
	def __init__(self, path):
		mymedea.root_path = path
		mymedea.get_music_files()

		pygame.mixer.init()
		pygame.init()
		
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
			mymedea.do_fft()
				
			if mymedea.last_str:
				n = 0;
				while n < len(mymedea.last_str) + 10:
					sys.stdout.write ('\b')
					n += 1
			pos = int(pygame.mixer.music.get_pos()/1000)
			m = int(pos/60) 
			s = int(pos%60)
			mymedea.last_str = '...still playing ' + mymedea.get_file(mymedea.current_index) + ', pos:  ' + str(m) + ':' + str(s) +'  ...'
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
			
		mymedea.timer = threading.Timer(1, mymedea.playDaemon)
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
		NUM_SAMPLES = 2000      # pyAudio内部缓存的块的大小
		SAMPLING_RATE = 8000    # 取样频率
		framerate=44100
		
		if mymedea.stream:
			# 读入NUM_SAMPLES个取样
			string_audio_data = mymedea.stream.read(NUM_SAMPLES) 
			# 将读入的数据转换为数组
			audio_data = np.fromstring(string_audio_data, dtype=np.short)
			
			audio_data.shape = -1, 2
			audio_data = audio_data.T
			time = np.arange(0, NUM_SAMPLES) * (1.0 / framerate)
			#pylab.plot(time, audio_data[0])#显示波形数据
			
			# 采样点数，修改采样点数和起始位置进行不同位置和长度的音频波形分析
			
			start=0 #开始采样位置
			df = framerate/(framerate-1) # 分辨率
			freq = [df*n for n in range(0,framerate)] #N个元素
			wave_data2=audio_data[0][start:start+framerate]
			c=np.fft.fft(wave_data2)*2/framerate
			#常规显示采样频率一半的频谱
			d=int(len(c)/2)
			#仅显示频率在4000以下的频谱
			while freq[d]>4000:
				d-=10
			#pylab.plot(freq[:d-1],abs(c[:d-1]),'r')#显示频谱分析数据
			
		ff = [1000,1002, 1500, 1600, 1678, 2000, 2500]
		value = [1000,1002, 1500, 1600, 'rere', 2000, 'eee']
		if mymedea.do_fft_callback:
			mymedea.do_fft_callback(ff, value)
		
	def start(fft_callback = None, chg_index_callback = None):
		mymedea(os.getcwd() + "\\music")
		'''
		# 打开WAV文档
		f = wave.open(os.getcwd() + "\\music\\sound.wav", "rb")

		# 读取格式信息
		# (nchannels, sampwidth, framerate, nframes, comptype, compname)
		params = f.getparams()
		nchannels, sampwidth, framerate, nframes = params[:4]

		# 读取波形数据
		str_data = f.readframes(nframes)
		f.close()
		
		wave_data = np.fromstring(str_data, dtype=np.short)
		wave_data.shape = -1, 2
		wave_data = wave_data.T
		time = np.arange(0, nframes)# * (1.0 / framerate)
		'''
		
		
		'''
		item = "{ 'songItem': { (.*) } }"
		item2 = "'sid': '(.*)', 'sname': '(.*)', 'author': '(.*)'"
		myfile = open("song.txt",'w')
		response = urllib.request.urlopen('http://music.baidu.com/top/dayhot')
		html = response.read()[:].decode('utf-8')
		print(html.encode('utf-8'))

		html = re.findall(item,html)
		i = 1
		for rec in html:
			print(rec)
			r = re.findall(item2,rec)
			print(i,r[0][0],r[0][1],r[0][2])
			i = i+1 
		'''
		for f in mymedea.music_files:
			print('filename:%s' %(f['file']))
			
		mymedea.do_fft_callback = fft_callback;
		mymedea.do_chg_index_callback = chg_index_callback;
		
		NUM_SAMPLES = 2000      # pyAudio内部缓存的块的大小
		SAMPLING_RATE = 8000    # 取样频率
		# 开启声音输入
		mymedea.pa = PyAudio() 
		
		for i in range(mymedea.pa.get_device_count()):
			dev = mymedea.pa.get_device_info_by_index(i)
			#print((i,dev['name'].encode(),dev['maxInputChannels']))
			if dev['maxInputChannels']:
				mymedea.stream = mymedea.pa.open(format=paInt16, channels=dev['maxInputChannels'], rate=SAMPLING_RATE, input=True, frames_per_buffer=NUM_SAMPLES, input_device_index=dev['index']) 
			
		mymedea.load(mymedea.get_filepath(0)) 
		mymedea.play()
		
		if mymedea.do_chg_index_callback:
			mymedea.do_chg_index_callback()
				
	def close(): 
		mymedea.stop()
		if mymedea.pa and mymedea.stream:
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
