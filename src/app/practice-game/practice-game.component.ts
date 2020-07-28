import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core"

import * as THREE from "three"

@Component({
  selector: "app-practice-game",
  templateUrl: "./practice-game.component.html",
  styleUrls: [ "./practice-game.component.scss" ]
})
export class PracticeGameComponent implements AfterViewInit, OnDestroy {

  scene: THREE.Scene
  camera: THREE.Camera
  renderer: THREE.Renderer
  cube: THREE.Mesh

  private destroyed = false

  @ViewChild("gameCanvas") gameCanvas: ElementRef
  @ViewChild("gameContainer") gameContainer: ElementRef

  constructor() {
  }

  ngAfterViewInit(): void {
    this.initScene()
    this.animate()
  }

  ngOnDestroy(): void {
    this.destroyed = true
  }

  private initScene(): void {
    const width = this.gameContainer.nativeElement.offsetWidth - 20
    const height = this.gameContainer.nativeElement.offsetHeight - 20

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

    this.renderer = new THREE.WebGLRenderer({ canvas: this.gameCanvas.nativeElement })
    this.renderer.setSize(width, height)

    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    this.cube = new THREE.Mesh(geometry, material)
    this.scene.add(this.cube)

    this.camera.position.z = 5
  }

  private animate(): void {
    // Use `destroyed` as otherwise requestAnimationFrame would execute again even after the component has been destroyed
    if (this.destroyed) {
      return
    }
    requestAnimationFrame(() => this.animate())
    this.cube.rotation.x += 0.01
    this.cube.rotation.y += 0.01
    this.renderer.render(this.scene, this.camera)
    console.log("ok pol")
  }
}
