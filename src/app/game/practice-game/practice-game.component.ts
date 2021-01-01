import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core"

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

  private nextBalloonCreationTime = 0
  private balloonCreationSpeed = 1 // per second

  constructor() {
  }

  ngAfterViewInit(): void {
    const width = this.gameContainer.nativeElement.offsetWidth - 20
    const height = this.gameContainer.nativeElement.offsetHeight - 20
    const canvas = this.gameCanvas.nativeElement

    this.gameEngine = new GameEngine(width, height, canvas, (...args) => this.onUpdate(...args))
    this.gameEngine.start()
  }

  ngOnDestroy(): void {
    this.gameEngine.destroy()
  }

  private onUpdate(width: number, height: number, time: number, deltaTime: number): void {
    if (this.nextBalloonCreationTime < time) {
      this.gameEngine.addObject(new Balloon())
      this.nextBalloonCreationTime = time + 1 / this.balloonCreationSpeed
    }
  }
}
