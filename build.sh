#!/bin/bash

emconfigure ../configure --without-x --enable-debug 2>&1 | tee emconfigure.log
source make.sh
