from django.db import models

class Message(models.Model):
	english = models.CharField(max_length=2000, blank = True)
	french = models.CharField(max_length=2000, blank = True)
	german = models.CharField(max_length=2000, blank = True)
	spanish = models.CharField(max_length=2000, blank = True)
	polish = models.CharField(max_length=2000, blank = True)
	
	def __unicode__(self):
		return self.english
