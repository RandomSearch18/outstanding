import { store } from "voby"

export type Namespace = string
export type NamespacedId = `${Namespace}:${string}`

export interface RegistryItem {
  id: NamespacedId
}

type postRegisterCallback<T extends RegistryItem> = (
  registry: Registry<T>,
  items: T
) => void

export class Registry<T extends RegistryItem> {
  id: NamespacedId
  private $items: Record<NamespacedId, T>
  private postRegister?: (registry: Registry<T>, item: T) => void

  registerWithId(id: NamespacedId, item: T): T {
    this.$items[id] = item
    this.postRegister?.(this, item)
    return item
  }

  register<I extends T>(item: I): I {
    // @ts-ignore - Not sure why this wouldn't work
    return this.registerWithId(item.id, item)
  }

  registerEntries(entries: [NamespacedId, T][]) {
    entries.forEach(([id, item]) => {
      this.registerWithId(id, item)
    })
  }

  getKeys(): NamespacedId[] {
    return Object.keys(this.$items) as NamespacedId[]
  }

  entries(): [NamespacedId, T][] {
    return Object.entries(this.$items) as [NamespacedId, T][]
  }

  getItems(): T[] {
    return Object.values(this.$items)
  }

  getItem(id: NamespacedId): T | undefined {
    return this.$items[id]
  }

  constructor(id: NamespacedId, postRegister?: postRegisterCallback<T>) {
    this.id = id
    this.$items = store({})
    this.postRegister = postRegister
  }
}
