type Namespace = string
type NamespacedId = `${Namespace}:${string}`

type postRegisterCallback<T extends unknown> = (
  registry: Registry<T>,
  items: T
) => void

export class Registry<T extends unknown> {
  items: Map<NamespacedId, T>
  private postRegister?: (registry: Registry<T>, item: T) => void

  register(item: T, id: NamespacedId): void {
    this.items.set(id, item)
    this.postRegister?.(this, item)
  }

  constructor(postRegister?: postRegisterCallback<T>) {
    this.items = new Map()
    this.postRegister = postRegister
  }
}
