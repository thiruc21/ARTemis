import { Component, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { CanvasComponent } from '../canvas/canvas.component';
import { ChatComponent } from '../chat/chat.component';
import { ApiModule } from '../../api/api.module';
import { Router } from '@angular/router';
import { PannelComponent } from '../pannel/pannel.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],

})
export class GameComponent implements OnInit {
  // Canvas and chat references.
  @ViewChild('canvas') private canvas:CanvasComponent;
  @ViewChild('chat') private chat:ChatComponent;
  @ViewChild('panel') private panel:PannelComponent;

  // Values for game start timer.
  timeText:string;
  timeVal:number;

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
  private running:boolean;
  private sent:boolean;
  private recieved:boolean;
  
  teamNum:number;
  // Api module.
  api:ApiModule;

  constructor(public router: Router) { }

  ngOnInit() {
    // Load API
    this.api = new ApiModule();

    // Define Variables: 
    this.myCanvasId = null; // Peering Ids
    this.myChatId = null;
    this.canvasPeer = [null , null];
    this.chatPeer = null;

    this.timeText = "Game Starts in:" // timer/countdown variables.
    this.timeVal = 10; // Countdown for game start: Initial is at 10 seconds.
    this.timeLeft = null; // Countdown for game end.

    this.canvas.bg = "grey"; // Canvas and chat child components disabled until game start countdown over.
    this.chat.disabled = true;

    this.teamNum = null; // Player team number, assigned later.

    this.lob = this.api.getLobby();
    this.gameId = this.lob._id;
    this.user = this.api.getCurrentUser();

    // Set Flags
    this.running = true; // Short Poll Running.
    this.sent = false; // Wait on Sending PeerIds. We send first.
    this.recieved = false; // Wait on Recieving PeerIds. Then see if we can recieve the other players PeerIds

    this.timeOut(); // Start Short-Polling
    this.timer(); // Start game start timer.

  }


  // Short Polling Function, waits on child components to produce their peerIds and sends them. 
  // Afterwards it waits on recieveing other users PeerIds and sets it to the child components.
  timeOut() {
    if (this.panel.running != null && (!this.panel.running)) { // Flag from panel to tell if user signed out in lobby.
      this.running = false;
      this.canvas.running = false; // Tell children to stop running.
      this.chat.running = false; 
    }
    if (!this.running) return; // Exit on not running. 

    // Temp Variables for scope issues and checks.
    var user = this.user; // Local reference to user.
    var team = this.teamNum; // Local reference to teamNum which is null on default. This will change in this function.
    var canvasPeer:any[] = this.canvasPeer; // Reference to global canvasPeer.
    var chatPeer:any = this.chatPeer; // Local reference to global chatPeer

    var sent = this.sent; // Local sent flag, default set to same as global.
    var error = false; // Local error flag.
    var singlePlayer:boolean = true; // Single Player flag, assume the user is a single player until proven otherwise.

    if (!this.sent) { // Has not sent yet, try sending.
      console.log("Waiting on send")
      if (this.canvas.myPeerId != "null" && this.chat.myPeerId != null) { // Child components have not generated values.
        this.api.updateUserInfo(this.gameId, this.canvas.myPeerId, this.chat.myPeerId, function (err, res) { // Try Sending data.
          if (err) { // Error, cannot send.
            console.log("Connection with game lost.\n" + err)
            error = true;
          }
          else sent = true;
        });
      }
    } else if (this.recieved == false) { // Has sent, has not recieved, try recieveing.
      console.log("Waiting on recieve");
      this.api.getPlayers(this.gameId, function (err, players) { // Get all players to find our teammate and their peerIds.
        if (err) { // Error, cannot connect.
          console.log("Could not get player peerIds.\n" + err)
          error = true;
        }
        else { // Can get players.
          var otherPlayer = null; // Local var for holding the team mate.
          players.forEach(function(player) { // Loop through until you find your team number.
            if (user == player.user) team = player.teamNum;
          });
          if (team) { // If you don't have your team number already wait for next loop cycle.
            players.forEach(function(player) { // Loop through until you find your team mate.
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
        }
      });
      if (team != null) { // If you have team num.
        this.api.getGame(this.gameId, function(err, res) { // Check for hosts peerId.
          if (err) { // Error, cannot connect.
            console.log("Could not get host peerId.\n" + err)
            error = true;
          }
          else {
            if (team == 0) {
              if (res.team1Id) {
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
      if (error) { this.api.killLobby(); this.exit('/'); return; } // Exit handler. Stops everything.
      this.teamNum = team; // Update teamNum
      this.sent = sent; // Update sent.
      // We have recieved iff we have host canvasId or teammate canvasId and chatId.
      this.recieved = (canvasPeer[1] != null && (singlePlayer || (canvasPeer[0] != null && chatPeer != null)));

      if (this.recieved) { // If we have recieved. Update info.
        this.canvasPeer = canvasPeer;
        this.chatPeer = chatPeer;
        this.canvas.singlePlayer = singlePlayer;
        // Send to child components.
        this.canvas.myPeers = this.canvasPeer;
        this.canvas.recieved = this.recieved;
        this.chat.myPeer = this.chatPeer;
        this.chat.recieved = this.recieved;
      }
      if (this.running && (this.sent == false || this.recieved == false)) this.timeOut() // Update loop.
      else console.log("all connections made with: " + this.canvasPeer, this.chatPeer);
    }, 1500);
  }


  exit(route: string) {
    this.running = false;
    this.canvas.running = false; // Tell children to stop running.
    this.chat.running = false;

    this.router.navigate([route]);
  }

  countDown() { // Game over timer.
    if (!this.running) return; // Exit on not running. 

    var error:boolean = false; // Local error catch flag.
    var game = null; // Temp var to hold game.
    this.api.getGame(this.gameId, function(err, res){
      if (err) { // Unexpected end of game, game Id doesnt exist. Means the game has been stoped serverside, reset.
        console.log(err);
        error = true;
      } else game = res;
    });
    setTimeout(() => {
      if (error) { this.exit('/'); return; } // Redirect back on error.
  
      this.timeText ="Time Left:"; // Change countdown text.
      // Countdown timer logic. It gets time from server so that users cannot cheat.
      var curr = new Date().getTime(); // Generate current time.
      this.timeVal = Math.floor((game.endTime - curr) / 1000); // Subtract servers expected end time with users time.
      if (this.timeVal <= 0) this.exit('/result'); // If countdown is over, go to results.
      else {
        this.timeVal = this.timeVal - 1;
        console.log(this.timeVal)
        this.countDown();
      }
    }, 1000);
  }

  timer() { // Game start timer.
    if (!this.running) return; // Exit on not running. 
    setTimeout(() => {
      if (this.timeVal == 0) { // Game starts, enable all child components, start countdown timer.
        this.timeText ="Game Begins!";
        this.canvas.bg = "white";
        this.chat.disabled = false;
        this.countDown();
      } else { // Keep counting down.
        this.timeVal = this.timeVal - 1;
        this.timer();
      }
    }, 1000);
  }

}
