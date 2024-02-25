import { App } from "../app"
import { NamespacedId, Registry, RegistryItem } from "./registry"

export abstract class Provider {
  app: App
  constructor(app: App) {
    this.app = app
  }

  abstract id: NamespacedId
  abstract priority: number
  abstract isAvailable(): Promise<boolean>
  abstract init(): Promise<void>
}

export class ProviderRegistry<T extends Provider> extends Registry<T> {
  constructor(app: App) {
    super()
  }

  async availableProviders(): Promise<T[]> {
    const availableProviders: T[] = []
    for (const provider of this.getItems()) {
      if (await provider.isAvailable()) {
        availableProviders.push(provider)
      }
    }
    return availableProviders
  }

  async selectBestProvider(): Promise<T | null> {
    const availableProviders = await this.availableProviders()
    if (availableProviders.length === 0) return null
    return availableProviders.sort((a, b) => a.priority - b.priority)[0]
  }
}
