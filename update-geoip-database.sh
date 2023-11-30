#!/bin/bash
set -x

source .env

STARTDIR=`pwd`

if [ -z "MAXMIND_LICENSE_KEY" ]; then
  echo Please set MAXMIND_LICENSE_KEY environtment variable
  exit 1
fi

if [ ! -z "$GEOTMPDIR" ]; then
  if [ ! -d "$GEOTMPDIR" ]; then
    mkdir -p $GEOTMPDIR
  fi
fi

if [ ! -z "$GEODATADIR" ]; then
  if [ ! -d "$GEODATADIR" ]; then
    mkdir -p $GEODATADIR
  fi
fi

export GEOTMPDIR
export GEODATADIR

cd node_modules/geoip-lite && npm run-script updatedb license_key=$MAXMIND_LICENSE_KEY

cd $STARDIR
