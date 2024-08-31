import { $, If, Observable, useEffect, useMemo } from "voby"
import { App } from "../app.mjs"
import Button from "../components/Button"
import MainbarLayout from "../components/Mainbar"
import { NoProvidersError } from "../registry/provider.mjs"
import SegmentedButtonSwitcher from "../components/SegmentedButtonSwitcher"
import { mdiContentSave, mdiEye, mdiLeadPencil } from "@mdi/js"
import Icon from "../components/Icon"
import { ValueOf } from "../utilities.mjs"
import SegmentedButtons, {
  SegmentedButtonOptions,
} from "../components/SegmentedButtons"
import { DataDirectoryProvider } from "../dataDirectory/dataDirProvider.mjs"
import {
  NotePane,
  NotePaneProvider,
} from "../datapacks/outstanding/notePane.mjs"

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

  const buttons: Observable<Record<string, SegmentedButtonOptions>> = useMemo(
    () => {
      const paneRegistry = app.registries.getItem("outstanding:note_pane")
      if (!paneRegistry) {
        console.warn(
          "Not showing any pane buttons because the pane registry isn't available"
        )
        return {}
      }
      const panes: Record<
        string,
        NotePaneProvider<NotePane>
      > = paneRegistry.$items
      const buttons: Record<string, SegmentedButtonOptions> = {}
      for (const [id, paneProvider] of Object.entries(panes)) {
        buttons[id] = {
          content: () => <Icon>{mdiLeadPencil}</Icon>,
          label: paneProvider.id,
          showLabel: false,
          onClick: () => {
            app.dataDirectoryManager.activatePane(paneProvider)
          },
        }
      }
      return buttons
    }
  )
  const editMode: Observable<EditMode> = $<EditMode>(EditMode.Edit)
  const toolbar = (
    <>
      <SegmentedButtonSwitcher selected={editMode} buttons={buttons} />
      <SegmentedButtons
        buttons={[
          {
            content: <Icon>{mdiContentSave}</Icon>,
            label: "Save",
            // showLabel: false,
            onClick: () => {
              // TODO: This should be a command
              const note = app.dataDirectoryManager.$currentNote()
              if (!note)
                return app.pushErrorSnackbar(
                  "Failed to save file: No open editor",
                  "no_editor_open"
                )
              note.saveContent().then(() => {
                app.pushSnackbar({
                  text: "Saved",
                  durationSeconds: 0.7,
                  id: "editor_saved",
                })
              })
              return
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
