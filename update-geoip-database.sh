#!/bin/bash
set -x

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

source .env

if [ -z "MAXMIND_LICENSE_KEY" ]; then
  echo Please set MAXMIND_LICENSE_KEY environtment variable
  exit 1
fi

if [ -z "$GEOTMPDIR" ]; then
  GEOTMPDIR=${SCRIPT_DIR}/data/geoip-lite/tmp
fi

if [ -z "$GEODATADIR" ]; then
  GEODATADIR=${SCRIPT_DIR}/data/geoip-lite/data
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
