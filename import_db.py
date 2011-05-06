import sys
from django.core.management import setup_environ
sys.path.append('C:\code\SoF')
from serversonfire import settings
setup_environ(settings)

from serversonfire.sof_main.models import Message

import csv
reader = csv.reader(open("C:/code/SoF/sofdatabase.csv"), dialect='excel')
   
for row in reader:
	print row[0]
	Message.objects.get_or_create(english = row[0])