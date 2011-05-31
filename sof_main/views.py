from django.db import connection
from django.utils.encoding import force_unicode
from django.shortcuts import render_to_response, redirect, get_object_or_404
from django.http import HttpResponse
from django.utils.html import linebreaks
from sof_main.models import Message
from datetime import datetime
import pprint
import json
import shlex
import re

def dbug(text):
	try:
		pp = pprint.PrettyPrinter()
		fh = open("debuglog.txt", "a")
		now = datetime.now().strftime("%H:%M:%S")
		if isinstance(text, str) or isinstance(text, unicode):
			fh.write(now + " " + text + "\n")
		else:
			fh.write(now + ":\n" + pp.pformat(text) + "\n------------\n")
		fh.close()
	except:
		pass

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
	edit = request.GET.get("edit", False)
	sd = {"cats" : getMsgsWithCats()}
	if edit:
		return render_to_response("templates/edit_view.html", sd)
	else:
		return render_to_response("templates/main_view.html", sd)
	
def getMsgsWithCats(objs = Message.objects.all(), filter = "all", query = ""):
	# Miaow
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
	return HttpResponse('')
	
def deleterow(request):
	id = request.GET.get("id", False)
	idres = re.match("(\w+)_(\d+)", id)
	m_id = idres.groups()[1]	
	if id:
		Message.objects.filter(pk=m_id).delete()
	return HttpResponse('')
	
def ajax(request):
	if not request.is_ajax():
		dbug("DENIED")
		return False
	query = request.GET.get("query", "")
	filter = request.GET.get("filter", "")
	returnObject = getMsgsForAjax(query = query, filter = filter)
	jr = json.dumps(returnObject)
	#dbug(jr)
	return HttpResponse(jr)
	
def getMsgsForAjax(query="", filter=""):
	returnObject = {"reply" : []}
	query = query.encode("ascii", "ignore")
	terms = shlex.split(query)
	matches = Message.objects.all()
	for term in terms:
		matches = matches.filter(english__icontains = term)
	if filter == "french":
		matches = matches.filter(french__exact = "")
	elif filter == "german":
		matches = matches.filter(german__exact = "")
	elif filter == "spanish":
		matches = matches.filter(spanish__exact = "")
	elif filter == "polish":
		matches = matches.filter(polish__exact = "")
	matches = getMsgsWithCats(objs = matches)

	for category, messages in matches.iteritems():
		thisRow = {}
		thisRow["name"] = category
		thisRow["messages"] = []
		for msg in messages:
			newRow = {}
			newRow["english"] = linebreaks(msg.english)
			newRow["french"] = linebreaks(msg.french)
			newRow["spanish"] = linebreaks(msg.spanish)
			newRow["german"] = linebreaks(msg.german)
			newRow["polish"] = linebreaks(msg.polish)
			newRow["id"] = msg.id
			thisRow["messages"].append(newRow)
		returnObject["reply"].append(thisRow)

	returnObject["query"] = query
	return returnObject

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	