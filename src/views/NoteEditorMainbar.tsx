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
import { DataDirectoryProvider } from "../dataDirectory/dataDirProvider.mjs"

export type EditMode = ValueOf<typeof EditMode>
export const EditMode = {
  Edit: "edit",
  Preview: "preview",
} as const

function NoteEditorMainbar({ app }: { app: App }) {
  function openDataDirectory(provider?: DataDirectoryProvider) {
    app.dataDirectoryManager
      .openDataDirectory(provider)
      .then((directory) => {
        if (directory.wasInitializedThisSession) {
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
            label: "Edit",
            showLabel: false,
          },
          preview: {
            content: () => <Icon>{mdiEye}</Icon>,
            label: "Preview",
            showLabel: false,
          },
        }}
      />
      <SegmentedButtons
        buttons={[
          {
            content: <Icon>{mdiContentSave}</Icon>,
            label: "Save",
            // showLabel: false,
            onClick: () => {
              const editor = app.dataDirectoryManager.$currentEditor()
              if (editor) {
                // TODO: This should be a command
                editor.saveContent().then(() => {
                  app.pushSnackbar({
                    text: "Saved",
                    durationSeconds: 0.7,
                    id: "editor_saved",
                  })
                })
                return
              }
              app.pushErrorSnackbar(
                "Failed to save file: No open editor",
                "no_editor_open"
              )
            },
          },
        ]}
      />
    </>
  )

  const getStartedSplash = (
    <div class="get-started">
      <If
        when={() => !app.dataDirectoryManager.$directoryIsOpen()}
        fallback={<p>No note open</p>}
      >
        <p>
          Get started by opening or creating a data directory (i.e. a folder to
          store your notes) using the button below
        </p>
        <Button
          text="Open a data directory"
          action={() => openDataDirectory()}
        />
        <Button
          text="Open a local folder"
          action={() => {
            const provider = app.dataDirectoryManager.providerRegistry.getItem(
              "outstanding:filesystem_access_api"
            )
            openDataDirectory(provider)
          }}
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
