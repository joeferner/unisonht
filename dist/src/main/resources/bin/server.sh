#!/bin/bash

DIR=$(cd $(dirname "$0") && pwd)

java -Djava.library.path=/usr/lib -cp ${DIR}/../lib/\* com.unisonht.UnisonHT "$@"
