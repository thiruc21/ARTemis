import { Component, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { AppComponent } from '../../app.component';
import { ApiModule } from '../../api/api.module';
import { Router } from '@angular/router';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  games:string[];
  gamesData:any[];
  user:string;
  check:boolean;
  constructor(public router: Router) { }
  private api:ApiModule

  @ViewChild('title') public label:ElementRef;

  ngOnInit() {
    //Set Default values.
    this.games = [];
    this.gamesData = [];
    this.api = new ApiModule();
    // Get current user.
    this.user = this.api.getCurrentUser();

    if (this.user == "" || this.user == null) { // No users.
      this.check = false; // No need to check.
    }
    else {
      // Temp references to allow usage inside the callback.
      var games:string[] = this.games;
      var gamesData:any[] = this.gamesData;
      var check:boolean = this.check;
      this.api.getGames(function(err, res){
        if (err) console.log(err);
        else if (res) {
          check = true; // Short poll for updates.
          if (res.length > 0) { // If there is a game availabe.
            res.forEach(function(element) {
              games.push(element.title + " by " + element.host);
              gamesData.push(element);
            });
          }
        }
        else check = true;
      });
      this.timeOut(); // Short poll timer loop.
    }
  }
  // Make a new game.
  createGame() { // Temp references.
    var label = this.label.nativeElement.value;
    var api = this.api;
    var rtr = this.router;
    var check:boolean = this.check;
    // Add game.
    this.api.addGame(label, "132", "123", function(err, res) {
      if (err) console.log(err);
      else {
        api.pushLobby(res); // Store lobby that user enters into local Storage.
        this.api.joinGame(res._id, "123", "123", function(err, res){
          if (err) console.log(err);
          else {
            console.log('successfully joined.');
            check = false; // No need to check for updates.
            rtr.navigate(['/lobby']); // Navigate.
          }
        });
      }
    })
  }
  clickGame(i) { //User is joing a lobby at index i.
    var check:boolean = this.check;
    var rtr:Router = this.router;
    this.api.pushLobby(this.gamesData[i]);
    this.api.joinGame(this.gamesData[i]._id, "123", "123", function(err, res){
      if (err) console.log(err);
      else {
        console.log('successfully joined.');
        check = false; // No need to check for updates.
        rtr.navigate(['/lobby']); // Navigate.
      }
    });
  }

  timeOut() {
    // Check for new lobbys every three seconds.
    setTimeout(() => {
      this.update();
      this.check = this.check;
      console.log("im still running");
      if (this.check) this.timeOut(); // Only continue if check is true.
    }, 3000);
  }

  update() {
    // temp values.
    var games:string[] = this.games;
    var gamesData:any[] = this.gamesData;
    this.api.getGames(function(err, res) {
      games = [];
      gamesData = [];
      if (res && res.length > 0) {
        res.forEach(function(element) {
        games.push(element.title + " by " + element.host);
        gamesData.push(element);
        });
      }
    });
    if (games.length > 0) this.games.push(this.games.pop());
  }
}
