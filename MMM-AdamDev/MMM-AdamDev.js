Module.register("MMM-AdamDev", {
    defaults: {
        foo: "Some initial prop"
    },

    start: function () {
        this.count = 0;
    },

    // function to test get request from backend
    getModuleInfo: function () {
        Log.log("--------------------");
        Log.log("fetching");
        Log.log("--------------------");
        var moduleRequest = new XMLHttpRequest();
        const url = "http://localhost:3000/modules";
        moduleRequest.open("GET", url);
        moduleRequest.send();
        moduleRequest.onreadystatechange=(e)=>{
            Log.log(moduleRequest.responseText);
        }
    },

    getDom: function() {    
        // self.getModuleInfo();
        
        Log.log("--------------------");
        Log.log("fetching");
        Log.log("--------------------");
        var moduleRequest = new XMLHttpRequest();
        const url = "http://localhost:3000/modules";
        moduleRequest.open("GET", url);
        moduleRequest.send();
        moduleRequest.onreadystatechange=(e)=>{
            Log.log(moduleRequest.responseText);
        }


        var element = document.createElement("div");
        element.className = "myContent";
        element.innerHTML = "Hello"
        return element;
    },
    
    notificationReceived: function(notification, payload, sender) {
        switch(notification) {
            case "DOM_OBJECTS_CREATED":
                var timer = setInterval(()=>{
                    this.sendSocketNotification("DO_YOUR_JOB", this.count);
                    this.count++;
                }, 1000);
                break;
        }
    },
    
    socketNotificationReceived: function(notification, payload) {
        switch(notification) {
            case "I_DID":
                var elem = document.getElementById("COUNT");
                elem.innerHTML = "Count:" + payload;
                break;
        }
    },
  
})