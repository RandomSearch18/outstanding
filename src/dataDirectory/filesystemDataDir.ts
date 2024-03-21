import { App } from "../app.mjs"
import { NamespacedId } from "../registry/registry.mjs"
import { DataDirectoryProvider } from "./dataDirProvider"

class FilesystemDataDirectory extends DataDirectoryProvider {
  directoryHandle
  id: NamespacedId = "outstanding:file_system"
  priority

  constructor(
    app: App,
    directoryHandle: FileSystemDirectoryHandle,
    priority: number
  ) {
    super(app)
    this.directoryHandle = directoryHandle
    this.priority = priority
  }

  label() {
    return this.directoryHandle.name
  }

  async isAvailable(): Promise<boolean> {
    return "showOpenFilePicker" in window
  }

  async getMetadataFile(): Promise<FileSystemFileHandle> {
    // The outstanding.json file marks this folder as a Outstanding data directory, and stores metadata about the data directory
    try {
      const metadataFile = await this.directoryHandle.getFileHandle(
        "outstanding.json"
      )
      return metadataFile
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "NotFoundError"))
        throw error
      console.warn("Initializing new data directory")

      const metadataFile = await this.directoryHandle.getFileHandle(
        "outstanding.json",
        { create: true }
      )
      return metadataFile
    }
  }

  async init(): Promise<this> {
    const metadataFile = await this.getMetadataFile()
    const metadata = await metadataFile.getFile()
    const metadataText = await metadata.text()
    console.log(metadataText)
    return this
  }
}
