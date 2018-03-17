import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import  { GameComponent } from './components/game/game.component';
import { MainComponent } from './components/main/main.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { ChatComponent } from './components/chat/chat.component';
const routes: Routes = [
  { path: 'game', component:GameComponent } ,
  { path: '', component:MainComponent, pathMatch: 'full' } ,
  { path: 'lobby', component:LobbyComponent },
  { path: 'test', component:ChatComponent }
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
