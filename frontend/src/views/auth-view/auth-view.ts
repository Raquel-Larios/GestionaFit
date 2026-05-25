import { ChangeDetectorRef, Component} from '@angular/core';
import { FormField } from '../../assets/models/form-field.interface';
import { FormDinamico } from "../../shared/ui/form-dinamico/form-dinamico";
import { AuthService } from '../../shared/data/authService.service';
import { WelcomeMsgComponent } from "../../shared/ui/welcome-msg.component/welcome-msg.component";
import { Router } from '@angular/router';
import { UserService } from '../../shared/data/userService.service';
import { mostrarMensajeTemporal } from '../../assets/scripts/pop-up';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { EMPTY, tap } from 'rxjs';

@Component({
  selector: 'app-auth-view',
  imports: [FormDinamico, WelcomeMsgComponent],
  templateUrl: './auth-view.html',
  styleUrl: './auth-view.css',
})

export class AuthView {

  loginFields: FormField[] = [
    { name: 'email', type: 'email', label: 'Correo Electrónico', validators: { required: true}},
    { name: 'contraseña', type: 'password', label: 'Contraseña', validators: { required: true} }
  ];

  forgottenPassFields: FormField[] = [
    { name: 'email', type: 'email', label: 'Correo Electrónico', validators: { required: true}}
  ]

  errorMessage: string = "";
  successMessage: string = "";
  token = "";


  constructor(private authService: AuthService, private userService: UserService, private modalService: ModalService, private router: Router, private cd: ChangeDetectorRef){
  };

  onLogin(datos: any){
    this.authService.authDataValue = datos;
    this.authService.login().subscribe({
      next: (res) => {
        const decoded = this.authService.currentUserValue;
        this.userService.loadTokenData(decoded.id)
        this.successMessage = res.message; 
        this.token= res.data.token;
        this.cd.detectChanges();
        mostrarMensajeTemporal(this.successMessage, 2000);

        setTimeout(() => {
        this.successMessage = ""; 
        this.cd.detectChanges();
          if (decoded.rol === 1) {
            this.router.navigate(['/home']);
          } 
          else if (decoded.rol === 0) {
            this.router.navigate(['/mis-rutinas']);
          }
        }, 2000);

      },
      error: (err) => {
        const mensaje = err.error?.message;
        this.errorMessage = mensaje;
        mostrarMensajeTemporal(this.errorMessage, 2000);
        this.cd.detectChanges();
      }
    });
  }

  onForgottenPass(){
    this.modalService.setDataFields(this.forgottenPassFields);
    this.modalService.setMessages(null, null);
    
    const config: ModalConfig = {
      action: 'create',
      service: {
        create: (data) => this.authService.forgottenPass(data).pipe(
          tap(res => mostrarMensajeTemporal(res.message, 2000)),
        ),
        update: () => EMPTY,
      },
    };
    this.modalService.openModal(config);

    // Maneja el evento de envío del formulario
    this.modalService.isOpen$.subscribe((isOpen) => {
      if (!isOpen) {
        
      }
    })
    }
}
