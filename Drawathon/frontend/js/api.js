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

    // Local Storage.
    if (!localStorage.getItem("canvas")){
        localStorage.setItem("canvas", JSON.stringify({end: false, strokes: []}));
    }
    module.addImage = function(title, author, url){
        var imgs = JSON.parse(localStorage.getItem("imgs"));
        imgs.nextId++;
        var image = {imageId: (imgs.nextId).toString(), title: title, author: author, url: url, date: new Date()};
        imgs.items.push(image);
        localStorage.setItem("imgs", JSON.stringify(imgs));
        localStorage.setItem(image.imageId, JSON.stringify({nextId: 0, items: []}));
        return image;
    };
    module.startGame = function() {
        var canvas = JSON.parse(localStorage.getItem("canvas"));
        if (canvas.end) {
            canvas.strokes = [];
            canvas.end = false;
        }
        localStorage.setItem("canvas", JSON.stringify(canvas));
        return canvas;
    };
    module.pushStroke = function(x, y, px, py, color) {
        var canvas = JSON.parse(localStorage.getItem("canvas"));
        var stroke = {x:x, y:y, px:px, py:py, color:color};
        canvas.strokes.push(stroke);
        localStorage.setItem("canvas", JSON.stringify(canvas));
        return stroke;
    };
    module.getStrokes = function() {
        var canvas = JSON.parse(localStorage.getItem("canvas"));
        return canvas.strokes;
    };
    module.endGame =function() {
        var canvas = JSON.parse(localStorage.getItem("canvas"));
        canvas.strokes = [];
        canvas.end = true;
        localStorage.setItem("canvas", JSON.stringify(canvas));
        return canvas;
    };

    // ServerSIde

    // POST /game/ (id)
    // GET /game/:id game id
    return module;
})();