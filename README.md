# build-ngspice-js
Quick &amp; dirty support for building ngspice with emscripten.

This is a quick and dirty demo of a tool for building a cut-down version of the circuit simulation tool [ngspice](http://sourceforge.net/projects/ngspice/) to run in the browser.

It works on my computer (running OS X 10.9.5); that is all I can promise.

## Setup

1. Install [Emscripten](http://emscripten.org/) -- either the official Emscripten SDK, or from Homebrew
2. Clone ngspice from the Concord Consortium version on Github: https://github.com/concord-consortium/ngspice
3. Clone *this* repository into `<ngspice repo>/release`:

        # in the root of the ngspice repository:
        git clone https://github.com/concord-consortium/build-ngspice-js.git release

4. `cd release` and run `./build.sh`:

        cd release  # this has to be run from the `<ngspice repo>/release`
        ./build.sh

This should build `ngspice.html`, `ngspice.js`, and `ngspice.html.mem`. You can open `ngspice.html`. The page will appear to be blank, but you can open it in your browser's developer console to see the output from SPICE.

## Rebuilding:

* Initially, and after making structural changes to the C source code that require makefile/autoconf changes: `./build.sh` (will rebuild the entire project)
* After modifying C source: `./make.sh` (reruns Make, runs linker & generates JS, recompiling only changed sources)
* After modifying the Javascript sources in this repository: `./gen.sh` (skips the Make step)

## Key learnings:

* The autoconf-generated `configure` file needs to be patched by `build.sh` to fail the sigsetjmp test: see  https://groups.google.com/d/msg/emscripten-discuss/nvq18u4lj6E/sCBVl1uAZvkJ
* Emscripten doesn't compile sources with debug information if you run the `configure` step with `--enable-debug`. To override this, we need to ensure `emcc`'s `-g` flag is set during the compilation steps; however, `EMMAKEN_CFLAGS` and `EMCC_CLFAGS` env vars are overwritten somehow during the make process and are ignored. Setting `CFLAGS` to `-g` works (see `make.sh`) but will fail if more than one option is included (`emcc` parses `CFLAGS` incorrectly)
* Sourcemaps aren't currently working (Setting `-g4` flag to `emcc` in `gen.sh` doesn't work; output is similar to that described in https://github.com/kripken/emscripten/issues/2970)
* The build process embeds the 
Eventually, we may modify this repository so it includes ngspice as a submodule (rather than requiring 2 manual `git clone` steps)
* We can provide JS-defined stdin ngspice by calling `FS.init` with an appropriate callback (see `pre.js`) as long as we switch `ngspice` to "pipe mode" (see `Module.arguments` in `pre.js`)
* However, ngspice wants to use an infinite loop and blocking I/O to read from stdin, which would hang the browser and prevent us from supplying asynchronous input to ngspice from Javascript.
* Emscripten doesn't support a conversion to nonblocking mode (if the `input` function we supply to `FS.init` returns `null` or `undefined`, emscripten marks the stream as having reached EOF or having errored, and refuses to read further from it). 
* Therefore, we modify ngspice's `main` to call [emscripten_set_main_loop] (http://kripken.github.io/emscripten-site/docs/api_reference/emscripten.h.html#c.emscripten_set_main_loop) so that `app_rl_readlines` is called from a `setInterval` loop. This almost fixes the problem, but as noted above emscripten requires that our JS stdin always return a value if it is to be readable at  a later time. Therefore we also had to modify ngspice to return from the main loop whenever it receives a single newline (without preceding input). This allows our `input` function to return `\n` (and terminate this interval's main loop call) if there is no data, without affecting ngspice's behavior.

TODO:
  * Instead of using `emscripten_set_main_loop` in `main.c`, modify `main.c` so that it publishes an endpoint callable from Javascript. Then when we have input for ngspice, we can put it into our `stdin` buffer (see `pre.js` for how this implemented) and then call `app_rl_readlines` on demand from Javascript.
  * Have Javascript write user-updated netlists to the  `MEMFS` filesystem and load them by sending a `source` command via stdin (using the above mechanism)
  * Make a simple demo page that (asynchronously) accepts user input to spice
  * Maintain the build product at a canonical UREL: the current HTML/JS build products are available at https://github.com/concord-consortium/build-ngspice-js/tree/gh-pages
 
