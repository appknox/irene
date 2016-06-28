#! /bin/bash
#
# heroku.sh
# Copyright (C) 2016 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#


git push heroku $(git rev-parse --abbrev-ref HEAD):master
