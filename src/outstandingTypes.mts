import { DataDirectoryProvider } from "./dataDirectory/dataDirProvider.mjs"
import { DataDrivenDecoder } from "./registry/dataDrivenRegistries.mjs"
import { DatapackRegistry } from "./registry/datapack.mjs"
import { ProviderRegistry } from "./registry/provider.mjs"
import {
  SettingsProvider,
  SettingsWithDefaults,
} from "./registry/settingsProvider.mjs"
import { ViewRegistry } from "./registry/view.mjs"

export namespace Outstanding {
  export type Registries = {
    "outstanding:settings": ProviderRegistry<SettingsWithDefaults>
    "outstanding:persistant_storage": ProviderRegistry<SettingsProvider>
    "outstanding:ui_view": ViewRegistry
    "outstanding:data_directory_provider": ProviderRegistry<DataDirectoryProvider>
    "outstanding:datapacks": DatapackRegistry
  }

  export type DataDrivenContributionFor<Registry extends keyof Registries> =
    Registries[Registry]["decoder"] extends DataDrivenDecoder<any, any>
      ? Parameters<Registries[Registry]["decoder"]["decode"]>[0]
      : never

  export type RegistryContributionFor<Registry extends keyof Registries> =
    ReturnType<Registries[Registry]["getItems"]>[number]
}
