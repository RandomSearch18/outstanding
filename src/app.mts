import { DatapackManager, KnownDatapack } from "./datapack.mjs"
import { ProviderRegistry } from "./registry/provider.mjs"
import { NamespacedId } from "./registry/registry.mjs"
import RegistryRegistry from "./registry/registryRegistry.mjs"
import {
  AppSettingOwner,
  LocalStorageSettingsProvider,
  SettingsProvider,
  SettingsWithDefaults,
} from "./registry/settingsProvider.mjs"

export class App {
  // @ts-ignore - Living life on the edge
  registries: RegistryRegistry // @ts-ignore
  settings: SettingsWithDefaults // @ts-ignore
  storage: SettingsProvider // @ts-ignore
  datapackManager: DatapackManager

  async init() {
    window.outstanding = this

    this.registries = new RegistryRegistry()

    // Settings provider
    const DEFAULT_SETTINGS = Object.entries({
      useDatapacks: true,
    })

    const settingsProviderRegistry = new ProviderRegistry<SettingsWithDefaults>(
      this
    )
    this.registries.register(
      settingsProviderRegistry.id,
      settingsProviderRegistry
    )
    settingsProviderRegistry.register(
      "outstanding:local_storage",
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
    const storageProviderRegistry = new ProviderRegistry<SettingsProvider>(this)
    storageProviderRegistry.register(
      "outstanding:local_storage",
      new LocalStorageSettingsProvider(this, "internal_data", 10)
    )
    this.registries.register(
      storageProviderRegistry.id,
      storageProviderRegistry
    )
    this.storage = await storageProviderRegistry
      .getBestProvider()
      .then((p) => p.init())

    // Datapack manager
    if (this.settings.get("useDatapacks")!) {
      await this.initDatapacks()
    }
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

    // TODO: Load the packs!
  }
}
