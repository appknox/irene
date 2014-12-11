#! /bin/sh
#
# deploy.sh
# Copyright (C) 2014 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#

ember build --environment production
sed -i 's/\.\.\/fonts/\/\/appknox-web.storage.googleapis.com\/fonts/g' dist/assets/vendor-*.css
gsutil -m rm gs://appknox-web/**
gsutil -m cp -R dist/* gs://appknox-web
gsutil -m acl set -R -a public-read gs://appknox-web
cp dist/index.html ../sherlock/generated
