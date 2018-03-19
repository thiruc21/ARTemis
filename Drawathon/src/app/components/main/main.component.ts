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
  public user:string;
  constructor(public router: Router) { }
  private api:ApiModule
  check:boolean;
  @ViewChild('title') public label:ElementRef;

  ngOnInit() {
    this.check = true;
    //Load games
    this.games = [];
    this.gamesData = [];
    this.api = new ApiModule();
    this.user = this.api.getCurrentUser();
    if (this.user == "" || this.user == null) {
      this.games = [];
      this.gamesData = [];
    }
    else {
      var games:string[] = this.games;
      var gamesData:any[] = this.gamesData;
      this.api.getGames(function(err, res){
        if (err) console.log(err);
        else {
          if (res.length > 0) {
              res.forEach(function(element) {
                games.push(element.title + " by " + element.host);
                gamesData.push(element);
              });
          }
        }
      });
      this.timeOut();
    }
  }

  createGame(){
    var label = this.label.nativeElement.value;
    var api = this.api;
    var rtr = this.router;
    this.api.addGame(label, "132", "123", function(err, res){
      if (err) console.log(err);
      else {
        api.pushLobby(res);
        this.check = false;
        rtr.navigate(['/game']);
      }
    })
  }
  clickGame(i){
    this.api.pushLobby(this.gamesData[i]);
    this.check = false;
    this.router.navigate(['/game']);
  }
  timeOut(){
    // Update messages every second
    setTimeout(() => {
      this.update();
      if (this.check) this.timeOut();
    }, 1000);
  }

  update(){
    var games:string[] = this.games;
    var gamesData:any[] = this.gamesData;
    this.api.getGames(function(err, res) {
      games = [];
      if (res.length > 0) {
        res.forEach(function(element) {
        games.push(element.title + " by " + element.host)
        gamesData.push(element);
        });
      }
    });
    if (games.length > 0) this.games.push(this.games.pop());
  }
}
