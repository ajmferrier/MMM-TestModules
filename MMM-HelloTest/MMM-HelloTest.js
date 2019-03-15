Module.register("MMM-HelloTest", {
    getDom: function() {
        var element = document.createElement("div");
        element.className = "myContent";
        element.innerHTML = "HelloWorld";
        return element;
    }
})