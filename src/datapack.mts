import { App } from "./app.mjs"
import { DatapackRegistry } from "./registry/datapack.mjs"
import { NamespacedId, RegistryItem } from "./registry/registry.mjs"
import { SettingAccessor } from "./registry/settingsProvider.mjs"

/** An object like this should be the default export of a datapack source file */
export interface DatapackExport {
  metadata: {
    id: NamespacedId
    packFormat: number
    friendlyName?: string
    description?: string
  }

  /** A map of registry IDs to {@link RegistryAdditions} objects containing items to be added to the registry */
  registryAdditions?: {
    [registry: NamespacedId]: RegistryAdditions
  }
}

/** A map of new registry item IDs to new registry items that should be registered by the datapack */
export interface RegistryAdditions {
  [id: NamespacedId]: RegistryItem
}

export type RegistryContributions = Record<NamespacedId, RegistryAdditions>

export class Datapack {
  id: NamespacedId
  packFormat: number
  display: {
    friendlyName?: string
    description?: string
  }
  data: {
    registryAdditions?: RegistryContributions
  }
  exportedSource: DatapackExport

  constructor(exportedPack: DatapackExport) {
    this.exportedSource = exportedPack
    this.id = exportedPack.metadata.id
    this.packFormat = exportedPack.metadata.packFormat
    this.display = {
      friendlyName: exportedPack.metadata.friendlyName,
      description: exportedPack.metadata.description,
    }
    this.data = {
      registryAdditions: exportedPack.registryAdditions,
    }
  }
}

export interface KnownDatapack {
  enabled: boolean
}

export class DatapackManager {
  app: App
  knownDatapacks: SettingAccessor<Record<NamespacedId, KnownDatapack>>
  registry: DatapackRegistry

  static readonly PACK_FORMAT = 0

  constructor(
    app: App,
    knownDatapacks: SettingAccessor<Record<NamespacedId, KnownDatapack>>
  ) {
    this.app = app
    this.knownDatapacks = knownDatapacks
    this.registry = new DatapackRegistry()
  }

  registerDatapack(exportedPack: DatapackExport) {
    const datapack = new Datapack(exportedPack)
    this.registry.register(datapack.id, datapack)
    console.log(`Registered datapack ${datapack.id}`)
  }

  shouldLoadDatapack(datapack: DatapackExport) {
    return datapack.metadata.packFormat === DatapackManager.PACK_FORMAT
  }

  assertValidDatapackImport(
    imported: unknown,
    name: string
  ): asserts imported is DatapackExport {
    if (typeof imported === "undefined") {
      throw new DatapackLoadError(
        `Datapack file ${name} doesn't have a default export`
      )
    }
    if (!(typeof imported === "object")) {
      throw new DatapackLoadError(`Default export of ${name} is not an object`)
    }
    if (imported === null) {
      throw new DatapackLoadError(`Default export of ${name} is null`)
    }
  }

  async registerBuiltInDatapacks() {
    const builtInDatapacks = import.meta.glob("./datapacks/*.mts", {
      import: "default",
    })

    const registeredPackIds: string[] = []
    for (const [path, importSource] of Object.entries(builtInDatapacks)) {
      const defaultImport = await importSource()
      this.assertValidDatapackImport(defaultImport, path)
      const importedData = defaultImport as DatapackExport
      this.registerDatapack(importedData)
      registeredPackIds.push(importedData.metadata.id)
    }

    if (registeredPackIds.length > 0) {
      console.log(
        `Registered built-in datapacks: ${registeredPackIds.join(", ")}`
      )
    }
  }

  /** Adds new datapacks to the known datapacks map, and enables it if it should be automatically enabled */
  async handleNewDatapacks() {
    const unknownDatapacks = this.registry.getItems().filter((datapack) => {
      return !(datapack.id in this.knownDatapacks.get())
    })

    unknownDatapacks.forEach((datapack) => {
      if (!this.shouldLoadDatapack(datapack.exportedSource)) {
        this.knownDatapacks.get()[datapack.id] = { enabled: false }
        console.warn(
          `Disabled datapack with unsupported pack format: ${datapack.id}`
        )
        return
      }
      this.knownDatapacks.get()[datapack.id] = { enabled: true }
    })
  }

  loadDatapack(datapack: Datapack) {
    // Load its registry contributions
    if (datapack.data.registryAdditions) {
      this.app.registries.loadRegistryContributions(
        datapack.data.registryAdditions
      )
    }
  }
}

class DatapackLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DatapackLoadError"
  }
}
