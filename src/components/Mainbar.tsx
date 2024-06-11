import "./Mainbar.css"

function MainbarLayout({
  children,
  toolbarContent,
}: {
  children: JSX.Child
  toolbarContent: JSX.Child
}) {
  return (
    <>
      <div class="toolbar">
        <div class="toolbar-items">{toolbarContent}</div>
      </div>
      <div class="mainbar-content">{children}</div>
    </>
  )
}

export default MainbarLayout
