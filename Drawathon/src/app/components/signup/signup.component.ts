import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { API } from '../../../assets/js/API';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  api:any;
  @ViewChild('user') private user:ElementRef;
  @ViewChild('pass') private pass:ElementRef;
  
  username:string;
  password:string;
  constructor() { }

  ngOnInit() {
    this.api = new API();
  }
  SignUp() {
    this.username = this.user.nativeElement.value;
    this.password = this.pass.nativeElement.value;
    console.log("Signing up with: " + this.username + " , " + this.password);
    this.api.signup(this.username, this.password, function(err, res){
      if (err) console.log(err);
      else {
        console.log("Success");
      }
    })
  }
}
