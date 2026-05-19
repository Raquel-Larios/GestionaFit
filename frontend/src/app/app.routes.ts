import { Routes } from '@angular/router';
import { WelcomeView } from '../views/welcome-view/welcome-view';
import { AuthView } from '../views/auth-view/auth-view';
import { HomeView } from '../views/home-view/home-view';
import { TemplateView } from '../views/template-view/template-view';
import { UserlistView } from '../views/userlist-view/userlist-view';
import { CategoryView } from '../views/category-view/category-view';
import { ExerciseView } from '../views/exercise-view/exercise-view';
import { MaterialView } from '../views/material-view/material-view';
import { VideoView } from '../views/video-view/video-view';
import { authGuard } from '../core/guards/auth.guard';
import { adminGuard } from '../core/guards/admin.guard';
import { ErrorView } from '../views/error-view/error-view';
import { RutinasClientesView } from '../views/rutinas-clientes-view/rutinas-clientes-view';
import { MisRutinasView } from '../views/mis-rutinas-view/mis-rutinas-view';

export const routes: Routes = [
    {path: 'welcome', component: WelcomeView},
    {path: 'auth', component: AuthView},
    {path: 'home', component: HomeView, canActivate: [authGuard, adminGuard]},
    {path: 'gestionar/clientes', component: UserlistView, canActivate: [authGuard, adminGuard]},
    {path: 'gestionar/plantillas', component: TemplateView, canActivate: [authGuard, adminGuard]}, //Admin
    {path: 'gestionar/categorias', component: CategoryView, canActivate: [authGuard, adminGuard]},
    {path: 'gestionar/ejercicios', component: ExerciseView, canActivate: [authGuard, adminGuard]},
    {path: 'gestionar/rutinas-clientes', component: RutinasClientesView, canActivate: [authGuard, adminGuard]},
    {path: 'mis-rutinas', component: MisRutinasView, canActivate: [authGuard]}, //Cliente
    //{path: 'estadisticas', component: , canActivate: [authGuard]},
    {path: 'materiales', component: MaterialView, canActivate: [authGuard]},
    {path: 'demostraciones', component: VideoView, canActivate: [authGuard]},
    {path: 'error', component: ErrorView, canActivate: [authGuard]},
    {path: '', redirectTo: '/welcome', pathMatch: 'full'}, //Redirije path vacío a welcome por defecto y lo hace solo si es exactamente el path vacío, sino va al de abajo
    {path: '**', redirectTo: '/error'}, //Este redirije las páginas no encontradas a una página de error
];
