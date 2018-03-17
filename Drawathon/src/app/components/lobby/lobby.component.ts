import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  team1:string[];
  team2:string[];
  host:string;
  constructor() { }

  ngOnInit() {
    this.host = "Null Host"
    this.team1 = ["Null User", "Null User"];
    this.team2 = ["Null User", "Null User"];
  }

}
