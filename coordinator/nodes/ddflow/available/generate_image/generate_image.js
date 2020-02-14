module.exports = function(RED) {

    function generate_image(config) {
        RED.nodes.createNode(this,config);
        var node = this;
       	node.on('input', function(msg) {});
    }
    RED.nodes.registerType("generate_image",generate_image);
}