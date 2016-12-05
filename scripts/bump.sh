#! /bin/bash
#
# bump.sh
# Copyright (C) 2016 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#


npm version patch
git push
git push --tags
