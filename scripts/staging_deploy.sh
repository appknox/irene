#! /bin/sh
#
# deploy.sh
# Copyright (C) 2014 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#

ember build --environment staging
sed -i 's/\.\.\/fonts/\/\/sherlock-assets-staging.s3-us-west-2.amazonaws.com\/fonts/g' dist/assets/vendor-*.css
aws s3 sync dist/ s3://sherlock-assets-staging/ --acl public-read
cp dist/index.html ../sherlock/generated/index_staging.html
