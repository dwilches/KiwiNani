import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ProgressChartComponent } from "./progress-chart/progress-chart.component"
import { AuthenticationGuard } from "./authentication/authentication.guard"
import { LoginComponent } from "./login/login.component"
import { FormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"


const routes: Routes = [
  {
    path: "main",
    canActivate: [ AuthenticationGuard ],
    component: ProgressChartComponent,
    pathMatch: "full"
  },
  {
    path: "login",
    component: LoginComponent,
    pathMatch: "full"
  },
  {
    path: "game",
    loadChildren: () => import("./game/game.module").then(m => m.GameModule),
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
    RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: "legacy" })
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
