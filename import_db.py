import sys
from django.core.management import setup_environ
sys.path.append('C:\code\SoF')
from serversonfire import settings
setup_environ(settings)

from serversonfire.sof_main.models import Message

filename = sys.argv[1]
lc = filename[-6:-4]
print "ls is " + lc

import csv
reader = csv.reader(open(filename), dialect='excel')
   
for row in reader:
	print "processing " + row[0] + " and " + row[1]
	result = Message.objects.get_or_create(english = row[0])
	if result[1]:
		print "Created new message for " + row[0]
	m = result[0]
	if lc == "de":
		m.german = row[1]
	elif lc == "pl":
		m.polish = row[1]
	elif lc == "fr":
		m.french = row[1]
	elif lc == "es":
		m.spanish = row[1]
	m.save()
		