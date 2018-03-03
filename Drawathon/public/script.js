(function(){
    "use strict";
    var x = 0;
    var y = 0;
    var px = 0;
    var py = 0;
    var mouse = false;
    var color = "black";
    var curr = 0;

    var can = document.querySelector('#canabis');
    var ctx = can.getContext('2d');
    var canabis = can.getBoundingClientRect();
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;

    function timeout() {
        setTimeout(function () {
            api.getLatest(function (err, latest) {
                if (err) console.log(err);
                else {
                    if (curr < latest){
                        updateCanvas(curr);
                    }
                    timeout();
                }
            });
        }, 1000);
    }

    window.addEventListener('load', function(){
        updateCanvas("all");
        timeout();
    });
    
    document.querySelector('#red').addEventListener('click', function(){
        color = "red";
    });
    document.querySelector('#blue').addEventListener('click', function(){
        color = "blue";
    });
    document.querySelector('#green').addEventListener('click', function(){
        color = "green";
    });
    document.querySelector('#white').addEventListener('click', function(){
        color = "white";
    });
    document.querySelector('#black').addEventListener('click', function(){
        color = "black";
    });


    document.onmousemove = function(event) {
        px = x;
        py = y;
        x = event.clientX - canabis.left;
        y = event.clientY - canabis.top;
        if (mouse && event.clientX < canabis.right && event.clientY < canabis.bottom) {
            api.pushStroke(x, y, px, py, color, function(err, stroke){
                if (err) console.log(err);
                else {
                    draw(stroke); //x,y, px, py
                }
            });
        }
    }
    document.onmousedown = function(e) {
        mouse = true;
    }
    document.onmouseup = function(e) {
        mouse = false;
    }
    document.querySelector('#clicker').addEventListener('click', function(){
        console.log(curr);
    });

    document.querySelector('#canabis').addEventListener('click', function(event){
        //draw(x, y);
    });

    function draw(stroke) {
        ctx.beginPath();
        ctx.moveTo(stroke.px, stroke.py);
        ctx.lineTo(stroke.x, stroke.y);
        ctx.strokeStyle = stroke.color;
        ctx.closePath();
        ctx.stroke();
        curr = stroke._id;
        //ctx.fillRect(x - 0.1 ,y - 0.1, x + 0.1,y + 0.1);
    }

    function updateCanvas(limit) {
        api.getStrokes(limit, function(err, strokes){
            if (err) console.log(err);
            else {
                console.log(strokes);
                strokes.forEach(function(stroke) {
                    draw(stroke);
                });
            }
        });
    }
}());