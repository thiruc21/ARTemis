import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ApiModule } from '../../api/api.module';
import { Router } from '@angular/router';
import { PannelComponent } from '../pannel/pannel.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  public start: boolean = false;
  @ViewChild('input') private input: ElementRef;
  @ViewChild('panel') private panel: PannelComponent;
  inputElem: HTMLInputElement;
  // Variables to hold all related info of the game.
  title: string;
  private gameId: string;
  teams: string[][];
  host: string;
  private user: string;

  private api: ApiModule;

  private file: File;

  private players: any;
  private lob: any;

  private uploaded: boolean;
  private left: boolean;
  private running: boolean;

  
  hostD: string;
  startText: string;
  constructor(public router: Router) { }

  ngOnInit() {
    // Load API
    this.api = new ApiModule();

    // Define Variables:
    this.inputElem = this.input.nativeElement;
    this.file = null;
    this.players = [];
    this.teams = [[], []]

    this.hostD = "none";
    this.startText = "Upload"

    this.user = this.api.getCurrentUser();
    this.lob = this.api.getLobby();
    this.host = this.lob.host;
    this.gameId = this.lob._id;
    this.title = this.lob.title;

    // Set Flags
    this.running = true; // Timeout Short Poll is running.
    this.left = false; // Player left on own accord. Used to differentiate start and leave.
    this.uploaded = false; // Host only flag, for if host has uploaded an image. Cannot start without image.

    // Display logic;
    if (this.host == this.user) this.hostD = "flex"; // If host, show host specific data.
    else this.teams[0].push(this.user); // else push this player to an arbitrary team while we wait for update.
    this.timeOut(); // Start Short-Polling
  }
  
  timeOut() { // Short-Poll Function: it check if new players are in and if game has declared as started from host. Redirects to main on disconnect.
    console.log(this.panel.running);
    if (this.panel.running != null && (!this.panel.running)) this.running = false; // Flag from panel to tell if user signed out in lobby.
    if (!this.running) return; // Exit on not running. 
    
    var error: boolean = false; // Local Error flag. On connection error, disconnect and redirect to main.
    var check:boolean = false; // Flag to check if game started.
    var players:any[] = null; // Temp variables to handle scope issues.
    // Get lateset amount of players.
    this.api.getPlayers(this.gameId, function(err, res){
      if (err) { // Error, cannot connect.
        console.log("Connection with game lost.\n" + err)
        error = true;
      }
      else players = res; // Set players = to result.
    });

    if (this.user != this.host && this.running) { // If not host, check if game has started.
      this.api.getGame(this.gameId, function(err, res) {
        if (err) { // Connection lost.
          console.log("Connection with game lost.\n" + err)
          error = true;
        }
        else if (res.inLobby == false) { // Game is in session.
          check = true; // No need to run anymore.
        }
      });
    }

    setTimeout(() => { // Checks for new lobbys every 3 seconds. Since we are using a timeout loop anyway, no need to use await on the functions.
      if (error) { this.api.killLobby(); this.exit('/'); return; } // Exit handler. Stops everything.
      if (check) { this.running = false; }

      if (players) { // If we have results.
        var kicked:boolean = true; // Start with the assumtion that this player is kicked out.
        this.players = players; // Update players.
        this.teams = [[], []]; // Empty teams holder. Will refill next.
        var i = 0; // for For loop.
        if (this.user == this.host) kicked = false; // Host cannot be kicked.
        for (i = 0; i < this.players.length; i++) { // Go through all players.
          this.teams[this.players[i].teamNum].push(this.players[i].user); // Distribution of team members.
          if (this.user == this.players[i].user) kicked = false; // Check if player needs to be kicked.
        }
        if (kicked && this.running) { this.api.killLobby(); this.exit('/'); return; } // If player was kicked exit this.
      }

      if (this.running) this.timeOut(); // Only continue if check is true.
      else if (this.left == false) this.exit('/game') // Game started and the player didn't leave.
    }, 3000);
  }

  exit(route: string) {
    this.running = false;
    this.left = true;
    this.router.navigate([route]);
  }

  leave(){ // Leave button that serves as a delete game for host.
    if (!this.running) return; // Prevents edge cases, like button mashing.

    var check:boolean = false; // Scope for check.
    if (this.host == this.user) {
      this.api.removeGame(this.lob._id, function(err){
        if (err) { // Error, cannot connect.
          console.log("Could not remove game\n" + err)
        }
        else check = true;
      })
    }
    else {
      this.api.leaveGame(this.lob._id, function(err, res){
        if (err) { // Error, cannot connect.
          console.log("Could not leave game.\n" + err)
        }
        else check = true;
      });
    }
    setTimeout(() => {
      if (check) { this.api.killLobby(); this.exit('/'); return; } // Leave.
    },1000);
  }


  uploadImg() {
    var uploaded:boolean = false;
    this.file = this.inputElem.files[0];
    if (this.file) {
        this.api.uploadImage(this.gameId, this.file, function(err) {
        if (err) { // Error, cannot upload.
          console.log("Could not upload image.\n" + err)
        }
        else {
          console.log("Image uploaded");
          uploaded = true;
        }
      });
      setTimeout(() => {
       this.uploaded = uploaded; // Update uploaded flag.
       if (this.uploaded) { // Switch button and input to start game and time val.
         this.startText = "Start";
         this.inputElem.type="number";
         this.inputElem.max = "600";
         this.inputElem.min = "60";
         this.inputElem.placeholder="Seconds";
         this.inputElem.value="60";
       }
      }, 2000);
  } else console.log("Please select an image first!");
}

  startGame() {
    if (this.startText == "Upload"){ // Upload button.
      this.uploadImg();
    } else if (this.uploaded) { // Actually Starting game
    var check:boolean = false;
    var time:number = 60; // Default time in seconds is 60 seconds or a minute.
    if (this.inputElem.value) time = parseInt(this.inputElem.value); // Get time if it exists.
    if (time > 600) time = 600;
    if (time < 60) time = 60;
    this.api.startGame(this.gameId, (time + 20) * 1000,function(err, res){ // Give time in ms.
        if (err) { // Error, cannot connect.
          console.log("Could not start game\n" + err)
        }
        else check = true;
      });
      setTimeout(() => {
        if (check) { this.exit('/host'); }
      }, 1000);
    }
  }

  kick(teamNum, index) { // Host only kic.
    var player:string = this.teams[teamNum][index];
    this.api.kickPlayer(this.gameId, player, function(err, res){
      if (err) { // Error, cannot connect.
        console.log("Could not kick " + player + ".\n" + err)
      }
      else console.log(res);
    });
  }
}
