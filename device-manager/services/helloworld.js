module.exports = {
	params: ["prefix", "suffix"],
	preamble: "Hello World! ",
	suffix: "",
	init(config) {
		this.preamble = this.preamble + config.prefix + " ";
		this.suffix = config.suffix;
	},
	receive(data) {
		console.log(this.preamble + JSON.stringify(data) + " " + this.suffix);
		this.send(data);
	},
	stop() {
	}
}