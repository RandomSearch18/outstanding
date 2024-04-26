import { App } from "../../app.mjs"
import { NamespacedId } from "../../registry/registry.mjs"
import {
  DataDirectoryHandle,
  DataDirectoryProvider,
} from "../../dataDirectory/dataDirProvider.mjs"

/**
 * Uses the web Filesystem Access API to provide access to a data directory in the local filesystem
 * when the app is running in a modern browser environment.
 */
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
      // Initialise the file with an empty object, so that it's valid JSON
      const writable = await metadataFile.createWritable()
      await writable.write(JSON.stringify({}))
      await writable.close()
      return metadataFile
    }
  }

  // TODO: reconsider this function
  async init(): Promise<this> {
    const metadataFile = await this.getMetadataFile()
    const metadata = await metadataFile.getFile()
    const metadataText = await metadata.text()
    console.log(JSON.parse(metadataText))
    return this
  }
}
