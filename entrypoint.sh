#!/bin/sh

set -e

rm -rf /usr/share/nginx/html/*
npx ember deploy docker

if [ -z "$1" ] || [ "$1" = "server" ]; then
  echo "Starting nginx..."
  nginx -g 'daemon off;'
fi

exec "$@"
