#! /bin/sh
#
# deploy.sh
# Copyright (C) 2014 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#

ember build --environment production
# sed -i 's/\.\.\/fonts/\/\/staging-assets.appknox.com\/fonts/g' dist/assets/vendor-*.css
# gsutil -m rm gs://staging-assets.appknox.com/**
# gsutil -m cp -R dist/* gs://staging-assets.appknox.com
# gsutil -m acl set -R -a public-read gs://staging-assets.appknox.com
sed -i 's/\.\.\/fonts/\/\/du6tdhcax0qep.cloudfront.net\/fonts/g' dist/assets/vendor-*.css
aws s3 sync dist/ s3://sherlock-assets/ --recursive --acl public-read
cp dist/index.html ../sherlock/generated
