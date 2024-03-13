import { DatapackManager, KnownDatapack } from "./datapack.mjs"
import { ProviderRegistry } from "./registry/provider.mjs"
import { NamespacedId } from "./registry/registry.mjs"
import {
  AppSettingOwner,
  LocalStorageSettingsProvider,
  SettingsProvider,
  SettingsWithDefaults,
} from "./registry/settingsProvider.mjs"

export class App {
  // @ts-ignore - Living life on the edge
  settings: SettingsWithDefaults // @ts-ignore
  storage: SettingsProvider // @ts-ignore
  datapackManager: DatapackManager

  async init() {
    // Settings provider
    const DEFAULT_SETTINGS = Object.entries({
      useDatapacks: true,
    })

    const settingsProviderRegistry = new ProviderRegistry<SettingsWithDefaults>(
      this
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
      value: new Map<NamespacedId, KnownDatapack>(),
      owner: new AppSettingOwner(),
    })
    this.datapackManager = new DatapackManager(this, knownDatapacks)
    await this.datapackManager.registerBuiltInDatapacks()
  }
}
