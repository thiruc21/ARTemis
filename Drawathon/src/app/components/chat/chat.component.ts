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
  peer;
  public disabled:boolean = false;
  btnDisplay:string;
  textelem:HTMLTextAreaElement;
  divelem:HTMLDivElement;
  private api:ApiModule;
  constructor() { }
  @ViewChild('textarea') public textarea:ElementRef;
  @ViewChild('peer') public peerId:ElementRef;
  @ViewChild('content') public container:ElementRef;

  ngOnInit() {
    this.api = new ApiModule();
    this.textelem = this.textarea.nativeElement;
    this.divelem = this.container.nativeElement;
    //this.textelem.disabled = this.disabled;
    if (this.textelem.disabled) this.btnDisplay = "none";
    else this.btnDisplay = "flex";
    this.messages = [];
    this.myPeerId = "null";
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
      console.log(this.myPeerId);
    },2000);
    //var messages:string[] = this.messages;
    var me:any = this;
    var func:(me:this, data:string) => void = this.addMessage;
    // Receive the data
    this.peer.on('connection', function(connection) {
      connection.on('data', function(data){
          //messages.push(data);
          func(me, data);
      });
    });
    //this.timeOut();
    this.keepAlive();
  }
  // Push the message, connect to the peer, and send message to the peer
  addMessage(me, data) {
    me.messages.push(data);
    this.divelem.scrollTo(0, this.divelem.scrollHeight);
    this.divelem.scrollBy(0, 50);
  }
  submitMessage() {
    if (this.recieved && this.myPeer != "null" && this.textelem.value != "") {
      var text = this.textelem.value;
      var me = this.api.getCurrentUser();
      this.messages.push(me + ": " + text);
      this.textelem.value = "";
      // Connect to other peer and send message
      var otherPeer = this.peer.connect(this.myPeer);
      otherPeer.on('open', function(){
        otherPeer.send(me + ": " + text);
      });
      this.divelem.scrollTo(0, this.divelem.scrollHeight);
      this.divelem.scrollBy(0, 50);
    }
  }
  enter() {
    console.log("submitting message");
    this.submitMessage();
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
       console.log("KEEP alive 4 lyfe")
       var conn = this.peer.connect(this.peerId.nativeElement.value);
       this.keepAlive();
    }, 25000);
  }
  // Update 
  update(){
    this.textelem.disabled = this.disabled;
    if (this.textelem.disabled) this.btnDisplay = "none";
    else this.btnDisplay = "flex";
    //var message = this.messages.pop();
    //this.messages.push(message);
  }
  
}
