import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { ColorPickerModule } from 'ngx-color-picker';
import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';
import { GameComponent } from './components/game/game.component';
import { AppRoutingModule } from './/app-routing.module';
import { FormsModule } from '@angular/forms';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ChatComponent } from './components/chat/chat.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { PannelComponent } from './components/pannel/pannel.component';
import { HostComponent } from './components/host/host.component';
import { CreditComponent } from './components/credit/credit.component';
import { ResultComponent } from './components/result/result.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    GameComponent,
    CanvasComponent,
    ChatComponent,
    LobbyComponent,
    SigninComponent,
    SignupComponent,
    PannelComponent,
    HostComponent,
    CreditComponent,
    ResultComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule, 
    ColorPickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
