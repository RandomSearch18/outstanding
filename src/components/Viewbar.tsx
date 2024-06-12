import { For, If, Portal, useEffect, useMemo } from "voby"
import { App } from "../app.mjs"
import { View, ViewbarButtonPosition } from "../registry/view.mjs"

export function Viewbar({ app }: { app: App }) {
  useEffect(() => {
    app.contextKeys.set("currentView", app.state.viewbar.selectedItem)
  })

  const topItems = () =>
    app.views
      .getItems()
      .filter((item) => item.viewbarPosition === ViewbarButtonPosition.Top)
  const bottomItems = () =>
    app.views
      .getItems()
      .filter((item) => item.viewbarPosition === ViewbarButtonPosition.Bottom)

  return (
    <nav class="viewbar left">
      <For values={topItems}>
        {(view) => <ViewbarItemButton app={app} view={view} />}
      </For>
      <span class="spacer"></span>
      <For values={bottomItems}>
        {(view) => <ViewbarItemButton app={app} view={view} />}
      </For>
    </nav>
  )
}

export function ViewbarItemButton({
  app,
  view: { id, icon, label, sidebarContent, mainbarContent },
}: {
  app: App
  view: View
}) {
  const isActive = useMemo(() => app.state.viewbar.selectedItem === id)

  return (
    <>
      <a
        class={() => ({
          active: isActive(),
        })}
        onClick={() => {
          if (!isActive()) {
            app.state.sidebar.isOpen = true
            app.state.viewbar.selectedItem = id
            return
          }
          app.layout.toggleSidebar()
        }}
        href="#"
      >
        <i>{icon}</i>
        <div>{label}</div>
      </a>
      <If when={() => isActive()}>
        {() => [
          <Portal mount={document.querySelector("#sidebar-target")}>
            {sidebarContent(app)}
          </Portal>,
          mainbarContent && (
            <Portal mount={document.querySelector("#mainbar-target")}>
              {mainbarContent(app)}
            </Portal>
          ),
        ]}
      </If>
    </>
  )
}
