import { BrowserModule } from "@angular/platform-browser"
import { NgModule } from "@angular/core"

import { AppComponent } from "./app.component"
import { WANIKANI_TOKEN } from "./wanikani.service"
import { ProgressDashboardComponent } from "./progress-dashboard/progress-dashboard.component"
import { HttpClientModule } from "@angular/common/http"

@NgModule({
  declarations: [
    AppComponent,
    ProgressDashboardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [
    { provide: WANIKANI_TOKEN, useValue: "TOKEN_HERE" }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
