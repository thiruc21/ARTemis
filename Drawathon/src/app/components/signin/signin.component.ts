import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiModule } from '../../api/api.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  @ViewChild('user') private user:ElementRef;
  @ViewChild('pass') private pass:ElementRef;
  apiModule:ApiModule;
  username:string;
  password:string;
  response:string;
  constructor(public router: Router) { }

  ngOnInit() {
    this.apiModule = new ApiModule();
  }
  SignIn(e) {
    this.username = this.user.nativeElement.value;
    this.password = this.pass.nativeElement.value;
    var apiModule = this.apiModule;
    console.log(e);
    e.preventDefault();
    console.log("Signing in with: " + this.username + " , " + this.password);
    var rtr = this.router;
    // Pointer to own class and a function in it which we use in callback
    var me:any = this;
    var respond:(me:this, err:string) => void = this.ServerResponse;
    this.apiModule.signin(this.username, this.password, function(err, res){
      if (err) respond(me, err);
      else {
        console.log(res);
        rtr.navigate(['/']);
      }
    });
  }

  ServerResponse(me, err) {
    me.response = err;
  }
}
