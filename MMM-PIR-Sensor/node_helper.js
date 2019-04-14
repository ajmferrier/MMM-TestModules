const NodeHelper = require('node_helper');
var mqtt = require('mqtt');

module.exports = NodeHelper.create({
    start: function() {
        this.clients = [];
    },

    connectMqtt: function(config) {
        var self = this;
        var client;

        if (typeof self.clients[config.mqttServer] === "undefined") {
            console.log("Creating new MQTT client for url: ", config.mqttServer);
            client = mqtt.connect(config.mqttServer, {
                port: config.brokerPort,
                username: config.username,
                password: config.password,
                clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8)
            });
            self.clients[config.mqttServer] = client;

            client.on('connect', function(error) {
                if(!error) {
                    Log.log("***********MQTT CONNECTED**************");
                }
            });

            client.on('error', function(error) {
                console.log('*** MQTT JS ERROR ***: ' + error);
                self.sendSocketNotification('ERROR', {
                    type:    'notification',
                    title:   'MQTT Error',
                    message: 'The MQTT Client has suffered an error: ' + error
                });
            });

            client.on('offline', function() {
                console.log('*** MQTT Client Offline ***');
                self.sendSocketNotification('ERROR', {
                    type:    'notification',
                    title:   'MQTT Offline',
                    message: 'MQTT Server is offline.'
                });
                client.end();
            });

        } else {
            client = self.clients[config.mqttServer];
        }

        // subscribe to the topic
        client.subscribe(config.topic);
        client.on('message', function(topic, message) {
            self.sendSocketNotification('MQTT_DATA', {
                'topic': topic,
                'data':  message.toString()
            });
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'MQTT_SERVER') {
            this.connectMqtt(payload);
        }
    }
});