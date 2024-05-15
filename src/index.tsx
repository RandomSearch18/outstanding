/* @refresh reload */
import { render } from "voby"

import "./global.css"
import "./utility.css"
import "beercss/dist/cdn/beer.min.css"
import MainLayout from "./components/MainLayout"
import { App } from "./app.mjs"
import "beercss"
import "material-dynamic-colors"

declare global {
  interface Window {
    outstanding: App
  }
}

const app = new App()
await app.init()

function updateTheme(useDarkMode: boolean) {
  const theme_color = "#C1694F"
  ui("mode", useDarkMode ? "dark" : "light")
  ui("theme", theme_color)
}

const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)")
updateTheme(darkModeQuery.matches)
darkModeQuery.addEventListener("change", (e) => updateTheme(e.matches))

render(<MainLayout app={app} />, document.getElementById("app"))

// Set some initiial app state
app.state.viewbar.selectedItem = app.views.getInitialView()?.id ?? null
