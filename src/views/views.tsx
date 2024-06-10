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
                    app.dataDirectoryManager.$currentNote()?.id === note.id,
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
  mainbarContent: (app) => {
    function openDataDirectory() {
      app.dataDirectoryManager
        .openDataDirectory()
        .then((directory) => {
          if (directory.wasinitializedThisSession) {
            app.pushSnackbar({
              text: `Initialised new data directory using ${directory.dataDirProvider}`,
              id: "data_directory_initialized",
            })
          }
        })
        .catch((error) => {
          if (error instanceof NoProvidersError) {
            app.pushErrorSnackbar(
              `Can't open a data directory: No data directory providers are available`,
              "no_data_directory_providers"
            )
          }
        })
    }

    return (
      <MainbarLayout>
        <div class="get-started">
          <p>Get started by opening a file</p>
          <p>Note: File opening has not been implemented yet</p>
          <p>Settings: {app.settings.getKeys().join(", ")}</p>
          <If when={() => !app.dataDirectoryManager.$directoryIsOpen()}>
            <Button
              text="Open a data directory"
              action={() => openDataDirectory()}
            />
          </If>
        </div>
      </MainbarLayout>
    )
  },
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
})
