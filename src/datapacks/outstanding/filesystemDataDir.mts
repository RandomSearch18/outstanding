import { App } from "../../app.mjs"
import { NamespacedId } from "../../registry/registry.mjs"
import {
  DataDirectoryHandle,
  DataDirectoryProvider,
} from "../../dataDirectory/dataDirProvider.mjs"
import {
  FileLikeSettingsProvider,
  ImportSettingsResult,
  SettingsFormattedForJSONBackend,
  SettingsMap,
} from "../../registry/settingsProvider.mjs"

function filesystemAccessAPIAvailable() {
  return "showOpenFilePicker" in window
}

/**
 * Uses the web Filesystem Access API to provide access to a data directory in the local filesystem
 * when the app is running in a modern browser environment.
 */
export class FilesystemDataDirectoryProvider extends DataDirectoryProvider {
  id: NamespacedId = "outstanding:filesystem_access_api"
  priority

  async isAvailable(): Promise<boolean> {
    return filesystemAccessAPIAvailable()
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

export class FilesystemSettingsProvider extends FileLikeSettingsProvider {
  id: NamespacedId = "outstanding:filesystem_settings"
  private fileHandle: FileSystemFileHandle | null
  parentDirectory: FileSystemDirectoryHandle
  settingsFilename: string

  getHandle() {
    if (!this.fileHandle) {
      throw new Error("FilesystemSettingsProvider has not been initialized")
    }
    return this.fileHandle
  }

  async isAvailable(): Promise<boolean> {
    return filesystemAccessAPIAvailable()
  }

  async initializeFile(): Promise<FileSystemFileHandle> {
    try {
      return await this.parentDirectory.getFileHandle(this.settingsFilename)
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "NotFoundError"))
        throw error
      console.warn(
        `Initializing new file for data storage: ${this.settingsFilename}`
      )
      return await this.parentDirectory.getFileHandle(this.settingsFilename, {
        create: true,
      })
    }
  }

  async init(importSettings?: SettingsMap): Promise<this> {
    if (importSettings) {
      await this.importFromSettingsMap(importSettings)
    }

    this.fileHandle = await this.initializeFile()
    this.saveSettingsToBackend()

    return this
  }

  async readFromBackend(): Promise<SettingsFormattedForJSONBackend> {
    const file = await this.getHandle().getFile()
    const text = await file.text()
    return JSON.parse(text)
  }

  async writeToBackend(
    settings: SettingsFormattedForJSONBackend
  ): Promise<void> {
    const writable = await this.getHandle().createWritable()
    await writable.write(JSON.stringify(settings))
    await writable.close()
  }

  constructor(
    app: App,
    priority: number,
    directory: FileSystemDirectoryHandle,
    filename: string
  ) {
    super(app, priority)
    this.fileHandle = null
    this.parentDirectory = directory
    this.settingsFilename = filename
  }
}
