import { App } from "../app.mjs"
import {
  DataDrivenRegistryContributions,
  RegistryAddition,
  RegistryContributions,
} from "../datapack.mjs"
import { toEntries } from "../utilities.mjs"
import { NamespacedId, Registry, RegistryItem } from "./registry.mjs"
import { isFunction, isPlainObject } from "is"

class RegistryRegistry extends Registry<Registry<any>> {
  constructor() {
    super("outstanding:registry")
  }

  /** Loads "data-driven" registry additions, perhaps defined with plain JSON in a datapack */
  loadDataDrivenRegistryContributions(
    contributions: DataDrivenRegistryContributions
  ) {
    toEntries(contributions).forEach(([registryId, additions]) => {
      const registry = this.getItem(registryId)
      if (!registry) {
        throw new Error(`Registry ${registryId} does not exist`)
      }
      const registryEntries = toEntries(additions)
      const resolvedEntries: [NamespacedId, RegistryItem][] =
        registryEntries.map(([id, addition]) => {
          const decoder = registry.decoder
          if (!decoder) {
            throw new Error(
              `Registry ${registryId} does not have a decoder, so it cannot accept data-driven additions`
            )
          }
          return [id, decoder.decode(addition)]
        })
      registry.registerEntries(resolvedEntries)
    })
  }

  /** Loads registry contributions defined in JavaScript code */
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
        registryEntries.map(([id, addition]) => [id, addition(app)])
      registry.registerEntries(resolvedEntries)
    })
  }
}

export default RegistryRegistry
