import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core"

import * as THREE from "three"
import * as _ from "lodash"
import { Balloon } from "./game-engine/balloon"
import { GameEngine } from "./game-engine/game-engine"

@Component({
  selector: "app-practice-game",
  templateUrl: "./practice-game.component.html",
  styleUrls: [ "./practice-game.component.scss" ]
})
export class PracticeGameComponent implements AfterViewInit, OnDestroy {

  @ViewChild("gameCanvas") gameCanvas: ElementRef
  @ViewChild("gameContainer") gameContainer: ElementRef

  gameEngine: GameEngine

  constructor() {
  }

  ngAfterViewInit(): void {
    this.initScene()
    this.animate()
  }

  ngOnDestroy(): void {
    this.gameEngine.destroy()
  }

  private initScene(): void {
    const width = this.gameContainer.nativeElement.offsetWidth - 20
    const height = this.gameContainer.nativeElement.offsetHeight - 20
    const canvas = this.gameCanvas.nativeElement

    this.gameEngine = new GameEngine(width, height, canvas)
    this.gameEngine.addObject(new Balloon())
  }

  private animate(): void {
    // Stop the animation once OnDestroy has been invoked
    if (!this.gameEngine) {
      return
    }

    requestAnimationFrame(() => this.animate())
    this.gameEngine.update()
  }
}
