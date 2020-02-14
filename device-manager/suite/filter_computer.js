module.exports = {
	init(config) {
	},
	receive(data) {
		var str = JSON.stringify(data).toLowerCase();
		if(str.includes("car") || str.includes("comp") || str.includes("key") || str.includes("monitor")) {
			this.send(data);
		}
	}
}