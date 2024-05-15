import { Observable } from "voby"
import { NamespacedId } from "./registry/registry.mjs"

export type AppState = {
  viewbar: {
    selectedItem: NamespacedId | null
  }
  snackbar: {
    visible: Observable<boolean>
    currentText: Observable<string>
    queue: {
      text: string
      id: string | null
      durationSeconds: number
      timer: number | null
    }[]
  }
}
