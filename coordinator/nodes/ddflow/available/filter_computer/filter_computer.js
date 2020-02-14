module.exports = function(RED) {

    function filter_computer(config) {
        RED.nodes.createNode(this,config);
        var node = this;
       	node.on('input', function(msg) {});
    }
    RED.nodes.registerType("filter_computer",filter_computer);
}