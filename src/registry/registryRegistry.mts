import { App } from "../app.mjs"
import { RegistryAddition, RegistryContributions } from "../datapack.mjs"
import { toEntries } from "../utilities.mjs"
import { NamespacedId, Registry, RegistryItem } from "./registry.mjs"

class RegistryRegistry extends Registry<Registry<any>> {
  constructor() {
    super("outstanding:registry")
  }

  loadRegistryContributions(contributions: RegistryContributions, app: App) {
    toEntries(contributions).forEach(([registryId, additions]) => {
      const registry = this.getItem(registryId)
      if (!registry) {
        throw new Error(`Registry ${registryId} does not exist`)
      }
      const registryEntries = Object.entries(additions) as [
        NamespacedId,
        RegistryAddition
      ][]
      const resolvedEntries: [NamespacedId, RegistryItem][] =
        registryEntries.map(([id, addition]) => {
          if (typeof addition === "function") {
            return [id, addition(app)]
          }
          return [id, addition]
        })
      registry.registerEntries(resolvedEntries)
    })
  }
}

export default RegistryRegistry
