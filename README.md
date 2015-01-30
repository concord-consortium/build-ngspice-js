# build-ngspice-js

Quick &amp; dirty demonstration of building [ngspice](http://sourceforge.net/projects/ngspice/) to Javascript/[asm.js](http://asmjs.org/spec/latest/) with [Emscripten](http://emscripten.org/). This will eventually enable educational and other webapps to use SPICE circuit simulation lag-free and without requiring developers to provision a server that runs a SPICE binary.

In order for the build product to be a manageable size (~2.5MB), most device types were removed from the ngspice source code before building. The current demo includes voltage and current sources, resistors, capacitors, inductors, diodes, bipolar junction transistors, and ideal voltage-controlled switches. Devices can be added back, but note they must be statically linked, so the device set should be chosen wisely based on project needs.

Note this is intended to become a backend component to be used by a separate UI; it does not provide a user-facing interface (though a command-line based demo would be trivially easy at this point).

The build runs on my computer (running OS X 10.9.5); that is all I can promise.

## Setup

1. Install [Emscripten](http://emscripten.org/) -- either the official Emscripten SDK, or from Homebrew
2. Clone *the `emscripten` branch* of ngspice from the Concord Consortium version on Github: https://github.com/concord-consortium/ngspice:

        git clone --branch emscripten https://github.com/concord-consortium/ngspice.git
        
3. Clone *this* repository into `<ngspice repo>/release`:

        cd ngspice
        git clone https://github.com/concord-consortium/build-ngspice-js.git release

4. `cd release` and run `./build.sh`:

        cd release  
        # this must be run from the `<ngspice repo>/release`:
        ./build.sh

This should build `ngspice.html`, `ngspice.js`, and `ngspice.html.mem`. You can open `ngspice.html`. The page will appear to be blank, but you can open it in your browser's developer console to see the output from SPICE.

## Rebuilding:

* Initially, and after making structural changes to the C source code that require makefile/autoconf changes: `./build.sh` (always rebuilds the entire project)
* After modifying C source: `./make.sh` (reruns Make, recompiling only changed sources, then runs linker & JS generation)
* After modifying Javascript sources: `./gen.sh` (skips the C compilation, and just runs the linker and JS generation)

## Key learnings:

* The autoconf-generated `configure` must be (and is) patched by `build.sh` to fail the sigsetjmp test: see  https://groups.google.com/d/msg/emscripten-discuss/nvq18u4lj6E/sCBVl1uAZvkJ
* Emscripten doesn't compile sources with debug information if you run the `configure` step with `--enable-debug`. To override this, we need to ensure `emcc`'s `-g` flag is set during the compilation steps; however, `EMMAKEN_CFLAGS` and `CFLAGS` env vars are overwritten somehow during the make process and are ignored. Setting `EMCC_CFLAGS` seems to work, however.
* Sourcemaps aren't currently working (Sending the `-g4` flag to `emcc` in `gen.sh` doesn't work; output is similar to that described in https://github.com/kripken/emscripten/issues/2970)
* We can execute ngspice commands from Javascript by providing a JS-defined stdin and stdout to ngspice. In order to do this we call `FS.init` with an appropriate callbacks (see `pre.js`) and switch `ngspice` to "pipe mode" (see `Module.arguments` in `pre.js`).
* However, ngspice wants to use an infinite loop and blocking I/O to read from stdin, which would hang the browser until ngspice exits, preventing us from supplying asynchronous input to ngspice from Javascript.
* Emscripten doesn't support nonblocking streams (if the `input` function we supply to `FS.init` returns `null` or `undefined`, emscripten marks the stream as having reached EOF or having errored, and refuses to read further from it). 
* Therefore, we modify ngspice's `main` to call [emscripten_set_main_loop] (http://kripken.github.io/emscripten-site/docs/api_reference/emscripten.h.html#c.emscripten_set_main_loop) so that `app_rl_readlines` is called from a `setInterval` loop. This almost fixes the problem, but as noted above emscripten requires that our JS stdin always return a value if it is to be readable at  a later time. Therefore we also had to modify ngspice to return from the main loop whenever it receives a single newline (without preceding input). This allows our `input` function to return `\n` (and terminate this interval's main loop call) if there is no data, without affecting ngspice's behavior.

## TODO:

* Instead of using `emscripten_set_main_loop` in `main.c` (therefore running the ngspice parser every 1/60s), modify `main.c` so that it publishes an endpoint callable from Javascript. (See http://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#interacting-with-code)  That way ngspice can be quiescent until we have input for it, at which point we populate the `stdin` buffer, add or modify netlists and other files in the virtual `MEMFS` filesystem seen by ngspice, and call `app_rl_readlines` from Javascript.
* Make a simple demo page that (asynchronously) accepts user input to spice
* Maintain the build product at a canonical URL: the current HTML/JS build products are available at https://github.com/concord-consortium/build-ngspice-js/tree/gh-pages
* Setup a Travis build
* Adapt the supported subset of tests from the ngspice repository.
 
