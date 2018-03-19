import { Component, OnInit } from '@angular/core';
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
  api:ApiModule;
  constructor() { }

  ngOnInit() {
    this.api = new ApiModule();
    var lob = this.api.getLobby();


    this.host = lob.host;
    this.team1 = ["Null User", "Null User"];
    this.team2 = ["Null User", "Null User"];
  }

}
