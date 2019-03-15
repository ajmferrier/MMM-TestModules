Module.register("MMM-RemoteApp", {
    defaults: {
        moduleList: []
    },

    start: function () {
        
    },

    notificationReceived: function(notification, payload, sender) {
        switch(notification) {
            case "ALL_MODULES_STARTED":
                // once all modules are started, get list of modules
                Log.log("-----------------------------------");
                Log.log("getting list of modules");
                Log.log("-----------------------------------");
                var modules = MM.getModules();
                Log.log(modules);
                this.moduleList = modules;

                // turn clock on and off every second
                var timer = setInterval(() =>{
                    MM.getModules().exceptModule(this).enumerate(function(module) {
                        module.hide(1000, function() {
                            // module hidden
                        });
                    });
                }, 1000);

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