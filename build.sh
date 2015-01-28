#!/bin/bash
pushd ..
./autogen.sh
patch configure < release/configure.diff
popd
emconfigure ../configure --without-x --enable-debug 2>&1 | tee emconfigure.log
source make.sh
