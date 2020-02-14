module.exports = {
	init(config) {
	},
	receive(data) {
		var str = JSON.stringify(data).toLowerCase();
		console.log(str);
		if(str.includes("car") || str.includes("comp") || str.includes("key") || str.includes("monitor") || str.includes("person")) {
			this.send(data);
		}
	}
}