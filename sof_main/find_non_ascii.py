# -*- coding: utf-8 -*-
import sys

data = open(sys.argv[1])
line = 0
for l in data:
    line += 1
    char = 0
    for s in list(unicode(l,'utf-8')):
        char += 1
        try:
            s.encode('ascii')
        except:
            print 'Non ASCII character at line:%s char:%s' % (line,char)