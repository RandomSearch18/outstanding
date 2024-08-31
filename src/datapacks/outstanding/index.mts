import { DatapackExport } from "../../datapack.mjs"
import { ProviderRegistry } from "../../registry/provider.mjs"
import { Registry, RegistryItem } from "../../registry/registry.mjs"
import { OPFSDataDirectoryProvider } from "./OPFSDataDir.mjs"
import {
  Editor,
  EditorPaneProvider,
  EditorProvider,
  TextAreaEditorProvider,
} from "./editorProvider.mjs"
import { FilesystemDataDirectoryProvider } from "./filesystemDataDir.mjs"
import { MonacoEditorProvider } from "./monacoEditor.mjs"
import { NotePane, NotePaneProvider } from "./notePane.mjs"
import {
  MarkedNotePreviewerProvider,
  NotePreviewerProvider,
  PreviewPaneProvider,
} from "./notePreviewer.mjs"

export type NotePaneRegistry = ProviderRegistry<NotePaneProvider<NotePane>>

const outstandingDatapack: DatapackExport = {
  metadata: {
    id: "outstanding:outstanding",
    packFormat: 0,
    friendlyName: "Outstanding (vanilla)",
    description: "The built-in datapack for Outstanding's basic features",
  },
  functions: {
    postLoad: (app) => {
      console.log("Outstanding datapack loaded, yay!")
    },
  },
  newRegistries: {
    "outstanding:editor": new ProviderRegistry<EditorProvider<Editor>>(
      "outstanding:editor"
    ) as Registry<RegistryItem>, // FIXME: Why does Typescript complain when we remove the `as`?
    "outstanding:note_pane": new ProviderRegistry<NotePaneProvider<NotePane>>(
      "outstanding:note_pane"
    ) as Registry<RegistryItem>,
    "outstanding:note_previewer": new ProviderRegistry<NotePreviewerProvider>(
      "outstanding:note_previewer"
    ) as Registry<RegistryItem>,
  },
  registryAdditions: {
    "outstanding:data_directory_provider": {
      "outstanding:filesystem_access_api": (app) =>
        new FilesystemDataDirectoryProvider(app, 100),
      "outstanding:origin_private_file_system": (app) =>
        new OPFSDataDirectoryProvider("outstanding", 200),
    },
    "outstanding:editor": {
      "outstanding:text_area": () => new TextAreaEditorProvider(),
      "outstanding:monaco_editor": () => new MonacoEditorProvider(100),
    },
    "outstanding:note_pane": {
      "outstanding:preview": (app) => new PreviewPaneProvider(app),
      "outstanding:editor": (app) => new EditorPaneProvider(app),
    },
    "outstanding:note_previewer": {
      "outstanding:marked": () => new MarkedNotePreviewerProvider(),
    },
  },
  shortcuts: [
    {
      shortcut: "Ctrl+S",
      when: "noteOpen",
      callback: (app) => {
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
  ],
  data: {
    registryAdditions: {
      "outstanding:ui_view": {
        "outstanding:git_manager": {
          id: "outstanding:git_manager",
          label: "Git",
          viewbarDisplay: {
            icon: "account_tree",
            position: "top",
          },
          sidebarContent: {
            title: "Git version control",
            plainTextContent: "Git manager view content?!",
          },
          mainbarContent: "Imagine some Git things here, I guess",
        },
      },
    },
  },
}

export default outstandingDatapack
