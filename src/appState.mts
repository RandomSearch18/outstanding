import { store } from "voby"

export enum ViewbarItem {
  Notes = "notes",
  Search = "search",
  Settings = "settings",
}

export type AppState = {
  viewbar: {
    selectedItem: ViewbarItem | null
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
