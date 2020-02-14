module.exports = function(RED) {

    function play_sound(config) {
        RED.nodes.createNode(this,config);
        var node = this;
       	node.on('input', function(msg) {});
    }
    RED.nodes.registerType("play_sound",play_sound);
}