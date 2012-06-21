from django.conf.urls.defaults import *
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'serversonfire.sof_main.views.home'),
	url(r'^ajax/$', 'serversonfire.sof_main.views.ajax'),
	url(r'^gettime/$', 'serversonfire.sof_main.views.gettime'),
	url(r'^getlocadata/$', 'serversonfire.sof_main.views.getld'),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
	url(r'^takeedit/$', 'serversonfire.sof_main.views.takeedit'),
	url(r'^addnewrow/$', 'serversonfire.sof_main.views.newrow'),
	url(r'^delete/$', 'serversonfire.sof_main.views.deleterow'),
	url(r'^changecat/$', 'serversonfire.sof_main.views.changecat'),
)

urlpatterns = urlpatterns + patterns('',
	#(r'^stuff/(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/var/www/html/sof/serversonfire/stuff'}),
	(r'^stuff/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),
)
