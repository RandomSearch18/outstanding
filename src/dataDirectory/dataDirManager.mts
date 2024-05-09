import { $ } from "voby"
import { ProviderRegistry } from "../registry/provider.mjs"
import {
  DataDirectoryHandle,
  DataDirectoryProvider,
} from "./dataDirProvider.mjs"

export class DataDirectoryManager {
  providerRegistry: ProviderRegistry<DataDirectoryProvider>
  activeProvider: DataDirectoryProvider | null = null
  currentDirectory: DataDirectoryHandle | null = null
  $directoryIsOpen = $(false)

  constructor(providerRegistry: ProviderRegistry<DataDirectoryProvider>) {
    this.providerRegistry = providerRegistry
  }

  async chooseProvider() {
    const newProvider = await this.providerRegistry.getBestProvider()
    this.setActiveProvider(newProvider)
  }

  setActiveProvider(provider: DataDirectoryProvider) {
    this.activeProvider = provider
  }

  async getActiveProvider() {
    if (this.activeProvider === null) {
      await this.chooseProvider()
    }
    return this.activeProvider!
  }

  async openDataDirectory() {
    const provider = await this.getActiveProvider()
    const directory = await provider.openDataDirectory()
    this.currentDirectory = directory
    this.$directoryIsOpen(true)
    return directory
  }
}
