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
	pp = pprint.PrettyPrinter()
	fh = open("debuglog.txt", "a")
	now = datetime.now().strftime("%H:%M:%S")
	if isinstance(text, str) or isinstance(text, unicode):
		fh.write(now + " " + text + "\n")
	else:
		fh.write(now + ":\n" + pp.pformat(text) + "\n------------\n")
	fh.close()

def newrow(request):
	Message.objects.create()
	return HttpResponse('')

def home(request):
	return render_to_response("templates/main_view.html", {"messages" : Message.objects.all()})
	
def edit(request):
	return render_to_response("templates/edit_view.html", {"messages" : Message.objects.all()})

def takeedit(request):
	dbug("taking edit")
	id = request.GET["id"]
	idres = re.match("(\w+)_(\d+)", id)
	lang = idres.groups()[0]
	m_id = idres.groups()[1]
	dbug("lang is " + lang + " and m_id is " + m_id)
	mes = Message.objects.get(pk=m_id)
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
	dbug("saving")
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
		return False
	returnObject = {"reply" : []}
	query = request.GET["query"]
	query = query.encode("ascii", "ignore")
	terms = shlex.split(query)
	dbug(terms)
	matches = Message.objects.all()
	for term in terms:
		matches = matches.filter(english__icontains = term)
	filter = request.GET.get("filter", "")
	if filter == "french":
		matches = matches.filter(french__exact = "")
	elif filter == "german":
		matches = matches.filter(german__exact = "")
	elif filter == "spanish":
		matches = matches.filter(spanish__exact = "")
	elif filter == "polish":
		matches = matches.filter(polish__exact = "")
	for match in matches:
		thisRow = {}
		thisRow["english"] = linebreaks(match.english)
		thisRow["french"] = linebreaks(match.french)
		thisRow["spanish"] = linebreaks(match.spanish)
		thisRow["german"] = linebreaks(match.german)
		thisRow["polish"] = linebreaks(match.polish)
		thisRow["id"] = match.id
		returnObject["reply"].append(thisRow)
		
	jr = json.dumps(returnObject)
	return HttpResponse(jr)
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	