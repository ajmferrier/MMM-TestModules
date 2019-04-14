Module.register("MMM-RemoteApp", {

    defaults: {
        serverURL: 'https://mm-remote-server.herokuapp.com/modules',
        updateTime: 5000
    },

    // performs GET request to get list of all modules in DB
    // then calls helper function to update as needed
    updateModules: function () {
        var self = this;
        var getRequest = new XMLHttpRequest();
        const url = this.config.serverURL;
        getRequest.open("GET", url);
        getRequest.setRequestHeader('Content-type','application/json; charset=utf-8');
        getRequest.onload = function () {
            var returnData = JSON.parse(getRequest.responseText);
            if (getRequest.readyState == 4 && getRequest.status == "200") {
                self.updateModulesHelper(returnData);
                // console.table(returnData);
            } else {
                console.error(returnData);
            }
        }

        getRequest.send();
    },

    // once the list of modules has been obtained from the DB,
    // go through list of modules on client and update any changed
    // active statuses
    updateModulesHelper: function (returnData) {
        for (var i = 0; i < returnData.length; i++) {
            var hiddenDB = returnData[i].hidden;
            var nameDB = returnData[i]._id;

            // hide as necessary
            MM.getModules().withClass(nameDB).enumerate(function(module) {
                if (hiddenDB) {
                    module.hide(1000, function() {
                        //module hidden
                    });
                } else {
                    module.show(1000, function() {
                        // show module
                    });
                }
            });

        }
    },

    // after all modules loaded, put list into DB
    initializeModules: function () {
        Log.log("-----------------------------------");
        Log.log("getting list of modules");
        Log.log("-----------------------------------");
        var modules = MM.getModules();
        Log.log(modules);
        this.moduleList = modules;

        // iterate through list of modules
        for (var i = 0; i < this.moduleList.length; i++) {
            const moduleName = this.moduleList[i].name;
            const hiddenStatus = this.moduleList[i].hidden;

            // put needed data into json object to send
            var data = {};
            data._id = moduleName;
            data.hidden = hiddenStatus;
            var json = JSON.stringify(data);
            
            // perform PUT request to http://localhost:3000/modules/{name}
            var putRequest = new XMLHttpRequest();
            const url = this.config.serverURL + "/" + moduleName;
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

    start: function () {
        
        // once started, perform get request every time interval
        var timer = setInterval(() => {
            this.updateModules();
        }, this.config.updateTime);

    },

    notificationReceived: function(notification, payload, sender) {
        switch(notification) {
            case "ALL_MODULES_STARTED":
                this.initializeModules();
                break;
            
        }
    },

    getDom: function() {
        // var element = document.createElement("div");
        // element.className = "myContent";
        // element.innerHTML = "List of current modules:";
        // for (var i = 0; i < this.moduleList.length; i++){
        //     var subElement = document.createElement("div");
        //     subElement.id = "MODULE " + i;
        //     subElement.innerHTML = this.moduleList[i].data.name;
        //     element.appendChild(subElement);
        // }
        // return element;
    },
  
})