import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ProgressDashboardComponent } from "../progress-dashboard/progress-dashboard.component"
import { AuthenticationGuard } from "../authentication/authentication.guard"
import { LoginComponent } from "../authentication/login.component"
import { FormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"


const routes: Routes = [
  {
    path: "main",
    canActivate: [ AuthenticationGuard ],
    component: ProgressDashboardComponent,
    pathMatch: "full"
  },
  {
    path: "login",
    component: LoginComponent,
    pathMatch: "full"
  },
  {
    path: "**",
    redirectTo: "main"
  }
]

@NgModule({
  declarations: [
    LoginComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AuthenticationGuard
  ]
})
export class AppRoutingModule {
}
