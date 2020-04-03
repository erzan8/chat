import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { WebSocketService } from '../web-socket.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import {Data} from '../models/data.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent  implements OnInit, AfterViewChecked, OnDestroy {
user:string;
room: string;
messageForm: FormGroup;
pseudoForm: FormGroup;
messages: Data[] = [];
messageSent: Data = new Data;
lastPseudo:string ="";
isSameEmitter:boolean = false;
messageArray: Array<{user:String, message:String}> = [];

 constructor(
   private webSocketService: WebSocketService,
   private fb: FormBuilder,
   private route : ActivatedRoute,
   ){
    this.webSocketService.newUserJoined().subscribe((data) => this.messageArray.push(data));
    this.webSocketService.userLeftRoom().subscribe((data) => this.messageArray.push(data));   
    this.user = route.snapshot.params['user'];
    this.room = route.snapshot.params['room'];
    this.messageForm = this.fb.group({
      message:'',
    });
   }
 
  ngOnInit() {
    //listen to event from socket.io server
    this.webSocketService.listen('message').subscribe((data: Data) => {
      console.log('received =>', data);
      this.messages.push(data);
      if(data.pseudo != this.messageSent.pseudo){
        //If user pseudo equal pseudo of received message --> we don't change the side of the message
        data.isReceived = true;
      } else{
        data.isReceived = false;
      }
      //remove the pseudo on next messages if someone send several messages in a row
      if(this.lastPseudo == data.pseudo){
        this.isSameEmitter = true;
      }
      else{
        this.isSameEmitter = false;
      }
      //this.lastPseudo = data.pseudo;
    });
  }
  ngAfterViewChecked(){
    this.autoScroll();
  }
  ngOnDestroy(){
    this.leaveRoom();
  }

  onSubmit(message) {
    this.messageSent.message = message;
    this.messageSent.pseudo = this.user;
    this.messageSent.room = this.room;
    console.log('messageSent =>', this.messageSent);
    this.messageForm.reset();
    this.webSocketService.emit('message', this.messageSent);
  }
  setPseudo(pseudo:string){
    this.messageSent.pseudo = pseudo;
  }
  autoScroll(){
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  leaveRoom(){
    this.webSocketService.emit('leave', {user:this.user, room:this.room});
  }
}