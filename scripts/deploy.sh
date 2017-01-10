#! /bin/bash
#
# deploy.sh
# Copyright (C) 2015 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#

ember deploy production --verbose=true --activate=true --show-progress=true

ACCESS_TOKEN=f1d76383c2d346a3aeedc21823f18c76
ENVIRONMENT=production
LOCAL_USERNAME=`whoami`
REVISION=`git log -n 1 --pretty=format:"%H"`

curl https://api.rollbar.com/api/1/deploy/ \
  -F access_token=$ACCESS_TOKEN \
  -F environment=$ENVIRONMENT \
  -F revision=$REVISION \
  -F local_username=$LOCAL_USERNAME

curl https://intake.opbeat.com/api/v1/organizations/1ff25e9c6a1d40bbad1293635d201fcb/apps/61501c19d2/releases/ \
  -H "Authorization: Bearer afe70fde72c21c3fc240c182d027551edb305eb9" \
  -d rev=`git log -n 1 --pretty=format:%H` \
  -d branch=`git rev-parse --abbrev-ref HEAD` \
  -d status=completed
