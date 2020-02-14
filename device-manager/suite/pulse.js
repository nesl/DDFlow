module.exports = {
	intervalID: null,
	init(config) {
		var node = this;
		function pulse() {
			node.send({"pulse":"pulse","time":new Date().getTime()});
		}
		node.intervalID = setInterval(pulse, 30000);
	},
	receive(data) {
	},
	stop() {
		if (this.intervalID) {
			clearInterval(this.intervalID);
		}
	}
}