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
  private items: Map<NamespacedId, T>
  private postRegister?: (registry: Registry<T>, item: T) => void

  register(id: NamespacedId, item: T): void {
    this.items.set(id, item)
    this.postRegister?.(this, item)
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

  constructor(postRegister?: postRegisterCallback<T>) {
    this.items = new Map()
    this.postRegister = postRegister
  }
}
