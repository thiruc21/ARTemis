var api = (function(){
    "use strict";
    var module = {};
    function sendFiles(method, url, data, callback){
        var formdata = new FormData();
        Object.keys(data).forEach(function(key){
            var value = data[key];
            formdata.append(key, value);
        });
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    }

    function send(method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    // Draw
    module.pushStroke = function(x, y, px, py, color, callback){
        send("POST", "/api/draw/", {px: px, x: x, py: py, y: y, color:color}, callback);
    };

    // Get
    module.getStrokes = function(limit="all", callback){
        send("GET", "/api/draw/?limit=" + limit, null, callback);
    };

    module.getLatest = function(callback){
        send("GET", "/api/curr/", null, callback);
    }

    return module;
})();