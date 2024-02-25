/* @refresh reload */
import { render } from "voby"

import "./global.css"
import MainLayout from "./components/MainLayout"
import { App } from "./app"
import { Registry } from "./registry/registry"
import {
  LocalStorageSettingsProvider,
  SettingsProvider,
} from "./registry/settingsProvider"

const app = new App()

export const settingsProviderRegistry = new Registry<SettingsProvider>()

settingsProviderRegistry.register(
  "outstanding:local_storage",
  new LocalStorageSettingsProvider(app, "settings")
)

render(<MainLayout app={App} />, document.getElementById("app"))
