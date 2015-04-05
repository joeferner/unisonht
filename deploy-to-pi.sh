#!/bin/bash

DIR=$(cd $(dirname "$0") && pwd)
cd ${DIR}

DEST=pi@unisonht-pi

echo "Building..."
mvn package -am -pl dist

echo "Deploying to $DEST"
rsync --exclude 'juds*' -ur dist/target/unisonht-dist-*/ $DEST:/opt/unisonht
rsync -ur pi-ir/lib/ $DEST:/opt/unisonht/lib
