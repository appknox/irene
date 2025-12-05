#! /bin/bash
#
# deploy.sh
# Copyright (C) 2015 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#

npx ember deploy production --verbose=true --activate=true --show-progress=true

ENVIRONMENT=production
LOCAL_USERNAME=`whoami`
REVISION=`git log -n 1 --pretty=format:"%H"`

file=".env"
if [ -f "$file" ]
then
  echo "Deploying using an .env file"
  set -o allexport
  source .env
  set +o allexport
fi


# Also Slack post from here
