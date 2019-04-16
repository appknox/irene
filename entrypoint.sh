#!/bin/sh

set -e

echo "var runtimeGlobalConfig={
    IRENE_API_HOST=\"${IRENE_API_HOST}\",
    IRENE_DEVICEFARM_URL= \"${IRENE_DEVICEFARM_URL}\",
    IRENE_API_SOCKET_PATH=\"${IRENE_API_SOCKET_PATH}\",
    IRENE_ENABLE_SSO = \"${IRENE_ENABLE_SSO}\",
    ENTERPRISE = \"${ENTERPRISE}\",
    IRENE_ENABLE_REGISTRATION = \"${IRENE_ENABLE_REGISTRATION}\",
    registrationLink = \"${registrationLink}\",
    whitelabel = \"${whitelabel}\",
}" > public/runtimeconfig.js

if [ -z "$1" ] || [ "$1" = "server" ]; then
  echo "Starting nginx..."
  nginx -g 'daemon off;'
fi

exec "$@"
