#! /bin/bash
#
# deploy.sh
# Copyright (C) 2015 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#

ember deploy production --verbose=true --activate=true --show-progress=true

ENVIRONMENT=production
LOCAL_USERNAME=`whoami`
REVISION=`git log -n 1 --pretty=format:"%H"`

curl https://api.rollbar.com/api/1/deploy/ \
  -F access_token=$ROLLBAR_ACCESS_TOKEN \
  -F environment=$ENVIRONMENT \
  -F revision=$REVISION \
  -F local_username=$LOCAL_USERNAME

curl $OPBEAT_ENDPOINT \
  -H "Authorization: Bearer $OPBEAT_TOKEN" \
  -d rev=`git log -n 1 --pretty=format:%H` \
  -d branch=`git rev-parse --abbrev-ref HEAD` \
  -d status=completed

# Also Slack post from here
