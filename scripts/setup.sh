#! /bin/bash

sudo pip install --upgrade pip
sudo -H pip install nodeenv

mkdir -p ~/.nodeenvs/
nodeenv ~/.nodeenvs/irene --node=0.12.13
. ~/.nodeenvs/irene/bin/activate
npm install
npm install -g bower
npm install -g ember-cli
bower install
