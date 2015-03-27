#!/bin/bash

cp mods/* ../../../kicad-library/mods/
kicad-split --yes -i pi-ir.lib -o ../../../kicad-library/libs/
