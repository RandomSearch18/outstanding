import { App } from "../../app.mjs"
import { NamespacedId } from "../../registry/registry.mjs"
import {
  DataDirectoryHandle,
  DataDirectoryProvider,
} from "../../dataDirectory/dataDirProvider.mjs"

export class FilesystemDataDirectoryProvider extends DataDirectoryProvider {
  id: NamespacedId = "outstanding:filesystem_access_api"
  priority

  async isAvailable(): Promise<boolean> {
    return "showOpenFilePicker" in window
  }

  async init(): Promise<this> {
    return this
  }

  constructor(app: App, priority: number) {
    super(app)
    this.priority = priority
  }

  async openDataDirectory(): Promise<FilesystemDataDirectoryHandle> {
    // TODO: Error handling, obviously
    const directoryHandle = await window.showDirectoryPicker({
      // Makes the browser remember the last-selected directory, scoped only to our app
      id: "outstanding_data_directory",
      mode: "readwrite",
      startIn: "documents",
    })

    return new FilesystemDataDirectoryHandle(directoryHandle).init()
  }
}

export class FilesystemDataDirectoryHandle extends DataDirectoryHandle {
  directoryHandle

  constructor(directoryHandle: FileSystemDirectoryHandle) {
    super()
    this.directoryHandle = directoryHandle
  }

  label() {
    return this.directoryHandle.name
  }

  private async getMetadataFile(): Promise<FileSystemFileHandle> {
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

  // TODO: reconsider this function
  async init(): Promise<this> {
    const metadataFile = await this.getMetadataFile()
    const metadata = await metadataFile.getFile()
    const metadataText = await metadata.text()
    console.log(metadataText)
    return this
  }
}
