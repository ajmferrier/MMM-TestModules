// based off code from https://github.com/javiergayala/MMM-mqtt

Module.register("MMM-PIR-Sensor", {
    defaults: {
        httpServer: 'https://mm-remote-server.herokuapp.com/modules',
        mqttServer: "tls://m16.cloudmqtt.com",
        brokerPort: 21056,
        topic:      "sensors/pir",
        username:   "iruokgqc",
        password:   "iJrh6uT-j_uN",
        // issue: these dont get ovverridden when set in the config file
        // so for now, writing in as defaults (not good practice)
        shutdownTimer: 10
    },

    shutdownModules: function() {
        this.shutdownFlag = true;
        Log.log("--------------SHUTTING DOWN MODULES---------------");

        // get request to obtain current state
        var self = this;
        var getRequest = new XMLHttpRequest();
        const url = self.config.httpServer;
        getRequest.open("GET", url);
        getRequest.setRequestHeader('Content-type','application/json; charset=utf-8');
        getRequest.onload = function () {
            var returnData = JSON.parse(getRequest.responseText);
            if (getRequest.readyState == 4 && getRequest.status == "200") {
                // store the current state of all modules
                self.previousState = returnData;
                Log.log(self.previousState);
                self.shutdownHelper();
            } else {
                console.error(returnData);
            }
        }

        getRequest.send();
    },

    shutdownHelper: function () {
        // send requests to server to shutdown all modules
        for (var i = 0; i < this.previousState.length; i++) {

            // put needed data into json object to send
            var data = {};
            data._id = this.previousState[i]._id;
            data.hidden = true;
            var json = JSON.stringify(data);

            var putRequest = new XMLHttpRequest();
            const url = this.config.httpServer + "/" + data._id;
            putRequest.open("PUT", url);
            putRequest.setRequestHeader('Content-type','application/json; charset=utf-8');
            putRequest.onload = function () {
                var returnData = JSON.parse(putRequest.responseText);
                if (putRequest.readyState == 4 && putRequest.status == "200") {
                    // console.table(returnData);
                } else {
                    console.error(returnData);
                }
            }

            // Log.log("shutting down " + data._id + "...");
            putRequest.send(json);
        }
    },

    wakeUpModules: function() {
        this.shutdownFlag = false;
        Log.log("------------------WAKING UP MODULES---------------");

        // send requests to server to restore previous state of all modules
        for (var i = 0; i < this.previousState.length; i++) {

            // put needed data into json object to send
            var data = {};
            data._id = this.previousState[i]._id;
            data.hidden = this.previousState[i].hidden;
            var json = JSON.stringify(data);

            var putRequest = new XMLHttpRequest();
            const url = this.config.httpServer + "/" + data._id;
            putRequest.open("PUT", url);
            putRequest.setRequestHeader('Content-type','application/json; charset=utf-8');
            putRequest.onload = function () {
                var returnData = JSON.parse(putRequest.responseText);
                if (putRequest.readyState == 4 && putRequest.status == "200") {
                    // console.table(returnData);
                } else {
                    console.error(returnData);
                }
            }

            putRequest.send(json);
        }
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'MQTT_DATA' && payload.topic === this.config.topic) {
            this.mqttVal = payload.data.toString();
            this.loaded = true;

            // if PIR detected value (1) comes in, reset counter
            if (payload.data == 1) {
                this.counter = 0;
                // if modules were shutdown, wake back up
                if (this.shutdownFlag) {
                    this.wakeUpModules();
                }
            }

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
        this.counter = 0;
        this.shutdownFlag = false;
        this.previousState = [];

        // start timer when module is started
        Log.log("counting......");
        var timer = setInterval(() => {
            this.counter++;
            Log.log("Counter: " + this.counter);
            // if counter exceeds shutdown timer, turn all modules off
            if (this.counter > this.config.shutdownTimer && !this.shutdownFlag) {
                this.shutdownModules();
            }

        }, 1000);
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