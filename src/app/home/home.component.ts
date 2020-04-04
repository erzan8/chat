import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  pseudoForm: FormGroup;
  user:String;
  room:String;

 
 constructor(
   private fb: FormBuilder,
   private webSocketService: WebSocketService,
   ){

    this.pseudoForm = this.fb.group({
      pseudo:'',
    });
   }

  ngOnInit(): void {
   
  }
}
