import "./MainLayout.css"
import { App } from "../app.mjs"

function MainLayout({ app }: { app: App }): JSX.Element {
  return (
    <div class="main-layout">
      <main>
        <div class="get-started">
          <p>Get started by opening a file</p>
          <p>Note: File opening has not been implemented yet</p>
          <p>Settings: {app.settings.getKeys()}</p>
        </div>
      </main>
    </div>
  )
}

export default MainLayout
