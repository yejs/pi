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

def signal_handler2(signum, frame):
	print('signal_handler2')
	mymedia.playing = False
	mymedia.close()

	  
class mymedia():
	inited = False
	track = None
	music_files = None	#文件列表
	TRACK_END = None
	root_path = None	#本地音乐文件根路径
	current_index = 0	#当前播放文件的索引
	paused = False		#暂停标志
	playing = False		#播放标志
	can_play = False	#当前文件是否能够播放标志
	play_count = 0		#当前文件秒数，用于控制快速切换的逻辑
	timer = None
	last_str = None
	do_fft_callback = None
	do_chg_index_callback = None
	pa = None			#audio对象
	stream = None		#流对象
	q = queue.Queue()	#音频数据队列
	output_zero = False
	last = {'r':0, 'g':0, 'b':0, 'count':0}
	ad_rdy_ev=threading.Event()#信号
	mutex = threading.Lock()#创建锁
	time_tick = 0
	
	
	def __init__(self, path):
		inited = True
		mymedia.root_path = path
		mymedia.get_music_files()
		
		pygame.mixer.init()
		#pygame.init()
		
		pygame.mixer.music.set_volume(0.9)
		mymedia.TRACK_END = pygame.USEREVENT + 1
		#pygame.mixer.music.set_endevent(mymedia.TRACK_END)
	
		
	def getID3(filename):
		file = os.path.join(mymedia.root_path, filename)

		tag  = ''
		title  = ''
		artist = ''
		album  = ''
		anno  = ''
		version = ''
		sample_freq = 0
		time_secs = 0
		if filename.lower().endswith('.mp3'):
			audiofile = None
			try:
				audiofile = eyed3.load(file)
			except:
				pass#print("eyed3 load file {} error!".format(file))
			finally:
				if audiofile:
					time_secs = audiofile.info.time_secs
					if audiofile.info.mp3_header:
						version = audiofile.info.mp3_header.version
						sample_freq = audiofile.info.mp3_header.sample_freq
		return {'file':filename, 'tag':tag, 'title':title, 'artist':artist, 'album':album, 'time_secs':time_secs, 'version':version, 'sample_freq':sample_freq}
		
	#获取本地音乐文件列表
	def get_music_files():
    # 从文件夹来读取所有的音乐文件
		mymedia.mutex.acquire()#取得锁
		raw_filenames = os.listdir(mymedia.root_path)
		mymedia.music_files = []
		for filename in raw_filenames:
			# 不是Windows的话，还是去掉mp3吧
			if filename.lower().endswith('.ogg') or filename.lower().endswith('.mp3') or filename.lower().endswith('.wav'):
				#mymedia.music_files.append(os.path.join(mymedia.root_path, filename))
				mymedia.music_files.append(mymedia.getID3(filename))
				
		mymedia.mutex.release()#释放锁
		return mymedia.music_files#sorted(mymedia.music_files)
		
	#播放音乐文件，外部接口
	def play_music(index):
		mymedia.current_index = index
		mymedia.load(mymedia.get_filepath(mymedia.current_index)) 
		mymedia.play()
		
	#加载音乐文件
	def load(file):
		try:
			if file:
				mymedia.track = pygame.mixer.music.load(file.encode('utf-8'))
				mymedia.can_play = True
		except pygame.error:
			mymedia.can_play = False
			print("load File {} error! {}".format(file, pygame.get_error()))
		finally:
			if mymedia.do_chg_index_callback:
				mymedia.do_chg_index_callback()
			
		return file

		
	def playDaemon():
		while mymedia.inited and (mymedia.get_busy() or mymedia.play_count < 5) and mymedia.stream._is_running and mymedia.can_play: #still playing
			if mymedia.get_busy() and mymedia.play_count < 5:
				mymedia.play_count += 1
			elif not mymedia.get_busy():
				pygame.time.wait(1000)
				continue
				
			if mymedia.last_str:
				n = 0;
				while n < len(mymedia.last_str) + 50:
					sys.stdout.write ('\b')
					n += 1
			pos = int(pygame.mixer.music.get_pos()/1000)
			m = int(pos/60) 
			s = int(pos%60)
			
			file = mymedia.get_file(mymedia.current_index)
			time_secs = '--'
			for f in mymedia.music_files:
				if f['file'] == file:
					time_secs = str(int(f['time_secs']/60)) + ':' + str(int(f['time_secs']%60))

			if type(file) != None and type(m) != None and type(s) != None:
				mymedia.last_str = 'still playing ' + file + ', time_secs:  ' + time_secs + ', time:  ' + str(m) + ':' + str(s)
				sys.stdout.write (mymedia.last_str)
				sys.stdout.flush()
			pygame.time.wait(1000)
			

		if mymedia.inited and mymedia.stream._is_running and mymedia.playing:
			mymedia.get_music_files()
			mymedia.play_next()
		
	#播放音乐文件
	def play(loops=0, start=0.0):
		if mymedia.paused:
			pygame.mixer.music.unpause()
			mymedia.paused = False

		try:
			if mymedia.can_play:
				pygame.mixer.music.play(loops, start)
				mymedia.playing = True
		except pygame.error:
			print("play error! {}".format(pygame.get_error()))
		finally:
			pass

		mymedia.play_count = 0
			
		if mymedia.timer:
			mymedia.timer.cancel()
			mymedia.timer = None
			
		mymedia.timer = threading.Timer(0.5, mymedia.playDaemon)
		mymedia.timer.start()
		
	#播放下一首音乐 
	def play_next():
		mymedia.current_index = (mymedia.current_index + 1) % len(mymedia.music_files)
		mymedia.load(mymedia.get_filepath(mymedia.current_index)) 
		mymedia.play()
		
	#播放上一首音乐
	def play_pre():
		# prev的处理方法：
        # 已经播放超过3秒，从头开始，否则就播放上一曲
		if pygame.mixer.music.get_pos() > 3000:
			pygame.mixer.music.stop()
			pygame.mixer.music.play()
		else:
			mymedia.current_index = (mymedia.current_index - 1) if  mymedia.current_index>0 else len(mymedia.music_files) - 1
			mymedia.load(mymedia.get_filepath(mymedia.current_index)) 
			mymedia.play()
		
	def pause():
		if mymedia.paused:
			pygame.mixer.music.unpause()
			mymedia.paused = False
		else:
			pygame.mixer.music.pause()
			mymedia.paused = True
			
		if mymedia.do_chg_index_callback:
			mymedia.do_chg_index_callback()
		
	def stop():
		if mymedia.timer:
			mymedia.timer.cancel()
			mymedia.timer = None
			
		if not mymedia.music_files:
			return
		pygame.mixer.music.stop()
		mymedia.paused = False
		mymedia.playing = False
		
		
	def fadeout(time):
		pygame.mixer.music.fadeout(time)
		mymedia.paused = False
		mymedia.playing = False
		
		if mymedia.timer:
			mymedia.timer.cancel()
			mymedia.timer = None
			
	def get_busy():
		if mymedia.inited:
			return pygame.mixer.music.get_busy()
		else:
			return False
		
	def set_volume(value):
		pygame.mixer.music.set_volume(value)
		
		if mymedia.do_chg_index_callback:
			mymedia.do_chg_index_callback()
		
	def get_volume():
		return pygame.mixer.music.get_volume()

	def get_file(file_index = None):
		if mymedia.music_files and len(mymedia.music_files):
			if file_index == None or file_index >= len(mymedia.music_files):
				file_index = 0
			return mymedia.music_files[file_index]['file']
		else:
			return None
			
	def get_filepath(file_index = None):
		file = mymedia.get_file(file_index)
		if file:
			return os.path.join(mymedia.root_path, file)
		else:
			return None
			
	#http://blog.sina.com.cn/s/blog_40793e970102w3m2.html
	#http://old.sebug.net/paper/books/scipydoc/wave_pyaudio.html
		
	def fft2color(freq, value):
		#下面将fft频谱数据转为color数据
		i = 0
		r = 0
		g = 0
		b = 0

		df = len(freq)/len(value)
		L = len(value)
		for v in value:#简化处理，只处理1000~4000hz间的数据
			ff = freq[int(i*df)]
			if ff <= 6000:
				tmp = int(np.power(np.power(v.real, 2) + np.power(v.imag, 2),0.5)/L);

				if ff <= 800:
					r += tmp
				elif ff > 800 and ff <= 2000:
					g += tmp
				else:
					b += tmp
				i += 1
			else:
				break

		m = max(r, g, b, 50000)

		r = r*255/m
		g = g*255/m
		b = b*255/m
		
		#每秒10几个数据，ESP来不及接收，这里过滤相近的数据，只发送变化比较大的数据，以提高LED灯的响应速度，a是过滤阀值，过大了LED只反应幅度比较大的数据，幅度小的LED灯亮度不变，太小了达不到过滤的效果
		a = 30
		if not (abs(mymedia.last['r'] - r) > a or abs(mymedia.last['g'] - g) > a or abs(mymedia.last['b'] - b) > a or (abs(mymedia.last['r'] - r) + abs(mymedia.last['g'] - g) + abs(mymedia.last['b'] - b)) > a*2 or mymedia.last['count'] > 10) and (r + g + b) > 3:
			mymedia.last['count'] += 1
			#print('.................%d.........' %mymedia.last['count'])
			return
			
		mymedia.last['r'] = r
		mymedia.last['g'] = g
		mymedia.last['b'] = b
		mymedia.last['count'] = 0

		color = hex(int(r/16))[2:] + hex(int(r%16))[2:] + hex(int(g/16))[2:] + hex(int(g%16))[2:] + hex(int(b/16))[2:] + hex(int(b%16))[2:]
		
		if mymedia.do_fft_callback and (r + g + b) > 3:
			mymedia.do_fft_callback(color)
			mymedia.output_zero = False
		else:									#静音后的处理，只输出一次静音信号，其余的不输出，这样就可以人工调节LED灯光了
			if not mymedia.output_zero:
				mymedia.do_fft_callback('000000')
				mymedia.output_zero = True

	
	#https://github.com/licheegh/dig_sig_py_study/blob/master/Analyse_Microphone/audio_fft.py
	def read_audio_thead(q,stream,ad_rdy_ev):
		#global rt_data
		#global fft_data

		while stream._is_running and stream.is_active():
			ad_rdy_ev.wait(timeout=1000)
			if not q.empty():
				#process audio data here
				data=q.get()
				while not q.empty():
					q.get()

				if time.time() - mymedia.time_tick > 0.1:
					#mymedia.time_tick = time.time()
					rt_data = np.frombuffer(data,np.dtype('<i2'))
					rt_data = rt_data * sg.hamming(CHUNK)
					fft_temp_data=fftpack.fft(rt_data,rt_data.size,overwrite_x=True)
					fft_data=np.abs(fft_temp_data)[0:int(fft_temp_data.size/2+1)]
					freq = [n for n in range(0,RATE)] #N个元素
					mymedia.fft2color(freq, fft_data)
			ad_rdy_ev.clear()
		#print('read_audio_thead close')
	
	def audio_callback(in_data, frame_count, time_info, status):
		global counter

		mymedia.q.put(in_data)
		mymedia.ad_rdy_ev.set()

		if counter <= 0:
			return (None, pyaudio.paComplete)
		else:
			return (None, pyaudio.paContinue)
	
	def start(fft_callback = None, chg_index_callback = None):
		mymedia(os.getcwd() + "\\music")
		'''文件列表
		for f in mymedia.music_files:
			print('filename:%s' %(f['file']))
		'''
		mymedia.do_fft_callback = fft_callback;
		mymedia.do_chg_index_callback = chg_index_callback;
		
		# 开启声音输入
		mymedia.pa = PyAudio() 

		for i in range(mymedia.pa.get_device_count()):
			dev = mymedia.pa.get_device_info_by_index(i)
			name = dev['name'].encode('ISO-8859-1').decode('gb2312')
			#print(name)
			if dev['maxInputChannels'] and name.find('麦克风') != -1 and name.find('High Definition') != -1:#找到指定的声音输入设备（麦克风）
				mymedia.ad_rdy_ev.clear()
				mymedia.stream = mymedia.pa.open(format=paInt16,channels=CHANNELS,rate=RATE,input=True,frames_per_buffer=CHUNK,stream_callback=mymedia.audio_callback,input_device_index=dev['index'])
				mymedia.stream.start_stream()
				
				read_audio_t=threading.Thread(target=mymedia.read_audio_thead,args=(mymedia.q, mymedia.stream, mymedia.ad_rdy_ev))
				read_audio_t.daemon=True
				read_audio_t.start()
				print("Input audio '%s' 初始化成功..." %name)
				break

		mymedia.load(mymedia.get_filepath(0)) 
		mymedia.play()
	
		if mymedia.do_chg_index_callback:
			mymedia.do_chg_index_callback()
				
	def close(): 
		mymedia.stop()
		if mymedia.pa and mymedia.stream:
			mymedia.stream.stop_stream()
			mymedia.stream.close()
			mymedia.pa.terminate()
			mymedia.ad_rdy_ev.set()
			#print('mymedia close')
		
if __name__ == "__main__":
	try:
		signal.signal(signal.SIGINT, signal_handler2)       

		mymedia.start()

		while mymedia.playing:
			pygame.time.wait(1000)
	
	except KeyboardInterrupt:
		mymedia.close()
		print('exit.........')
	finally:
		mymedia.close()
		print('exit.........')
		pass
