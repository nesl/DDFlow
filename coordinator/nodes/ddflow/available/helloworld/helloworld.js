module.exports = function(RED) {

    function helloworld(config) {
        RED.nodes.createNode(this,config);
        var node = this;
       	node.on('input', function(msg) {});
    }
    RED.nodes.registerType("helloworld",helloworld);
}