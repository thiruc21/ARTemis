import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ApiModule } from './api/api.module';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';
  user:string;
  private apiModule:ApiModule;
  constructor(
    private location: Location
  ) {};
  ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.apiModule = new ApiModule
    this.user = this.apiModule.getCurrentUser();
  }
}