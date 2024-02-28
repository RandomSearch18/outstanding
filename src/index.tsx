/* @refresh reload */
import { render } from "voby"

import "./global.css"
import MainLayout from "./components/MainLayout"
import { App } from "./app.mjs"

const app = new App()
await app.init()

render(<MainLayout app={app} />, document.getElementById("app"))
