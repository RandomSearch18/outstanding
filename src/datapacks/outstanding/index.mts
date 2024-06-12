import { DatapackExport } from "../../datapack.mjs"
import { Provider, ProviderRegistry } from "../../registry/provider.mjs"
import { Registry, RegistryItem } from "../../registry/registry.mjs"
import { SettingsProvider } from "../../registry/settingsProvider.mjs"
import { OPFSDataDirectoryProvider } from "./OPFSDataDir.mjs"
import {
  Editor,
  EditorProvider,
  TextAreaEditorProvider,
} from "./editorProvider.mjs"
import { FilesystemDataDirectoryProvider } from "./filesystemDataDir.mjs"

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
    },
  },
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
