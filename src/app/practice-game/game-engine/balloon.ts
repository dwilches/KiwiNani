import { GameObject } from "./game-object"
import * as THREE from "three"

export class Balloon extends GameObject {
  private texture: THREE.Texture
  private material: THREE.SpriteMaterial

  private sprite: THREE.Sprite

  public start(): THREE.Object3D {
    this.texture = this.gameEngine.getSharedResource(this, "texture",
      () => new THREE.TextureLoader().load("assets/balloon.png"))
    this.material = this.gameEngine.getSharedResource(this, "material",
      () => new THREE.SpriteMaterial({ map: this.texture, color: 0xffffff }))

    this.sprite = new THREE.Sprite(this.material)
    this.sprite.position.x = 100 // this.xScenePositions[_.random(this.xScenePositions.length - 1)] * this.width / 2
    this.sprite.scale.x = 64
    this.sprite.scale.y = 64

    return this.sprite
  }

  update(): void {
    this.sprite.position.y += 100 * this.deltaTime
  }

  destroy(): void {
  }
}

