import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { JwtModule} from '@auth0/angular-jwt';

import { routes } from './app.routes';


import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { PrimeraLetraPipe } from '../shared/utils/primeraLetraPipe';

library.add(faPlus, faEdit, faTrash);

export function tokenGetter() {
  return localStorage.getItem('token');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: ['localhost:3000'], // A cambiar por el dominio que sea una vez se lance
        },
      })
    ),
    PrimeraLetraPipe,
  ]
};


