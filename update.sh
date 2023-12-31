#!/bin/bash
set -x

if ! command -v jq &>/dev/null
then
  echo jq not found
  exit 1
fi

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

echo "** Fetch remote repo"
git fetch

GITSTATUS=`git status`
if [[ "$GITSTATUS" =~ "Your branch is behind" ]]; then
  echo "** Need to pull the update"
else
  echo "No need to pull the update"
  exit
fi;

OLDDEP="`jq -c .dependencies package.json`"

echo "** Pulling from repo"
git pull

NEWDEP="`jq -c .dependencies package.json`"

if [ "$OLDDEP" == "$NEWDEP" ]; then
  echo "** Does not need to run npm ci"
else
  echo "** Need to run npm ci"
  npm ci
fi

if [ -f ".env" ]; then
  npx db-migrate up
fi

echo "** Killing old process"
kill `cat pid.txt`
