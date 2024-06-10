import "./MainLayout.css"
import { App } from "../app.mjs"
import { Viewbar } from "./Viewbar"

function MainLayout({ app }: { app: App }): JSX.Element {
  return (
    <>
      <div
        class={{
          "main-layout": true,
          "no-sidebar": () => !app.state.sidebar.isOpen,
        }}
      >
        <Viewbar app={app} />
        <div class="sidebar">
          <div id="sidebar-target"></div>
        </div>
        <main class="mainbar">
          <div id="mainbar-target"></div>
        </main>
      </div>
      <div
        class={{
          snackbar: true,
          active: () => app.state.snackbar.visible(),
          error: () => app.state.snackbar.queue.at(0)?.isError,
        }}
        id="main-snackbar"
        onClick={() => {
          app.closeSnackbar()
        }}
      >
        {() => app.state.snackbar.queue.at(0)?.text}
      </div>
    </>
  )
}

export default MainLayout
