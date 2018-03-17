import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {
  color:string;
  pts:any;
  bound:any;
  pressed:boolean;

  @ViewChild('canvas') public canvas: ElementRef;
  constructor() { }
  private ctx: CanvasRenderingContext2D;


  ngOnInit() {
    this.color  = "black";
    this.pts = {x: 0, y:0, px:0, py:0}
    this.pressed = false;
  }

  ngAfterViewInit() {
    const canvasEvent: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx = canvasEvent.getContext('2d');
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = 10;
    this.bound = canvasEvent.getBoundingClientRect();
  }
  mouseDown = function() {
    this.pressed = true;
  };
  mouseUp = function() {
    this.pressed = false;
  }
  mouseMove(event){
    this.pts.px = this.pts.x;
    this.pts.py = this.pts.y;
    this.pts.x = event.clientX - this.bound.left;
    this.pts.y = event.clientY - this.bound.top;

    if (this.pressed && event.clientX < this.bound.right && event.clientX > this.bound.left && event.clientY < this.bound.bottom && event.clientY > this.bound.top) {
        //draw(api.pushStroke(pts.x, pts.y, pts.px, pts.py, color));
        this.draw();
    }
  }
  
  draw() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.pts.px, this.pts.py);
    this.ctx.lineTo(this.pts.x, this.pts.y);
    this.ctx.strokeStyle = this.color;
    this.ctx.closePath();
    this.ctx.stroke();
  }

  clickColor(color){
    this.color = color;
    console.log(color);
  }

  clickSize(size){
    this.ctx.lineWidth = size;
  }

}

