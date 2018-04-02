import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiModule } from '../../api/api.module';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  constructor(public router: Router) { }
  running:boolean;
  leaveD:string;
  leaveText:string;
  result:string;
  resultText:string;
  resultEnd:string;
  count:number;
  game: any;
  user: string;
  api: ApiModule;
  ngOnInit() {
    this.api = new ApiModule();
    this.game = this.api.getLobby();

    this.api.killLobby(); // No more need to come back here if user exits.

    this.user = this.api.getCurrentUser();
    this.running = true;
    this.leaveD = "none";
    this.resultText = "Waiting on results";
    this.resultEnd = "";
    this.leaveText = "Well the host didn't choose a result yet, but you can leave if you want."
    this.count = 20; // Wait that long for results before deciding to allow users to leave.
    this.result = this.resultText + this.resultEnd;

    this.timeOut();
  }

  timeOut() {
    var check = false;
    var win = false;
    var user = this.user;
    this.api.getPlayers(this.game._id, function(err, res){
      if (err) console.log("Could not connect to game\n" + err);
      else {
        var i = 0;
        for (i = 0; i < res.length; i++) { // Go through all players.
          if (res[i].winner) {
            check = true;
            if (user == res[i].user) win = true; // Check if player needs to be kicked.
          }
        }
      }
    }); 
    setTimeout(() => {
      if (check) {
        this.leaveText = "";
        this.count = 0;
        if (win) this.resultText = "You Won!";
        else this.resultText = "You Lost.";
        this.running = false;
      }
      if (this.count == 0) {
        this.leaveD = "flex";
      }
      else this.count = this.count - 1;
      if (this.resultText == "Waiting on results"){
        if (this.resultEnd == "...") {
          this.resultEnd = "";
        }
        else this.resultEnd = this.resultEnd + ".";
      }
      this.result = this.resultText + this.resultEnd;
      if (this.running) this.timeOut();
    } ,1000);
  }

  leave() {
    this.running = false;
    this.router.navigate(['/']);
  }
}
