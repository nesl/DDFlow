var exec = require('child_process').exec;
var fs = require('fs');

module.exports = {
	init(config) {
	},
	receive(data) {
		var node = this;
		var tmpfile = require('os').homedir() + '/dev/scripts/tmp.jpg';
		exec('raspistill --awb sun -w 1280 -h 720 -o ~/dev/scripts/tmp.jpg --timeout 1', function(err, stdout, stderr) {
			if (!err) {
				var base64 = fs.readFileSync(tmpfile).toString('base64');
				node.send({image:base64});
			}
		});
	}
}
