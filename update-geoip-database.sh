#!/bin/bash
set -x

source .env

STARDIR=`pwd`

if [ -z "MAXMIND_LICENSE_KEY" ]; then
  echo Please set MAXMIND_LICENSE_KEY environtment variable
  exit 1
fi

export GEOTMPDIR
export GEODATADIR

cd node_modules/geoip-lite && npm run-script updatedb license_key=$MAXMIND_LICENSE_KEY

cd $STARDIR
