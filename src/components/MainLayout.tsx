import { $, useMemo, usePromise } from "voby"
import "./MainLayout.css"
import { App } from "../app.mjs"
import { resourceValue } from "../utilities.mjs"

function MainLayout({ app }: { app: App }): JSX.Element {
  const request = app.settings.getKeys()
  const resource = usePromise(request)
  // const settingKeys = usePromise(app.settings.getKeys())()
  const observable = $(0)
  // return "AAA"

  setInterval(() => {
    observable(observable() + 1)
  }, 1000)

  return (
    <div class="main-layout">
      <main>
        <div class="get-started">
          <p>Get started by opening a file</p>
          <p>Note: File opening has not been implemented yet</p>
          <p>Settings: {observable}</p>
        </div>
      </main>
    </div>
  )
  return useMemo(() => {
    //const settingKeys = usePromise(app.settings.getKeys())()
    return (
      <div class="main-layout">
        <main>
          <div class="get-started">
            <p>Get started by opening a file</p>
            <p>Note: File opening has not been implemented yet</p>
            {/* <p>Settings: {resourceValue(settingKeys)}</p> */}
          </div>
        </main>
      </div>
    )
  })
}

export default MainLayout
