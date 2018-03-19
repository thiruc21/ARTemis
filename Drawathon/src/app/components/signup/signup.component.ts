import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiModule } from '../../api/api.module';
import { Router } from '@angular/router';

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
  constructor(public router: Router) { }

  ngOnInit() {
    this.apiModule = new ApiModule();
  }
  SignUp(e) {
    e.preventDefault();
    this.username = this.user.nativeElement.value;
    this.password = this.pass.nativeElement.value;
    console.log("Signing up with: " + this.username + " , " + this.password);
    var rtr = this.router;
    this.apiModule.signup(this.username, this.password, function(err, res){
      if (err) console.log("access-denied");
      else {
        console.log(res);
        rtr.navigate(['/']);
      }
    })
  }
}