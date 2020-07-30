import { GameObject } from "./game-object"
import * as THREE from "three"

/**
 * Super light Unity-like Game Engine
 *
 * It allows us to make simple games using concepts well-known to people familiar with Unity.
 */
export class GameEngine {
  // Three.js elements
  private readonly scene: THREE.Scene
  private readonly camera: THREE.Camera
  private readonly renderer: THREE.WebGLRenderer

  // Used to store Three.js objects that should be reused by GameObjects, and that should be disposed at the end of the life of this
  // GameEngine. Shared objects are stored in a 2D map. The top-level Map is indexed by the requester's name (the name of the class
  // that requests the shared object). The inner Maps are indexed by resource name (an arbitrary string defined by the requester).
  // The values of the inner
  private sharedResources: Map<string, Map<string, any>> = new Map()

  // List of game objects currently added to the scene. The GameEngine invokes the "update" method of these objects for rendering each
  // frame.
  private readonly gameObjects: GameObject[] = []

  // The time at which the GameEngine started running. The "time" variable starts counting from 0, where 0 means "startTime".
  private readonly startTime: number
  // Time is used to calculate the deltaTime, which is used by the GameObjects to make calculations independent of frame rate.
  // Analogous to Unity's. Moving something at speed "10 * deltaTime" will move it at 10 units per second.
  private time: number
  // Size of the canvas where the scene is rendered
  private readonly width: number
  private readonly height: number

  public constructor(width: number, height: number, nativeElement: HTMLCanvasElement) {
    this.width = width
    this.height = height

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xffffff)

    this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, this.height / -2, 1, 100)
    this.camera.position.z = 5

    this.renderer = new THREE.WebGLRenderer({ canvas: nativeElement })
    this.renderer.setSize(width, height)

    this.startTime = Date.now() / 1000
    this.time = 0
  }

  // Should be invoked on each frame of Three.js to update the scene.
  // This method also invokes the "update" methods of any GameObject that is in the scene.
  public update(): void {
    const newTime = (Date.now() / 1000) - this.startTime
    const deltaTime = newTime - this.time
    this.time = newTime

    this.gameObjects.forEach(go => go.beforeFrame(newTime, deltaTime))
    this.gameObjects.forEach(go => go.update())

    this.renderer.render(this.scene, this.camera)
  }

  // Should be invoked by Three.js when the canvas component is about to be destroyed.
  public destroy(): void {
    this.gameObjects.forEach(go => go.destroy())
    this.sharedResources.forEach(resGroup => {
      resGroup.forEach(res => res.dispose())
    })
    this.scene.dispose()
    this.renderer.dispose()
  }

  public addObject(gameObject: GameObject): void {
    gameObject.initGameObject(this.width, this.height, this)
    const threeJsObject = gameObject.start()

    this.gameObjects.push(gameObject)
    this.scene.add(threeJsObject)
  }

  // GameObjects can use this method to request shared resources. These resources will be alive until the GameEngine instance is disposed.
  // Any GameObject requesting the same resource will receive the same instance. The factory is used to generate the instance of the
  // requested resource if none is available (so, only the first time).
  public getSharedResource<T>(requester: GameObject, name: string, factory: () => T): T {
    if (!this.sharedResources[requester.constructor.name]) {
      this.sharedResources[requester.constructor.name] = {}
    }
    if (!this.sharedResources[requester.constructor.name][name]) {
      this.sharedResources[requester.constructor.name][name] = factory()
    }
    return this.sharedResources[requester.constructor.name][name] as T
  }
}
