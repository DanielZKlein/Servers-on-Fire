import csv, sys
from django.core.management import setup_environ
sys.path.append('C:\code\SoF')
from serversonfire import settings
setup_environ(settings)

from serversonfire.sof_main.models import *

myfile = sys.argv[1]


with open(myfile, 'rb') as csvfile:
	reader = csv.reader(csvfile)
	n = -1 # wait, I can explain
	
	for row in reader:
		n = n + 1
		if n == 0:
			# Skip the header
			continue
		if len(Issue.objects.filter(id=n)) > 0:
			# already imported! Skippity skip
			print "Skipping already existing message id #" + n
			continue
		# create category if new
		category = row[0]
		if len(Category.objects.filter(name__english = row[0])) == 0:
			catname = Message(english = row[0])
			catname.save()
			thiscat = Category(name = catname)
			thiscat.save()
		else:
			thiscat = Category.objects.filter(name__english = row[0])[0]
		issuename = Message(english = row[1])
		issuename.save()
		issuelong = Message(english = row[2])
		issuelong.save()
		issueshort = Message(english = row[3])
		issueshort.save()
		myissue = Issue(name = issuename, category = thiscat, short = issueshort, long = issuelong)
		myissue.save()
