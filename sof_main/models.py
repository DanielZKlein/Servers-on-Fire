from django.db import models

class Message(models.Model):
	english = models.TextField(blank = True)
	french = models.TextField(blank = True)
	german = models.TextField(blank = True)
	spanish = models.TextField(blank = True)
	polish = models.TextField(blank = True)
	
	def __unicode__(self):
		return self.english
