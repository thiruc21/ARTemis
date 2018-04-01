import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiModule } from '../../api/api.module';
import { Router } from '@angular/router';
@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {
  @ViewChild('canvas1') public canvas1: ElementRef;
  @ViewChild('canvas2') public canvas2: ElementRef;
  running:boolean;
  game:any;
  players: any[];
  team1: string[];
  team2: string[];

  private api:ApiModule;
  constructor(public router: Router) { }
  
  // Values for game start timer.
  timeText:string;
  timeVal:number;

  // Canvas Draw Variables
  private canvasElem: HTMLCanvasElement[];
  private ctx: CanvasRenderingContext2D[];
  strokes: any[];

   // Controls display of lobby and game.
   gameStatus:string;

  // Peering
  public myPeerId: string[];
  public peer: any[];

  // Update loop
  private check:boolean;


  ngOnInit() {
    this.running = true; // Flag for timeout loops. If we ever leave, we make sure this is set to false.
    this.api = new ApiModule();
    this.game = this.api.getLobby();
    this.gameStatus = "not started";
    this.peer = [null, null];
    this.myPeerId = [null, null];
    this.canvasElem = [null, null];
    this.ctx = [null, null];
    this.strokes = [[], []];
    var players = this.players;
    if (this.gameStatus == "not started"){
      this.timeText = "Game Starts in:"
      this.timeVal = 5;
    }
    this.api.getPlayers(this.game._id, function(err, res){
      if (err) console.log(err);
      else players = res;
    });
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
    this.peer[0] = new Peer({host : "lightpeerjs.herokuapp.com",
                          secure : true,
                          path : "/peerjs",
                          port : 443,
                          debug: true});
    this.peer[1] = new Peer({host : "lightpeerjs.herokuapp.com",
                          secure : true,
                          path : "/peerjs",
                          port : 443,
                          debug: true});
    this.peer[0].on('open', function(id){
      console.log(id);
    });
    this.peer[1].on('open', function(id){
      console.log(id);
    });
    setTimeout(() => {
      this.myPeerId[0] = this.peer[0].id;
      this.myPeerId[1] = this.peer[1].id;
      this.api.updateHostInfo(this.game._id, this.myPeerId[0], this.myPeerId[1], function(err) {
        if (err) console.log(err);
        else console.log("sent peerIds");
      });
    },1000);
    // End off with initing the canvasi;
    this.canvasElem[0] = this.canvas1.nativeElement;
    this.canvasElem[1] = this.canvas2.nativeElement;
    this.ctx[0] = this.canvasElem[0].getContext('2d');
    this.ctx[1] = this.canvasElem[1].getContext('2d');
    this.ctx[0].lineJoin = "round";
    this.ctx[1].lineJoin = "round";
    var peerDraw:any[] = this.strokes;
    // Listeners
    this.peer[0].on('connection', function(connection) {
      connection.on('data', function(data){
        while (data.length > 0) {
          var smtn = data.shift();
          peerDraw[0].push(smtn);
        }
      });
    });
    this.peer[1].on('connection', function(connection) {
      connection.on('data', function(data){
        while (data.length > 0) {
          var smtn = data.shift();
          peerDraw[1].push(smtn);
        }
      });
    });
    this.check = true;
    this.keepAlive(0);
    this.keepAlive(1);
    this.timeOut();
    this.timer();
  }
  timeOut() {
    if (this.running) {
      setTimeout(() => {
        this.update(0);
        this.update(1);
        if (this.check) this.timeOut();
      }, 300);
    }
  }
  update(i) {
    setTimeout(() => { // This is here to make the canvas's both update async rather than having it update one first.
      while (this.strokes[i].length > 0) {
        var smtn = this.strokes[i].shift();
        this.draw(i, smtn[0], smtn[1], smtn[2],smtn[3],smtn[4],smtn[5]);
      }
    }, 10);
  }

  draw(i, x, y, px, py, size, color) {
    this.ctx[i].beginPath();
    this.ctx[i].moveTo(px, py);
    this.ctx[i].lineTo(x, y);
    this.ctx[i].lineWidth = size;
    this.ctx[i].strokeStyle = color;
    this.ctx[i].closePath();
    this.ctx[i].stroke();
  
  }


  countDown(){
    var error:boolean = false;
    var game = null;
    this.api.getGame(this.game._id, function(err, res){
      if (err) { // Unexpected end of game, game Id doesnt exist. Means the game has been stoped serverside, reset.
        console.log(err);
        error = true;
      }
      else {
        game = res;
      }
    });
    setTimeout(() => {
      if (error) { // Redirect back on error.
        this.exit();
        this.router.navigate(['/']); 
      } else {
        this.timeText ="Time Left:";
        var curr = new Date().getTime();
        this.timeVal = Math.floor((game.endTime - curr) / 1000);
        console.log(this.timeVal);
        if (this.timeVal <= 0){
          console.log("Canvas elem 1", this.canvasElem[0].toDataURL());
          console.log("Canvas elem 2", this.canvasElem[1].toDataURL());
          //this.exit();
          
        } 
        else {
          this.timeVal = this.timeVal - 1;
          console.log(this.timeVal)
          this.countDown();
        }
      }
    }, 1000);
  }

  timer() {
    setTimeout(() => {
      if (this.gameStatus == "not started"){
        if (this.timeVal == 0){
          this.timeText ="Game Begins!";
          this.gameStatus = "started";
          this.timeVal = null;
          this.countDown();
        } 
        else {
          this.timeVal = this.timeVal - 1;
          console.log(this.timeVal)
          this.timer();
        }
      }
      else this.timer();
    }, 1000);
  }

  keepAlive(i){
    // Keep the peer alive as long as on page
    setTimeout(() => {
       // Connect to other peer and send message
       var conn = this.peer[i].socket.send({
				    type: 'ping'});
       if (this.running) this.keepAlive(i);
    }, 25000);
  }
  exit() { // Standard exit code; Stops all timer flags.
    this.timeText ="Game Over!";
    this.timeVal = null;
    this.running = false;
  }
}
