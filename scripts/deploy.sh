#! /bin/sh
#
# deploy.sh
# Copyright (C) 2014 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#

ember build --environment production
gsutil -m rsync -d -r dist gs://appknox-web
gsutil -m acl set -R -a public-read gs://appknox-web
