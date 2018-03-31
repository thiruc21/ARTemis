import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiModule } from '../../api/api.module';
import { Router } from '@angular/router';


@Component({
  selector: 'app-pannel',
  templateUrl: './pannel.component.html',
  styleUrls: ['./pannel.component.css']
})

export class PannelComponent implements OnInit {
  user:string;
  private apiModule:ApiModule;
  @ViewChild('signin') private linkin:ElementRef;
  @ViewChild('signout') private linkout:ElementRef;
  constructor(public router: Router) { }

  ngOnInit() {
    var ain:HTMLLinkElement = this.linkin.nativeElement;
    var aout:HTMLLinkElement = this.linkout.nativeElement;
    this.apiModule = new ApiModule();
    this.user = this.apiModule.getCurrentUser();
    if (this.user == "" || this.user == null) {
      ain.style.display = "flex";
      ain.innerHTML = `Sign In`;
      aout.style.display = "none";
      aout.innerHTML = ``;  
    } 
    else {
      ain.style.display = "none";
      ain.innerHTML =``;
      aout.style.display = "flex";
      aout.innerHTML=`Sign Out`;
    }
  }
  signOut() {
    var module = this.apiModule;
    var user = this.user;
    var rtr = this.router;
    this.apiModule.signout(function(err, res){
      if (err) console.log(err);
      else {
        user = module.getCurrentUser();
        
        rtr.navigate(['/']);
        window.location.reload();
      }
    });
  }
}
