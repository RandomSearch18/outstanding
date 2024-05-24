import { NamespacedId, Registry } from "./registry.mjs"

export abstract class Provider {
  constructor() {}

  abstract id: NamespacedId
  abstract priority: number
  abstract isAvailable(): Promise<boolean>
  abstract init(...args: unknown[]): Promise<this>

  toString() {
    return this.id
  }
}

export class ProviderRegistry<T extends Provider> extends Registry<T> {
  constructor(id: NamespacedId) {
    super(id)
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
      .sort((a, b) => b.priority - a.priority)
      .at(0)
    return best || null
  }

  async getBestProvider(): Promise<T> {
    const best = await this.findBestProvider()
    if (best === null) {
      throw new NoProvidersError("No available providers")
    }
    return best
  }
}

export class NoProvidersError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NoProvidersError"
  }
}
