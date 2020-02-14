module.exports = {
	intervalID: null,
	init(config) {
		var node = this;
		function pulse() {
			node.send({"pulse":"pulse","time":new Date().getTime()});
		}
		node.intervalID = setInterval(pulse, 12000);
	},
	receive(data) {
	},
	stop() {
		if (this.intervalID) {
			clearInterval(this.intervalID);
		}
	}
}