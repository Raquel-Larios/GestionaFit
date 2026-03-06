import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../shared/data/authService.service'; 

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if(token && !authService.isTokenExpired(token)){

        const decoded = authService.decodeToken(token);
        const userRole = decoded.rol;
        if (userRole === 1) { //en la base de datos, rol = 1 => Admin
            //Añadir pop-ups
            return true;
        }
        else{
            router.navigate(['auth']);
            return false;
        }
    }

    else{
       router.navigate(['/auth']);
        return false;
    }
};
