import { If } from "voby"
import { App } from "../app.mjs"
import Button from "../components/Button"
import MainbarLayout from "../components/Mainbar"
import { NoProvidersError } from "../registry/provider.mjs"

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
}

export default NoteEditorMainbar
