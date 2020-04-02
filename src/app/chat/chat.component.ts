import { Component, OnInit, AfterViewInit } from '@angular/core';
import { WebSocketService } from '../web-socket.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import {Data} from '../models/data.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent  implements OnInit {
user:string = 'User';
messageForm: FormGroup;
pseudoForm: FormGroup;
messages: Data[] = [];
lastMessage;
isFromMe:boolean = true;
messageSent: Data = new Data;

 constructor(
   private webSocketService: WebSocketService,
   private fb: FormBuilder,
   ){

    this.messageForm = this.fb.group({
      message:'',
    });
    
    this.pseudoForm = this.fb.group({
      pseudo:'',
    });
   }
 
  ngOnInit() {
    //listen to event from socket.io server
    this.webSocketService.listen('message').subscribe((data: Data) => {
      this.messages.push(data);
      console.log(this.messages);
    
      if(data.message != this.lastMessage){
        this.isFromMe = false;
      }
    });
    this.webSocketService.listen('connection').subscribe((data) => {
      console.log(data);
    });
    this.webSocketService.listen('disconnect').subscribe((data) => {
      console.log(data);
    });
  }

  onSubmit(message) {
    console.log(message)
    this.messageSent.message = message;
    this.messageForm.reset();
    console.log(this.messageSent);
    this.webSocketService.emit('message', this.messageSent);
    this.lastMessage = message;
    this.isFromMe = true;
  }
  setPseudo(pseudo:string){
    // console.log(pseudo)
    this.messageSent.pseudo = pseudo;
  }
}