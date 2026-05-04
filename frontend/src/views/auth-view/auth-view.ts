import { ChangeDetectorRef, Component} from '@angular/core';
import { FormField } from '../../assets/models/form-field.interface';
import { FormDinamico } from "../../shared/ui/form-dinamico/form-dinamico";
import { AuthService } from '../../shared/data/authService.service';
import { WelcomeMsgComponent } from "../../shared/ui/welcome-msg.component/welcome-msg.component";
import { Router } from '@angular/router';
import { UserService } from '../../shared/data/userService.service';
import { mostrarMensajeTemporal } from '../../assets/scripts/pop-up';

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

  errorMessage: string = "";
  successMessage: string = "";
  token = "";


  constructor(private authService: AuthService, private userService: UserService, private router: Router, private cd: ChangeDetectorRef){
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
}
