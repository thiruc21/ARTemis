import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiModule } from '../../api/api.module';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {
  @ViewChild('canvas1') public canvas1: ElementRef;
  @ViewChild('canvas2') public canvas2: ElementRef;

  game:any;

  players: any[];
  team1: string[];
  team2: string[];

  private api:ApiModule;

  // Canvas Draw Variables
  private canvasElem: HTMLCanvasElement[];
  private ctx: CanvasRenderingContext2D[];
  strokes: any[];

  // Peering
  public myPeerId: string[];
  public peer: any[];

  // Update loop
  private check:boolean;
  constructor() { }

  ngOnInit() {
    this.api = new ApiModule();
    this.game = this.api.getLobby();
    this.peer = [null, null];
    this.myPeerId = [null, null];
    this.canvasElem = [null, null];
    this.ctx = [null, null];
    this.strokes = [[], []];
    var players = this.players;
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
    setTimeout(() => {
      this.myPeerId[0] = this.peer[0].id;
      this.myPeerId[1] = this.peer[1].id;
      console.log(this.myPeerId);
    },1000);
    // End off with initing the canvasi;
    this.canvasElem[0] = this.canvas1.nativeElement;
    this.canvasElem[1] = this.canvas2.nativeElement;
    this.ctx[0] = this.canvasElem[0].getContext('2d');
    this.ctx[1] = this.canvasElem[1].getContext('2d');

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
    this.timeOut();
  }
  timeOut() {
    setTimeout(() => {
      this.update(0);
      this.update(1);
      if (this.check) this.timeOut();
     }, 300);
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
    this.ctx[i].strokeStyle = color;
    this.ctx[i].lineWidth = size;
    this.ctx[i].closePath();
    this.ctx[i].stroke();
  }
}