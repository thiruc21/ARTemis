import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiModule } from '../../api/api.module';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {
  @ViewChild('canvas1') public canvas1Elem:ElementRef;
  @ViewChild('canvas2') public canvas2Elem:ElementRef;

  game:any;

  players:any[];
  team1:string[];
  team2:string[];

  private api:ApiModule;
  constructor() { }

  ngOnInit() {
    this.api = new ApiModule();
    this.game = this.api.getLobby();
    var players = this.players;
    this.api.getPlayers(this.game._id, function(err, res){
      if (err) console.log(err);
      else players = res;
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
          else this.team2.push(this.players[i].user); // Even distribution of teamMembers.
        }
      }
    }, 500);
  }

}
