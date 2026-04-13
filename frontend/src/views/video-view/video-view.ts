import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../../shared/ui/icon-button/icon-button.component';
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/pipes/primeraLetraPipe';
import { EMPTY, of, switchMap } from 'rxjs';
import { UserService } from '../../shared/data/userService.service';
import { LightboxComponent } from "../../shared/ui/lightbox.component/lightbox.component";
import { Video, VideoOrderOptions } from '../../assets/models/video.interface';
import { VideoService } from '../../shared/data/videoService.service';
import { ImgFallbackDirective } from '../../shared/utils/directives/imgFallback.directive';


@Component({
  selector: 'app-video-view',
  imports: [FontAwesomeModule,
    CommonModule,
    IconButtonComponent,
    OrderOptionComponent,
    PrimeraLetraPipe, LightboxComponent, ImgFallbackDirective],
  templateUrl: './video-view.html',
  styleUrl: './video-view.css',
})
export class VideoView {

  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;
  isAdmin: boolean = false;
  videoOrderOptions = VideoOrderOptions;
  orderOptionSelected: string = 'Antigüedad';
  listaVideos: Video[] = [];
  videoFields: FormField[] = [
    {
      name: 'nombre_video',
      type: 'text',
      label: 'Nombre del video',
      validators: { required: true },
    },
    {
      name: 'enlace_video', type: 'link', label: 'Contenido (enlace)', validators: {required: true},
    }
  ];
  iconoAdd = faPlus;
  iconoModify = faEdit;
  iconoDelete = faTrash;

  constructor(
    private videoService: VideoService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private userService: UserService
  ) {}

  get lightboxItems() {
    return this.listaVideos.map(vid => ({
      src: vid.enlace_video,
      thumb: vid.enlace_video,
      title: vid.nombre_video,
      type: 'video' as const
    }));
  }

  ngOnInit() {
    this.isAdminUser()
    if (this.orderOptionSelected === 'Antigüedad') {
      this.videoService.getVideosAntiguedad().subscribe({
        next: (datos) => {
          this.listaVideos = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener los vídeos.', err);
        },
      });
    } else if (this.orderOptionSelected === 'Nombre') {
      this.videoService.getVideosNombre().subscribe({
        next: (datos) => {
          this.listaVideos = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener los vídeos.', err);
        },
      });
    }
  }

  onItemsReversed(reversed: Video[]) {
    this.listaVideos = reversed;
  }

  abrirModal(option: 'create' | 'edit', idSelected?: number): void {
    this.modalService.setDataFields(this.videoFields);
    this.modalService.setMessages(null, null);

    const video$ =
      option === 'edit' && idSelected
        ? this.videoService.getVideoById(idSelected)
        : of(null);

    video$
      .pipe(
        switchMap((video) => {
          const config: ModalConfig = {
            action: option,
            service: {
              create:
                option === 'create'
                  ? (data) => this.videoService.crearVideo(data)
                  : () => EMPTY,
              update:
                option === 'edit' && idSelected
                  ? (data) => this.videoService.actualizarVideo(data)
                  : () => EMPTY,
            },
            id: idSelected,
            data: video,
          };
          this.modalService.openModal(config);

          return this.modalService.isOpen$;
        }),
      )
      .subscribe((isOpen) => {
        if (!isOpen) {
          this.refrescarVideos();
        }
      });
  }

  deleteVideo(id: number): void {
    this.videoService.borrarVideo(id).subscribe({
      next: (res) => {
        const mensaje = res.message;
        console.log(mensaje);
        this.refrescarVideos();
        setTimeout(() => this.cd.detectChanges());
      },
      error: (err) => {
        const mensaje = err.error?.message;
        console.log(mensaje);
        const isDefault = err.error?.code === 'DEFAULT_ERROR';
      },
    });
  }

  refrescarVideos(): void {
    if (this.orderOptionSelected === 'Antigüedad') {
      this.videoService.getVideosAntiguedad().subscribe((data) => {
        this.listaVideos = [...data];
        this.cd.detectChanges();
      });
    } else if (this.orderOptionSelected === 'Nombre') {
      this.videoService.getVideosNombre().subscribe((data) => {
        this.listaVideos = [...data];
        this.cd.detectChanges();
      });
    }
  }

  onOrderSelected(order: string) {
    this.orderOptionSelected = order;
    this.refrescarVideos();
  }

  abrirLightbox(src: string) {
    this.lightbox.open(src);
  }

  getYoutubeThumbnail(enlace: string): string {
    const videoId = enlace.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|.*[?&]v=))([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'assets/page-not-found.jpg';
  }

  isAdminUser(){
    this.isAdmin = this.userService.currentUserRol === 1
  }

  trackByVideo(index: number, video: any): number {
    return video.id;
  }
}
