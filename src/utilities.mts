import { $, useMemo, usePromise } from "voby"
import { Observable, Resource, ObservableReadonly } from "voby/dist/types"

export type anyObject = { [key: string]: any }

export function toEntries<K extends string, V>(object: Record<K, V>): [K, V][] {
  return Object.entries(object) as [K, V][]
}

export function resourceValue<T>(
  resource: Resource<T>
): ObservableReadonly<T | string> {
  return useMemo(() => {
    const state = resource()
    if (state.pending) return "Loading..."
    if (state.error) return `${state.error}`
    return state.value
  })
}

export function promiseValue<T>(
  promise: Promise<T>
): ObservableReadonly<T | string> {
  return resourceValue(usePromise(promise))
}

type ReactiveMapKey = string | number
export class ReactiveMap<K extends ReactiveMapKey, V> {
  private map: Map<K, Observable<V>>

  constructor(initialEntries?: [K, V][]) {
    const entries = initialEntries?.map(([key, value]) => [
      key,
      $<V>(value),
    ]) as [K, Observable<V>][]
    this.map = new Map(entries)
  }

  get(key: K): Observable<V> | undefined {
    return this.map.get(key)
  }

  toPlainObject() {
    const plainObject: {
      [key: string]: V
    } = {}
    for (const [key, value] of this.map) {
      plainObject[key as string] = value()
    }
    return plainObject
  }

  toJSON() {
    return this.toPlainObject()
  }

  set(key: K, value: V) {
    const observable = this.map.get(key)

    if (!observable) {
      const newObservable = $<V>(value)
      this.map.set(key, newObservable)
      return
    }

    observable(value)
  }

  keys() {
    return this.map.keys()
  }

  delete(key: K) {
    this.map.delete(key)
  }
}

export function toTitleCase(string: string) {
  return string.replace(/\b\w/g, (char) => char.toUpperCase())
}
