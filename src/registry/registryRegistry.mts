import { App } from "../app.mjs"
import { RegistryAddition, RegistryContributions } from "../datapack.mjs"
import { toEntries } from "../utilities.mjs"
import { NamespacedId, Registry, RegistryItem } from "./registry.mjs"
import { isFunction, isPlainObject } from "is"

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
          if (isFunction(addition)) {
            return [id, addition(app)]
          }
          if (isPlainObject(addition)) {
            // We assume it's a data-driven addition, perhaps defined using plain JSON
            const decoder = registry.decoder
            if (!decoder) {
              throw new Error(
                `Registry ${registryId} does not have a decoder, so it cannot accept data-driven additions`
              )
            }
            return [id, decoder.decode(addition)]
          }
          throw new Error(
            `Registry ${registryId} addition for ${id} is not a function or plain object`
          )
        })
      registry.registerEntries(resolvedEntries)
    })
  }
}

export default RegistryRegistry
