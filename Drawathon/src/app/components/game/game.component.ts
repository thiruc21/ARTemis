import { Component, OnInit, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { CanvasComponent } from '../canvas/canvas.component';
import { ChatComponent } from '../chat/chat.component';
import { ApiModule } from '../../api/api.module';
import { Router } from '@angular/router';

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
  timeLeft:number;

  // Chat and canvas peering variables.
  myChatId:string;
  myCanvasId:string;
  chatPeer:any;
  canvasPeer:any[];

  // Boolean's for sending and recieving;
  sent:boolean;
  recieved:boolean;
  
  teamNum:number;
  // Api module.
  api:ApiModule;

  constructor(public router: Router) { }

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
    this.teamNum = null;
    this.timeLeft = null;
    this.timeOut(); // Update loop.

    if (this.gameD == "grid"){
      this.timeText = "Game Starts in:"
      this.timeVal = 5;
      this.canvas.bg = "grey";
      this.chat.disabled = true;
    }
    
  }

  timeOut() {
    // Temp Variables.
    var sent = this.sent;
    var canvasPeer:any[] = this.canvasPeer;
    var chatPeer:any = this.chatPeer;
    var singlePlayer:boolean = true;
    var user = this.user;
    var team = this.teamNum;

    if (this.sent == false) { // Update for sending peer Data.
      console.log("waiting on send")
      if (this.canvas.myPeerId != "null" && this.chat.myPeerId != "null") {
        this.api.updateUserInfo(this.gameId, this.canvas.myPeerId, this.chat.myPeerId, function (err, res) {
          if (err) console.log("err") 
          else {
            console.log("sent: " + res);
            sent = true;
          }
        });
      }
    } else if (this.recieved == false) { // Update for recieveing peer Data.
      console.log("waiting on recieve");
      this.api.getPlayers(this.gameId, function (err, players) {
        if (err) console.log(err);
        else {
          var otherPlayer = null;
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
          if (singlePlayer == false && otherPlayer.canvasId && otherPlayer.chatId) {
            canvasPeer[0] = otherPlayer.canvasId;
            chatPeer = otherPlayer.chatId;
          }
        }
      });
      if (this.teamNum != null) {
        var t = this.teamNum;
        this.api.getGame(this.gameId, function(err, res) {
          if (err) console.log(err);
          else {
            if (t == 0) {
              if (res.team1Id) { //Change to null
                canvasPeer[1] = res.team1Id;
              }
            }
            else {
              if (res.team2Id) {
                canvasPeer[1] = res.team2Id;
              }
            }
          }
        });
      }
    }
    setTimeout(() => {
      this.teamNum = team;
      this.sent = sent;
      console.log("chat: " + chatPeer);
      console.log("canvas: " + canvasPeer);
      console.log("singleP?: " + singlePlayer);
      this.recieved = (canvasPeer[1] != null && (singlePlayer || (canvasPeer[0] != null && chatPeer != null)));
      if (this.recieved) {
        this.canvasPeer = canvasPeer;
        this.chatPeer = chatPeer;
        this.canvas.singlePlayer = singlePlayer;
        this.canvas.myPeers = this.canvasPeer;
        this.canvas.recieved = this.recieved;
        this.chat.myPeer = this.chatPeer;
        this.chat.recieved = this.recieved;
      }
      console.log("bools: " + this.sent + " "  + this.recieved);
      if (this.sent == false || this.recieved == false) this.timeOut() // Update loop.
      else {
        console.log("all connections made with: " + this.canvasPeer, this.chatPeer);
        this.timer();
      }
    }, 1500);
  }

  countDown(){
    var error:boolean = false;
    var game = null;
    this.api.getGame(this.gameId, function(err, res){
      if (err) { // Unexpected end of game, game Id doesnt exist. Means the game has been stoped serverside, reset.
        console.log(err);
        error = true;
      }
      else {
        game = res;
      }
    });
    setTimeout(() => {
      if (error) { // Redirect back on error.
        this.sent = true;
        this.recieved = true;
        this.timeVal = 0;
        this.router.navigate(['/']); 
      } else {
        this.timeText ="Time Left:";
        var curr = new Date();
        this.timeVal = Math.floor((game.endTime - curr.getTime()) / 1000);
        console.log(curr.getTime(), game.endTime, this.timeVal);
        if (this.timeVal == 0){
          this.timeText ="Game Over!";
          this.timeVal = null;
          this.router.navigate(['/result']);
        } 
        else {
          this.timeVal = this.timeVal - 1;
          console.log(this.timeVal)
          this.countDown();
        }
      }
    }, 1000);
  }
  timer() {
    setTimeout(() => {
      if (this.gameD == "grid"){
        if (this.timeVal == 0){
          this.timeText ="Game Begins!";
          this.canvas.bg = "white";
          this.chat.disabled = false;
          this.timeVal = null;
          this.countDown();
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
