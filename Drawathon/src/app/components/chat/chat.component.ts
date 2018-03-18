import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages:string[];
  myPeerId:string;
  peer;  
  constructor() { }
  @ViewChild('textarea') public textarea:ElementRef;
  @ViewChild('peer') public peerId:ElementRef;
  ngOnInit() {
    this.messages = [];
    this.myPeerId = ""; 
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
    },3000);
    var messages:string[] = this.messages;
    // Receive the data
    this.peer.on('connection', function(connection) {
      connection.on('data', function(data){
        messages.push(data);
      });
    });
    this.timeOut();
    this.keepAlive();
  }
  // Push the message, connect to the peer, and send message to the peer
  submitMessage() {
    var text = this.textarea.nativeElement.value;
    var me = this.myPeerId;
    this.messages.push(me + ": " + text);
    this.textarea.nativeElement.value = "";
    // Connect to other peer and send message
    var otherPeer = this.peer.connect(this.peerId.nativeElement.value);
    otherPeer.on('open', function(){
      otherPeer.send(me + ": " + text);
    });
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
  // Update 
  update(){
    var message = this.messages.pop();
    this.messages.push(message);
  }
  
}
