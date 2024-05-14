import { NamespacedId, Registry } from "../registry/registry.mjs"
import { toTitleCase } from "../utilities.mjs"

export type SidebarContent = JSX.Element

export interface ViewOptions {
  id: NamespacedId
  label: string
  viewbarDisplay: {
    icon: string
  }
  sidebarContent: SidebarContent
}

export class View {
  id: NamespacedId
  label: string
  icon: string
  sidebarContent: SidebarContent

  constructor(options: ViewOptions) {
    this.id = options.id
    this.label = options.label
    this.icon = options.viewbarDisplay.icon
    this.sidebarContent = options.sidebarContent
  }

  toString() {
    return toTitleCase(this.label)
  }
}

export class ViewRegistry extends Registry<View> {
  constructor(id: NamespacedId) {
    super(id)
  }

  getInitialView(): View | null {
    return this.getItems().at(0) ?? null
  }
}
