import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpHeaders, HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': 'my-auth-token'
  })
};
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class ApiModule implements OnInit {   
  private http:HttpClient;
  ngOnInit() {
  }

  private send2(method, url, data, callback){
    
  }
  constructor() {}
  private sendFiles(method, url, data, callback){
    var formdata = new FormData();
    Object.keys(data).forEach(function(key){
        var value = data[key];
        formdata.append(key, value);
    });
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
        else callback(null, JSON.parse(xhr.responseText));
    };
    xhr.open(method, url, true);
    xhr.send(formdata);
};
  private send(method, url, data, callback){
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
          if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
          else {
            console.log(xhr.responseText);
            callback(null, JSON.parse(xhr.responseText));
          }
      };
      xhr.open(method, url, true);
      if (!data) xhr.send();
      else{
          xhr.withCredentials = true;
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify(data));
      }
  }
  public getCurrentUser = function(){
      var l = document.cookie.split("username=");
      if (l.length > 1) return l[1];
      return null;
  }
  public signup = function(username, password, callback) {
      console.log("API sending " + username +" , " + password);
      this.send("POST", "/signup/", {username: username, password: password}, callback);
  }
  public signin = function(username, password, callback) {
    this.send("POST", "/signin/", {username: username, password: password}, callback);
  }
  public signout = function(callback) {
    this.send("GET", "/signout/", null, callback);
  }
  public getGames = function(callback) {
    this.send("GET", "/api/games/",null, callback);
  }
  public addGame = function(title, callback) {
    this.send("POST", "/api/games", {title: title}, callback);
  }

  public startGame = function() {
      var canvas = JSON.parse(localStorage.getItem("canvas"));
      if (canvas.end) {
          canvas.strokes = [];
          canvas.end = false;
      }
      localStorage.setItem("canvas", JSON.stringify(canvas));
      return canvas;
  };
  public pushStroke = function(x, y, px, py, color) {
      if (!localStorage.getItem("canvas")){
          localStorage.setItem("canvas", JSON.stringify({end: false, strokes: []}));
      }
      var canvas = JSON.parse(localStorage.getItem("canvas"));
      var stroke = {x:x, y:y, px:px, py:py, color:color};
      canvas.strokes.push(stroke);
      localStorage.setItem("canvas", JSON.stringify(canvas));
      console.log("hiiii");
      return stroke;
  };
  public getStrokes = function() {
      var canvas = JSON.parse(localStorage.getItem("canvas"));
      return canvas.strokes;
  };
  public endGame =function() {
      var canvas = JSON.parse(localStorage.getItem("canvas"));
      canvas.strokes = [];
      canvas.end = true;
      localStorage.setItem("canvas", JSON.stringify(canvas));
      return canvas;
  };
 }
