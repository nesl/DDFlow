//NTGBOX: add this file

var request = require('request');
var typeRegistry = require("../registry");
var fs = require('fs');
var path = require('path');
var events = require("../../events");

var nodes = [];
var activeNodes = [];
var activeFlows = [];

var ddwarn = function(id, msg) {
	var notificationId = "ddflow-" + id;
	events.emit("runtime-event",{id:notificationId,payload:{type:"warning",error:"ddflow",ddflow:msg},retain:false});
}

var dderror = function(id, msg) {
	var notificationId = "ddflow-" + id;
	events.emit("runtime-event",{id:notificationId,payload:{type:"error",error:"ddflow",ddflow:msg},retain:false});
}

var ddsuccess = function() {
	events.emit("runtime-event",{id:"ddflow-success",payload:{type:"success",error:"ddflow"},retain:false});
}

var killAll = function() {
	console.log("--------Killing Services--------");
		for(var i=0; i<nodes.length; i++) {
			var ip = nodes[i];
			console.log(ip + "/services/stop");
			request(ip + "/services/stop", (err, res, body) => {
			});
		}
}

var heartbeatActive = false;
var heartbeat = function() {
	if (activeNodes.length == 0) return;
	console.log('-----Heartbeats------');
	//pinging all active nodes
	for(var i = 0; i < activeNodes.length; i++) {
		var node = activeNodes[i];
		console.log(node);
		var options = {
			url: node + "/heartbeat",
			timeout: 1000
		}
		var rq = request(options, function(err, resp, body) {
			if (err) {
				console.log("HEARTBEAT FAILED! NEED TO RE-DISTRIBUTE");
				ddwarn("heartbeat", "Device " + rq.uri.host + " unresponsive. Reconfiguring...");
				module.exports.distribute(activeFlows, null, false);
				//TODO: Kill and re-start application
			}
		});
	}
}

module.exports = {

	stop: function() {
		killAll();
	},

	loadServices: function(flows, diff) {
		var text = fs.readFileSync("./nodes/ddflow/list.txt", "utf-8");
		var ips = text.split("\n");
		console.log("----------DDFLOW LOAD SERVICES-------------");

		var services = [];
		var serviceParams = {};
		var finished_count = 0;

		if(!heartbeatActive) {
			setInterval(heartbeat, 10*1000);
			heartbeatActive = true;
		}
		for (var i=0; i<ips.length; i++) {
			var ip = ips[i];
			var options = {
				url: ip + "/services/available",
				timeout: 1000
			}
			var rq = request(options, function(err, resp, body) {
				if (err) {
					// dderror("Unable to contact device: " + rq.uri.host);
				} else {
					var bdy = JSON.parse(body);
					services = services.concat(bdy['services']);
					serviceParams = Object.assign(serviceParams, bdy['params']);
				}
				finished_count += 1;
				if (finished_count == ips.length) {
					// console.log("All services: ", services);
					//clear the available folder
					var folder = fs.readdirSync('./nodes/ddflow/available');
					for(var j = 0; j < folder.length; j++) {
						var service = folder[j] + ".js";
						if (services.includes(service)) {
							var index = services.indexOf(service);
							while(index > -1) {
								services.splice(index, 1);
								var index = services.indexOf(service);
							}
						} else {
							//not here. delete folder
							var path = './nodes/ddflow/available/' + folder[j];
							if (fs.existsSync(path)) {
								if (fs.lstatSync(path).isDirectory()) {
										fs.readdirSync(path).forEach(function(file, index){
										var curPath = path + "/" + file;
										fs.unlinkSync(curPath);
									});
									fs.rmdirSync(path);
								} else {
									fs.unlinkSync(path);
								}
							}
						}
					}
					// console.log(folder);
					//add instance for every intance here

					// console.log("add remaining services: ", services);
					for(var z=0; z<services.length;z++) {
						var service = services[z].replace(/\.[^/.]+$/, "");
						var srvcparams = serviceParams[services[z]];
						var paramString = ""
						var defaultString = ""
						for (var chi=0; srvcparams && chi<srvcparams.length; chi++) {
							var param = srvcparams[chi];
							paramString+='\n    <div class="form-row">\n        <label for="node-input-${PARAM}"><i class="fa fa-cog"></i> ${PARAM}</label>\n        <input type="text" id="node-input-${PARAM}" placeholder="${PARAM}">\n    </div>'
							while (paramString != paramString.replace("${PARAM}", param)) {
								paramString = paramString.replace("${PARAM}", param);
							}
							defaultString += '\n            ' + param + ': {value:""},';
						}
						// console.log(service);
						try {
							fs.mkdirSync('./nodes/ddflow/available/' + service);
						} catch(err) {
							//directroy exists
						}

						var package = fs.readFileSync("./nodes/ddflow/template/package.json", "utf-8");
						while (package != package.replace('${SERVICE}', service)) {
							package = package.replace('${SERVICE}', service);
						}
						var file = fs.createWriteStream('./nodes/ddflow/available/' + service + "/package.json");
						file.on('error', function(err) {});
						file.write(package);
						file.end();
						var html = fs.readFileSync("./nodes/ddflow/template/template.html", "utf-8").replace('${SERVICE}', service);
						while (html != html.replace('${SERVICE}', service)) {
							html = html.replace('${SERVICE}', service)
						}
						html = html.replace('${DEFAULTS}', defaultString);
						html = html.replace('${PARAMETERS}', paramString);
						var file = fs.createWriteStream('./nodes/ddflow/available/' + service + "/" + service + ".html");
						file.on('error', function(err) {});
						file.write(html);
						file.end();
						var js = fs.readFileSync("./nodes/ddflow/template/template.js", "utf-8").replace('${SERVICE}', service);
						while (js != js.replace('${SERVICE}', service)) {
							js = js.replace('${SERVICE}', service)
						}
						var file = fs.createWriteStream('./nodes/ddflow/available/' + service + "/" + service + ".js");
						file.on('error', function(err) {});
						file.write(js);
						file.end();
					}

				}
			});
		}

	},

	distribute: function(flows, diff, bootingup) {
		console.log("--------DDFlow--------");
		// console.log(flows);
		// console.log("----------------------");

		activeFlows = JSON.parse(JSON.stringify(flows));
		activeNodes = [];

		//Parse Flows
		var ips = []
		var mqtt = ""
		var nodes_to_deploy = []
		for (var i=0; i<flows.length; i++) {
			var type = flows[i]["type"];
			if (type==="ddflow-config") {
				ips = flows[i]['nodes'].split(';');
			} else if (flows[i]['z']) {
				var clone = JSON.parse(JSON.stringify(flows[i]));
				delete clone['z'];
				delete clone['name'];
				delete clone['x'];
				delete clone['y'];
				delete clone['wires'];
				clone['out'] = flows[i]["wires"][0];
				nodes_to_deploy.push(clone);
			}
		}

		console.log("-------Devices--------");
		console.log(ips);
		nodes = ips;
		var file = fs.createWriteStream('./nodes/ddflow/list.txt');
		file.on('error', function(err) {});
		file.write(ips.join('\n'));
		file.end();
		console.log("-------Nodes----------");
		for(var i=0; i<nodes_to_deploy.length; i++) {
			console.log(JSON.stringify(nodes_to_deploy[i]['type']));
		}
		killAll();
		// console.log("----------------------");

		var promises = []
		var capabilities = {}
		var assignment = {}
		var finished_count = 0;
		for (var i=0; i<ips.length; i++) {
			var ip = ips[i];
			// console.log(ip, ips);
			console.log("--------Requesting-----------");
			console.log(ip);
			var options = {
				url: ip + "/services/available",
				timeout: 1000
			}
			var rq = request(options, function(err, resp, body) {
				if (err) {
					ddwarn("services", "Unable to reach device: " + rq.uri.host);
				} else {
					capabilities["http://" + resp.request.host + ":" + resp.request.port] = JSON.parse(body)['services'];
				}
				finished_count += 1;
				if (finished_count == ips.length) {
					//got all
					console.log("Capabilities: ", capabilities);

					//decide who executes what.
					//TODO: THIS IS WHERE WE WOULD ADD NEW NODES TO THE GUI aka loadServices
					// typeRegistry.clear();
					// typeRegistry.load();
					//TODO: Scale stuff

					if(bootingup) {
						console.log("FIRST TIMER, DO NOTHING...");
						return;
					}

					console.log("--------HELIOT----------")
					var scenario = 1
					for(var j=0; j<nodes_to_deploy.length; j++) {
						var node = nodes_to_deploy[j];
						console.log(node);
						if (node.type == 'heliot-config') {
							scenario = (node.weather == 'Sunny' ? 1 : 2);
							nodes_to_deploy.splice(j,1);
							j -= 1;
							continue;
						} else if (node.type == 'drone_patrol') {
							if (node.Patrol_Area && node.Patrol_Area.toLowerCase() == 'perch') {
								scenario += 2;
							}
						}
						// console.log(node.type);
					}
					console.log(nodes_to_deploy);

					console.log("CONTACTING HELIOT...", scenario);
					var exec = require('child_process').exec;
					///Users/jnoor/workspace/Heliot/demo/send_scenario.py 2
					//This requires you to have the heliot github on your computer in ~/workspace
					exec('python3 /Users/jnoor/workspace/Heliot/demo/send_scenario.py ' + scenario.toString(), function(err, stdout, stderr) {
						if (err) console.log("HELIOT ERROR", err, stderr);
						else console.log("HELIOT RESPONSE", stdout);
					});

					//ASSIGN: right now this is dumb (greedy, no scaling)
					console.log("--------Computing----------")
					for(var j=0; j<nodes_to_deploy.length; j++) {
						var node = nodes_to_deploy[j];
						var assigned = false;
						for(var ip in capabilities) {
							if(capabilities[ip].includes(node.type + ".js")) {
								if (!(ip in assignment)) {
									assignment[ip] = []
								}
								assignment[ip].push(node)
								assigned = true;
								break;
							}
						}
						if (!assigned) {
							//we never found a compatible device.
							dderror("solver", "Unable to compute assignment. No device has: " + node.type);
							return;
						}
					}

					// console.log("Assignments");
					// console.log(JSON.stringify(assignment));

					//correct OUT IDs to proper post URL.
					var mapOutToNewOut = {}
					var total_num_services = 0
					for(var device in assignment) {
						var services_to_activate = assignment[device];
						for(var p=0; p<services_to_activate.length; p++) {
							var service_to_activate = services_to_activate[p];
							var id = service_to_activate["id"];
							var newOut = device + "/service/send?id=" + id;
							mapOutToNewOut[id] = newOut
							total_num_services += 1;
						}
					}
					for(var device in assignment) {
						for(var q=0; q<assignment[device].length; q++) {
							var service = assignment[device][q];
							if(service.out) {
								for(var w=0; w<service.out.length; w++) {
									service.out[w] = mapOutToNewOut[service.out[w]];
								}
							}
						}
					}

					// console.log("Assignments");
					// console.log(JSON.stringify(assignment));
					console.log("--------Assigning-----------");
					//Issue service requests
					finished_count = 0;
					for(var device in assignment) {
						for(var b=0; b<assignment[device].length; b++) {
							var service = assignment[device][b];
							var options = {
								method: 'post',
								body: {
									service: service.type + ".js",
									outputs: service.out ? service.out : [],
									params: service
								},
								json:true,
								url: device + "/service/start?id=" + service.id
							}
							request(options, (err, res, body) => {
								if (err) {
									console.log("Deployment error: ", err);
									dderror("deployment", err.toString());
									killAll();
								} else {
									finished_count += 1;
								}
								// console.log(err, body);
								if(finished_count == total_num_services) {
									//finished!!!
									console.log("--------INITIATED-----------");
									activeNodes = Object.keys(assignment);
									ddsuccess();
								}
							});
						}
					}
				}
			});
		}
		
	},
	init: function(settings) {
		// nodeCloseTimeout = settings.nodeCloseTimeout || 15000;
	},
	create: function(global,conf) {
		// return new Flow(global,conf);
	}
}
