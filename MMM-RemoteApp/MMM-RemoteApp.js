Module.register("MMM-RemoteApp", {

    defaults: {
        moduleList: []
    },

    start: function () {
        
    },

    notificationReceived: function(notification, payload, sender) {

        const SERVER_URL = "https://mm-remote-server.herokuapp.com/modules";

        switch(notification) {
            case "ALL_MODULES_STARTED":
                // once all modules are started, get list of modules
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
                    const url = SERVER_URL + "/" + moduleName;
                    putRequest.open("PUT", url);
                    putRequest.setRequestHeader('Content-type','application/json; charset=utf-8');
                    putRequest.onload = function () {
                        var returnData = JSON.parse(putRequest.responseText);
                        if (putRequest.readyState == 4 && putRequest.status == "200") {
                            console.table(returnData);
                        } else {
                            console.error(returnData);
                        }
                    }

                    putRequest.send(json);

                }

                // turn clock on and off every second
                // var timer = setInterval(() =>{
                //     MM.getModules().exceptModule(this).enumerate(function(module) {
                //         module.hide(1000, function() {
                //             // module hidden
                //         });
                //     });
                // }, 1000);

                // timer = setInterval(() =>{
                //     MM.getModules().exceptModule(this).enumerate(function(module) {
                //         module.show(1000, function() {
                //             // show moudle
                //         });
                //     });
                // }, 1000)

                break;
            
        }
    },

    getDom: function() {
        var element = document.createElement("div");
        element.className = "myContent";
        element.innerHTML = "List of current modules:";
        for (var i = 0; i < this.moduleList.length; i++){
            var subElement = document.createElement("div");
            subElement.id = "MODULE " + i;
            subElement.innerHTML = this.moduleList[i].data.name;
            element.appendChild(subElement);
        }
        return element;
    },
  
})