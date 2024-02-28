import { useMemo, usePromise } from "voby"
import { ObservableReadonly } from "voby/dist/oby"
import { Resource } from "voby/dist/types"

export type anyObject = { [key: string]: any }

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
