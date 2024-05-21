import { NamespacedId, Registry } from "./registry.mjs"
import { ValueOf, toTitleCase } from "../utilities.mjs"
import { DataDrivenDecoder } from "./dataDrivenRegistries.mjs"
import { App } from "../app.mjs"
import { createElement } from "voby"
import SidebarLayout from "../components/Sidebar"

export type ViewbarButtonPosition = ValueOf<typeof ViewbarButtonPosition>
export const ViewbarButtonPosition = {
  Top: "top",
  Bottom: "bottom",
} as const

export type SidebarContent = (app: App) => JSX.Element
export type DataDrivenSidebarContent = {
  title: string
  plainTextContent: string
}

export interface ViewOptions {
  id: NamespacedId
  label: string
  viewbarDisplay: {
    icon: string
    position?: ViewbarButtonPosition
  }
  sidebarContent: SidebarContent
}

export interface DataDrivenView {
  id: NamespacedId
  label: string
  viewbarDisplay: {
    icon: string
    position?: ViewbarButtonPosition
  }
  sidebarContent: DataDrivenSidebarContent
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
    this.sidebarContent = options.sidebarContent
  }

  toString() {
    return toTitleCase(this.label)
  }
}

class ViewDecoder extends DataDrivenDecoder<DataDrivenView, View> {
  decode(data: DataDrivenView): View {
    const sidebarContent = createElement(SidebarLayout, {
      title: data.sidebarContent.title,
      children: createElement("div", {}, data.sidebarContent.plainTextContent),
    })

    return new View({
      id: data.id,
      label: data.label,
      viewbarDisplay: data.viewbarDisplay,
      sidebarContent,
    })
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
