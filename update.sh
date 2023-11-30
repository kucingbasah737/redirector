#!/bin/bash
set -x

if ! command -v jq &>/dev/null
then
  echo jq not found
  exit 1
fi

OLDDEP="`jq -c .dependencies package.json`"

git fetch

GITSATUS=`git status`
if [ "$GITSATUS" =~ "Your branch is behind" ]; then
  echo "** Need to pull the update"
else
  echo "No need to pull the update"
  exit
fi;

echo "** Pulling from repo"
git pull

NEWDEP="`jq -c .dependencies package.json`"

if [ "$OLDDEP" == "$NEWDEP" ]; then
  echo "** Does not need to run npm ci"
else
  echo "** Need to run npm ci"
  npm ci
fi

echo "** Killing old process"
kill `cat pid.txt`
