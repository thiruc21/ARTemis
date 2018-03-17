import { Component, OnInit, Output } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  games:string[];
  constructor() { }
  
  ngOnInit() {
    //Load games
    this.games = ["fakeGame1", "fakeGame2", "fakeGame3", "fakeGame4","fakeGame5"];
    console.log(this.games);
  }
  
  clickGame(game){
    
  }

}
