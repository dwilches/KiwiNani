import { BrowserModule } from "@angular/platform-browser"
import { NgModule } from "@angular/core"

import { AppComponent } from "./app.component"
import { ProgressChartComponent } from "./progress-chart/progress-chart.component"
import { HttpClientModule } from "@angular/common/http"
import { AppRoutingModule } from "./app-routing.module"
import { FormsModule } from "@angular/forms"
import { NavbarComponent } from "./navbar/navbar.component"

@NgModule({
  declarations: [
    AppComponent,
    ProgressChartComponent,
    NavbarComponent,
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
