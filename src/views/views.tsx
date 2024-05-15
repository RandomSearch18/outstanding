import { If, useMemo } from "voby"
import SidebarLayout from "../components/Sidebar"
import { View, ViewbarButtonPosition } from "../registry/view.mjs"

export const notesView = new View({
  id: "outstanding:notes",
  label: "Notes",
  viewbarDisplay: {
    icon: "description",
  },
  sidebarContent: (app) => {
    return () =>
      useMemo(() => {
        app.dataDirectoryManager.$directoryIsOpen()
        const dataDirectory = app.dataDirectoryManager.currentDirectory
        return dataDirectory ? (
          <SidebarLayout>Imagine a bunch of notes here</SidebarLayout>
        ) : (
          <SidebarLayout>
            <div class="large-message">No data directory open</div>
            <div>Open a data directory first to start taking notes</div>
          </SidebarLayout>
        )
      })
  },
})

export const searchView = new View({
  id: "outstanding:search",
  label: "Search",
  viewbarDisplay: {
    icon: "search",
  },
  sidebarContent: () => (
    <SidebarLayout>
      <div>Search sidebar content!</div>
    </SidebarLayout>
  ),
})

export const settingsView = new View({
  id: "outstanding:settings",
  label: "Settings",
  viewbarDisplay: {
    icon: "settings",
    position: ViewbarButtonPosition.Bottom,
  },
  sidebarContent: () => (
    <SidebarLayout>
      <div>Settings sidebar content!</div>
    </SidebarLayout>
  ),
})
