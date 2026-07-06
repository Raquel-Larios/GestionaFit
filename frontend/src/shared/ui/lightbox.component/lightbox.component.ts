import { Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightboxItem } from '../../../assets/models/lightbox-item.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-lightbox',
  imports: [CommonModule],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.css',
})
export class LightboxComponent {
  @Input() items: LightboxItem[] = [];
  isOpen = false;
  isZoomed = false;
  isImage = false;
  currentItem: LightboxItem = { src: '', thumb: '', title: '', type: 'image' };

  constructor(private sanitizer : DomSanitizer) {}

  open(src: string): void {
    this.currentItem = this.items.find(i => i.src === src) || this.items[0];
    this.isOpen = true;
    this.isImageValidation()
  }

  close(): void {
    this.isOpen = false;
    this.isZoomed = false;
  }

  isImageValidation(){
    this.isImage = this.currentItem.type === "image"
  }

  toggleZoom() {
    this.isZoomed = !this.isZoomed;
  }

  getSafeUrl(enlace: string): SafeResourceUrl {
    const match = enlace.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([^&\n?#]+)/);
  const videoId = match ? match[1] : null;

  if (!videoId) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(enlace);
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?fs=1`;
  return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}

