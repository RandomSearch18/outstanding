import { App } from "../app.mjs"
import { ViewbarItem } from "../appState.mjs"

export function ViewbarItemButton({
  app,
  item,
  label,
  icon,
}: {
  app: App
  item: ViewbarItem
  label: string
  icon: string
}) {
  return (
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
  )
}
