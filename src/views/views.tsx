import { View } from "../registry/view.mjs"

export const notesView = new View({
  id: "outstanding:notes",
  label: "Notes",
  viewbarDisplay: {
    icon: "description",
  },
  sidebarContent: <div>Notes sidebar content!</div>,
})

export const searchView = new View({
  id: "outstanding:search",
  label: "Search",
  viewbarDisplay: {
    icon: "search",
  },
  sidebarContent: <div>Search sidebar content!</div>,
})

export const settingsView = new View({
  id: "outstanding:settings",
  label: "Settings",
  viewbarDisplay: {
    icon: "settings",
  },
  sidebarContent: <div>Settings sidebar content!</div>,
})
