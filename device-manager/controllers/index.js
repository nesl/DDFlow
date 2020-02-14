const { exec, spawn } = require('child_process');
const request = require('request');

//tracks the services and forwards input data to them
var services = {};
var availableServices = [];
var serviceParams = {};

//lets coordinator know about all available services
module.exports.getAvailableServices = function (req, res) {
    exec('ls ./services/', (err, stdout, stderr) => {
        if (err) {
            console.log(err);
        }
        var all = stdout.split("\n");
        var srvcs = all.filter(function (el) {
            return el;
        });

        var serviceParams = {};

        for(var i=0; i<srvcs.length; i++) {
            var service = srvcs[i];
            var SI = require(`${__dirname}/../services/${service}`);
            serviceParams[service] = SI.params;
        }

        srvcs.push('udf.js');

        availableServices = srvcs;
        
        res.send({services: srvcs, params: serviceParams});
    });
}

module.exports.getActiveServices = function (req, res) {
    res.json(services);
}

module.exports.stop = function (req, res) {
    for(var id in services) {
        var service = services[id];
        if (service.service.stop) {
            service.service.stop();
        }
        delete services[id].service;
    }
    services = {};
    // console.log("stopping services");
    res.json({"success":"true"});
}

//activates a particular instance of a service on the device
module.exports.startService = function (req, res) {

    var id = req.query.id;
    var outputs = req.body.outputs;
    var service = req.body.service;

    //TODO: Configuration parameters
    // console.log(id, service, outputs);
    if(!id || !outputs || !service) {
        res.status(404).send("invalid");
        return;
    }

    if (!(outputs instanceof Array)) {
        outputs = [outputs]
    }

    if (!availableServices.includes(service)) {
        res.status(404).send("unavailable");
        return;
    }

    //load service and give send function
    var Service = undefined;
    if(service === "udf.js") {
        Service = require(`${__dirname}/udf.js`);
        var func = "var node = this;\n" + req.body.params.func;
        Service.receive = new Function('msg', func);
    } else {
        Service = require(`${__dirname}/../services/${service}`);
    }

    Service.send = function(data) {
        let self = this;
        for (var i = 0; i < this._outputs.length; i++) {
            var o = this._outputs[i];
            console.log(`Service ${this._id}: sending output to ${o}...`);
            var options = {
                method: 'post',
                body: {
                    'data': data
                },
                json: true,
                url: o
            }
            request(options, (err, res, body) => {
                if (err) {
                    console.log(`Service ${this._id}: failure to send output to ${o}`);
                    console.log(err);
                }
            });
        }
    };

    //instantiate
    const srvc = Object.create(Service);
    srvc._id = id;
    if (srvc.init) {
        srvc.init(req.body.params);
    }
    srvc._outputs = outputs;

    //store service details
    services[id] = {
        "outputs":outputs,
        "type":service,
        "service":srvc
    }

    res.send({"service":{
        "id":id,
        "outputs":outputs,
        "service":service
    }});
}

module.exports.heartbeat = function(req, res) {
    res.json({"hi":"hi"});
}

//forwards a message to the service instance
module.exports.sendToService = function (req, res) {
    var id = req.query.id;
    var data = req.body.data;

    var instance = services[id];
    if (!instance) {
        res.send({"error":"cannot find service"});
    } else {
        console.log(`Service ${id}: received data`);
        res.send({"success":"received"});
        if(instance.service.receive) {
            instance.service.receive(data);
        }
    }
}