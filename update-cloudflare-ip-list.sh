#!/bin/bash
#
# This script is to download updated cloudflare ip list
#

set -x

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

if [ ! -d "data" ]; then
  mkdir -v data
fi

set +x
echo
echo "** Downloading CF ipv4 list"

set -x
( curl --output data/cf-ipv4.txt.new https://www.cloudflare.com/ips-v4/ && echo >> data/cf-ipv4.txt.new && diff -q data/cf-ipv4.txt.new data/cf-ipv4.txt ) || cp -fv data/cf-ipv4.txt.new data/cf-ipv4.txt
rm -fv data/cf-ipv4.txt.new

set +x
echo
echo "** Downloading CF ipv6 list"

set -x
( curl --output data/cf-ipv6.txt.new https://www.cloudflare.com/ips-v6/ && echo >> data/cf-ipv6.txt.new && diff -q data/cf-ipv6.txt.new data/cf-ipv6.txt ) || cp -fv data/cf-ipv6.txt.new data/cf-ipv6.txt
rm -fv data/cf-ipv6.txt.new

set +x
echo
diff -q data/cf-ipv4.txt lib/webserver/cf-ipv4.txt || echo "Downloaded ipv4 list is different with built-in list, please report our developer to update it"
diff -q data/cf-ipv6.txt lib/webserver/cf-ipv6.txt || echo "Downloaded ipv6 list is different with built-in list, please report our developer to update it"

