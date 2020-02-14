var controllers = require('../controllers/');

module.exports = function(app) {

  app.get('/', function(req,res) {
    res.json({message:'Nothing to see here... try a REST API request.'});
  });

  app.route('/services/available')
    .get(controllers.getAvailableServices);

  app.route('/services/active')
  	.get(controllers.getActiveServices);

  app.route('/service/start')
    .post(controllers.startService);

  app.route('/service/send')
   	.post(controllers.sendToService);

  app.route('/services/stop')
  	.get(controllers.stop);

  app.route('/heartbeat')
    .get(controllers.heartbeat);

};
