from django.conf.urls.defaults import *

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^serversonfire/$', 'serversonfire.sof_main.views.home'),
	url(r'^serversonfire/ajax/$', 'serversonfire.sof_main.views.ajax'),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
)

urlpatterns = urlpatterns + patterns('',
	(r'^serversonfire/stuff/(?P<path>.*)$', 'django.views.static.serve', {'document_root': 'c:\code\SoF\serversonfire\stuff'}),
)
