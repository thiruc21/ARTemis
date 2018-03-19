import { Component, OnInit, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { CanvasComponent } from '../canvas/canvas.component';
import { ChatComponent } from '../chat/chat.component';
import { ApiModule } from '../../api/api.module';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  //<app-lobby [ngStyle]="{ 'display':lobbyD }" class="lobby"></app-lobby>

})
export class GameComponent implements OnInit {
  @ViewChild('canvas') public canvas:CanvasComponent;
  @ViewChild('chat') public chat:ChatComponent;
  timeText:string;
  timeVal:number;
  lobbyD:string;
  gameD:string;
  team1:string[];
  team2:string[];
  api:ApiModule;
  host:string;
  myChatId:string;
  myCanvasId:string;
  chatPeer:any;
  canvasPeer:any;

  constructor() { }
  ngOnInit() {
    this.lobbyD = "none";
    this.gameD = "grid";
    this.api = new ApiModule();
    //var lob = this.api.getLobby();
    //var gameId = lob._id;
    //this.canvasPeer= new Peer({host : "lightpeerjs.herokuapp.com",
    //secure : true,
    //path : "/peerjs",
    //port : 443,
    //debug: true});

    //this.chatPeer = new Peer({host : "lightpeerjs.herokuapp.com",
    //secure : true,
    //path : "/peerjs",
    //port : 443,
    //debug: true});
    //setTimeout(() => {
    //  this.myCanvasId= this.canvasPeer.id;
    //},3000);
    //setTimeout(() => {
    //  this.myChatId= this.chatPeer.id;
    //},3000);
    //this.api.joinGame(gameId, "123", "123", function(){

    //});

    if (this.gameD == "grid"){
      this.timeText = "Game Starts in:"
      this.timeVal = 5;
      this.canvas.bg = "grey";
      this.chat.disabled = true;
    }
    this.timer();
  }
  ngAfterViewInit() {
  }
  timer(){
    setTimeout(() => {
      if (this.gameD == "grid"){
        if (this.timeVal == 0){
          this.timeText ="Game Begins!";
          this.canvas.bg = "white";
          this.chat.disabled = false;
          this.timeVal = null;
        } 
        else {
          this.timeVal = this.timeVal - 1;
          console.log(this.timeVal)
          this.timer();
        }
      }
      else this.timer();
    }, 1000);
  }
}
