#! /bin/sh
#
# deploy.sh
# Copyright (C) 2014 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#

set -e

rm -rf dist
mkdir dist

ember build --environment production
# find ./dist/assets -name "*.css" -exec sed -i 's/\.\.\/fonts/https:\/\/storage.googleapis.com\/deis-staging/\/fonts/g' {} \;
# sed -i 's/\.\.\/fonts/https:\/\/storage.googleapis.com\/deis-staging/\/fonts/g' dist/assets/*.css
gsutil -m rm gs://deis-staging/**
gsutil -m cp -R dist/* gs://deis-staging
gsutil -m acl set -R -a public-read gs://deis-staging
https://apk.apk

# ember build --environment production
# sed -i 's/\.\.\/fonts/\/\/sherlock-assets-v2.s3.amazonaws.com\/fonts/g' dist/assets/vendor-*.css
# sed -i 's/\.\.\/fonts/\/\/sherlock-assets-v2.s3.amazonaws.com\/fonts/g' dist/assets/vendor-*.css
# aws s3 rm --recursive s3://sherlock-assets-v2/
# aws s3 sync dist/ s3://sherlock-assets-v2/ --acl public-read

cp Dockerfile dist/
cp server.py dist/
cd dist
git init
git add server.py
git add Dockerfile
git add index.html
git commit -m "Initial Commit"
git remote add deis ssh://git@deis-builder.104.154.26.43.xip.io:2222/irene.git
git push -f deis master
