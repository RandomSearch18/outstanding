import "./MainLayout.css"
import { App } from "../app.mjs"
import Button from "./Button"
import { If } from "voby"
import { ViewbarItem } from "../appState.mjs"
import { ViewbarItemButton } from "./Viewbar"

function MainLayout({ app }: { app: App }): JSX.Element {
  return (
    <div class="main-layout">
      <nav class="viewbar left">
        <ViewbarItemButton
          app={app}
          item={ViewbarItem.Notes}
          label="Notes"
          icon="description"
        />
        <ViewbarItemButton
          app={app}
          item={ViewbarItem.Search}
          label="Search"
          icon="search"
        />
        <ViewbarItemButton
          app={app}
          item={ViewbarItem.Settings}
          label="Settings"
          icon="settings"
        />
      </nav>
      <div class="sidebar">Sidebar!</div>
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
        </div>
      </main>
    </div>
  )
}

export default MainLayout
