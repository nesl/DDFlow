module.exports = function(RED) {

    function filter_custom(config) {
        RED.nodes.createNode(this,config);
        var node = this;
       	node.on('input', function(msg) {});
    }
    RED.nodes.registerType("filter_custom",filter_custom);
}