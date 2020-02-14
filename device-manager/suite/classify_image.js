var exec = require('child_process').exec;
var fs = require('fs');

module.exports = {
	working:0,
	init(config) {
	},
	receive(data) {
		var node = this;

		if(node.working == 1) {
			console.log("STILL CLASSIFYING... SLOW DOWN");
			return;
		}

		var tmpfile = require('os').homedir() + '/dev/scripts/classify.jpg';

		var bitmap = Buffer.from(data.image, 'base64');
		fs.writeFileSync(tmpfile, bitmap); 

		node.working = 1;
		exec("~/dev/scripts/image_classification.py -i " + tmpfile, function(err, stdout, stderr) {
			node.working = 0;
			if (err) console.log("ERROR CLASSIFY: ", err);
//			console.log("classified!")
			node.send({classify: stdout});
		});
	}
}
