#! /bin/bash
#
# fix_errors.sh
# Copyright (C) 2017 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#


echo "Attempting to fix errors"

set +x

rm node_modules/ember-cli-pagination/app/resolver.js

set -x
