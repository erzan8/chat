import { Component, OnInit, AfterViewInit } from '@angular/core';
import { WebSocketService } from '../web-socket.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import {Data} from '../models/data.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent  implements OnInit {
user:string;
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
    this.user = route.snapshot.params['user'];
    this.messageForm = this.fb.group({
      message:'',
    });
    
    // this.pseudoForm = this.fb.group({
    //   pseudo:'',
    // });


   }
 
  ngOnInit() {
    //listen to event from socket.io server
    this.webSocketService.listen('message').subscribe((data: Data) => {
      this.messages.push(data);
      console.log(this.messages);
      if(data.pseudo != this.messageSent.pseudo){
        //If user pseudo equal pseudo of received message --> we don't change the side of the message
        data.isReceived = true;
      } else{
        data.isReceived = false;
      }

      if(this.lastPseudo == data.pseudo){
        console.log(this.lastPseudo);
        this.isSameEmitter = true;
      }
      else{
        this.isSameEmitter = false;
        console.log('false=>', this.lastPseudo);
      }
      //this.lastPseudo = data.pseudo;
    });

    this.webSocketService.listen('connection').subscribe((data) => {
      console.log(data);
    });
    this.webSocketService.listen('disconnect').subscribe((data) => {
      console.log(data);
    });
  }

  onSubmit(message) {
    this.messageSent.message = message;
    this.messageSent.pseudo = this.user;
    this.messageForm.reset();
    console.log(this.messageSent);
    this.webSocketService.emit('message', this.messageSent);
  }
  setPseudo(pseudo:string){
    this.messageSent.pseudo = pseudo;
  }
}