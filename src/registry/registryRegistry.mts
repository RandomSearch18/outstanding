import { RegistryContributions } from "../datapack.mjs"
import { NamespacedId, Registry, RegistryItem } from "./registry.mjs"

class RegistryRegistry extends Registry<Registry<any>> {
  constructor() {
    super("outstanding:registry")
  }

  loadRegistryContributions(contributions: RegistryContributions) {
    Object.entries(contributions).forEach(
      // @ts-ignore - registryId is always typed as a string, which is too broad
      ([registryId, additions]: [NamespacedId, RegistryAdditions]) => {
        const registry = this.getItem(registryId)
        if (!registry) {
          throw new Error(`Registry ${registryId} does not exist`)
        }
        const registryEntries = Object.entries(additions) as [
          NamespacedId,
          RegistryItem
        ][]
        registry.registerEntries(registryEntries)
      }
    )
  }
}

export default RegistryRegistry
