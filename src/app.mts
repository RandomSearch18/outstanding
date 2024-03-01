import { DatapackManager } from "./datapack.mjs"
import { ProviderRegistry } from "./registry/provider.mjs"
import {
  LocalStorageSettingsProvider,
  SettingsProvider,
} from "./registry/settingsProvider.mjs"

export class App {
  // @ts-ignore - Living life on the edge
  settings: SettingsProvider // @ts-ignore
  storage: SettingsProvider // @ts-ignore
  datapackManager: DatapackManager

  async init() {
    // Settings provider
    const settingsProviderRegistry = new ProviderRegistry<SettingsProvider>(
      this
    )
    settingsProviderRegistry.register(
      "outstanding:local_storage",
      new LocalStorageSettingsProvider(this, "settings", 10)
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
    this.datapackManager = new DatapackManager(this)
    await this.datapackManager.registerBuiltInDatapacks()
  }
}
