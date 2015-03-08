#!/bin/bash

DEST=pi@unisonht-pi
echo "Deploying to $DEST"

mvn package dependency:copy-dependencies

rsync -u `find . | grep jar` $DEST:/opt/unisonht
scp config/help-input.png config/tivo-roamio-pro-remote.jpg $DEST:/opt/unisonht/config
rsync -ur plugins/web/src/main/java/webapp pi@unisonht-pi:/opt/unisonht

