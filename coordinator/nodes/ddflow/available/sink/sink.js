module.exports = function(RED) {

    function sink(config) {
        RED.nodes.createNode(this,config);
        var node = this;
       	node.on('input', function(msg) {});
    }
    RED.nodes.registerType("sink",sink);
}