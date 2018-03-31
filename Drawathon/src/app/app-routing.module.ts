import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import  { GameComponent } from './components/game/game.component';
import { MainComponent } from './components/main/main.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { ChatComponent } from './components/chat/chat.component';
import { SignupComponent } from './components/signup/signup.component'
import { SigninComponent } from './components/signin/signin.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { HostComponent } from './components/host/host.component';
import { CreditComponent } from './components/credit/credit.component';

const routes: Routes = [
  { path: '', component:MainComponent, pathMatch: 'full' } ,
  { path: 'lobby', component:LobbyComponent } ,
  { path: 'game', component:GameComponent } ,
  { path: 'test', component:ChatComponent } ,
  { path: 'signin', component:SigninComponent } ,
  { path: 'host', component:HostComponent } ,
  { path: 'signup', component:SignupComponent } ,
  { path: 'credits', component:CreditComponent }
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
