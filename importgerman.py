import csv, sys
from django.core.management import setup_environ
sys.path.append('C:\code\SoF')
from serversonfire import settings
setup_environ(settings)

from serversonfire.sof_main.models import *

myfile = sys.argv[1]


def unicode_csv_reader(unicode_csv_data, dialect=csv.excel, **kwargs):
    # csv.py doesn't do Unicode; encode temporarily as UTF-8:
    csv_reader = csv.reader(utf_8_encoder(unicode_csv_data),
                            dialect=dialect, **kwargs)
    for row in csv_reader:
        # decode UTF-8 back to Unicode, cell by cell:
        yield [unicode(cell, 'utf-8') for cell in row]

def utf_8_encoder(unicode_csv_data):
    for line in unicode_csv_data:
        yield line.encode('utf-8')
		


with open(myfile, 'rb') as csvfile:
	reader = csv.reader(csvfile)
	n = -1 # wait, I can explain
	
	for row in reader:
		n = n + 1
		if n == 0:
			# Skip the header
			continue
		# create category if new
		print n
		myissue = Issue.objects.filter(id = n)[0]
		tempmes = myissue.name
		tempmes.german = row[1]
		tempmes.save()
		tempmes2 = myissue.long
		tempmes2.german = row[2]
		tempmes2.save()
		tempmes3 = myissue.short
		tempmes3.german = row[3]
		tempmes3.save()
		tempcat = myissue.category.name
		tempcat.german = row[0]
		tempcat.save()
