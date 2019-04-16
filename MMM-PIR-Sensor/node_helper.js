const NodeHelper = require('node_helper');
var mqtt = require('mqtt');

module.exports = NodeHelper.create({
    start: function() {
    },

    connectMqtt: function(config) {
        var self = this;
        var client;

        try {

            client = mqtt.connect(config.mqttServer, {
                port:     config.brokerPort,
                username: config.username,
                password: config.password
            });

            client.on('connect', () => {
                console.log('Connected to ' + config.mqttServer);
                client.subscribe(config.topic);
                client.publish(config.topic, 'hello');
            });

            client.on('message', function(top, message) {
                self.sendSocketNotification('MQTT_DATA', {
                    topic: top,
                    data:  message.toString()
                });
            });

            client.on('offline', function() {
                console.log('*** MQTT Client Offline ***');
            })

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