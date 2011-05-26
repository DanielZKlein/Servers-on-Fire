from django.db import models

from django.contrib import admin
admin.autodiscover()


class Message(models.Model):
	english = models.TextField(blank = True)
	french = models.TextField(blank = True)
	german = models.TextField(blank = True)
	spanish = models.TextField(blank = True)
	polish = models.TextField(blank = True)
	category = models.CharField(default = "general", max_length = 20)

	def __unicode__(self):
		return self.english
