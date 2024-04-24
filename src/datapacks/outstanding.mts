import { DatapackExport } from "../datapack.mjs"
import { FilesystemDataDirectoryProvider } from "./outstanding/filesystemDataDir.mjs"

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
    },
  },
}

export default outstandingDatapack
