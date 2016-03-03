#! /usr/bin/env python
# -*- coding: utf-8 -*-
#
# vim: fenc=utf-8
# vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4
#
#

"""
File name: tmp.py
Author: dhilipsiva <dhilipsiva@gmail.com>
Date created: 2016-03-02
"""

import time
from http.server import HTTPServer, BaseHTTPRequestHandler

index = open("index.html", "r").read().encode()


class IreneHandler(BaseHTTPRequestHandler):

    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(index)

# header(": *");

if __name__ == '__main__':
    target = ('0.0.0.0', 8083)
    httpd = HTTPServer(target, IreneHandler)
    print(time.asctime(), "Server Starts - %s:%s" % target)
    httpd.serve_forever()
