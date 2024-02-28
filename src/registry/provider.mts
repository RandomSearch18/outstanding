import { App } from "../app.mjs"
import { NamespacedId, Registry, RegistryItem } from "./registry.mjs"

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

  async findBestProvider(): Promise<T | null> {
    const availableProviders = await this.availableProviders()
    if (availableProviders.length === 0) return null
    const best = availableProviders
      .sort((a, b) => a.priority - b.priority)
      .at(0)
    return best || null
  }

  async getBestProvider(): Promise<T> {
    const best = await this.findBestProvider()
    if (best === null) {
      throw new Error("No available providers")
    }
    return best
  }
}
