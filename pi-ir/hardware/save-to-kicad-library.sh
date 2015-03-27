#!/bin/bash

kicad-split --yes -i pi-ir.mod -o ./kicad-library/mods/
kicad-split --yes -i pi-ir.lib -o ./kicad-library/libs/
