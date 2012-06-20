# encoding: utf-8
from django.db import connection
from django.utils.encoding import force_unicode
from django.shortcuts import render_to_response, redirect, get_object_or_404
from django.http import HttpResponse
from django.utils.html import linebreaks
from sof_main.models import Message
from datetime import datetime
import pprint
from django.utils import simplejson as json
import shlex
import re
from pytz import *
from orderedDict import OrderedDict

locaData = OrderedDict()
locaData['na'] = {'language': 'english', 'region': 'North America', 'forumurl': 'http://na.leagueoflegends.com/board/forumdisplay.php?f=20', 'tz': 'US/Pacific', 'datefmt': '%m/%d/%y', 'timefmt': '%I:%M %p %Z'}
locaData['euw'] = {'language': 'english', 'region': 'Europe West', 'forumurl': 'http://euw.leagueoflegends.com/board/forumdisplay.php?f=10', 'tz': 'Europe/London', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M UK time'}
locaData['eune'] = {'language': 'english', 'region': 'Europe Nordic and East', 'forumurl': 'http://eune.leagueoflegends.com/board/forumdisplay.php?f=10', 'tz': 'Europe/Stockholm', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M %Z'}
locaData['fr'] = {'language': 'french', 'region': 'France', 'forumurl': 'http://euw.leagueoflegends.com/board/forumdisplay.php?f=35', 'tz': 'Europe/Paris', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M heure française'}
locaData['es'] = {'language': 'spanish', 'region': 'Spain', 'forumurl': 'http://euw.leagueoflegends.com/board/forumdisplay.php?f=21', 'tz': 'Europe/Madrid', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M hora peninsular'}
locaData['de'] = {'language': 'german', 'region': 'Germany', 'forumurl': 'http://euw.leagueoflegends.com/board/forumdisplay.php?f=46', 'tz': 'Europe/Berlin', 'datefmt': '%d.%m.%y', 'timefmt': '%H:%M Uhr deutscher Zeit'}
locaData['ro'] = {'language': 'romanian', 'region': 'Romania', 'forumurl': 'http://eune.leagueoflegends.com/board/forumdisplay.php?f=143', 'tz': 'Europe/Bucharest', 'datefmt': '%d.%m.%y', 'timefmt': '%H:%M ora României'}
locaData['pl'] = {'language': 'polish', 'region': 'Poland', 'forumurl': 'http://eune.leagueoflegends.com/board/forumdisplay.php?f=83', 'tz': 'Europe/Warsaw', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M czasu polskiego'}
locaData['gr'] = {'language': 'greek', 'region': 'Greece', 'forumurl': 'http://eune.leagueoflegends.com/board/forumdisplay.php?f=166', 'tz': 'Europe/Athens', 'datefmt': '%d/%m/%y', 'timefmt': '%H:%M Ώρα Ελλάδας'}
locaData['kr'] = {'language': 'korean', 'region': 'Korea', 'forumurl': '', 'tz': 'Asia/Seoul', 'datefmt': '%Y년 %m월 %d일', 'timefmt': '%H시 %M분 %Z'}




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

def changecat(request):
	newcat = request.GET.get("newcat", "general")
	id = request.GET.get("id", False)
	if not id:
		return
	id = re.sub(r'^.*_', "", id)
	msg = Message.objects.get(pk = id)
	msg.category = newcat
	msg.save()
	return ajax(request)
		
def newrow(request):
	dbug("new row!")
	cat = request.GET.get("category", "general")
	newMessage = Message.objects.create()
	newMessage.category = cat
	newMessage.save()
	ro = getMsgsForAjax() # newrow has no filters or query... for now
	ro["newRow"] = newMessage.id
	jDump = json.dumps(ro)
	
	return HttpResponse(jDump)

def home(request):
	
	lD = locaData.copy()
	sd = {'locaData': lD}

	return render_to_response("templates/main_view.html", sd)
	
def getMsgsWithCats(objs = Message.objects.all(), filter = "all", query = ""):
	# Meaow
	cursor = connection.cursor()
	cursor.execute("SELECT DISTINCT category FROM sof_main_message")
	cats = cursor.fetchall()
	ro = {}
	query = query.encode("ascii", "ignore")
	terms = shlex.split(query)
	for term in terms:
		objs = objs.filter(english__icontains = term)

	for cat in cats:
		msgs = objs.filter(category = cat[0])
		ro[cat[0]] = msgs

	return ro
	

def takeedit(request):
	id = request.GET["id"]
	idres = re.match("(\w+)_(\d+)", id)
	lang = idres.groups()[0]
	m_id = idres.groups()[1]
	mes = Message.objects.get(pk=m_id)
	newtext = force_unicode(request.GET["newtext"])
	if lang == "english":
		dbug("english detected. Setting english to " + request.GET["newtext"])
		mes.english = request.GET["newtext"]
	elif lang == "german":
		mes.german = request.GET["newtext"]
	elif lang == "french":
		mes.french = request.GET["newtext"]
	elif lang == "spanish":
		mes.spanish = request.GET["newtext"]
	elif lang == "polish":
		mes.polish = request.GET["newtext"]
	mes.save()
	return ajax(request)
	
def deleterow(request):
	id = request.GET.get("id", "")
	idres = re.match("(\w+)_(\d+)", id)
	m_id = idres.groups()[1]	
	if id:
		Message.objects.filter(pk=m_id).delete()
	return ajax(request)
	
def ajax(request):
	if not request.is_ajax():
		dbug("DENIED")
		return False
	dbug("AJAX received: ")
	dbug(request.GET)
	query = request.GET.get("query", "")
	filter = request.GET.get("filter", "")
	returnObject = getMsgsForAjax(query = query, filter = filter)
	dbug("about to dump string")
	jr = json.dumps(returnObject)
	dbug("dumped")
	return HttpResponse(jr)
	
def getMsgsForAjax(query="", filter=""):
	dbug("getmsgs for a jax initiated")
	returnObject = {"reply" : []}
	query = query.encode("ascii", "ignore")
	terms = shlex.split(query)
	matches = Message.objects.all()
	for term in terms:
		matches = matches.filter(english__icontains = term)
	matches = getMsgsWithCats(objs = matches)

	for category, messages in matches.iteritems():
		thisRow = {}
		thisRow["name"] = category
		thisRow["numMatches"] = len(messages)
		thisRow["messages"] = []
		for msg in messages:
			newRow = {}
			newRow["english"] = linebreaks(msg.english)
			newRow["french"] = linebreaks(msg.french)
			newRow["spanish"] = linebreaks(msg.spanish)
			newRow["german"] = linebreaks(msg.german)
			newRow["polish"] = linebreaks(msg.polish)
			newRow["romanian"] = linebreaks(msg.romanian)
			newRow["korean"] = linebreaks(msg.korean)
			newRow["greek"] = linebreaks(msg.greek)
			newRow["id"] = msg.id
			thisRow["messages"].append(newRow)
		returnObject["reply"].append(thisRow)

	returnObject["query"] = query
	dbug("returning from getmessages")
	return returnObject

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
	
	
	
	
	
		
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	