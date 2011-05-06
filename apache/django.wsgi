import os
import sys

path = 'c:\code\SoF'
if path not in sys.path:
    sys.path.append(path)

path = 'c:\code\SoF\serversonfire'
if path not in sys.path:
    sys.path.append(path)

	
os.environ['DJANGO_SETTINGS_MODULE'] = 'serversonfire.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()