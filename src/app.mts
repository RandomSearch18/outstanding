import { $, store, useEffect } from "voby"
import { AppState } from "./appState.mjs"
import { DataDirectoryManager } from "./dataDirectory/dataDirManager.mjs"
import { DataDirectoryProvider } from "./dataDirectory/dataDirProvider.mjs"
import { DatapackManager } from "./datapack.mjs"
import { DatapackRegistry } from "./registry/datapack.mjs"
import { ProviderRegistry } from "./registry/provider.mjs"
import RegistryRegistry from "./registry/registryRegistry.mjs"
import {
  AppSettingOwner,
  LocalStorageSettingsProvider,
  SettingsProvider,
  SettingsWithDefaults,
} from "./registry/settingsProvider.mjs"
import { createNanoEvents } from "./utils/nanoEvents"
import { ViewRegistry } from "./registry/view.mjs"
import { notesView, searchView, settingsView } from "./views/views"

export type AppEvents = {}

export class App {
  // @ts-ignore - Living life on the edge
  state: AppState // @ts-ignore
  registries: RegistryRegistry // @ts-ignore
  settings: SettingsWithDefaults // @ts-ignore
  storage: SettingsProvider // @ts-ignore
  datapackManager: DatapackManager // @ts-ignore
  dataDirectoryManager: DataDirectoryManager // @ts-ignore
  views: ViewRegistry // @ts-ignore

  events = createNanoEvents<AppEvents>()

  closeSnackbar() {
    const snackbar = this.state.snackbar
    const currentItem = snackbar.queue.at(0)
    if (!currentItem) return console.debug("No snackbars to close")
    if (currentItem.timer) clearTimeout(currentItem.timer)
    else console.warn("Snackbar doesn't have timer", currentItem)

    snackbar.queue.shift()
    this.state.snackbar.visible(false)
    if (snackbar.queue.length === 0) return
    this.showNextSnackbar()
  }

  showNextSnackbar() {
    const next = this.state.snackbar.queue.at(0)
    if (!next) return console.warn("No snackbars to show")
    this.state.snackbar.currentText(next.text)
    this.state.snackbar.visible(true)
    next.timer = setTimeout(
      () => this.closeSnackbar(),
      next.durationSeconds * 1000
    )
  }

  pushSnackbar(text: string, id: string, durationSeconds = 5) {
    const snackbar = this.state.snackbar
    const queueItem = {
      text,
      id,
      durationSeconds,
      timer: null,
    }
    snackbar.queue.push(queueItem)
    // console.log("Updated snackbar Q", store.unwrap(snackbar.queue))
    if (snackbar.queue.length === 1) {
      this.showNextSnackbar()
    } else if (snackbar.queue[0].id === queueItem.id) {
      this.closeSnackbar()
    }
  }

  async init() {
    window.outstanding = this

    this.state = store<AppState>({
      viewbar: {
        selectedItem: null,
      },
      snackbar: {
        visible: $(false),
        currentText: $(""),
        queue: [],
      },
    })

    this.registries = new RegistryRegistry()

    // Settings provider
    const DEFAULT_SETTINGS = Object.entries({
      useDatapacks: true,
    })

    const settingsProviderRegistry = this.registries.register(
      new ProviderRegistry<SettingsWithDefaults>("outstanding:settings")
    )
    settingsProviderRegistry.register(
      new SettingsWithDefaults(
        new LocalStorageSettingsProvider("settings", 10),
        new Map(DEFAULT_SETTINGS)
      )
    )
    this.settings = await settingsProviderRegistry
      .getBestProvider()
      .then((p) => p.init())
    console.log("Using settings storage provider", this.settings)

    // Persistant storage provider
    const storageProviderRegistry = this.registries.register(
      new ProviderRegistry<SettingsProvider>("outstanding:persistant_storage")
    )
    storageProviderRegistry.register(
      new LocalStorageSettingsProvider("internal_data", 10)
    )
    this.storage = await storageProviderRegistry
      .getBestProvider()
      .then((p) => p.init())

    // UI views (i.e. viewbar items)
    this.views = this.registries.register(
      new ViewRegistry("outstanding:ui_view")
    )
    ;[notesView, searchView, settingsView].forEach((view) =>
      this.views.register(view)
    )

    // Data directory manager
    const dataDirectoryProviderRegistry = this.registries.register(
      new ProviderRegistry<DataDirectoryProvider>(
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
  }

  async initDatapacks() {
    const datapackRegistry = new DatapackRegistry("outstanding:datapacks")
    this.registries.register(datapackRegistry)
    const knownDatapacks = this.storage.setIfNonexistent({
      key: "knownDatapacks",
      value: {},
      owner: new AppSettingOwner(),
    })

    this.datapackManager = new DatapackManager(
      this,
      knownDatapacks,
      datapackRegistry
    )

    await this.datapackManager.registerBuiltInDatapacks()
    this.datapackManager.handleNewDatapacks()

    const loadedPackIDs = this.datapackManager
      .loadDatapacks()
      .map((datapack) => datapack.id)
    const totalLoadedPacks = loadedPackIDs.length
    console.log(`Loaded ${totalLoadedPacks} datapack(s):`, loadedPackIDs)
  }
}
