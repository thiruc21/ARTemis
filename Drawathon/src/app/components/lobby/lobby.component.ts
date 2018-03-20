import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiModule } from '../../api/api.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  public start:boolean = false;
  // Variables to hold all related info of the game.
  gameId:string;
  team1:string[];
  team2:string[];
  host:string;
  user:string;
  api:ApiModule;
  players:any;
  lob:any;
  check:boolean;
  constructor(public router: Router) { }

  ngOnInit() {
    // Set defaults.
    this.api = new ApiModule();
    this.user = this.api.getCurrentUser();
    this.lob = this.api.getLobby();
    this.players =[];
    this.host = this.lob.host;
    this.team1 = [];
    this.team2 = [];
    this.team1.push(this.user);
    var players = this.players;
    this.api.getPlayers(this.lob._id, function(err, res){
      players = res;
    });
    setTimeout(() => {
      this.check = true;
      if (players) {
        this.team1 = [];
        this.team2 = [];
        this.players = players;
        var i = 0;
        for (i = 0; i < this.players.length; i++) {
          if (this.team1.length <= this.team2.length) this.team1.push(this.players[i].user);
          else this.team2.push(this.players[i].user);
        }
      }
      this.timeOut();
    },1000);
  }
  
  timeOut() {
    var players = this.players;
    this.api.getPlayers(this.lob._id, function(err, res){
      players = res;
    });
    // Check for new lobbys every three seconds.
    setTimeout(() => {
      if (players) {
        this.team1 = [];
        this.team2 = [];
        this.players = players;
        var i = 0;
        for (i = 0; i < this.players.length; i++) {
          if (this.team1.length <= this.team2.length) this.team1.push(this.players[i].user);
          else this.team2.push(this.players[i].user);
        }
      }
      if (this.check) this.timeOut(); // Only continue if check is true.
    }, 3000);
  }
  leave(){
    var check:boolean = this.check;
    this.api.leaveGame(this.lob._id, function(err, res){
      if (err) console.log(err);
      else {
        console.log('successfully left.');
        check = false; // No need to check for updates.
      }
    });
    setTimeout(() => {
      this.check = check;
      if (check == false) this.router.navigate(['/']); // Navigate.
    },1000);
  }
  startGame() {
    this.check = false;
    if (this.check == false) this.router.navigate(['/game']); // Navigate.
  }
}
