import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';
import { GameComponent } from './components/game/game.component';
import { AppRoutingModule } from './/app-routing.module';
import { FormsModule } from '@angular/forms';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ChatComponent } from './components/chat/chat.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    GameComponent,
    CanvasComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
