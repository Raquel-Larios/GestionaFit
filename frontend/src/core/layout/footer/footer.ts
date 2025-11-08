import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MediaLink } from '../../../assets/models/media-link.interface';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
@Input() logoUrl: string = "";

links: MediaLink[] = [
  {
    url: "https://www.facebook.com",
    name: "Facebook"
  },
  {
    url: "https://www.instagram.com",
    name: "Instagram"
  },
  {
    url: "https://www.telegram.org",
    name: "Telegram"
  },
    {
    url: "https://whatsapp.com",
    name: "Whatsapp"
  },
    {
    url: "https://www.x.com",
    name: "X"
  },
    {
    url: "https://es.linkedin.com",
    name: "LinkedIn"
  }];

getDomain(url: string): string {
  try{
     return new URL(url).hostname;
  }
  catch (e){
    return url;
  }
 

}

//"https://www.google.com/s2/favicons?domain=facebook.com"
}
