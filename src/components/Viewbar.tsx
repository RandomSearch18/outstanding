import { For, If, Portal } from "voby"
import { App } from "../app.mjs"
import { View } from "../views/view.mjs"

export function Viewbar({ app }: { app: App }) {
  return (
    <nav class="viewbar left">
      <For values={() => app.views.getItems()}>
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
