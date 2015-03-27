#!/bin/bash

kicad-update -i pi-ir.mod.list -o pi-ir.mod --basedir ./kicad-library
kicad-update -i pi-ir.lib.list -o pi-ir.lib --basedir ./kicad-library
