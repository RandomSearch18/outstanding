import { App } from "./app.mjs"
import { DatapackRegistry } from "./registry/datapack.mjs"
import { NamespacedId, RegistryItem } from "./registry/registry.mjs"
import { SettingAccessor } from "./registry/settingsProvider.mjs"

/** An object like this should be the default export of a datapack source file */
interface DatapackExport {
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
interface RegistryAdditions {
  [id: NamespacedId]: RegistryItem
}

export class Datapack {
  id: NamespacedId
  packFormat: number
  display: {
    friendlyName?: string
    description?: string
  }
  data: {
    registryAdditions?: {
      [registry: NamespacedId]: RegistryAdditions
    }
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
  knownDatapacks: SettingAccessor<Map<NamespacedId, KnownDatapack>>
  registry: DatapackRegistry

  static readonly PACK_FORMAT = 0

  constructor(
    app: App,
    knownDatapacks: SettingAccessor<Map<NamespacedId, KnownDatapack>>
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
    if (!(typeof imported === "object")) {
      throw new DatapackLoadError(`Default export of ${name} is not an object`)
    }
    if (imported === null) {
      throw new DatapackLoadError(`Default export of ${name} is null`)
    }
  }

  async registerBuiltInDatapacks() {
    const builtInDatapacks = import.meta.glob("../datapacks/*.mts", {
      import: "default",
    })

    const loadedPackIds: string[] = []
    for (const [path, importSource] of Object.entries(builtInDatapacks)) {
      const defaultImport = await importSource()
      this.assertValidDatapackImport(defaultImport, path)
      const importedData = defaultImport as DatapackExport
      this.registerDatapack(importedData)
      loadedPackIds.push(importedData.metadata.id)
    }

    if (loadedPackIds.length > 0) {
      console.log(`Registered built-in datapacks: ${loadedPackIds.join(", ")}`)
    }
  }

  /** Adds new datapacks to the known datapacks map, and enables it if it should be automatically enabled */
  async handleNewDatapacks() {
    //if (!this.shouldLoadDatapack(importedData)) continue
    const unknownDatapacks = this.registry.getItems().filter((datapack) => {
      return !this.knownDatapacks.get().has(datapack.id)
    })

    // TODO
  }
}

class DatapackLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DatapackLoadError"
  }
}
