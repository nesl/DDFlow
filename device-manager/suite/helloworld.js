module.exports = {
	stuff: "",
	init(config) {
	},
	receive(data) {
		console.log("Hello World! " + data);
		this.send(data);
	}
}