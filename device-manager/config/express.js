var express = require('express'),
    bodyParser = require('body-parser');

module.exports = function () {
    var app = express();
    var router = express.Router();
    
    // app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
    app.use(bodyParser.json({limit: '5mb'}));

    app.use(function(req, res, next) {
    	console.info(`${req.method} ${req.originalUrl}`);
    	next();
    });

    app.use('/', router);
    
    //Load the routes
    require('../routes')(router);

    return app;
};