import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { API } from '../../../assets/js/API';
@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})
export class SignComponent implements OnInit {
  api:any;
  @ViewChild('user') private user:ElementRef;
  @ViewChild('pass') private pass:ElementRef;
  username:string;
  password:string;
  constructor() { }
  SignUp() {
    this.api = new API();
    this.api.signUp(this.username, this.password, function(err){
      if (err) console.log(err);
      else {
        console.log("Success");
      }
    })
  }

  ngOnInit() {
    this.username = this.user.nativeElement.value;
    this.password = this.pass.nativeElement.value;
  }

}
