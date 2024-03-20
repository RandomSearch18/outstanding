import { DatapackExport } from "../datapack.mjs"

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
    // ""
  },
}

export default outstandingDatapack
