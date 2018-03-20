import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiModule } from '../../api/api.module';

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
  constructor() { }

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
      this.players = players
      var i = 0;
      for (i = 0; i < this.players.length; i++) {
        if (this.team1.length <= this.team2.length) this.team1.push(this.players[i].user);
        else this.team2.push(this.players[i].user);
      }
    },1000);
  }

}
