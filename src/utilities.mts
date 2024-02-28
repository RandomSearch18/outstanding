import { ResourceStatic } from "voby/dist/types"

export type anyObject = { [key: string]: any }

export function resourceValue<T>(resource: ResourceStatic<T>): T | string {
  if (resource.pending) return "Loading..."
  if (resource.error) return `${resource.error}`
  return resource.value
}
