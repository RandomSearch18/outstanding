import { $, If, Observable, useEffect } from "voby"
import { App } from "../app.mjs"
import Button from "../components/Button"
import MainbarLayout from "../components/Mainbar"
import { NoProvidersError } from "../registry/provider.mjs"
import SegmentedButtonSwitcher from "../components/SegmentedButtonSwitcher"
import { mdiContentSave, mdiEye, mdiLeadPencil } from "@mdi/js"
import Icon from "../components/Icon"
import { ValueOf } from "../utilities.mjs"
import SegmentedButtons from "../components/SegmentedButtons"

export type EditMode = ValueOf<typeof EditMode>
export const EditMode = {
  Edit: "edit",
  Preview: "preview",
} as const

function NoteEditorMainbar({ app }: { app: App }) {
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

  const editMode: Observable<EditMode> = $<EditMode>(EditMode.Edit)
  const toolbar = (
    <>
      <SegmentedButtonSwitcher
        selected={editMode}
        buttons={{
          edit: {
            content: () => <Icon>{mdiLeadPencil}</Icon>,
          },
          preview: {
            content: () => <Icon>{mdiEye}</Icon>,
          },
        }}
      />
      <SegmentedButtons
        buttons={[
          {
            content: <Icon>{mdiContentSave}</Icon>,
            onClick: () => {
              app.dataDirectoryManager.$currentEditor()?.saveContent()
            },
          },
        ]}
      />
    </>
  )

  const getStartedSplash = (
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
  )

  return (
    <MainbarLayout toolbarContent={toolbar}>
      <div class="main-editor-wrapper">{getStartedSplash}</div>
    </MainbarLayout>
  )
}

export default NoteEditorMainbar
