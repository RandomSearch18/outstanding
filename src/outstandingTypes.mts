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

export type SettingsSomething =
  OutstandingRegistries["outstanding:settings"]["decoder"]

// export type DataDrivenContributionFor<
//   Registry extends keyof OutstandingRegistries
// > = Parameters<OutstandingRegistries[Registry]["decoder"]["decode"]>[0]

export type DataDrivenContributionFor<
  Registry extends keyof OutstandingRegistries
> = OutstandingRegistries[Registry]["decoder"] extends DataDrivenDecoder<
  any,
  any
>
  ? Parameters<OutstandingRegistries[Registry]["decoder"]["decode"]>[0]
  : null

type x = DataDrivenContributionFor<"outstanding:settings">
type y = DataDrivenContributionFor<"outstanding:ui_view">
