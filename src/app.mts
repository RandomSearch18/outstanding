import { DataDirectoryManager } from "./dataDirectory/dataDirManager.mjs"
import { DataDirectoryProvider } from "./dataDirectory/dataDirProvider.mjs"
import { DatapackManager, KnownDatapack } from "./datapack.mjs"
import { ProviderRegistry } from "./registry/provider.mjs"
import RegistryRegistry from "./registry/registryRegistry.mjs"
import {
  AppSettingOwner,
  LocalStorageSettingsProvider,
  SettingsProvider,
  SettingsWithDefaults,
} from "./registry/settingsProvider.mjs"
import { createNanoEvents } from "./utils/nanoEvents"

export type AppEvents = {}

export class App {
  // @ts-ignore - Living life on the edge
  registries: RegistryRegistry // @ts-ignore
  settings: SettingsWithDefaults // @ts-ignore
  storage: SettingsProvider // @ts-ignore
  datapackManager: DatapackManager // @ts-ignore
  dataDirectoryManager: DataDirectoryManager // @ts-ignore

  events = createNanoEvents<AppEvents>()

  async init() {
    window.outstanding = this

    this.registries = new RegistryRegistry()

    // Settings provider
    const DEFAULT_SETTINGS = Object.entries({
      useDatapacks: true,
    })

    const settingsProviderRegistry = this.registries.register(
      new ProviderRegistry<SettingsWithDefaults>(this, "outstanding:settings")
    )
    settingsProviderRegistry.register(
      new SettingsWithDefaults(
        new LocalStorageSettingsProvider(this, "settings", 10),
        new Map(DEFAULT_SETTINGS)
      )
    )
    this.settings = await settingsProviderRegistry
      .getBestProvider()
      .then((p) => p.init())
    console.log("Using settings storage provider", this.settings)

    // Persistant storage provider
    const storageProviderRegistry = this.registries.register(
      new ProviderRegistry<SettingsProvider>(
        this,
        "outstanding:persistant_storage"
      )
    )
    storageProviderRegistry.register(
      new LocalStorageSettingsProvider(this, "internal_data", 10)
    )
    this.storage = await storageProviderRegistry
      .getBestProvider()
      .then((p) => p.init())

    // Data directory manager
    const dataDirectoryProviderRegistry = this.registries.register(
      new ProviderRegistry<DataDirectoryProvider>(
        this,
        "outstanding:data_directory_provider"
      )
    )
    this.dataDirectoryManager = new DataDirectoryManager(
      dataDirectoryProviderRegistry
    )

    // Datapack manager
    if (this.settings.get("useDatapacks")!) {
      await this.initDatapacks()
    }
    // Filesystem Access API data directory provider
  }

  async initDatapacks() {
    const knownDatapacks = this.storage.setIfNonexistent({
      key: "knownDatapacks",
      value: {},
      owner: new AppSettingOwner(),
    })
    this.datapackManager = new DatapackManager(this, knownDatapacks)
    await this.datapackManager.registerBuiltInDatapacks()

    this.datapackManager.handleNewDatapacks()

    const loadedPackIDs = this.datapackManager
      .loadDatapacks()
      .map((datapack) => datapack.id)

    const totalLoadedPacks = loadedPackIDs.length
    console.log(`Loaded ${totalLoadedPacks} datapack(s):`, loadedPackIDs)
  }
}
