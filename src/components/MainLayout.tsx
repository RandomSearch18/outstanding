import "./MainLayout.css"
import { App } from "../app.mjs"
import Button from "./Button"
import { $, If } from "voby"
import { Viewbar } from "./Viewbar"
import { Snackbar } from "./Snackbar"

function MainLayout({ app }: { app: App }): JSX.Element {
  const triggerSnackbar = $(false)

  return (
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
            text="Toggle snackbar trigger"
            action={() => triggerSnackbar(!triggerSnackbar())}
          />
          <Snackbar when={triggerSnackbar}>
            Hello! Trigger is {() => `${triggerSnackbar()}`}
          </Snackbar>
        </div>
      </main>
    </div>
  )
}

export default MainLayout
