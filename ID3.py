#!/usr/bin/python 
#-*-<coding:UTF-8>-*- 

""" 
This file is mainly designed for mp3 ID3V_1/2 Decoder. 
""" 

import os 
import sys 

GENRE = { 
0:"Blues", 
1:"ClassicRock", 
2:"Country", 
3:"Dance", 
4:"Disco", 
5:"Funk", 
6:"Grunge", 
7:"Hip-Hop", 
8:"Jazz", 
9:"Metal", 
10:"NewAge", 
11:"Oldies", 
12:"Other", 
13:"Pop", 
14:"R&B", 
15:"Rap", 
16:"Reggae", 
17:"Rock", 
18:"Techno", 
19:"Industrial", 
20:"Alternative", 
21:"Ska", 
22:"DeathMetal", 
23:"Pranks", 
24:"Soundtrack", 
25:"Euro-Techno", 
26:"Ambient", 
27:"Trip-Hop", 
28:"Vocal", 
29:"Jazz+Funk", 
30:"Fusion", 
31:"Trance", 
32:"Classical", 
33:"Instrumental", 
34:"Acid", 
35:"House", 
36:"Game", 
37:"SoundClip", 
38:"Gospel", 
39:"Noise", 
40:"AlternRock", 
41:"Bass", 
42:"Soul", 
43:"Punk", 
44:"Space", 
45:"Meditative", 
46:"InstrumentalPop", 
47:"InstrumentalRock", 
48:"Ethnic", 
49:"Gothic", 
50:"Darkwave", 
51:"Techno-Industrial", 
52:"Electronic", 
53:"Pop-Folk", 
54:"Eurodance", 
55:"Dream", 
56:"SouthernRock", 
57:"Comedy", 
58:"Cult", 
59:"Gangsta", 
60:"Top40", 
61:"ChristianRap", 
62:"Pop/Funk", 
63:"Jungle", 
64:"NativeAmerican", 
65:"Cabaret", 
66:"NewWave", 
67:"Psychadelic", 
68:"Rave", 
69:"Showtunes", 
70:"Trailer", 
71:"Lo-Fi", 
72:"Tribal", 
73:"AcidPunk", 
74:"AcidJazz", 
75:"Polka", 
76:"Retro", 
77:"Musical", 
78:"Rock&Roll", 
79:"HardRock", 
80:"Folk", 
81:"Folk-Rock", 
82:"NationalFolk", 
83:"Swing", 
84:"FastFusion", 
85:"Bebob", 
86:"Latin", 
87:"Revival", 
88:"Celtic", 
89:"Bluegrass", 
90:"Avantgarde", 
91:"GothicRock", 
92:"ProgessiveRock", 
93:"PsychedelicRock", 
94:"SymphonicRock", 
95:"SlowRock", 
96:"BigBand", 
97:"Chorus", 
98:"EasyListening", 
99:"Acoustic", 
100:"Humour", 
101:"Speech", 
102:"Chanson", 
103:"Opera", 
104:"ChamberMusic", 
105:"Sonata", 
106:"Symphony", 
107:"BootyBass", 
108:"Primus", 
109:"PornGroove", 
110:"Satire", 
111:"SlowJam", 
112:"Club", 
113:"Tango", 
114:"Samba", 
115:"Folklore", 
116:"Ballad", 
117:"PowerBallad", 
118:"RhythmicSoul", 
119:"Freestyle", 
120:"Duet", 
121:"PunkRock", 
122:"DrumSolo", 
123:"Acapella", 
124:"Euro-House", 
125:"DanceHall", 
126:"Goa", 
127:"Drum&Bass", 
128:"Club-House", 
129:"Hardcore", 
130:"Terror", 
131:"Indie", 
132:"BritPop", 
133:"Negerpunk", 
134:"PolskPunk", 
135:"Beat", 
136:"ChristianGangstaRap", 
137:"HeavyMetal", 
138:"BlackMetal", 
139:"Crossover", 
140:"ContemporaryChristian", 
141:"ChristianRock", 
142:"Merengue", 
143:"Salsa", 
144:"TrashMetal", 
145:"Anime", 
146:"JPop", 
147:"Synthpop", 
255:"None" 
} 

class ID3Ver1_Decoder(): 

	def __init__(self,filename): 
		self.fd = open(filename) 

	def __del__(self): 
		self.fd.close() 

	def getID3_header(self): 
		length = 3 
		self.fd.seek(-128,os.SEEK_END) 
		header = self.fd.read(length) 
		return header, 

	def getID3_title(self): 
		length = 30 
		self.fd.seek(-125,os.SEEK_END) 
		title = self.fd.read(length) 
		return title 

	def getID3_artist(self): 
		length = 30 
		self.fd.seek(-95,os.SEEK_END) 
		artist = self.fd.read(length) 
		return artist 

	def getID3_album(self): 
		length = 30 
		self.fd.seek(-65,os.SEEK_END) 
		album = self.fd.read(length) 
		return album 

	def getID3_year(self): 
		length = 4 
		self.fd.seek(-61,os.SEEK_END) 
		year = self.fd.read(length) 
		return year 

	def getID3_comment(self): 
		length = 30 
		self.fd.seek(-31,os.SEEK_END) 
		comment = self.fd.read(length) 
		return comment 

	def getID3_genre(self): 
		length = 1 
		self.fd.seek(-1,os.SEEK_END) 
		genre = self.fd.read(length) 
		return GENRE[ord(genre)] 

class ID3Ver2_Decoder(): 

	def __init__(self,filename): 
		self.fd = open(filename, 'rb', 0)
		
	def close(self): 
		self.fd.close()
		
	def getID3Ver2_header(self): 
		length = 3 
		self.fd.seek(0,os.SEEK_SET) 
		header = self.fd.read(length) 
		return header 

	def getID3Ver2_version(self): 
		length = 1 
		self.fd.seek(3,os.SEEK_SET) 
		version = self.fd.read(length) 
		return ord(version) 

	def getID3Ver2_revision(self): 
		length = 1 
		self.fd.seek(4,os.SEEK_SET) 
		revision = self.fd.read(length) 
		return ord(revision) 

	def getID3Ver2_flag(self): 
		length = 1 
		self.fd.seek(5,os.SEEK_SET) 
		flag = self.fd.read(length) 
		return ord(flag) 

	def getID3Ver2_size(self): 
		length = 4 
		self.fd.seek(6,os.SEEK_SET) 
		size = self.fd.read(length) 
		#print "size:%d,%d,%d,%d" %(ord(size[0]),ord(size[1]),ord(size[2]),ord(size[3])) 
		totalSize = (ord(size[0])&0x7f)*0x2000000 + (ord(size[1])&0x7f)*0x40000 + (ord(size[2])&0x7f)*0x80 + ord(size[3])&0x7f 
		#print totalSize 
		return totalSize 

	def getID3Ver2_frame(self): 
		length = 4 
		self.fd.seek(10,os.SEEK_SET) 
		frameID = self.fd.read(length) 
		return frameID 

	def getID3Ver2_frameSize(self): 
		length = 4 
		self.fd.seek(14,os.SEEK_SET) 
		frameSize = self.fd.read(length) 
		totalSize = ord(frameSize[0])*0x1000000 + ord(frameSize[1])*0x10000 + ord(frameSize[2])*0x100 + ord(frameSize[3]) 
		return totalSize 

	def getID3Ver2_frameFlags(self): 
		length = 2 
		self.fd.seek(18,os.SEEK_SET) 
		frameFlags = self.fd.read(length) 
		return frameFlags 