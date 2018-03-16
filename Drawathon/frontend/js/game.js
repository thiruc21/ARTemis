(function(){
    "use strict";
    var pts = {x: 0, y: 0, px: 0, py: 0};
    var color = "black";
    var mousePress = false;

    var canvas = document.querySelector('.gcanvas');
    var ctx = canvas.getContext('2d');
    var canvasbound = canvas.getBoundingClientRect();
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    window.addEventListener('load', function(){
        console.log(canvasbound.top, canvasbound.left, canvasbound.bottom, canvasbound.right);
        api.endGame();
        api.startGame();
        updateCanvas();
    });
    // Color Handlers.
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

    // Size Handlers.
    document.querySelector('#small').addEventListener('click', function() {
        ctx.lineWidth = 10;
    });
    // Size Handlers.
    document.querySelector('#medium').addEventListener('click', function() {
        ctx.lineWidth = 25;
    });
            // Size Handlers.
    document.querySelector('#large').addEventListener('click', function() {
        ctx.lineWidth = 50;
    });
    // Mouse Handlers.
    document.onmousemove = function(event) {
        pts.px = pts.x;
        pts.py = pts.y;
        pts.x = event.clientX - canvasbound.left;
        pts.y = event.clientY - canvasbound.top;

        if (mousePress && event.clientX < canvasbound.right && event.clientX > canvasbound.left && event.clientY < canvasbound.bottom && event.clientY > canvasbound.top) {
            //draw(api.pushStroke(pts.x, pts.y, pts.px, pts.py, color));
            draw({x:pts.x, y:pts.y, px:pts.px, py:pts.py, color:color})
        }
    }
    document.onmousedown = function(e) {
        mousePress = true;
    }
    document.onmouseup = function(e) {
        mousePress = false;
    }

    // Drawing Function.
    function draw(stroke) {
        ctx.beginPath();
        ctx.moveTo(stroke.px, stroke.py);
        ctx.lineTo(stroke.x, stroke.y);
        ctx.strokeStyle = stroke.color;
        ctx.closePath();
        ctx.stroke();
        //curr = stroke._id;
    }
    function updateCanvas() {
        api.getStrokes().forEach(function(stroke) {
            draw(stroke);
        });
    }
}());