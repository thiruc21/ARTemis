import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ColorPickerModule } from 'ngx-color-picker';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})

export class CanvasComponent implements OnInit {
  
  // Canvas draw elements.
  color:string;
  cColor:string;
  pts:any;
  bound:any;
  pressed:boolean;
  size:number;
  customSS:string;
  // Canvas Drawing.
  myEdit:any[];
  peerEdit:any[];


  // Variables to be accessed by parent. game.component.
  public bg:string = "white";
  public myPeerId:string;
  public myPeers:string[];
  peer:any;
  public recieved:boolean;
  public singlePlayer:boolean;
  public running:boolean;

  @ViewChild('canvas') public canvas: ElementRef;
  @ViewChild('peer') public peerId:ElementRef;
  @ViewChild('cSize') private customSize:ElementRef;
  constructor() { }

  private canvasElem: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D; // Rendering context.

  ngOnInit() {
    this.myEdit = []
    this.peerEdit = [] // set edit to none.
    this.color  = "black";
    this.cColor = "black";
    this.customSize.nativeElement.value = 20
    this.customSS = this.customSize.nativeElement.value.toString() + 'px'
    this.pts = {x: 0, y:0, px:0, py:0}
    this.pressed = false;
    this.myPeerId = "null";
    this.myPeers = [null, null];
    this.recieved = false;
    this.singlePlayer = true;
    this.canvasElem = this.canvas.nativeElement;
    this.ctx = this.canvasElem.getContext('2d');
    this.running = true;

    // Connect to peer.
    this.peer = new Peer({host : "lightpeerjs.herokuapp.com",
                          secure : true,
                          path : "/peerjs",
                          port : 443,
                          debug: false});     
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
  test(){
    console.log(this.cColor);
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
    var size =  this.size;
    if (this.size < 0) size = this.customSize.nativeElement.value;
    // Find radius of a circle with diameter = this.ctx.lineWidth then fill
    this.ctx.arc(this.pts.x, this.pts.y, size/2, 0, 2*Math.PI, true);
    this.ctx.closePath()
    this.ctx.fill();
  }

  draw() {
    var size = this.size;
    var color = this.color;
    if (this.color == 'custom') color = this.cColor;
    if (this.customSize.nativeElement.value < 5) this.customSize.nativeElement.value = 5
    if (this.customSize.nativeElement.value > 60) this.customSize.nativeElement.value = 60
    if (this.size < 0) size = this.customSize.nativeElement.value;
    this.ctx.beginPath();
    this.ctx.moveTo(this.pts.px, this.pts.py);
    this.ctx.lineTo(this.pts.x, this.pts.y);
    this.ctx.lineWidth = size;
    this.ctx.strokeStyle = color;
    this.ctx.closePath();
    this.ctx.stroke();

    this.myEdit.push([this.pts.x, this.pts.y, this.pts.px, this.pts.py, size, this.color])
    // Connect to other peer and send message
  
  }

  clickColor(color) {
    this.color = color;
    console.log(color);
  }

  clickSize(size){
    this.size = size;
  }

  timeOut(){
    setTimeout(() => {
      //console.log("canvas recieved?: " + this.recieved);
     if (this.recieved && this.running) this.update();
     else {

     }
     this.timeOut();
    }, 300);
  }

  keepAlive(){
    // Keep the peer alive as long as on page
    setTimeout(() => { // Keep the peer alive as long as on page
       var conn = this.peer.socket.send({
        type: 'ping'});
       if (this.running) this.keepAlive();
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
    console.log("Canvas - Single Player?: " + this.singlePlayer);
    if (this.customSize.nativeElement.value < 5) this.customSize.nativeElement.value = 5
    if (this.customSize.nativeElement.value > 60) this.customSize.nativeElement.value = 60
    this.customSS = this.customSize.nativeElement.value.toString() + 'px'
    if (this.myEdit.length > 0) {
      var myEdit = this.myEdit.slice();
      this.myEdit = [];
      if (this.singlePlayer == false) {
        var otherPeer = this.peer.connect(this.myPeers[0]);
        otherPeer.on('open', function(){
          otherPeer.send(myEdit);
        });
      }
      var hostPeer = this.peer.connect(this.myPeers[1]);
      hostPeer.on('open', function(){
        hostPeer.send(myEdit);
      });
    }
    while (this.peerEdit.length > 0) {
      var smtn = this.peerEdit.shift();
      this.pDraw(smtn[0], smtn[1], smtn[2],smtn[3],smtn[4],smtn[5]);
    }
    //  this.draw()
  }
}

