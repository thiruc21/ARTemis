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
  private api:ApiModule;
  constructor() { }
  @ViewChild('textarea') public textarea:ElementRef;
  @ViewChild('peer') public peerId:ElementRef;

  ngOnInit() {
    this.api = new ApiModule();
    this.textelem = this.textarea.nativeElement;
    //this.textelem.disabled = this.disabled;
    if (this.textelem.disabled) this.btnDisplay = "none";
    else this.btnDisplay = "flex";
    this.messages = [];
    this.myPeerId = "null";
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
  }
  submitMessage() {
    console.log(this.myPeer);
    if (this.recieved && this.myPeer != "null") {
      var text = this.textarea.nativeElement.value;
      var me = this.api.getCurrentUser();
      this.messages.push(me + ": " + text);
      this.textarea.nativeElement.value = "";
      // Connect to other peer and send message
      var otherPeer = this.peer.connect(this.peerId.nativeElement.value);
      otherPeer.on('open', function(){
        otherPeer.send(me + ": " + text);
      });
    }
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
    this.textelem.disabled = this.disabled;
    if (this.textelem.disabled) this.btnDisplay = "none";
    else this.btnDisplay = "flex";
    //var message = this.messages.pop();
    //this.messages.push(message);
  }
  
}
