import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiModule } from '../../api/api.module';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  apiModule:ApiModule;
  @ViewChild('user') private user:ElementRef;
  @ViewChild('pass') private pass:ElementRef;
  
  username:string;
  password:string;
  constructor() { }

  ngOnInit() {
    this.apiModule = new ApiModule();
  }
  SignUp() {
    this.username = this.user.nativeElement.value;
    this.password = this.pass.nativeElement.value;
    console.log("Signing up with: " + this.username + " , " + this.password);
    this.apiModule.signup(this.username, this.password, function(err, res){
      if (err) console.log(err);
      else {
        console.log("Success");
      }
    })
  }
}
