import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { PracticeGameComponent } from "./practice-game/practice-game.component"
import { RouterModule, Routes } from "@angular/router"

const routes: Routes = [
  {
    path: "",
    component: PracticeGameComponent
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class GameRoutingModule {
}
