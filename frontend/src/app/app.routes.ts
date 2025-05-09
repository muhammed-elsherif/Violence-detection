import { Routes } from "@angular/router";
import { ServicesComponent } from "./components/services/services.component";
import { HomeComponent } from "./components/home/home.component";
import { IndustriesComponent } from "./components/industries/industries.component";
import { LoginComponent } from "./components/login/login.component";
import { TechnologyComponent } from "./components/technology/technology.component";
import { SignupComponent } from "./components/signup/signup.component";
import { AdminComponent } from "./layouts/admin/admin.component";
import { UserComponent } from "./layouts/user/user.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { UsersComponent } from "./components/users/users.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { ReportsComponent } from "./components/reports/reports.component";
import { PlacesComponent } from "./components/places/places.component";
import { AnalyticsComponent } from "./components/analytics/analytics.component";
import { UserMagementNavComponent } from "./components/userManagement/user-magement-nav/user-magement-nav.component";
import { CreateUserComponent } from "./components/userManagement/create-user/create-user.component";
import { AboutComponent } from "./components/about/about.component";
import { ContactComponent } from "./components/contact/contact.component";

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },

  // Auth Routes
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },

  // Admin Routes
  {
    path: "admin",
    component: AdminComponent,
    children: [
      { path: "", redirectTo: "analytics", pathMatch: "full" },
      {
        path: "user-magement-nav",
        component: UserMagementNavComponent,
        children: [
          { path: "", redirectTo: "users", pathMatch: "full" },
          { path: "users", component: UsersComponent },
          { path: "create-user", component: CreateUserComponent },
        ],
      },
      { path: "settings", component: SettingsComponent },
      { path: "reports", component: ReportsComponent },
      { path: "analytics", component: AnalyticsComponent },
    ],
  },

  // User Routes
  {
    path: "user",
    component: UserComponent,
    children: [
      { path: "", redirectTo: "home", pathMatch: "full" },
      { path: "home", component: HomeComponent },
      { path: "services", component: ServicesComponent },
      { path: "industries", component: IndustriesComponent },
      { path: "technology", component: TechnologyComponent },
      { path: "about", component: AboutComponent },
      { path: "contact", component: ContactComponent },
    ],
  },
];
