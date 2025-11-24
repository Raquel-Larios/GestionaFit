import { ChangeDetectorRef, Component} from '@angular/core';
import { FormField } from '../../assets/models/form-field.interface';
import { FormDinamico } from "../../shared/ui/form-dinamico/form-dinamico";
import { AuthService } from '../../shared/data/authService.service';
import { WelcomeMsgComponent } from "../../shared/ui/welcome-msg.component/welcome-msg.component";
import { Router } from '@angular/router';

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
  isDefaultError: boolean = false;
  token = "";


  constructor(private authService: AuthService, private router: Router, private cd: ChangeDetectorRef){
  };

  onLogin(datos: any){
    this.authService.loginData = datos;
    this.authService.login(this.authService.loginData).subscribe({
      next: (res) => {
        this.successMessage = res.message; 
        const userData = res.data[0];
        this.token= res.data.token;
        const rol = userData.rol;

        this.cd.detectChanges();

        setTimeout(() => {
        this.successMessage = ""; 
        this.cd.detectChanges();
          if (rol === 1) {
            this.router.navigate(['/home']);
          } 
          else if (rol === 0) {
            this.router.navigate(['/mis-rutinas']);
          }
        }, 2000);

      },
      error: (err) => {
        const mensaje = err.error?.message;
        this.errorMessage = mensaje;
        this.isDefaultError = err.error?.code === 'DEFAULT_ERROR';
        this.cd.detectChanges();
      }
    });
    
  }
}
