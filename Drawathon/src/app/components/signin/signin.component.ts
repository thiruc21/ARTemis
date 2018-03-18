import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { API } from '../../../assets/js/API';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  api:any;
  @ViewChild('user') private user:ElementRef;
  @ViewChild('pass') private pass:ElementRef;
  
  username:string;
  password:string;
  constructor() { }

  ngOnInit() {
    this.api = new API();
  }
  SignIn() {
    this.username = this.user.nativeElement.value;
    this.password = this.pass.nativeElement.value;
    console.log("Signing in with: " + this.username + " , " + this.password);
    this.api.signin(this.username, this.password, function(err, res){
      if (err) console.log(err);
      else {
        console.log("Success");
      }
    });
  }
}
