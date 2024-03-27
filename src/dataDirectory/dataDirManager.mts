import { ProviderRegistry } from "../registry/provider.mjs"
import { DataDirectoryProvider } from "./dataDirProvider.mjs"

export class DataDirectoryManager {
  providerRegistry: ProviderRegistry<DataDirectoryProvider>
  activeProvider: DataDirectoryProvider | null = null

  constructor(providerRegistry: ProviderRegistry<DataDirectoryProvider>) {
    this.providerRegistry = providerRegistry
  }

  async chooseProvider() {
    this.activeProvider = await this.providerRegistry.getBestProvider()
  }

  provider() {
    
  }
}
