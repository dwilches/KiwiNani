import * as THREE from "three"
import { GameEngine } from "./game-engine"

/**
 * Life Cycle Hooks:
 *
 *  - initGameObject (only once, should not be overridden by subclasses)
 *  - start (only once)
 *  - beforeFrame (before each frame, should not be overridden by subclasses)
 *  - update (before each frame)
 *  - destroy (only once)
 */
export abstract class GameObject {
  protected time: number
  protected deltaTime: number
  protected width: number
  protected height: number
  protected gameEngine: GameEngine

  // Should only be invoked by GameEngine.
  // Invoked only once, before the start method that is overridden by subclasses.
  public initGameObject(width: number, height: number, gameEngine: GameEngine): void {
    this.width = width
    this.height = height
    this.gameEngine = gameEngine
  }

  // Should only be invoked by GameEngine.
  // Invoked before each frame, before the update method that is overridden by subclasses.
  public beforeFrame(time: number, deltaTime: number): void {
    // Absolute time, counting from when the GameEngine was started
    this.time = time
    // Time difference between the previous frame and the current one. Useful for doing speed calculations independent of frame rate
    this.deltaTime = deltaTime
  }

  // Life-cycle hooks to be overridden by subclasses
  public abstract start(): THREE.Object3D

  public abstract update(): void

  public abstract destroy(): void
}
