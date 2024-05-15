import { NamespacedId, Registry } from "./registry.mjs"
import { ValueOf, toTitleCase } from "../utilities.mjs"
import { DataDrivenDecoder } from "./dataDrivenRegistries.mjs"
import { App } from "../app.mjs"
import { isFunction } from "is"
import { createElement } from "voby"
import SidebarLayout from "../components/Sidebar"

export type ViewbarButtonPosition = ValueOf<typeof ViewbarButtonPosition>
export const ViewbarButtonPosition = {
  Top: "top",
  Bottom: "bottom",
} as const

export type SidebarContent = (app: App) => JSX.Element
export type DataDrivenSidebarContent = string

export interface ViewOptions {
  id: NamespacedId
  label: string
  viewbarDisplay: {
    icon: string
    position?: ViewbarButtonPosition
  }
  sidebarContent: SidebarContent | DataDrivenSidebarContent
}

export class View {
  id
  label
  icon
  viewbarPosition: ViewbarButtonPosition
  sidebarContent: SidebarContent

  constructor(options: ViewOptions) {
    this.id = options.id
    this.label = options.label
    this.icon = options.viewbarDisplay.icon
    this.viewbarPosition =
      options.viewbarDisplay.position || ViewbarButtonPosition.Top
    this.sidebarContent = isFunction(options.sidebarContent)
      ? options.sidebarContent
      : () =>
          createElement(SidebarLayout, {
            children: `${options.sidebarContent}`,
          })
  }

  toString() {
    return toTitleCase(this.label)
  }
}

class ViewDecoder extends DataDrivenDecoder<ViewOptions, View> {
  decode(data: ViewOptions): View {
    return new View(data)
  }
}

export class ViewRegistry extends Registry<View> {
  decoder = new ViewDecoder()

  constructor(id: NamespacedId) {
    super(id)
  }

  getInitialView(): View | null {
    return this.getItems().at(0) ?? null
  }
}
