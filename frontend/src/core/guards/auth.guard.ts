import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../shared/data/authService.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token && !authService.isTokenExpired(token)) {
    //Añadir pop-ups
    return true;
  } else {
    router.navigate(['/auth']);
    return false;
  }
};