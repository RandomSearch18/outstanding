import { Registry } from "./registry"

/** Provides a persistant storage target for local data such as UI state */
class StorageProvider {}

const storageProviderRegistry = new Registry<StorageProvider>()
