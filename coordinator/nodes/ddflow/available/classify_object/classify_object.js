module.exports = function(RED) {

    function classify_object(config) {
        RED.nodes.createNode(this,config);
        var node = this;
       	node.on('input', function(msg) {});
    }
    RED.nodes.registerType("classify_object",classify_object);
}