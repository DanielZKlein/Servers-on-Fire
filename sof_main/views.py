from django.shortcuts import render_to_response, redirect, get_object_or_404
from django.http import HttpResponse
from sof_main.models import Message
from datetime import datetime
import pprint
import json
import shlex

def dbug(text):
	pp = pprint.PrettyPrinter()
	fh = open("debuglog.txt", "a")
	now = datetime.now().strftime("%H:%M:%S")
	if isinstance(text, str) or isinstance(text, unicode):
		fh.write(now + " " + text + "\n")
	else:
		fh.write(now + ":\n" + pp.pformat(text) + "\n------------\n")
	fh.close()
	

def home(request):
	return render_to_response("templates/main_view.html", {"messages" : Message.objects.all()})
	
def ajax(request):
	if not request.is_ajax():
		return False
	returnObject = {"reply" : []}
	query = request.GET["query"]
	query = query.encode("ascii", "ignore")
	terms = shlex.split(query)
	matches = Message.objects.all()
	for term in terms:
		matches = matches.filter(english__icontains = term)
	for match in matches:
		thisRow = {}
		thisRow["english"] = match.english
		thisRow["french"] = match.french
		thisRow["spanish"] = match.spanish
		thisRow["german"] = match.german
		thisRow["polish"] = match.polish
		returnObject["reply"].append(thisRow)
		
	jr = json.dumps(returnObject)
	return HttpResponse(jr)
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	