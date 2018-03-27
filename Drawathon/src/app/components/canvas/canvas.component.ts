import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {
  // Canvas draw elements.
  color:string;
  pts:any;
  bound:any;
  pressed:boolean;
  size:number;

  // Canvas Drawing.
  myEdit:any[];
  peerEdit:any[];

  // Variables to be accessed by parent. game.component.
  public bg:string = "white";
  public myPeerId:string;
  public peer;

  @ViewChild('canvas') public canvas: ElementRef;
  @ViewChild('peer') public peerId:ElementRef;

  constructor() { }

  private canvasElem: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D; // Rendering context.

  ngOnInit() {
    this.myEdit = []
    this.peerEdit = [] // set edit to none.
    this.color  = "black";
    this.pts = {x: 0, y:0, px:0, py:0}
    this.pressed = false;
    this.myPeerId = "";
    this.canvasElem = this.canvas.nativeElement;
    this.ctx = this.canvasElem.getContext('2d');
    

    // Connect to peer.
    this.peer = new Peer({host : "lightpeerjs.herokuapp.com",
                          secure : true,
                          path : "/peerjs",
                          port : 443,
                          debug: true});     
    this.peer.on('open', function(id){
      console.log(id);
    });
    setTimeout(() => {
      this.myPeerId = this.peer.id;
    },2000);


    // Assign variables that can be used in the callback
    var peerDraw = this.peerEdit;
    // Receive the data
    this.peer.on('connection', function(connection) {
      connection.on('data', function(data){
        while (data.length > 0) {
          var smtn = data.shift();
          peerDraw.push(smtn);
        }
      });
    });
    this.timeOut();
    this.keepAlive();
  }

  ngAfterViewInit() {
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = 10;
    this.bound = this.canvasElem.getBoundingClientRect();
  }
  mouseDown(event){
    this.pressed = true;
    this.pts.x = event.clientX - this.bound.left;
    this.pts.y = event.clientY - this.bound.top;
    if (this.bg == "white" && this.pressed && event.clientX < this.bound.right && event.clientX > this.bound.left && event.clientY < this.bound.bottom && event.clientY > this.bound.top) {
      this.drawPoint();
  }
  };
  mouseUp = function() {
    this.pressed = false;
  }
  mouseMove(event){
    this.pts.px = this.pts.x;
    this.pts.py = this.pts.y;
    this.pts.x = event.clientX - this.bound.left;
    this.pts.y = event.clientY - this.bound.top;

    if (this.bg == "white" && this.pressed && event.clientX < this.bound.right && event.clientX > this.bound.left && event.clientY < this.bound.bottom && event.clientY > this.bound.top) {
        //draw(api.pushStroke(pts.x, pts.y, pts.px, pts.py, color));
        this.draw();
    }
  }
  drawPoint() {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.color;
    // Find radius of a circle with diameter = this.ctx.lineWidth then fill
    this.ctx.arc(this.pts.x, this.pts.y, this.ctx.lineWidth/2, 0, 2*Math.PI, true);
    this.ctx.closePath()
    this.ctx.fill();

  }

  draw() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.pts.px, this.pts.py);
    this.ctx.lineTo(this.pts.x, this.pts.y);
    this.ctx.lineWidth = this.size;
    this.ctx.strokeStyle = this.color;
    this.ctx.closePath();
    this.ctx.stroke();

    // Assign variables that can be used in the callback
    var x = this.pts.x;
    var y = this.pts.y;
    var prevx = this.pts.px;
    var prevy = this.pts.py;
    var width = this.ctx.lineWidth;
    var color = this.color;
    this.myEdit.push([this.pts.x, this.pts.y, this.pts.px, this.pts.py, this.ctx.lineWidth, this.color])
    // Connect to other peer and send message
  
  }

  clickColor(color){
    this.color = color;
    console.log(color);
  }

  clickSize(size){
    this.ctx.lineWidth = size;
    this.size = size;
  }

  timeOut(){
    // Update messages every second
    setTimeout(() => {
     this.update();
     this.timeOut();
    }, 1000);
  }

  keepAlive(){
    // Keep the peer alive as long as on page
    setTimeout(() => {
       // Connect to other peer and send message
       var conn = this.peer.connect(this.peerId.nativeElement.value);
       this.keepAlive();
    }, 25000);
  }
  pDraw(x,y,px,py, size, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(px, py);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size;
    this.ctx.closePath();
    this.ctx.stroke();
  }
   // Update 
   update(){
     console.log(this.myEdit)
    if (this.myEdit.length > 0) {
      var myEdit = this.myEdit.slice();
      this.myEdit = [];
      var otherPeer = this.peer.connect(this.peerId.nativeElement.value);
      otherPeer.on('open', function(){
        otherPeer.send(myEdit);
      });
    }
    while (this.peerEdit.length > 0) {
      var smtn = this.peerEdit.shift();
      this.pDraw(smtn[0], smtn[1], smtn[2],smtn[3],smtn[4],smtn[5]);
    }
    //  this.draw()
  }
}

