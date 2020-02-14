module.exports = function(RED) {

    function classify_image(config) {
        RED.nodes.createNode(this,config);
        var node = this;
       	node.on('input', function(msg) {});
    }
    RED.nodes.registerType("classify_image",classify_image);
}