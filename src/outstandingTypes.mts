import { DataDirectoryProvider } from "./dataDirectory/dataDirProvider.mjs"
import { DataDrivenDecoder } from "./registry/dataDrivenRegistries.mjs"
import { DatapackRegistry } from "./registry/datapack.mjs"
import { ProviderRegistry } from "./registry/provider.mjs"
import {
  SettingsProvider,
  SettingsWithDefaults,
} from "./registry/settingsProvider.mjs"
import { ViewRegistry } from "./registry/view.mjs"

export type OutstandingRegistries = {
  "outstanding:settings": ProviderRegistry<SettingsWithDefaults>
  "outstanding:persistant_storage": ProviderRegistry<SettingsProvider>
  "outstanding:ui_view": ViewRegistry
  "outstanding:data_directory_provider": ProviderRegistry<DataDirectoryProvider>
  "outstanding:datapacks": DatapackRegistry
}

export type DataDrivenContributionFor<
  Registry extends keyof OutstandingRegistries
> = OutstandingRegistries[Registry]["decoder"] extends DataDrivenDecoder<
  any,
  any
>
  ? Parameters<OutstandingRegistries[Registry]["decoder"]["decode"]>[0]
  : never

export type RegistryContributionFor<
  Registry extends keyof OutstandingRegistries
> = ReturnType<OutstandingRegistries[Registry]["getItems"]>[number]
