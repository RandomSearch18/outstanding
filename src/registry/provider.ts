import { App } from "../app"

export abstract class Provider {
  app: App
  constructor(app: App) {
    this.app = app
  }

  abstract isAvailable(): Promise<boolean>
  abstract init(): Promise<void>
}
