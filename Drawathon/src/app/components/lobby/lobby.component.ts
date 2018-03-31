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
  @ViewChild('picture') private picture:ElementRef;
  // Variables to hold all related info of the game.
  title:string;
  gameId:string;
  team1:string[];
  team2:string[];
  host:string;
  user:string;

  private api:ApiModule;

  file:File;

  players:any;
  lob:any;

  check:boolean;
  uploaded:boolean;
  left:boolean;
  hostD:string;

  constructor(public router: Router) { }

  ngOnInit() {
    // Set defaults.
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
  
    if (this.host == this.user) this.hostD = "flex";
    else this.team1.push(this.user);

    this.check = true;
    this.timeOut();
  }
  
  timeOut() {
    // Check if new players are in.
    var players = this.players;
    this.api.getPlayers(this.lob._id, function(err, res){
      if (err) console.log(err);
      else players = res;
    });
    var check = this.check;
    if (this.user != this.host) {// If not host, check if game has started.
      this.api.getGame(this.gameId, function(err, res) {
        if (err) console.log(err);
        else {
          if (res.inLobby == false) {
            check = false;
          }
        }
      });
    }
    // Check for new lobbys every two seconds.
    setTimeout(() => {
      this.check = check;
      if (players) {
        this.team1 = [];
        this.team2 = [];
        this.players = players;
        var i = 0;
        for (i = 0; i < this.players.length; i++) {
          if (this.team1.length <= this.team2.length) this.team1.push(this.players[i].user);
          else this.team2.push(this.players[i].user); // Even distribution of teamMembers.
        }
        this.players.forEach(function(player) {
          if (this.user = player.user && (this.user != this.host)) {
            console.log("was kicked in the shin");
            this.left = true;
            this.check = false;
            this.router.navigate(['/']);
          }
        });
      }
      if (this.check) this.timeOut(); // Only continue if check is true.
      else {
        if (this.left == false) this.router.navigate(['/game']);
        
       }  // Else we are done waiting for new game, go forward.
    }, 3000);
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

  startGame() {
    var input:HTMLInputElement = this.picture.nativeElement;
    var uploaded:boolean = false;
    this.file = input.files[0];
    console.log(this.file);
    if (this.file) {
      var check:boolean = this.check;
      if (this.uploaded == false) {
        this.api.uploadImage(this.gameId, this.file, function(err) {
          if (err) console.log(err)
          {
            console.log("starting.");
            uploaded = true;
          }
        });
      }
      this.api.startGame(this.gameId, function(err, res){
        if (err) console.log(err)
        else {
          check = false;
        }
      })
      setTimeout(() => {
        this.check = check;
        this.uploaded = uploaded;
        if (this.check == false && this.uploaded) {
          this.left = true;
          this.router.navigate(['/host']);
        }
      }, 1000);
    }
    else console.log("Please select an image first!");
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
