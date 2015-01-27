#!/bin/bash

export EMCC_CFLAGS=
emcc -g3 -s ALLOW_MEMORY_GROWTH=1 -s TOTAL_MEMORY=67108864 -s MAX_SETJMPS=50 --embed-file spinit@/usr/local/share/ngspice/scripts/spinit --embed-file test.cir --pre-js pre.js src/ngspice.bc -o ngspice.html
