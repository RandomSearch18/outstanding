import { Datapack } from "../datapack.mjs"
import { NamespacedId, Registry } from "./registry.mjs"

export class DatapackRegistry extends Registry<Datapack> {
  constructor(id: NamespacedId) {
    super(id)
  }
}
