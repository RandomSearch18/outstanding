import { Provider } from "../registry/provider.mjs"

export abstract class DataDirectoryProvider extends Provider {
  abstract label(): string
}
