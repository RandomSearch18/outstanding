import { DatapackRegistry } from "./registry/datapack.mjs"
import { NamespacedId, RegistryItem } from "./registry/registry.mjs"

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

export class DatapackManager {
  registry: DatapackRegistry
  static readonly PACK_FORMAT = 0

  constructor() {
    this.registry = new DatapackRegistry()
  }

  loadDatapack(exportedPack: DatapackExport) {
    const datapack = new Datapack(exportedPack)
    this.registry.register(datapack.id, datapack)
    console.log(`Loaded datapack ${datapack.id}`)
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

  async loadBuiltInDatapacks() {
    const builtInDatapacks = import.meta.glob("../datapacks/*.mts", {
      import: "default",
    })

    const loadedPackIds: string[] = []
    for (const [path, importSource] of Object.entries(builtInDatapacks)) {
      const defaultImport = await importSource()
      this.assertValidDatapackImport(defaultImport, path)
      const importedData = defaultImport as DatapackExport
      if (!this.shouldLoadDatapack(importedData)) continue
      this.loadDatapack(importedData)
      loadedPackIds.push(importedData.metadata.id)
    }

    if (loadedPackIds.length > 0) {
      console.log(`Loaded built-in datapacks: ${loadedPackIds.join(", ")}`)
    }
  }
}

class DatapackLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DatapackLoadError"
  }
}
