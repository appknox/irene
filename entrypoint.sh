#!/bin/sh

set -e

npx ember build --environment whitelabel
cp -r dist/* /usr/share/nginx/html/

if [ -z "$1" ] || [ "$1" = "server" ]; then
  echo "Starting nginx..."
  nginx -g 'daemon off;'
fi

exec "$@"
