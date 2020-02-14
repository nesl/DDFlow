module.exports = {
	init(config) {
	},
	receive(data) {
		if (data.toString.toLowerCase().includes("car")) {
			this.send(data);
		}
	}
}