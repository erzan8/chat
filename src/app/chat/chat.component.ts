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
isTyping:boolean = false;
timeout = null;
users: String[] = [];
showUsers:boolean = false;


 constructor(
   private webSocketService: WebSocketService,
   private fb: FormBuilder,
   private route : ActivatedRoute,
   ){
    //get info whe someone join
    this.webSocketService.newUserJoined().subscribe((data) => {
      this.messageArray.push(data);
      this.users.push(data.clients);
      console.log(data.clients);
    });

    this.webSocketService.userLeftRoom().subscribe((data) => {
      this.messageArray.push(data);
      let index = this.users.indexOf(data.user);
      this.users.splice(index, 1);
    });   
    this.user = route.snapshot.params['user'];
    this.room = route.snapshot.params['room'];

    this.messageForm = this.fb.group({
      message:'',
    });
   }
 
  ngOnInit() {
    //Emit that user joined the room
    this.webSocketService.emit('join', {user:this.user, room:this.room});
 
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
      this.isTyping = false;
      //this.lastPseudo = data.pseudo;
    });
    this.webSocketService.listen('typing').subscribe(() => {
      this.isTyping = true;
    })
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
  onType(targetValue){
    // console.log(targetValue);
    //can be improved
    //https://stackoverflow.com/questions/57429144/angular-6-settimeout-and-cleartimeout-error
    if(this.isTyping == false){
      this.isTyping = true;
      this.webSocketService.emit('typing', {user:this.user, room:this.room, typing:true});
      this.timeout =  setTimeout(() => 
        this.webSocketService.emit('typing', {user:this.user, room:this.room, typing:false}) 
        , 1500);
    }
    else{
      clearTimeout(this.timeout);
      this.timeout =  setTimeout(() => 
        this.webSocketService.emit('typing', {user:this.user, room:this.room, typing:false}) 
        , 1500);
    }
  }
  timeoutFunction(){
    this.isTyping = false;
    console.log('istyping =>', this.webSocketService);
    //problem if i use this it's undefined
    this.webSocketService.emit('typing', {user:this.user, room:this.room, typing:false}); 
  }
  toggleUsers(){
    this.showUsers = !this.showUsers;
  }
}