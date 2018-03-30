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
  }
  
  private send(method, url, data, callback){
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
          if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
          else {
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
      if (l.length > 1) return decodeURI(l[1]);
      return null;
  }

  public signup = function(username, password, callback) {
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

  public addGame = function(title, pId1, pId2, callback) {
    this.send("POST", "/api/games/", {title: title, team1Id: pId1, team2Id: pId2}, callback);
  }

  public removeGame = function(gameId, callback) {
    this.send("DELETE", "/api/games/", null, callback)
  }

  public joinGame = function(gameId, canvasId, chatId, callback) {
    this.send("POST", "/api/games/" + gameId + "/joined/", {canvasId:canvasId, chatId:chatId}, callback);
  }

  public startGame = function(gameId, callback) {
    console.log("TODO");
  }

//public getPeerIds = function(gameId, callback) { 
  //  this.send("GET", "/api/games/" + gameId + "/joined/ids", null, callback);
  //}

  /* Returns information about the game  (including the host's peerids) */
  public getGameInfo = function(gameId, callback) {
    this.send("GET", "/api/games/"  + gameId + "/" , null, callback);
  }

  /* Returns every player entry for that game (including their peerids) */

  public getPlayers = function(gameId, callback) {
    this.send("GET", "/api/games/" + gameId + "/joined/", null, callback);
  }

  public leaveGame = function(gameId, callback) {
    this.send("DELETE", "/api/games/" + gameId + "/joined/", null, callback);
  }

  public kickPlayer = function(gameId, playerId, callback) {
    this.send("DELETE", "/api/games/" + gameId + "/" + playerId + "/", null, callback);
  } 

  public uploadImage = function(gameId, image, callback) { //Host uploading image
    this.sendFiles("POST", "/api/games/" + gameId + "/image/", {file: image}, callback);
  }
  
  public getImage = function(gameId, callback) { //All players downloading image to draw.
    this.send("GET", "/api/games/" + gameId + "/image/", null, callback);
  }

  /* Patch the host's ids for the game they are hosting */
  public sendHostIds = function(gameId, team1Id, team2Id, callback) {
    this.send("PATCH", "/api/games/" + gameId + "/host/", {team1Id:team1Id, team2Id:team2Id}, callback);
  }

  /* Patch the player's ids for the game thay have joined */
  public sendPeerIds = function(gameId, chatId, canvasId, callback) {
    this.send("PATCH", "/api/games/" + gameId + "/joined/", {chatId:chatId, canvasId:canvasId}, callback);
  }

  /* to be implemented
  public startGame = function(gameId, callback) {
    this.send("POST", "/api/games/" + gameId + "/start/", null, callback);
  }
    }

  public getResults = function(gameId, image, callback) { // Get back results of image comparison. should return null if results not calculated yet.
    this.send("GET", "/api/games/" + gameId + "/joined/result", null, callback);
  }

*/
  //Local Storage
  public pushLobby = function(lobby) {
    localStorage.setItem("lob", JSON.stringify(lobby));
  }

  public getLobby = function() {
      return JSON.parse(localStorage.getItem('lob'));
  }

  public pushStroke = function(x, y, px, py, color) {
      if (!localStorage.getItem("canvas")){
          localStorage.setItem("canvas", JSON.stringify({end: false, strokes: []}));
      }
      var canvas = JSON.parse(localStorage.getItem("canvas"));
      var stroke = {x:x, y:y, px:px, py:py, color:color};
      canvas.strokes.push(stroke);
      localStorage.setItem("canvas", JSON.stringify(canvas));
      return stroke;
  };
  public getStrokes = function() {
      var canvas = JSON.parse(localStorage.getItem("canvas"));
      return canvas.strokes;
  };
 }
