import { Provider } from "../registry/provider.mjs"

export abstract class DataDirectoryProvider extends Provider {
  abstract openDataDirectory(): Promise<DataDirectoryHandle>
}

export abstract class DataDirectoryHandle {
  abstract label(): string
}
