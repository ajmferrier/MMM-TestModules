// based off code from https://github.com/javiergayala/MMM-mqtt

Module.register("MMM-PIR-Sensor", {
    defaults: {
        mqttServer: "tls://m16.cloudmqtt.com",
        brokerPort: 21056,
        topic:      "sensors/pir",
        username:   "iruokgqc",
        password:   "iJrh6uT-j_uN"
        // issue: these dont get ovverridden when set in the config file
        // so for now, writing in as defaults (not good practice)
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'MQTT_DATA' && payload.topic === this.config.topic) {
            this.mqttVal = payload.data.toString();
            this.loaded = true;
            this.updateDom();
        }

        if (notification === 'ERROR') {
            this.sendNotification('SHOW_ALERT', payload);
        }
    },

    start: function () {
        Log.log("Starting PIR Sensor reader");
        this.loaded = false;
        this.mqttVal = '';

        this.updateMqtt(this);
    },

    updateMqtt: function (self) {
        this.sendSocketNotification('MQTT_SERVER', { 
            mqttServer: self.config.mqttServer, 
            topic:      self.config.topic,
            brokerPort: self.config.brokerPort,
            username:   self.config.username,
            password:   self.config.password
        });
    },

    getDom: function() {
        var wrapper = document.createElement('div');

        if (!this.loaded) {
            wrapper.innerHTML = "Loading MQTT data...";
            return wrapper;
        }

        var mqttDiv = document.createElement('div');
        mqttDiv.innerHTML = this.mqttVal.toString();
        wrapper.appendChild(mqttDiv);

        return wrapper;
    }

})