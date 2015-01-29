# build-ngspice-js
Quick &amp; dirty support for building ngspice with emscripten.

This is a quick and dirty demo of a tool for building a cut-down version of the circuit simulation tool [ngspice](http://sourceforge.net/projects/ngspice/) to run in the browser.

It works on my computer (running OS X 10.9.5); that is all I can promise.

1. Install [Emscripten](http://emscripten.org/) -- either the official Emscripten SDK, or from Homebrew
2. Clone ngspice from the Concord Consortium version on Github: https://github.com/concord-consortium/ngspice
3. Clone *this* repository into `<ngspice repo>/release`:

        # in the root of the ngspice repository:
        git clone https://github.com/concord-consortium/build-ngspice-js.git release

4. `cd release` and run `./build.sh`:

        cd release  # this has to be run from the `<ngspice repo>/release`
        ./build.sh

This should build `ngspice.html`, `ngspice.js`, and `ngspice.html.mem`. You can open `ngspice.html`. The page will appear to be blank, but you can open it in your browser's developer console to see the output from SPICE.

To rebuild:
* Initially, and after making structural changes to the C source code that require makefile/autoconf changes: `./build.sh` (will rebuild the entire project)
* After modifying C source: `./make.sh` (reruns Make, runs linker & generates JS, recompiling only changed sources)
* After modifying the Javascript sources in this repository: `./gen.sh` (skips the Make step)

Eventually, we may modify this repository so it includes ngspice as a submodule (rather than requiring 2 manual `git clone` steps)
