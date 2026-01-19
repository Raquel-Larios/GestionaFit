import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../../shared/data/authService.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  if (token && !authService.isTokenExpired(token)) {
    return true;
  } else {
    // Redirige al login
    window.location.href = '/login';
    return false;
  }
};