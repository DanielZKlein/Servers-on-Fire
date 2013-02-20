# encoding: utf-8
from django.db import connection
from django.utils.encoding import force_unicode
from django.shortcuts import render_to_response, redirect, get_object_or_404
from django.http import HttpResponse
from django.utils.html import linebreaks
from django.core import serializers
from sof_main.models import *
from datetime import datetime
import pprint
from django.utils import simplejson as json
import shlex
import re
from pytz import *
from orderedDict import OrderedDict

locaData = OrderedDict()
locaData['na'] = {'shard': 'na', 'language': 'english', 'region': 'North America', 'forumurl': 'http://na.leagueoflegends.com/board/forumdisplay.php?f=20', 'tz': 'US/Pacific', 'datefmt': '%m/%d/%y', 'timefmt': '%I:%M %p %Z'}
locaData['euw'] = {'shard': 'euw', 'language': 'english', 'region': 'Europe West', 'forumurl': 'http://euw.leagueoflegends.com/board/forumdisplay.php?f=10', 'tz': 'Europe/London', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M UK time'}
locaData['fr'] = {'shard': 'euw', 'language': 'french', 'region': 'France', 'forumurl': 'http://euw.leagueoflegends.com/board/forumdisplay.php?f=35', 'tz': 'Europe/Paris', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M heure française'}
locaData['es'] = {'shard': 'euw', 'language': 'spanish', 'region': 'Spain', 'forumurl': 'http://euw.leagueoflegends.com/board/forumdisplay.php?f=21', 'tz': 'Europe/Madrid', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M hora peninsular'}
locaData['de'] = {'shard': 'euw', 'language': 'german', 'region': 'Germany', 'forumurl': 'http://euw.leagueoflegends.com/board/forumdisplay.php?f=46', 'tz': 'Europe/Berlin', 'datefmt': '%d.%m.%y', 'timefmt': '%H:%M Uhr deutscher Zeit'}
locaData['eune'] = {'shard': 'eune', 'language': 'english', 'region': 'Europe Nordic and East', 'forumurl': 'http://eune.leagueoflegends.com/board/forumdisplay.php?f=10', 'tz': 'Europe/Stockholm', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M %Z'}
locaData['ro'] = {'shard': 'eune', 'language': 'romanian', 'region': 'Romania', 'forumurl': 'http://eune.leagueoflegends.com/board/forumdisplay.php?f=143', 'tz': 'Europe/Bucharest', 'datefmt': '%d.%m.%y', 'timefmt': '%H:%M ora României'}
locaData['pl'] = {'shard': 'eune', 'language': 'polish', 'region': 'Poland', 'forumurl': 'http://eune.leagueoflegends.com/board/forumdisplay.php?f=83', 'tz': 'Europe/Warsaw', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M czasu polskiego'}
locaData['gr'] = {'shard': 'eune', 'language': 'greek', 'region': 'Greece', 'forumurl': 'http://eune.leagueoflegends.com/board/forumdisplay.php?f=166', 'tz': 'Europe/Athens', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M Ώρα Ελλάδας'}
#locaData['kr'] = {'language': 'korean', 'region': 'Korea', 'forumurl': '', 'tz': 'Asia/Seoul', 'datefmt': '%Y년 %m월 %d일', 'timefmt': '%H시 %M분 %Z'}

def getld(request):
	ro = json.dumps(locaData)
	return HttpResponse(ro)

def dbug(text):
	try:
		pp = pprint.PrettyPrinter()
		fh = open("debuglog.txt", "a")
		now = datetime.now().strftime("%H:%M:%S.%f")
		if isinstance(text, str) or isinstance(text, unicode):
			fh.write(now + " " + text + "\n")
		else:
			fh.write(now + ":\n" + pp.pformat(text) + "\n------------\n")
		fh.close()
	except:
		pass

def langDict(msg):
	# given an instance of models.Message, return a dict like so: {'english': 'chair', 'german': 'stuhl', 'spanish': 'silla'} etc
	langs = [x.name for x in Message._meta.fields[1:]] # skip the id field
	rd = {}
	for lang in langs:

		rd[lang] = getattr(msg, lang).replace("\n", "").replace("'", "&apos;").replace('"', "&#34;")
	return rd
		
def serializeIssues(issues):
	rd = {}
	for issue in issues:
		rd[issue.id] = {}
		rd[issue.id]['name'] = langDict(issue.name)
		rd[issue.id]['short'] = langDict(issue.short)
		rd[issue.id]['long'] = langDict(issue.long)
		rd[issue.id]['category'] = langDict(issue.category.name)
	return json.dumps(rd)
		
def serializeCats(cats):
	rd = {}
	for cat in cats:
		rd[cat.id] = {}
		rd[cat.id]['name'] = langDict(cat.name)
	return json.dumps(rd)
		
def home(request):
	
	lD = locaData.copy()
	issues = serializeIssues(Issue.objects.all())
	cats = serializeCats(Category.objects.all())
	sd = {'locaData': lD, 'url': request.build_absolute_uri(), 'issues': issues, 'cats': cats}

	return render_to_response("templates/main_view.html", sd)
	
def fakelogin(request):
	username = request.GET.get("username", False)
	password = request.GET.get("password", False)
	dbug("username is " + username + " and password is " + password)
	if not username or not password:
		return HttpResponse(json.dumps({'status': 'failed', 'msg': 'missingcredentials'}))
	shard = request.GET.get("shard", False)
	if not shard:
		return HttpResponse(json.dumps({'status': 'failed', 'msg': 'Shard not given'}))
	correctusername = shard + "username"
	correctpassword = shard + "password"
	if username == correctusername and password == correctpassword:
		return HttpResponse(json.dumps({'status': 'success', 'msg': ''}))
	else:
		return HttpResponse(json.dumps({'status': 'failed', 'msg': 'wrongcredentials'}))
		
def gettime(request):
	linuxtime = request.GET.get("time", False) or request.POST.get("time", False)
	if linuxtime:
		naiveTime = datetime.utcfromtimestamp(float(linuxtime))
	else:
		naiveTime = datetime.utcnow()
	awareTime = utc.localize(naiveTime)
	timesrequired = locaData
	ro = {}
	for label, info in timesrequired.items():
		rtz = timezone(info['tz'])
		rt = awareTime.astimezone(rtz)
		short = rt.strftime(info['timefmt'])
		# SUPER GHETTO MODE ENGAGE!
		# If we're making a timestamp for NA forums, give EST/EDT in addition to PST/PDT.
		if label == "na":
			east = rt.astimezone(timezone('US/Eastern'))
			short = short + " / " + east.strftime(info['timefmt'])
		long  = rt.strftime(info['datefmt']) + " " + short
			
		ro[label] = [long, short]
		
	jr = json.dumps(ro)
	return HttpResponse(jr)
	
def dumpall(request):
	sd = {'issues': Issue.objects.all()}
	return render_to_response("templates/dump_all.html", sd)
	
	