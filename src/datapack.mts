import { App } from "./app.mjs"
import { DatapackRegistry } from "./registry/datapack.mjs"
import { NamespacedId, RegistryItem } from "./registry/registry.mjs"
import { SettingAccessor } from "./registry/settingsProvider.mjs"
import { toEntries } from "./utilities.mjs"
import { createNanoEvents } from "./utils/nanoEvents.mjs"

export type DatapackCallback = (app: App) => unknown

export interface DatapackFunctions {
  postLoad?: DatapackCallback
}

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

  functions?: DatapackFunctions
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
    functions?: DatapackFunctions
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
      functions: exportedPack.functions,
    }
  }
}

export interface KnownDatapack {
  enabled: boolean
}

/** Represents a change of datapack state, e.g. a pack being loaded */
export class DatapackStateEvent extends Event {
  datapack: Datapack

  constructor(datapack: Datapack) {
    super("datapackState")
    this.datapack = datapack
  }
}

export type DatapackManagerEvents = {
  postLoad: (event: DatapackStateEvent) => void
}

export class DatapackManager {
  app: App
  events = createNanoEvents<DatapackManagerEvents>()
  postLoadCallbacks: Map<NamespacedId, DatapackCallback>
  knownDatapacks: SettingAccessor<Record<NamespacedId, KnownDatapack>>
  registry: DatapackRegistry

  static readonly PACK_FORMAT = 0

  constructor(
    app: App,
    knownDatapacks: SettingAccessor<Record<NamespacedId, KnownDatapack>>
  ) {
    this.app = app
    this.knownDatapacks = knownDatapacks
    this.postLoadCallbacks = new Map()
    this.registry = new DatapackRegistry()

    this.events.on("postLoad", (event) => this.onPostDatapackLoad(event))
  }

  onPostDatapackLoad(event: DatapackStateEvent) {
    const callback = this.postLoadCallbacks.get(event.datapack.id)
    if (!callback) return
    callback(this.app)
  }

  registerDatapack(exportedPack: DatapackExport) {
    const datapack = new Datapack(exportedPack)
    this.registry.registerWithId(datapack.id, datapack)
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

    // Load its callback functions
    if (datapack.data.functions) {
      if (datapack.data.functions.postLoad) {
        this.postLoadCallbacks.set(
          datapack.id,
          datapack.data.functions.postLoad
        )
      }
    }

    // Load is now complete
    this.events.emit("postLoad", new DatapackStateEvent(datapack))
  }

  loadDatapacks() {
    const enabledDatapacksRefs = toEntries(this.knownDatapacks.get()).filter(
      ([, datapack]) => datapack.enabled
    )
    const enabledDatapacks = enabledDatapacksRefs.map(
      ([id]) => this.registry.getItem(id)!
    )
    enabledDatapacks.forEach((datapack) => this.loadDatapack(datapack))
    return enabledDatapacks
  }
}

class DatapackLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DatapackLoadError"
  }
}
