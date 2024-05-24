import { DatapackExport } from "../../datapack.mjs"
import { OPFSDataDirectoryProvider } from "./OPFSDataDir.mjs"
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
  registryAdditions: {
    "outstanding:data_directory_provider": {
      "outstanding:filesystem_access_api": (app) =>
        new FilesystemDataDirectoryProvider(app, 100),
      "outstanding:origin_private_file_system": (app) =>
        new OPFSDataDirectoryProvider("outstanding", 200),
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
        },
      },
    },
  },
}

export default outstandingDatapack
