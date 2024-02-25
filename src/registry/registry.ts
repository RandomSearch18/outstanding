type Namespace = string
type NamespacedId = `${Namespace}:${string}`

type postRegisterCallback<T extends unknown> = (
  registry: Registry<T>,
  items: T
) => void

export class Registry<T extends unknown> {
  private items: Map<NamespacedId, T>
  private postRegister?: (registry: Registry<T>, item: T) => void

  register(id: NamespacedId, item: T): void {
    this.items.set(id, item)
    this.postRegister?.(this, item)
  }

  getKeys(): NamespacedId[] {
    return Array.from(this.items.keys())
  }

  constructor(postRegister?: postRegisterCallback<T>) {
    this.items = new Map()
    this.postRegister = postRegister
  }
}
