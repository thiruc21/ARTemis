import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiModule } from '../../api/api.module';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages:string[];
  public myPeerId:string;
  public myPeer:string;
  public recieved:boolean; 
  private peer;
  public disabled:boolean;
  public running:boolean;
  btnDisplay:string;
  textelem:HTMLTextAreaElement;
  divelem:HTMLDivElement;
  private api:ApiModule;
  constructor() { }
  @ViewChild('textarea') public textarea:ElementRef;
  @ViewChild('content') public container:ElementRef;

  ngOnInit() {
    // Load API
    this.api = new ApiModule();

    // Declare Variables:
    this.textelem = this.textarea.nativeElement;
    this.divelem = this.container.nativeElement;

    this.messages = [];
    this.myPeerId = null;
    this.myPeer = null;

    // Set Flags
    this.running = true; // Flag for running. Default true.
    this.disabled = true; //Flag for disabled. Default true.

    // Display Logic
    this.textelem.disabled = this.disabled;
    if (this.textelem.disabled) this.btnDisplay = "none";
    else this.btnDisplay = "flex";

    // Generate peerId
    this.peer = new Peer({host : "lightpeerjs.herokuapp.com",
                          secure : true,
                          path : "/peerjs",
                          port : 443,
                          debug: false});     
    this.peer.on('open', function(id){
      console.log(id);
    });
    setTimeout(() => {
      this.myPeerId = this.peer.id; // Update myPeer.
    }, 2000);

    var me:any = this; // Class declaration.
    var func:(me:this, data:string) => void = this.addMessage; // Function for callback.
    // Open listener.
    this.peer.on('connection', function(connection) {
      connection.on('data', function(data){
          //messages.push(data);
          func(me, data);
      });
    });

    this.timeOut(); // Disabled update loop.
    this.keepAlive(); // Keep alive for peerserver.
  }
  // Push the message, connect to the peer, and send message to the peer
  addMessage(me, data) {
    me.messages.push(data);
    this.divelem.scrollTo(0, this.divelem.scrollHeight);
    this.divelem.scrollBy(0, 50);
  }
  submitMessage() {
    var text = this.textelem.value;

    console.log("hi" + text);
    console.log("recieved? " + this.recieved)
    if (this.recieved  && text != "") { // If we recieved, its connected, and there is something typed.
      var me = this.api.getCurrentUser();
      this.messages.push(me + ": " + text); // Push messages onto local chat.
      this.textelem.value = ""; // Empty text box.
      // Connect to other peer and send message
      if (this.myPeer) {
        var otherPeer = this.peer.connect(this.myPeer); // Connect to other peer.
        otherPeer.on('open', function(){
          otherPeer.send(me + ": " + text); // Send text.
        });
      }
      this.divelem.scrollTo(0, this.divelem.scrollHeight); // Scroll to bottom.
      this.divelem.scrollBy(0, 50);
    }
    else this.textelem.value = "";
  }

  timeOut(){
    setTimeout(() => { // Checks if it needs to update chat disabled status.
      this.textelem.disabled = this.disabled;
      if (this.textelem.disabled) this.btnDisplay = "none";
      else this.btnDisplay = "flex";
      if (this.running && this.textelem.disabled) this.timeOut();
    }, 1000);
  }

  keepAlive(){
    setTimeout(() => { // Keep the peer alive as long as on page
      var conn = this.peer.socket.send({
        type: 'ping'});
       if (this.running) this.keepAlive();
    }, 25000);
  }
}
