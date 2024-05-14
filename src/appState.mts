import { store } from "voby"
import { NamespacedId } from "./registry/registry.mjs"

export type AppState = {
  viewbar: {
    selectedItem: NamespacedId | null
  }
}

export const appState = store<AppState>({
  viewbar: {
    selectedItem: null,
  },
})

// export function state() {
//   return globalState
// }
