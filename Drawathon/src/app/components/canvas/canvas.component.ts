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
  private pts:any;
  private bound:any;
  pressed:boolean;
  size:number;
  customSS:string;
  // Canvas Drawing.
  private myEdit:any[];
  private peerEdit:any[];


  // Variables to be accessed by parent. game.component.
  public bg:string = "white";
  public myPeerId:string;
  public myPeers:string[];
  private peer:any;
  public recieved:boolean;
  public singlePlayer:boolean;
  public running:boolean;

  @ViewChild('canvas') public canvas: ElementRef;
  @ViewChild('cSize') private customSize:ElementRef;
  constructor() { }

  private canvasElem: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D; // Rendering context.
  private customSizeElem: HTMLInputElement;

  ngOnInit() {
    // Declare Variables:
    this.customSizeElem = this.customSize.nativeElement;
  
    this.myPeerId = null; // Peering Variables
    this.myPeers = [null, null];
    this.myEdit = []; 
    this.peerEdit = [];        
    
    this.color  = "black"; // Colors
    this.cColor = "black";

    this.customSizeElem.value = '20'; // Size
    this.customSS = '20px';

    this.pts = {x: 0, y:0, px:0, py:0} // Mouse coordinates.

    // Set Flags.
    this.running = true; // Running flag.
    this.pressed = false; // Mouse down flag.
    this.recieved = false; // Recieved flag. To recieve from parent.
    this.singlePlayer = true; // Single player flag, to recieve from parent. Default true.

    this.canvasElem = this.canvas.nativeElement; // Get canvas context.
    this.ctx = this.canvasElem.getContext('2d');
    

    // Generate peerId.
    this.peer = new Peer({host : "lightpeerjs.herokuapp.com",
                          secure : true,
                          path : "/peerjs",
                          port : 443,
                          debug: false});     
    this.peer.on('open', function(id){
      console.log("Canvas peer ID: " + id);
    });
    setTimeout(() => {
      this.myPeerId = this.peer.id; // Update peer info.
    },2000);


    
    var peerDraw = this.peerEdit; // Assign reference to list that can be used in scope.
    // Receive the data
    this.peer.on('connection', function(connection) {
      connection.on('data', function(data) {
        while (data.length > 0) {
          var smtn = data.shift(); // Temp variable.
          peerDraw.push(smtn);
        }
      });
    });
    this.timeOut(); // Start peer sharing loop.
    this.keepAlive(); // Start keep alive for peer connection.
  }

  ngAfterViewInit() { // Loads after webpage.
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = 10;
    this.bound = this.canvasElem.getBoundingClientRect(); // Set bound.
  }

  mouseDown(event) { // Mouse down, set pressed flag to true, update mouse position.
    if (this.bg != "white") return; // Disabled canavs, return.
    this.pressed = true;
    this.pts.x = event.clientX - this.bound.left;
    this.pts.y = event.clientY - this.bound.top;

    var withinBounds:boolean = (event.clientX < this.bound.right && event.clientX > this.bound.left && event.clientY < this.bound.bottom && event.clientY > this.bound.top);
    // Draw a point.
    if (this.pressed && withinBounds) {
      this.drawPoint();
    }
  };
  mouseUp = function() { // Mouse up, update flag.
    this.pressed = false;
  }

  mouseMove(event) { // Update mouse position.
    if (this.bg != "white") return; // Disabled canavs, return.
    this.pts.px = this.pts.x;
    this.pts.py = this.pts.y;
    this.pts.x = event.clientX - this.bound.left;
    this.pts.y = event.clientY - this.bound.top;
    // Draw a line.
    var withinBounds:boolean = (event.clientX < this.bound.right && event.clientX > this.bound.left && event.clientY < this.bound.bottom && event.clientY > this.bound.top);
    if (this.bg == "white" && this.pressed && withinBounds) {
        this.draw();
    }
  }

  drawPoint() { // Draw a point.
    this.ctx.beginPath();
    this.ctx.fillStyle = this.color;
    var size =  this.size;
    if (this.size < 0) size = this.customSize.nativeElement.value;
    // Find radius of a circle with diameter = this.ctx.lineWidth then fill
    this.ctx.arc(this.pts.x, this.pts.y, size/2, 0, 2*Math.PI, true);
    this.ctx.closePath()
    this.ctx.fill();
  }

  draw() { // Draw a stroke.
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

    // Push to my edits list.
    this.myEdit.push([this.pts.x, this.pts.y, this.pts.px, this.pts.py, size, this.color])
    // Connect to other peer and send message
  
  }

  clickColor(color) { // Update color based of choice.
    this.color = color;
  }

  clickSize(size) { // Update size based of choice.
    this.size = size;
  }

  timeOut(){
    setTimeout(() => {
     if (this.recieved && this.running) this.update();
     this.timeOut();
    }, 300);
  }

  keepAlive(){
    setTimeout(() => { // Keep the peer alive as long as on page
       var conn = this.peer.socket.send({
        type: 'ping'});
       if (this.running) this.keepAlive();
    }, 25000);
  }

  // Draw for recieved data.
  pDraw(x, y, px, py, size, color) {
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
    if (this.customSize.nativeElement.value < 5) this.customSize.nativeElement.value = 5 // Hard code min and max
    if (this.customSize.nativeElement.value > 60) this.customSize.nativeElement.value = 60
    this.customSS = this.customSizeElem.value.toString() + 'px'

    if (this.myEdit.length > 0) { // If there are edits to send.
      var myEdit = this.myEdit.slice(); // Copy edits.
      this.myEdit = []; // Empty edit.
      if (this.singlePlayer == false) { // If multiplayer send to other peer.
        var otherPeer = this.peer.connect(this.myPeers[0]);
        otherPeer.on('open', function(){
          otherPeer.send(myEdit);
        });
      } // Always send to host.
      var hostPeer = this.peer.connect(this.myPeers[1]);
      hostPeer.on('open', function(){
        hostPeer.send(myEdit);
      });
    }
    // Draw what was sent from peer. If single player peerEdit.length = 0;
    while (this.peerEdit.length > 0) {
      var smtn = this.peerEdit.shift();
      this.pDraw(smtn[0], smtn[1], smtn[2],smtn[3],smtn[4],smtn[5]);
    }
  }
}

