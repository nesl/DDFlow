var service = "./services/helloworld.js";
var input = "test";

const Serv = require(service);
Serv.send = function(data) {
	console.log("OUTPUT:")
	console.log(data);
}

const srvc = Object.create(Serv);
srvc._id = "1";
if(srvc.init) {
	srvc.init();
}
srvc._outputs = ['1'];

srvc.receive(input);