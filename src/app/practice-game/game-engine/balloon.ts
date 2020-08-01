import { GameObject } from "./game-object"
import * as THREE from "three"
import * as _ from "lodash"

export class Balloon extends GameObject {
  private texture: THREE.Texture
  private material: THREE.SpriteMaterial

  private sprite: THREE.Sprite

  private balloonSpeed: number
  private readonly spriteSize = 64

  public start(): THREE.Object3D {
    this.texture = this.gameEngine.getSharedResource(this, "texture",
      () => new THREE.TextureLoader().load("assets/balloon.png"))
    this.material = this.gameEngine.getSharedResource(this, "material",
      () => new THREE.SpriteMaterial({ map: this.texture, color: 0xffffff }))

    this.sprite = new THREE.Sprite(this.material)
    this.sprite.position.x = _.random(-this.width / 2 + this.spriteSize, this.width / 2 - this.spriteSize / 2)
    this.sprite.position.y = -this.height / 2
    this.sprite.scale.x = this.spriteSize
    this.sprite.scale.y = this.spriteSize
    this.balloonSpeed = _.random(20, 100)

    return this.sprite
  }

  update(): void {
    this.sprite.position.y += this.balloonSpeed * this.deltaTime

    if (this.sprite.position.y > this.height / 2 + this.spriteSize / 2) {
      this.gameEngine.removeObject(this)
    }
  }

  destroy(): void {
  }
}

