import { $, useEffect, useMemo, usePromise } from "voby"
import "./MainLayout.css"
import { App } from "../app.mjs"
import { resourceValue } from "../utilities.mjs"

function MainLayout({ app }: { app: App }): JSX.Element {
  const request = app.settings.getKeys()
  const resource = usePromise(request)
  // const settingKeys = usePromise(app.settings.getKeys())()
  const observable = $(0)
  const observableValue = $(["loading"])
  // return "AAA"

  const state = resource()
  console.log(state, request)
  // if (state.pending) return <p>pending...</p>
  // if (state.error) return <p>{state.error.message}</p>

  useEffect(() => {
    console.log(resource())
  })

  const keysResult = useMemo(() => {
    const state = resource()
    if (state.pending) return "Loading..."
    if (state.error) return `${state.error}`
    return state.value.join(", ")
  })

  setInterval(() => {
    observable(observable() + 1)
  }, 1000)

  return (
    <div class="main-layout">
      <main>
        <div class="get-started">
          <p>Get started by opening a file</p>
          <p>Note: File opening has not been implemented yet</p>
          <p>Settings: {keysResult}</p>
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
