#! /bin/bash
#
# recreate_deis.sh
# Copyright (C) 2016 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#


git remote remove deis
deis git:remote -a irene
