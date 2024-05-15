import "./MainLayout.css"
import { App } from "../app.mjs"
import Button from "./Button"
import { If } from "voby"
import { Viewbar } from "./Viewbar"

function MainLayout({ app }: { app: App }): JSX.Element {
  let snackbarCount = 0
  return (
    <>
      <div class="main-layout">
        <Viewbar app={app} />
        <div class="sidebar">
          <div id="sidebar-target"></div>
        </div>
        <main class="mainbar">
          <div class="get-started">
            <p>Get started by opening a file</p>
            <p>Note: File opening has not been implemented yet</p>
            <p>Settings: {app.settings.getKeys().join(", ")}</p>
            <If when={() => !app.dataDirectoryManager.$directoryIsOpen()}>
              <Button
                text="Open a data directory"
                action={() => app.dataDirectoryManager.openDataDirectory()}
              />
            </If>
            <Button
              text="Show snackbar"
              action={() => {
                app.pushSnackbar(
                  `Snackbar #${snackbarCount}`,
                  // `${snackbarCount}`,
                  "test",
                  4
                )
                snackbarCount++
              }}
            />
          </div>
        </main>
      </div>
      <div
        class={{
          snackbar: true,
          active: () => app.state.snackbar.visible(),
        }}
        id="main-snackbar"
        onClick={() => {
          app.closeSnackbar()
        }}
      >
        {() => app.state.snackbar.currentText()}
      </div>
    </>
  )
}

export default MainLayout
