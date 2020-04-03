import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  socket:any;

  readonly uri:string = "https://gc-chat-service.herokuapp.com/";


  constructor() {
    this.socket = io(this.uri);
   }

  listen(eventName : string){
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      })
    });
  }
  
  emit(eventName: string, data?:any){
    this.socket.emit(eventName, data);
  }

  newUserJoined(){
    let observable = new Observable<{user:String, message:String}>( observer => {
      this.socket.on('new user joined', (data) => {
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });
    return observable;
  }
}
