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

export const routes: Routes = [
    {path: 'welcome', component: WelcomeView},
    {path: 'auth', component: AuthView},
    {path: 'home', component: HomeView, canActivate: [authGuard]},
    {path: 'clientes', component: UserlistView, canActivate: [authGuard]},
    {path: 'plantillas', component: TemplateView, canActivate: [authGuard]}, //Admin
    {path: 'categorias', component: CategoryView, canActivate: [authGuard]},
    {path: 'ejercicios', component: ExerciseView, canActivate: [authGuard]},
    {path: 'rutinas-clientes', component: TemplateView, canActivate: [authGuard]},
    {path: 'mis-rutinas', component: TemplateView}, //Cliente
    //{path: 'estadisticas', component: },
    {path: 'materiales', component: MaterialView},
    {path: 'demostraciones', component: VideoView},
    {path: '', redirectTo: '/welcome', pathMatch: 'full'}, //Redirije path vacío a welcome por defecto y lo hace solo si es exactamente el path vacío, sino va al de abajo
    {path: '**', redirectTo: '/welcome'}, //Este redirije las páginas no encontradas al inicio (por ahora, más tarde crearé pantalla de error)
];
