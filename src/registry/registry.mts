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
  private items: Map<NamespacedId, T>
  private postRegister?: (registry: Registry<T>, item: T) => void

  register(id: NamespacedId, item: T): void {
    this.items.set(id, item)
    this.postRegister?.(this, item)
  }

  registerEntries(entries: [NamespacedId, T][]) {
    entries.forEach(([id, item]) => {
      this.register(id, item)
    })
  }

  getKeys(): NamespacedId[] {
    return Array.from(this.items.keys())
  }

  entries(): [NamespacedId, T][] {
    return Array.from(this.items.entries())
  }

  getItems(): T[] {
    return Array.from(this.items.values())
  }

  getItem(id: NamespacedId): T | undefined {
    return this.items.get(id)
  }

  constructor(id: NamespacedId, postRegister?: postRegisterCallback<T>) {
    this.id = id
    this.items = new Map()
    this.postRegister = postRegister
  }
}
