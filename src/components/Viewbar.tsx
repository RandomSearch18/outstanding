import { If, Portal, useEffect } from "voby"
import { App } from "../app.mjs"
import { ViewbarItem } from "../appState.mjs"

export function ViewbarItemButton({
  app,
  item,
  label,
  icon,
  sidebarElement,
}: {
  app: App
  item: ViewbarItem
  label: string
  icon: string
  sidebarElement: JSX.Element
}) {
  return (
    <>
      <a
        class={() => ({
          active: app.state.viewbar.selectedItem === item,
        })}
        onClick={() => {
          app.state.viewbar.selectedItem = item
        }}
      >
        <i>{icon}</i>
        <div>{label}</div>
      </a>
      <If when={() => app.state.viewbar.selectedItem === item}>
        {() => (
          <Portal mount={document.querySelector("#sidebar-target")}>
            {sidebarElement}
          </Portal>
        )}
      </If>
    </>
  )
}
