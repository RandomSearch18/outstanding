import { Observable } from "voby"
import { NamespacedId } from "./registry/registry.mjs"

export type AppState = {
  viewbar: {
    selectedItem: NamespacedId | null
  }
  snackbar: {
    visible: Observable<boolean>
    text: Observable<string>
    id: string | null
    timer: number | null
  }
}
