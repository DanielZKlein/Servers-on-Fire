from django import template

register = template.Library()

def key(value, arg):
	return value[arg]

register.filter("key", key)
