import { RegistryItem } from "./registry.mjs"
import { JSONSafeObject } from "./settingsProvider.mjs"

/**
 * Converts a plain (JSON-safe) object into a registry item for some specific registry.
 *
 * This lets datapacks specify registry contributions with only JSON (instead of JS code).
 */
export abstract class DataDrivenDecoder<
  In extends JSONSafeObject,
  Out extends RegistryItem
> {
  abstract decode(data: In): Out
}
