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
                app.pushSnackbar({
                  text: `Snackbar #${snackbarCount}`,
                  id: "test",
                  durationSeconds: 4,
                  isError: snackbarCount % 2 === 1,
                })
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
