#! /bin/bash
#
# recreate_deis.sh
# Copyright (C) 2016 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#


git remote remove deis
deis apps:create irene
deis domains:add secure.appknox.com
deis certs:attach appknox secure.appknox.com
deis certs
