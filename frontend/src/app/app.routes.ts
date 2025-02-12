import { Routes } from '@angular/router';
import { ServicesComponent } from './components/services/services.component';
import { HomeComponent } from './components/home/home.component';
import { IndustriesComponent } from './components/industries/industries.component';
import { LoginComponent } from './components/login/login.component';
import { TechnologyComponent } from './components/technology/technology.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: 'home', component: HomeComponent},
    {path: 'services', component: ServicesComponent},
    {path: 'industries', component: IndustriesComponent},
    {path: 'technology', component: TechnologyComponent},
    {path: 'login', component: LoginComponent},
];
