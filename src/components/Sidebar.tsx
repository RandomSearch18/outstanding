import "./Sidebar.css"
import { If } from "voby"

function SidebarLayout({
  children,
  title,
  fab,
}: {
  children: JSX.Child
  title: string
  fab?: JSX.Child
}) {
  return (
    <div class="sidebar-layout">
      <h2 class="sticky">{title}</h2>
      {children}
      <If when={fab}>
        <div class="sidebar-fab">{fab}</div>
      </If>
    </div>
  )
}

export default SidebarLayout
