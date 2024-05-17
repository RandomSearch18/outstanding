import "./Sidebar.css"

function SidebarLayout({
  children,
  title,
}: {
  children: JSX.Child
  title: string
}) {
  return (
    <div class="sidebar-layout">
      <h2 class="sticky">{title}</h2>
      {children}
    </div>
  )
}

export default SidebarLayout
