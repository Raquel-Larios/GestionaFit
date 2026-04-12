import { Directive, ElementRef, HostListener} from "@angular/core";

@Directive({
  selector: 'img[fallback]'
})
export class ImgFallbackDirective {

  fallbackSrc: string = 'assets/img/page-not-found.jpg';

  constructor(private elementRef: ElementRef) {}

  @HostListener('error')
  onLoadError() {
    const img = this.elementRef.nativeElement as HTMLImageElement;
    img.src = this.fallbackSrc;
  } 

  
}