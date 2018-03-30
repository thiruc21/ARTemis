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
  @ViewChild('title') public label:ElementRef;

  games:string[];
  gamesData:any[];

  user:string;
  check:boolean;
  createD:string;

  private api:ApiModule;

  constructor(public router: Router) { }

  ngOnInit() {
    //Set Default values.
    this.games = [];
    this.gamesData = [];
    this.api = new ApiModule();
    // Get current user.
    this.user = this.api.getCurrentUser();

    if (this.user == "" || this.user == null) { // No users.
      this.router.navigate(['/signin'])
      this.createD = "none";
      this.check = false; // No need to check.
    }
    else {
      this.createD = "grid"; // Im commentint out repeated lines and making it DRY as fk.
      // Temp references to allow usage inside the callback.
      /*var games:string[] = this.games;
      var gamesData:any[] = this.gamesData;
      var check:boolean = this.check;

      this.api.getGames(function(err, res) {
        if (err) console.log(err);
        else if (res) {
          check = true; // Short poll for updates.
          if (res.length > 0) { // If there is a game availabe.
            res.forEach(function(element) {
              if (element.numPlayers < 4){ // No full games.
                games.push(element.title + " by " + element.host);
                gamesData.push(element);
              }
            });
          }
        }
        else check = true;
      });
      setTimeout(() => {
        this.check = check;
        this.timeOut();       // Short poll timer loop.
      },2000);*/
      this.update();
    }
  }
  // Make a new game.
  createGame() { // Temp references.
    var label = this.label.nativeElement.value;
    var api = this.api;
    var check:boolean = this.check;
    // Add game.
    this.api.addGame(label, "null", "null", function(err, res) { //Create game with 2 null peerIds that can be filled later. No generated peerIds will hold value of null.
      if (err) console.log(err);
      else {
        api.pushLobby(res); // Store lobby that user enters into local Storage.
        console.log("successfully created");
        check = false;
      }
    });
    setTimeout(() => {
      this.check = check;
      this.update();
      if (this.check==false) this.router.navigate(['/lobby']); // Navigate.
    },1500);
  }

  clickGame(i) { //User is joing a lobby at index i.
    var check:boolean = this.check;
    this.api.pushLobby(this.gamesData[i]);
    this.api.joinGame(this.gamesData[i]._id, "null", "null", function(err, res){ //Join game with null cavnasId and chatId.
      if (err) console.log(err);
      else {
        console.log('successfully joined.');
        check = false; // No need to check for updates.
      }
    });
    setTimeout(() => {
      this.check = check;
      if (this.check == false) this.router.navigate(['/lobby']); // Navigate.
    },1500);
  }

  timeOut() {
    // Check for new lobbys every 3 seconds.
    console.log("updating thangs.")
    setTimeout(() => {
      if (this.check) this.update(); // Only continue if check is true.
    }, 3000);
  }

  update() {
    // temp values.
    var games:string[] = [];
    var gamesData:any[] = [];
    var check:boolean = this.check;
    this.api.getGames(function(err, res) {
      if (err) {
        console.log(err)
        check = false;
      }
      else {
        if (res && res.length > 0) {
          res.forEach(function(element) {
          if (element.numPlayers < 4 /*&& element.host != user*/){
            games.push(element.title + " by " + element.host);
            gamesData.push(element);
          }
          });
        }
      }
    });
    // Confirm results and update after delay.
    setTimeout(() => {
      if (games.length > 0) {
        this.games = games;
        this.gamesData = gamesData;
        this.check = check;
      };
      if (this.check) this.timeOut(); // Only continue if check is true.
    }, 1000);
  }
}
