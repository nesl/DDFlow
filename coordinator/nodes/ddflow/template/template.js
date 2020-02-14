module.exports = function(RED) {

    function ${SERVICE}(config) {
        RED.nodes.createNode(this,config);
        var node = this;
       	node.on('input', function(msg) {});
    }
    RED.nodes.registerType("${SERVICE}",${SERVICE});
}