import { BrowserModule } from "@angular/platform-browser"
import { NgModule } from "@angular/core"

import { AppComponent } from "./app.component"
import { ProgressDashboardComponent } from "./progress-dashboard/progress-dashboard.component"
import { HttpClientModule } from "@angular/common/http"
import { AppRoutingModule } from "./app-routing/app-routing.module"
import { FormsModule } from "@angular/forms";
import { NavbarComponent } from './navbar/navbar.component'

@NgModule({
  declarations: [
    AppComponent,
    ProgressDashboardComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
