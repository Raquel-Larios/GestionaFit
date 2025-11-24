import { Component } from '@angular/core';
import { NavButtonComponent } from '../../shared/ui/nav-button.component/nav-button.component';
import { WelcomeMsgComponent } from "../../shared/ui/welcome-msg.component/welcome-msg.component";

@Component({
  selector: 'app-welcome-view',
  imports: [NavButtonComponent, WelcomeMsgComponent],
  templateUrl: './welcome-view.html',
  styleUrl: './welcome-view.css',
})

export class WelcomeView{

}
