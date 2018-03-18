import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { API } from '../assets/js/API';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';
  user:string;
  private api: API
  constructor(
    private location: Location
  ) {};
  ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.api = new API();
    this.user = this.api.getCurrentUser();
  }
}