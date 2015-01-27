#!/bin/bash

export EMCC_DEBUG=1
export EMCC_CFLAGS="-g"
emmake make 2>&1 | tee emmake.log
# (ignore ngmakeidx issue)
mv src/ngspice src/ngspice.bc
source gen.sh
