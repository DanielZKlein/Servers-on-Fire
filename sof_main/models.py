from django.db import models

from django.contrib import admin
admin.autodiscover()

class Message(models.Model):
	english = models.TextField(blank = True)
	french = models.TextField(blank = True)
	german = models.TextField(blank = True)
	spanish = models.TextField(blank = True)
	polish = models.TextField(blank = True)
	korean = models.TextField(blank = True)
	romanian = models.TextField(blank = True)
	greek = models.TextField(blank = True)
	
	def __unicode__(self):
		return self.english

class Category(models.Model):
	name = models.ForeignKey('Message', related_name='catname')
	
	def __unicode__(self):
		return self.name.english
	
class Issue(models.Model):
	name = models.ForeignKey('Message', related_name='issuename')
	long = models.ForeignKey('Message', related_name='long')
	short = models.ForeignKey('Message', related_name='short')
	category = models.ForeignKey('Category')
	
	