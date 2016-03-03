#! /bin/sh
#
# deploy.sh
# Copyright (C) 2014 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#

set -e

rm -rf dist

# ember build --environment production
# sed -i 's/\.\.\/fonts/\/\/staging-assets.appknox.com\/fonts/g' dist/assets/vendor-*.css
# gsutil -m rm gs://staging-assets.appknox.com/**
# gsutil -m cp -R dist/* gs://staging-assets.appknox.com
# gsutil -m acl set -R -a public-read gs://staging-assets.appknox.com

ember build --environment production
sed -i 's/\.\.\/fonts/\/\/du6tdhcax0qep.cloudfront.net\/fonts/g' dist/assets/vendor-*.css
aws s3 rm --recursive s3://sherlock-assets-v2/
aws s3 sync dist/ s3://sherlock-assets-v2/ --acl public-read

ember build --environment production
# cp Procfile dist/
# cp .buildpacks dist/
cp Dockerfile dist/
cp server.py dist/
# sed -i 's/\.\.\/fonts/\/\/du6tdhcax0qep.cloudfront.net\/fonts/g' dist/assets/vendor-*.css
cd dist
git init
git add server.py
git add Dockerfile
git commit -m "Initial Commit"
git remote add deis ssh://git@deis.suttawala.co:2222/irene.git
git push -f deis master
