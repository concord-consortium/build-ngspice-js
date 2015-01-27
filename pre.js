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
	var inputs = ['help', 'source test.cir', 'run', 'print V(1)', 'quit'].join('\n').split('');
	function input() {
		var chr = inputs.shift();
		return chr ? chr.charCodeAt() : null;
	}
	var stdout = new OutStream();
	var stderr = new OutStream();

	FS.init(input, stdout.accept.bind(stdout), stderr.accept.bind(stderr));
});

Module.logReadFiles = true;

// Need to enable 'pipe' (-p) mode for ngspice to accept our input from stdin
Module.arguments = ['-p'];
