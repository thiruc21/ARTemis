import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CanvasComponent } from '../canvas/canvas.component';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  @ViewChild('canvas') public canvas:CanvasComponent;
  @ViewChild('chat') public chat:ChatComponent;
  timeText:string;
  timeVal:number;
  constructor() { }
  ngOnInit() {
    this.timeText = "Game Starts in:"
    this.timeVal = 5;
    this.canvas.bg = "grey";
    this.chat.disabled = true;
    this.timer();
  }
  timer(){
    setTimeout(() => {
      if (this.timeVal == 0){
        this.timeText ="Game Begins!";
        this.canvas.bg = "white";
        this.chat.disabled = false;
        this.timeVal = null;
      } 
      else {
        this.timeVal = this.timeVal - 1;
        console.log(this.timeVal)
        this.timer();
      }
    }, 1000);
  }
}
