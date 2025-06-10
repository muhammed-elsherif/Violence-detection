import { Routes } from "@angular/router";
import { ServicesComponent } from "./components/services/services.component";
import { HomeComponent } from "./components/home/home.component";
import { IndustriesComponent } from "./components/industries/industries.component";
import { LoginComponent } from "./components/login/login.component";
import { SignupComponent } from "./components/signup/signup.component";
import { AdminComponent } from "./layouts/admin/admin.component";
import { UserComponent } from "./layouts/user/user.component";
import { UsersComponent } from "./components/users/users.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { ReportsComponent } from "./components/reports/reports.component";
import { AnalyticsComponent } from "./components/analytics/analytics.component";
import { UserMagementNavComponent } from "./components/userManagement/user-magement-nav/user-magement-nav.component";
import { CreateDeveloperComponent } from "./components/userManagement/create-user/create-user.component";
import { AboutComponent } from "./components/about/about.component";
import { ContactComponent } from "./components/contact/contact.component";
import { PurchaseModelComponent } from "./components/purchase-model/purchase-model.component";
import { RequestServiceComponent } from "./components/request-service/request-service.component";
import { MyModelsComponent } from "./components/my-models/my-models.component";
import { AddServiceComponent } from "./components/add-service/add-service.component";
import { ServiceRequestsComponent } from "./components/admin/service-requests/service-requests.component";
import { DeveloperMagementNavComponent } from "./components/userManagement/developer-management-nav/developer-magement-nav.component";
import { AssignedTasksComponent } from "./components/developer/assigned-tasks/assigned-tasks.component";
import { authGuard } from "./core/guards/auth.guard";
import { ProfileComponent } from "./components/profile/profile.component";
import { TestStreamingComponent } from "./components/test-streaming/test-streaming.component";

export const routes: Routes = [
  // Public Routes
  {
    path: "",
    component: UserComponent,
    children: [
      { path: "", redirectTo: "home", pathMatch: "full" },
      { path: "home", component: HomeComponent },
      { path: "services", component: ServicesComponent },
      { path: "industries", component: IndustriesComponent },
      { path: "about", component: AboutComponent },
      { path: "contact", component: ContactComponent },
      { path: "request-custom-service", component: RequestServiceComponent },
      { path: "purchase-model", component: PurchaseModelComponent },
      { path: "profile", component: ProfileComponent },
      { path: "my-models", component: MyModelsComponent },
      { path: "test-streaming", component: TestStreamingComponent },
    ],
  },

  // Auth Routes
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },

  // Admin Routes
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      { path: "", redirectTo: "analytics", pathMatch: "full" },
      { path: "analytics", component: AnalyticsComponent },
      {
        path: "user-magement-nav",
        component: UserMagementNavComponent,
        children: [
          { path: "", redirectTo: "users", pathMatch: "full" },
          { path: "users", component: UsersComponent },
          { path: "developers", component: DeveloperMagementNavComponent },
          { path: "create-user", component: CreateDeveloperComponent },
        ],
      },
      { path: "settings", component: SettingsComponent },
      { path: "reports", component: ReportsComponent },
      { path: "add-service", component: AddServiceComponent },
      { path: "service-requests", component: ServiceRequestsComponent },
    ],
  },

  // Developer Routes
  {
    path: "developer",
    component: AdminComponent,
    data: { role: "DEVELOPER" },
    children: [
      {
        path: "assigned-tasks",
        component: AssignedTasksComponent,
      },
    ],
  },
];
