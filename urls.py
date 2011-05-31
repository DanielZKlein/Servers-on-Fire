from django.conf.urls.defaults import *

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^serversonfire/$', 'serversonfire.sof_main.views.home'),
	url(r'^serversonfire/ajax/$', 'serversonfire.sof_main.views.ajax'),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
	url(r'^serversonfire/takeedit/$', 'serversonfire.sof_main.views.takeedit'),
	url(r'^serversonfire/addnewrow/$', 'serversonfire.sof_main.views.newrow'),
	url(r'^serversonfire/delete/$', 'serversonfire.sof_main.views.deleterow'),
)

urlpatterns = urlpatterns + patterns('',
	(r'^serversonfire/stuff/(?P<path>.*)$', 'django.views.static.serve', {'document_root': 'c:\code\SoF\serversonfire\stuff'}),
)
