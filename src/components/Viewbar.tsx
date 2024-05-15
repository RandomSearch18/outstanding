import { For, If, Portal } from "voby"
import { App } from "../app.mjs"
import { View, ViewbarButtonPosition } from "../registry/view.mjs"

export function Viewbar({ app }: { app: App }) {
  const topItems = () =>
    app.views
      .getItems()
      .filter((item) => item.viewbarPosition === ViewbarButtonPosition.TOP)
  const bottomItems = () =>
    app.views
      .getItems()
      .filter((item) => item.viewbarPosition === ViewbarButtonPosition.BOTTOM)

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
  view: { id, icon, label, sidebarContent },
}: {
  app: App
  view: View
}) {
  return (
    <>
      <a
        class={() => ({
          active: app.state.viewbar.selectedItem === id,
        })}
        onClick={() => {
          app.state.viewbar.selectedItem = id
        }}
        tabIndex={0}
      >
        <i>{icon}</i>
        <div>{label}</div>
      </a>
      <If when={() => app.state.viewbar.selectedItem === id}>
        {() => (
          <Portal mount={document.querySelector("#sidebar-target")}>
            {sidebarContent}
          </Portal>
        )}
      </If>
    </>
  )
}
