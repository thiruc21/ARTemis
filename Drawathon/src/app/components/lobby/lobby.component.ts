import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ApiModule } from '../../api/api.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  public start:boolean = false;
  @ViewChild('input') private input:ElementRef;
  inputElem:HTMLInputElement;
  // Variables to hold all related info of the game.
  title:string;
  gameId:string;
  team1:string[];
  team2:string[];
  host:string;
  user:string;
  running:boolean;

  private api:ApiModule;

  file:File;

  players:any;
  lob:any;

  check:boolean;
  uploaded:boolean;
  left:boolean;
  hostD:string;
  startText:string;
  constructor(public router: Router) { }

  ngOnInit() {
    this.running = true;
    // Set defaults.
    this.inputElem = this.input.nativeElement;
    this.file = null;
    this.left = false;
    this.api = new ApiModule();
    this.user = this.api.getCurrentUser();
    this.lob = this.api.getLobby();
    this.players = [];
    this.hostD = "none";
    this.host = this.lob.host;
    this.gameId = this.lob._id;
    this.title = this.lob.title;
    this.team1 = [];
    this.team2 = [];
    this.uploaded = false;
    this.startText = "Upload"
    if (this.host == this.user) this.hostD = "flex";
    else this.team1.push(this.user);

    this.check = true;
    this.timeOut();
  }
  
  timeOut() {
    // Check if new players are in.
    var error: boolean = false;
    var players:any[] = this.players;
    var rtr = this.router
    this.api.getPlayers(this.lob._id, function(err, res){
      if (err) {
        console.log("Connection with game lost.\n" + err)
        error = true;
      }
      else players = res;
    });
    var check = this.check;
    if (this.user != this.host) {// If not host, check if game has started.
      this.api.getGame(this.gameId, function(err, res) {
        if (err) {
          console.log("Connection with game lost.\n" + err)
          error = true;
        }
        else {
          if (res.inLobby == false) {
            check = false;
          }
        }
      });
    }
    // Check for new lobbys every two seconds.
    setTimeout(() => {
      if (error) {
        this.exit();
        this.router.navigate(['/']);
      }
      this.check = check;
      var kicked:boolean = true;
      if (players) {
        this.team1 = [];
        this.team2 = [];
        this.players = players;
        var i = 0;
        if (this.user == this.host) {
          kicked = false;
        }
        for (i = 0; i < this.players.length; i++) {
          if (this.team1.length <= this.team2.length) this.team1.push(this.players[i].user);
          else this.team2.push(this.players[i].user); // Even distribution of teamMembers.
          if (this.user == this.players[i].user) {
            kicked = false;
          }
        }
        if (kicked) {
          console.log("was kicked in the shin");
          this.left = true;
          this.check = false;
          this.router.navigate(['/main']);
        }
      }
      if (this.check) this.timeOut(); // Only continue if check is true.
      else {
        if (this.left == false) this.router.navigate(['/game']);
        
       }  // Else we are done waiting for new game, go forward.
    }, 3000);
  }
  exit() {
    this.running = false;
    this.check = false;
    this.left = true;
  }
  debug() {
    console.log("clicked debug");
    this.left = false;
    this.check = false;
    this.router.navigate(['/game']);
  }

  leave(){
    var check:boolean = this.check;
    if (this.host == this.user) {
      this.api.removeGame(this.lob._id, function(err){
        if (err) console.log(err);
        else {
          console.log("deleted game");
          check = false;
        }
      })
    }
    else {
      this.api.leaveGame(this.lob._id, function(err, res){
        if (err) console.log(err);
        else {
          console.log('successfully left.');
          check = false; // No need to check for updates.
        }
      });
    }
    setTimeout(() => {
      this.check = check;
      if (this.check == false) {
        this.left = true;
        this.router.navigate(['/']); // Navigate.
      }
    },1000);
  }


  uploadImg() {
    var uploaded:boolean = false;
    this.file = this.inputElem.files[0];
    console.log(this.file);
    if (this.file) {
      var check:boolean = this.check;
      if (this.uploaded == false) {
        this.api.uploadImage(this.gameId, this.file, function(err) {
          if (err) console.log(err)
          else {
            console.log("Image uploaded");
            uploaded = true;
          }
        });
      }
      setTimeout(() => {
       this.uploaded = uploaded;
       if (this.uploaded) {
         this.startText = "Start";
         this.inputElem.type="number";
         this.inputElem.placeholder="Seconds";
         this.inputElem.value="50";
       }
      }, 1500);
  } else console.log("Please select an image first!");
}

  startGame() {
    if (this.startText == "Upload"){
      this.uploadImg();
    } else {
    var check:boolean = this.check;
    var time = 60;
    if (this.inputElem.value) time = parseInt(this.inputElem.value);
    this.api.startGame(this.gameId, time * 1000,function(err, res){ // Give time in ms.
        if (err) console.log(err)
        else {
          check = false;
        }
      })
      setTimeout(() => {
        this.check = check;
        if (this.check == false && this.uploaded) {
          this.left = true;
          this.router.navigate(['/host']);
        }
      }, 2000);
    }
  }
   

  kick(teamNum, index) {
    if (teamNum == 1) {
      console.log("Kicking player " + this.team1[index]);
      this.api.kickPlayer(this.gameId, this.team1[index], function(err, res){
        if (err) console.log(err);
        else console.log(res);
      });
    }
    else {
      console.log("Kicking player " + this.team2[index]);
      this.api.kickPlayer(this.gameId, this.team1[index], function(err, res){
        if (err) console.log(err);
        else console.log(res);
      });
    }
  }
}
