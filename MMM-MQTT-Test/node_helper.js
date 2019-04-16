const NodeHelper = require('node_helper');
var mqtt = require('mqtt');

module.exports = NodeHelper.create({
    start: function() {

    },

    connectMqtt: function(config) {
        var self = this;
        var client;
        try {
            client = mqtt.connect("tls://m16.cloudmqtt.com", {
                port:       21056,
                username:   "iruokgqc",
                password:   "iJrh6uT-j_uN",
                // protocolId: 'MQIsdp',
                // protocolVersion: 3
            });

            client.on('connect', () => {
                console.log('***********************CONNECTED');
                client.subscribe('sensors/pir');
                client.publish('sensors/pir', 'hello');
            });

            client.on('message', function(top, message) {
                self.sendSocketNotification('MQTT_DATA', {
                    topic: top,
                    data: message.toString()
                });
            });
            client.on('offline', function() {
                console.log('*** MQTT Client Offline ***');
                // client.end();
            });

            
        
        } catch (err) {
            console.log("error: " + err.message);
        }
        

    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'MQTT_SERVER') {
            this.connectMqtt(payload);
        }
    }
});