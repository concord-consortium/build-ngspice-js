// TODO: Module.preRun should be an *array*; we clobber MEMFS initialization below!
Module.preRun = Module.preRun || [];

function OutStream() {
	this.buf = "";
}

OutStream.prototype.accept = function(charCode) {
	if (charCode === null || charCode === 10) {
		console.log(this.buf);
		this.buf = "";
		return;
	}
	this.buf = this.buf + String.fromCharCode(charCode);
};

Module.preRun.push(function() {
	var inputs = ['help\n'].join('\n').split('');
	function input() {
		var chr = inputs.shift();
		if (!chr) {
			// If there's no more input, just pretend we pressed enter.
			//
			// Currently emscripten doesn't support nonblocking streams. If we return null
			// then emscripten's "stdin" stream is permanently at EOF. If we return undefined
			// then emscripten sets EAGAIN and permanently marks the stream as having errored
			// (All subsequent calls to getc() will return -1 once we return undefined from 
		    // input().)
			// However, with a slight tweak to the ngspice source, reading '\n' from stdin
			// simply quits the mainloop until the emscripten interval calls it back again.
			return 10;
		}
		return chr.charCodeAt();
	}
	var stdout = new OutStream();
	var stderr = new OutStream();

	// Demonstration of how we can asynchronously control ngspice-js
	window.setTimeout(function() {
		console.log("(asynchronously appending to stdin)");
		inputs = inputs.concat(['source test.cir', 'run', 'print V(1)'].join('\n').split(''));
	}, 1000);

	// Initialize stdin, stdout, and stderr
	FS.init(input, stdout.accept.bind(stdout), stderr.accept.bind(stderr));
});

Module.logReadFiles = true;

// Need to enable 'pipe' (-p) mode for ngspice to accept our input from stdin
Module.arguments = ['-p'];
