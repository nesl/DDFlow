var exec = require('child_process').exec;

module.exports = {
	init(config) {
	},
	receive(data) {
		var node = this;
		var tmpfile = require('os').homedir() + '/dev/scripts/play_recording.py';
		exec(tmpfile, function(err, stdout, stderr) {
			if (!err) {
				node.send(data);
			}
		});
	}
}
