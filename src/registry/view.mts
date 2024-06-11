import { NamespacedId, Registry } from "./registry.mjs"
import { ValueOf, toTitleCase } from "../utilities.mjs"
import { DataDrivenDecoder } from "./dataDrivenRegistries.mjs"
import { App } from "../app.mjs"
import { createElement } from "voby"
import SidebarLayout from "../components/Sidebar"
import MainbarLayout from "../components/Mainbar"

export type ViewbarButtonPosition = ValueOf<typeof ViewbarButtonPosition>
export const ViewbarButtonPosition = {
  Top: "top",
  Bottom: "bottom",
} as const

export type SidebarContent = (app: App) => JSX.Element
export type MainbarContent = (app: App) => JSX.Element
export type DataDrivenSidebarContent = {
  title: string
  plainTextContent: string
}
export type DataDrivenMainbarContent = string

export interface ViewOptions {
  id: NamespacedId
  label: string
  viewbarDisplay: {
    icon: string
    position?: ViewbarButtonPosition
  }
  sidebarContent: SidebarContent
  mainbarContent: MainbarContent
}

export interface DataDrivenView {
  id: NamespacedId
  label: string
  viewbarDisplay: {
    icon: string
    position?: ViewbarButtonPosition
  }
  sidebarContent: DataDrivenSidebarContent
  mainbarContent: DataDrivenMainbarContent
}

export class View {
  id
  label
  icon
  viewbarPosition: ViewbarButtonPosition
  sidebarContent: SidebarContent
  mainbarContent

  constructor(options: ViewOptions) {
    this.id = options.id
    this.label = options.label
    this.icon = options.viewbarDisplay.icon
    this.viewbarPosition =
      options.viewbarDisplay.position || ViewbarButtonPosition.Top
    this.sidebarContent = options.sidebarContent
    this.mainbarContent = options.mainbarContent
  }

  toString() {
    return toTitleCase(this.label)
  }
}

class ViewDecoder extends DataDrivenDecoder<DataDrivenView, View> {
  decode(data: DataDrivenView): View {
    const sidebarContent = createElement(SidebarLayout, {
      title: data.sidebarContent.title,
      children: createElement("p", {}, data.sidebarContent.plainTextContent),
    })

    const mainbarContent = createElement(MainbarLayout, {
      children: data.mainbarContent,
      toolbarContent: () => [],
    })

    return new View({
      id: data.id,
      label: data.label,
      viewbarDisplay: data.viewbarDisplay,
      sidebarContent,
      mainbarContent,
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
