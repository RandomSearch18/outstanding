import { DatapackManager } from "./datapack.mjs"
import { ProviderRegistry } from "./registry/provider.mjs"
import {
  LocalStorageSettingsProvider,
  SettingsProvider,
} from "./registry/settingsProvider.mjs"

export class App {
  // @ts-ignore - Living life on the edge
  settings: SettingsProvider // @ts-ignore
  datapackManager: DatapackManager

  async init() {
    const settingsProviderRegistry = new ProviderRegistry<SettingsProvider>(
      this
    )

    settingsProviderRegistry.register(
      "outstanding:local_storage",
      new LocalStorageSettingsProvider(this, "settings", 10)
    )

    this.settings = await settingsProviderRegistry.getBestProvider()
    console.log("Using settings storage provider", this.settings)
    this.datapackManager = new DatapackManager()

    await this.datapackManager.loadBuiltInDatapacks()
  }
}
