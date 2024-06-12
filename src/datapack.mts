import { Expression, Key } from "context-keys/dist/types"
import { App } from "./app.mjs"
import { Outstanding } from "./outstandingTypes.mjs"
import { DatapackRegistry } from "./registry/datapack.mjs"
import { NamespacedId, Registry, RegistryItem } from "./registry/registry.mjs"
import { SettingAccessor } from "./registry/settingsProvider.mjs"
import { toEntries } from "./utilities.mjs"
import { createNanoEvents } from "./utils/nanoEvents.mjs"

export type DatapackCallback = (app: App) => unknown

export interface DatapackFunctions {
  postLoad?: DatapackCallback
}

export interface DatapackShortcut {
  callback: (app: App) => void
  shortcut: Key
  when: Expression
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
  registryAdditions?: RegistryContributions
  newRegistries?: NewRegistries
  functions?: DatapackFunctions
  shortcuts?: DatapackShortcut[]

  data?: {
    registryAdditions?: DataDrivenRegistryContributions
  }
}

export type RegistryAddition = (app: App) => RegistryItem
/** A map of new registry item IDs to new registry items that should be registered by the datapack */
export interface RegistryAdditions<R extends keyof Outstanding.Registries> {
  [id: NamespacedId]: (app: App) => Outstanding.RegistryContributionFor<R>
}
export interface NewRegistries {
  [registryId: NamespacedId]: Registry<RegistryItem>
}
export type RegistryContributions = {
  [registry in keyof Outstanding.Registries]?: RegistryAdditions<registry>
} & {
  [otherRegistry: NamespacedId]: RegistryAdditions<any>
}
export type DataDrivenRegistryContributions = {
  [registry in keyof Outstanding.Registries]?: {
    [id: NamespacedId]: Outstanding.DataDrivenContributionFor<registry>
  }
}

export class Datapack {
  id: NamespacedId
  packFormat: number
  display: {
    friendlyName?: string
    description?: string
  }
  code: {
    registryAdditions?: RegistryContributions
    newRegistries?: NewRegistries
    functions?: DatapackFunctions
    shortcuts?: DatapackShortcut[]
  }
  data: {
    registryAdditions?: DataDrivenRegistryContributions
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
    this.code = {
      registryAdditions: exportedPack.registryAdditions,
      newRegistries: exportedPack.newRegistries,
      functions: exportedPack.functions,
      shortcuts: exportedPack.shortcuts,
    }
    this.data = exportedPack.data || {}
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
    knownDatapacks: SettingAccessor<Record<NamespacedId, KnownDatapack>>,
    datapackRegistry: DatapackRegistry
  ) {
    this.app = app
    this.knownDatapacks = knownDatapacks
    this.postLoadCallbacks = new Map()
    this.registry = datapackRegistry

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
    const builtInDatapacks = import.meta.glob("./datapacks/*/index.mts", {
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
    // Load its new registries
    if (datapack.code.newRegistries) {
      for (const [_, registry] of Object.entries(datapack.code.newRegistries)) {
        this.app.registries.register(registry)
      }
    }

    // Load its registry contributions
    if (datapack.code.registryAdditions) {
      this.app.registries.loadRegistryContributions(
        datapack.code.registryAdditions,
        this.app
      )
    }

    // Load its callback functions
    if (datapack.code.functions) {
      if (datapack.code.functions.postLoad) {
        this.postLoadCallbacks.set(
          datapack.id,
          datapack.code.functions.postLoad
        )
      }
    }

    // Load the shortcuts that it wants to add
    if (datapack.code.shortcuts) {
      datapack.code.shortcuts.forEach((shortcut) => {
        this.app.shortcuts.add({
          ...shortcut,
          callback: () => {
            shortcut.callback(this.app)
          },
        })
      })
    }

    // Load its data-driven registry contributions
    if (datapack.data.registryAdditions) {
      this.app.registries.loadDataDrivenRegistryContributions(
        datapack.data.registryAdditions
      )
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
