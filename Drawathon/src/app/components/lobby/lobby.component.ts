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
    this.team1 = [];
    this.team2 = [];
  
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
      if (players) {
        this.team1 = [];
        this.team2 = [];
        this.players = players;
        var i = 0;
        for (i = 0; i < this.players.length; i++) {
          if (this.team1.length <= this.team2.length) this.team1.push(this.players[i].user);
          else this.team2.push(this.players[i].user); // Even distribution of teamMembers.
        }
      }
      this.check = check;
      if (this.check) this.timeOut(); // Only continue if check is true.
      else {
        if (this.left == false) this.router.navigate(['/game']);
       }  // Else we are done waiting for new game, go forward.
    }, 2000);
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
    this.file = input.files[0];
    console.log(this.file);
    if (this.file) {
      var check:boolean = this.check;
      this.api.uploadImage(this.gameId, this.file, function(err) {
        if (err) console.log(err)
        {
          console.log("starting.");
          check = false;
        }
      })
      setTimeout(() => {
        this.check = check;
        if (this.check == false) {
          this.left = true;
          this.router.navigate(['/host']);
        }
      }, 1000);
    }
    else console.log("Please select an image first!");
  }
}
