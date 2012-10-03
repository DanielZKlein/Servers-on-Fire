# USAGE: python import_sof.py [list of language codes]
# e.g.: python import_sof.py de es gr
# This would import de.csv (as German), es.csv (as Spanish) and gr.csv (as Greek) from the current directory

import csv, sys
from django.core.management import setup_environ
sys.path.append('C:\code\SoF')
from serversonfire import settings
setup_environ(settings)

from serversonfire.sof_main.models import *

def importcsv(filename, language):
	with open(filename, 'rb') as csvfile:
		reader = csv.reader(csvfile)
		n = -1 
		for row in reader:
			n = n + 1
			if n == 0:
				# Skip the header
				continue
			# Update or create the issue, based on whether or not it already exists
			if len(Issue.objects.filter(id = n)) == 0:
				if language != "english":
					print "ERROR! Creating issue in non-English. This shouldn't be happening."
					print "Bailing."
					sys.exit()
				# Issue with this id does not yet exist. Create it. 
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
			else:
				myissue = Issue.objects.filter(id = n)[0]
				tempmes = myissue.name
				setattr(tempmes, language, row[1])
				tempmes.save()
				tempmes2 = myissue.long
				setattr(tempmes2, language, row[2])
				tempmes2.save()
				tempmes3 = myissue.short
				setattr(tempmes3, language, row[3])
				tempmes3.save()
				tempcat = myissue.category.name
				setattr(tempcat, language, row[0])
				tempcat.save()

				
languages = {'en': 'english', 'de': 'german', 'fr': 'french', 'es': 'spanish', 'pl': 'polish', 'ro': 'romanian', 'gr': 'greek'}

for code in sys.argv[1:]:
	if code not in languages:
		print "Language code " + code + " not understood."
	else:
		print "Importing " + languages[code]
		importcsv(code + ".csv", languages[code])
		
