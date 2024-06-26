import { For, If, useMemo } from "voby"
import SidebarLayout from "../components/Sidebar"
import { View, ViewbarButtonPosition } from "../registry/view.mjs"
import NoteList from "../components/NoteList"
import Icon from "../components/Icon"
import { mdiNotePlus } from "@mdi/js"
import FAB from "../components/FAB"
import MainbarLayout from "../components/Mainbar"
import Button from "../components/Button"
import { NoProvidersError } from "../registry/provider.mjs"
import NoteEditorMainbar from "./NoteEditorMainbar"

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
        const addNoteButton = (
          <FAB
            icon={mdiNotePlus}
            label="New note"
            onClick={() => {
              dataDirectory!.createNote({
                filename: "Untitled note",
              })
            }}
          />
        )
        return dataDirectory ? (
          <SidebarLayout title="Notes" fab={addNoteButton}>
            <NoteList
              items={() =>
                dataDirectory.$notes().map((note) => ({
                  label: note.label(),
                  onClick: () => {
                    app.dataDirectoryManager.openNote(note.id)
                  },
                  isActive: () =>
                    app.dataDirectoryManager.$currentEditor()?.note.id ===
                    note.id,
                }))
              }
              sortByLabel={true}
              ifEmpty={
                <>
                  <p class="large-message">No notes</p>
                  <p>Click the new note button below to start writing</p>
                </>
              }
            />
          </SidebarLayout>
        ) : (
          <SidebarLayout title="Notes">
            <p class="large-message">No data directory open</p>
            <p>Open a data directory first to start taking notes</p>
          </SidebarLayout>
        )
      })
  },
  mainbarContent: (app) => <NoteEditorMainbar app={app} />,
})

export const searchView = new View({
  id: "outstanding:search",
  label: "Search",
  viewbarDisplay: {
    icon: "search",
  },
  sidebarContent: () => (
    <SidebarLayout title="Search">
      <p>Search sidebar content!</p>
    </SidebarLayout>
  ),
  mainbarContent: (app) => <NoteEditorMainbar app={app} />,
})

export const settingsView = new View({
  id: "outstanding:settings",
  label: "Settings",
  viewbarDisplay: {
    icon: "settings",
    position: ViewbarButtonPosition.Bottom,
  },
  sidebarContent: () => (
    <SidebarLayout title="Settings">
      <p>Settings sidebar content!</p>
    </SidebarLayout>
  ),
  mainbarContent: () => "Imagine some settings here",
})
