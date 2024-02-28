import { App } from "../app.mjs"
import { Datapack } from "../datapack.mjs"
import { Registry } from "./registry.mjs"

export class DatapackRegistry extends Registry<Datapack> {
  constructor() {
    super()
  }
}
