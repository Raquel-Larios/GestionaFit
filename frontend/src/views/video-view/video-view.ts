import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../../shared/ui/icon-button/icon-button.component';
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/pipes/primeraLetraPipe';
import { catchError, EMPTY, from, of, switchMap, tap, throwError } from 'rxjs';
import { UserService } from '../../shared/data/userService.service';
import { LightboxComponent } from "../../shared/ui/lightbox.component/lightbox.component";
import { Video, VideoOrderOptions } from '../../assets/models/video.interface';
import { VideoService } from '../../shared/data/videoService.service';
import { ImgFallbackDirective } from '../../shared/utils/directives/imgFallback.directive';
import { Ejercicio } from '../../assets/models/ejercicio.interface';
import { ItemLinkConfig, ItemLinkEvent, LinkItem, LinkOption } from '../../assets/models/item-linker.interface';
import { ExerciseService } from '../../shared/data/exerciseService.service';
import { ItemLinkerComponent } from "../../shared/ui/item-linker.component/item-linker.component";
import { mostrarMensajeTemporal } from '../../assets/scripts/pop-up';


@Component({
  selector: 'app-video-view',
  imports: [FontAwesomeModule,
    CommonModule,
    IconButtonComponent,
    OrderOptionComponent,
    PrimeraLetraPipe, LightboxComponent, ImgFallbackDirective, ItemLinkerComponent],
  templateUrl: './video-view.html',
  styleUrl: './video-view.css',
})
export class VideoView {

  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;
  selectedVideoId: number | null = null;
  isAdmin: boolean = false;
  videoOrderOptions = VideoOrderOptions;
  orderOptionSelected: string = 'Antigüedad';
  listaVideos: Video[] = [];
  listaEjercicios: Ejercicio[] = [];
  assignedItems: LinkItem[] = [];
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

  linkerConfig: ItemLinkConfig = {
      listaItems: [],
      multipleLinkChoice: false,
      listaLinkChoices: ['Ejercicio'],
      assignedItems: [],
      selectionService: {
        assign: (data) => this.videoService.crearAsignacionVideo_Ejercicio(data).pipe(
                switchMap(res => from([res])),
                catchError(err => {
                  if (err.status === 409 || err.error?.statusCode === 409) {
                    return from([window.confirm(err.error?.message)]).pipe(
                      switchMap(confirmado => {
                        if (confirmado) {
                          return this.videoService.crearAsignacionVideo_Ejercicio({
                            ...data,
                            forceReplace: true
                          });
                        } else {
                          return EMPTY;
                        }
                      })
                    );
                  }
                  return throwError(() => err);
                })
                ),
        unassign: (data) => this.videoService.eliminarAsignacionVideo_Ejercicio(data.id_video)
      },
      parentType: 'Vídeo'
    }

  constructor(
    private videoService: VideoService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private userService: UserService,
    private exerciseService: ExerciseService
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
      this.videoService.getVideos(false).subscribe({
        next: (datos) => {
          this.listaVideos = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000)
        },
      });
    } else if (this.orderOptionSelected === 'Nombre') {
      this.videoService.getVideos(true).subscribe({
        next: (datos) => {
          this.listaVideos = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000)
        },
      });
    }
    this.exerciseService.getEjercicios(false).subscribe({
      next: (datos) => {
        this.listaEjercicios = datos;
        this.linkerConfig = { ...this.linkerConfig, listaItems: this.listaEjercicios.map((item: any) => ({ id: item.id, nombre: item.nombre_ejercicio }))};
        this.cd.detectChanges();
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.message, 2000)
      },
    });
  }

  onItemsReversed(reversed: Video[]) {
    this.listaVideos = reversed;
  }

  onLoadForId(event: { id: number; choice?: LinkOption | null}) {
      this.onVideoSelected(event.id);
  }

  onVideoSelected(id:number) {
    this.selectedVideoId = id;
    this.videoService.getAsignacionVideo_EjercicioById(id).subscribe({
      next: (datos) => {
        this.assignedItems = datos.map((item: any) => ({ id: item.id_ejercicio, nombre: item.nombre_ejercicio }));
        this.linkerConfig = {
        ...this.linkerConfig,
        assignedItems: datos.map((item: any) => ({ id: item.id_ejercicio, nombre: item.nombre_ejercicio })), 
        };
        this.cd.detectChanges();
      },
      error: (err) => { 
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000)
      }
    });
  }

  onLinkAction(event: ItemLinkEvent) {
    const service = event.action === 'asignar' ? 
      this.linkerConfig.selectionService.assign : 
      this.linkerConfig.selectionService.unassign;
    
    service(event.data).subscribe({
      next: (res) => {
        mostrarMensajeTemporal(res.message, 2000)
        this.onVideoSelected(event.data.id_video); 
      },
      error: (err) => { 
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000)
      }
    });
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
                  ? (data) => this.videoService.crearVideo(data).pipe(tap(res => mostrarMensajeTemporal(res.message, 2000)))
                  : () => EMPTY,
              update:
                option === 'edit' && idSelected
                  ? (data) => this.videoService.actualizarVideo(data).pipe(tap(res => mostrarMensajeTemporal(res.message, 2000)))
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
        mostrarMensajeTemporal(mensaje, 2000)
        this.refrescarVideos();
        setTimeout(() => this.cd.detectChanges());
      },
      error: (err) => {
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000)
      },
    });
  }

  refrescarVideos(): void {
    if (this.orderOptionSelected === 'Antigüedad') {
      this.videoService.getVideos(false).subscribe((data) => {
        this.listaVideos = [...data];
        this.cd.detectChanges();
      });
    } else if (this.orderOptionSelected === 'Nombre') {
      this.videoService.getVideos(true).subscribe((data) => {
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

  trackByVideo(video: any): number {
    return video.id;
  }
}
