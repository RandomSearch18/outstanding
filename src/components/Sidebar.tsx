import { mdiNotePlus } from "@mdi/js"
import Icon from "./Icon"
import "./Sidebar.css"
import { If, useEffect } from "voby"

function SidebarLayout({
  children,
  title,
  fab,
}: {
  children: JSX.Child
  title: string
  fab?: JSX.Child
}) {
  useEffect(() => console.log(fab))

  return (
    <div class="sidebar-layout">
      <h2 class="sticky">{title}</h2>
      {children}
      <If when={fab}>
        <div class="sidebar-fab">
          <button class="square round expanded extra medium-elevate">
            {fab}
          </button>
        </div>
      </If>
    </div>
  )
}

export default SidebarLayout
