import { $ } from "voby"
import "./MainLayout.css"
import { App } from "../app.mjs"
import { promiseValue } from "../utilities.mjs"

function MainLayout({ app }: { app: App }): JSX.Element {
  const settingsKeys = promiseValue(
    app.settings.getKeys().then((keys) => keys.join(", "))
  )

  return (
    <div class="main-layout">
      <main>
        <div class="get-started">
          <p>Get started by opening a file</p>
          <p>Note: File opening has not been implemented yet</p>
          <p>Settings: {settingsKeys}</p>
        </div>
      </main>
    </div>
  )
}

export default MainLayout
