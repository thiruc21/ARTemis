import { Component, OnInit, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { CanvasComponent } from '../canvas/canvas.component';
import { ChatComponent } from '../chat/chat.component';
import { ApiModule } from '../../api/api.module';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],

})
export class GameComponent implements OnInit {
  // Canvas and chat references.
  @ViewChild('canvas') public canvas:CanvasComponent;
  @ViewChild('chat') public chat:ChatComponent;

  // Values for game start timer.
  timeText:string;
  timeVal:number;
  // Controls display of lobby and game.
  gameD:string;
  // Variables to hold all related info of the game.
  user:string;
  lob:any;
  gameId:string;


  // Chat and canvas peering variables.
  myChatId:string;
  myCanvasId:string;
  chatPeer:any;
  canvasPeer:any[];

  // Boolean's for sending and recieving;
  sent:boolean;
  recieved:boolean;

  // Api module.
  api:ApiModule;

  constructor() { }

  ngOnInit() {
    // Set defaults.
    this.gameD = "grid";
    this.api = new ApiModule();
    this.lob = this.api.getLobby();
    this.gameId = this.lob._id;
    this.user = this.api.getCurrentUser();

    this.myCanvasId = null;
    this.myChatId = null;

    this.canvasPeer = [null , null];
    this.chatPeer = null;

    this.sent = false;
    this.recieved = false;

    this.timeOut(); // Update loop.

    if (this.gameD == "grid"){
      this.timeText = "Game Starts in:"
      this.timeVal = 5;
      this.canvas.bg = "grey";
      this.chat.disabled = true;
    }
    this.timer(); // Seperate for countdown purposes only.
  }

  timeOut() {
    var sent = this.sent;
    var recieved = this.recieved;
    var canvasPeer:any[] = this.canvasPeer;
    var chatPeer:any = this.chatPeer;

    if (this.sent == false) { // Update for sending peer Data.
      if (this.canvas.myPeerId != "null" && this.chat.myPeerId != "null") {
        this.api.updateUserInfo(this.gameId, this.canvas.myPeerId, this.chat.myPeerId, function (err, res) {
          if (err) console.log("err") 
          else {
            console.log("sent" , res);
            sent = true;
          }
        });
      }
    } else if (this.recieved == false) { // Update for recieveing peer Data.
      var user = this.user;
      this.api.getPlayers(this.gameId, function (err, players) {
        if (err) console.log(err);
        else {
          var team = 0;
          var otherPlayer;
          var singlePlayer:boolean = true;
          players.forEach(function(player){
            if (user == player.user) {
              team = player.teamNum;
            }
          });
          players.forEach(function(player){
            if (team == player.teamNum && user != player.user) {
              otherPlayer = player;
              singlePlayer = false;
            }
          });
          if ((otherPlayer.canvasId != "null" && otherPlayer.chatId != "null") || singlePlayer) {
            canvasPeer[0] = otherPlayer.canvasId;
            chatPeer = otherPlayer.chatId;
            this.api.getGame(this.gameId, function(err, res) {
              if (err) console.log(err);
              else {
                if (team == 0) {
                  if (res.team1Id != "null") {
                    canvasPeer[1] = res.team1Id;
                    recieved = true;
                  }
                }
                else {
                  if (res.team2Id != "null") {
                    canvasPeer[1] = res.team2Id;
                    recieved = true;
                  }
                }
              }
            });
          }
        }
      });
    }
    setTimeout(() => {
      this.sent = sent;
      this.recieved = recieved;
      if (this.recieved) {
        this.canvasPeer = canvasPeer;
        this.chatPeer = chatPeer;
        this.canvas.myPeers = this.canvasPeer;
        this.canvas.recieved = this.recieved;
        this.chat.myPeer = this.chatPeer;
        this.chat.recieved = this.recieved;
      }
      if (this.sent == false || this.recieved == false) this.timeOut(); // Update loop.
      else console.log("all connections made with: " + this.canvasPeer, this.chatPeer);
    }, 1500);
  }

  timer() {
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
