import { Component, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { AppComponent } from '../../app.component';
import { ApiModule } from '../../api/api.module';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  games:string[];
  constructor() { }
  private api:ApiModule
  @ViewChild('title') public label:ElementRef;
  ngOnInit() {
    //Load games
    this.api = new ApiModule();
    this.api.getGames(function(err, res){
      if (err) console.log(err);
      else {
        console.log(res);
      }
    });
    this.games = ["fakeGame1", "fakeGame2", "fakeGame3", "fakeGame4","fakeGame5"];
    console.log(this.games);
  }
  createGame(){
    var label = this.label.nativeElement.value;
    this.api.addGame(label, function(err, res){
      if (err) console.log(err);
      else {
        console.log(res);
      }
    })
  }
}
