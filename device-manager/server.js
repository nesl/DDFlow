var express = require('./config/express.js');

var app = express();

var server = app.listen(3000,function(){
   console.log("Listening to port %s",server.address().port);
});

app.use(function(req, res, next) {
	console.log("REQUEST:", req.path)
	next();
});

module.exports = app;