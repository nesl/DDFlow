module.exports = function(RED) {
    function DistNodeList(config) {
        RED.nodes.createNode(this,config);
        var node = this;
    }
    RED.nodes.registerType("ddflow-config",DistNodeList);
}