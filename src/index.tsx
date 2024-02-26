/* @refresh reload */
import { render } from "voby"

import "./global.css"
import MainLayout from "./components/MainLayout"
import { App } from "./app.mjs"
import {
  LocalStorageSettingsProvider,
  SettingsProvider,
} from "./registry/settingsProvider.mjs"
import { ProviderRegistry } from "./registry/provider.mjs"

const app = new App()

export const settingsProviderRegistry = new ProviderRegistry<SettingsProvider>(
  app
)

settingsProviderRegistry.register(
  "outstanding:local_storage",
  new LocalStorageSettingsProvider(app, "settings", 10)
)

export const settings = await settingsProviderRegistry.selectBestProvider()

if (settings === null) {
  throw new Error("No settings provider available!")
}

console.log("Settings storage provider", settings)

render(<MainLayout app={App} />, document.getElementById("app"))
