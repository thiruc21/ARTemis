import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages:string[];
  constructor() { }
  @ViewChild('textarea') public textarea:ElementRef;
  ngOnInit() {
    this.messages = [];
  }
  submitMessage() {
    this.messages.push("Null User: " + this.textarea.nativeElement.value);
    this.textarea.nativeElement.value = "";
  }
}
