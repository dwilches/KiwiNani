import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PracticeGameComponent } from "./practice-game/practice-game.component"
import { GameRoutingModule } from "./game-routing.module"

@NgModule({
  declarations: [
    PracticeGameComponent
  ],
  imports: [
    CommonModule,
    GameRoutingModule
  ]
})
export class GameModule { }
