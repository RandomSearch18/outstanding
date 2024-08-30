import { App } from "../../app.mjs"
import { NamespacedId } from "../../registry/registry.mjs"
import {
  CreateNoteOptions,
  DataDirectoryHandle,
  DataDirectoryProvider,
} from "../../dataDirectory/dataDirProvider.mjs"
import {
  FileLikeSettingsProvider,
  ImportSettingsResult,
  SettingsFormattedForJSONBackend,
  SettingsMap,
} from "../../registry/settingsProvider.mjs"
import { Observable } from "voby"
import $ from "oby"
import { Note } from "../../dataDirectory/note.mjs"

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
    super()
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

    return new FilesystemDataDirectoryHandle(directoryHandle, this).init()
  }
}

export class FilesystemDataDirectoryHandle extends DataDirectoryHandle {
  directoryHandle
  metadataStore: FilesystemSettingsProvider
  wasInitializedThisSession = false
  $notes = $([] as Note[])
  dataDirProvider

  constructor(
    directoryHandle: FileSystemDirectoryHandle,
    fromProvider: DataDirectoryProvider
  ) {
    super()
    this.directoryHandle = directoryHandle
    this.dataDirProvider = fromProvider
    this.metadataStore = new FilesystemSettingsProvider(
      0,
      this.directoryHandle,
      "outstanding.json"
    )
  }

  label() {
    return this.directoryHandle.name
  }

  async init(): Promise<this> {
    await this.metadataStore.init()
    this.metadataStore
      .readFromBackend()
      .then((data) => console.debug("Loaded metadata store", data))
    this.wasInitializedThisSession = this.metadataStore.isNewFile
    this.getNotes().then((notes) => {
      this.$notes(notes)
    })
    return this
  }

  private async getNoteFiles() {
    // Find all *.md files in the directory
    const entries = this.directoryHandle.values()
    const notes = []
    for await (const entry of entries) {
      if (entry.kind === "file" && entry.name.endsWith(".md")) {
        notes.push(entry)
      }
    }
    return notes
  }

  async getNoteById(id: string) {
    for await (const entry of this.directoryHandle.values()) {
      if (entry.kind === "file" && entry.name === id) {
        return new FilesystemNoteHandle(entry)
      }
    }
    return null
  }

  async getNotes() {
    const notes = await this.getNoteFiles()
    return notes.map((entry) => new FilesystemNoteHandle(entry))
  }

  async createNote(options: CreateNoteOptions): Promise<Note> {
    const { filename: basename } = options
    const fullFilename = `${basename}.md`
    const existingFile = await this.directoryHandle
      .getFileHandle(fullFilename)
      .catch((e) => {
        if (e instanceof DOMException && e.name === "NotFoundError") {
          return null
        }
        throw e
      })
    if (existingFile) {
      const newFilename = `${basename} (1)`
      return this.createNote({
        ...options,
        filename: newFilename,
      })
    }
    const fileHandle = await this.directoryHandle.getFileHandle(fullFilename, {
      create: true,
    })

    const note = new FilesystemNoteHandle(fileHandle)
    this.$notes([...this.$notes(), note])
    console.debug("Created note", note)
    return note
  }
}

export class FilesystemNoteHandle extends Note {
  id
  fileHandle
  liveContent = $<string | null>(null)

  constructor(fileHandle: FileSystemFileHandle) {
    super()
    this.id = fileHandle.name
    this.fileHandle = fileHandle
  }

  label() {
    return this.fileHandle.name
  }

  async getContent() {
    const file = await this.fileHandle.getFile()
    return await file.text()
  }

  async overwriteContent(content: string) {
    const writable = await this.fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  }
}

export class FilesystemSettingsProvider extends FileLikeSettingsProvider {
  id: NamespacedId = "outstanding:filesystem_settings"
  private fileHandle: FileSystemFileHandle | null
  parentDirectory: FileSystemDirectoryHandle
  settingsFilename: string
  /** Set to true if the file was created within the lifetime of this class instance */
  isNewFile: boolean = false

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
      return await this.parentDirectory
        .getFileHandle(this.settingsFilename, {
          create: true,
        })
        .then((fileHandle) => {
          this.isNewFile = true
          return fileHandle
        })
    }
  }

  async init(importSettings?: SettingsMap): Promise<this> {
    if (importSettings) {
      await this.importFromSettingsMap(importSettings)
    }

    this.fileHandle = await this.initializeFile()
    await this.saveSettingsToBackend()

    return this
  }

  async readFromBackend(): Promise<string> {
    const file = await this.getHandle().getFile()
    const text = await file.text()
    return text
  }

  async writeToBackend(
    settings: SettingsFormattedForJSONBackend
  ): Promise<void> {
    const writable = await this.getHandle().createWritable()
    await writable.write(JSON.stringify(settings))
    await writable.close()
  }

  constructor(
    priority: number,
    directory: FileSystemDirectoryHandle,
    filename: string
  ) {
    super(priority)
    this.fileHandle = null
    this.parentDirectory = directory
    this.settingsFilename = filename
  }
}
