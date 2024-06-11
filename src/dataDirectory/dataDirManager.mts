import { $, Observable } from "voby"
import { ProviderRegistry } from "../registry/provider.mjs"
import {
  DataDirectoryHandle,
  DataDirectoryProvider,
} from "./dataDirProvider.mjs"
import { Note } from "./note.mjs"
import { NoteEditorManager } from "../noteEditorManager.mjs"

export class DataDirectoryManager {
  providerRegistry: ProviderRegistry<DataDirectoryProvider>
  activeProvider: DataDirectoryProvider | null = null
  currentDirectory: DataDirectoryHandle | null = null
  $currentNote: Observable<NoteEditorManager | null> =
    $<NoteEditorManager | null>(null)
  $directoryIsOpen = $(false)

  constructor(providerRegistry: ProviderRegistry<DataDirectoryProvider>) {
    this.providerRegistry = providerRegistry
  }

  async chooseProvider() {
    const newProvider = await this.providerRegistry.getBestProvider()
    this.setActiveProvider(newProvider)
  }

  setActiveProvider(provider: DataDirectoryProvider) {
    this.activeProvider = provider
  }

  async getActiveProvider() {
    if (this.activeProvider === null) {
      await this.chooseProvider()
    }
    return this.activeProvider!
  }

  async openDataDirectory() {
    const provider = await this.getActiveProvider()
    const directory = await provider.openDataDirectory()
    this.currentDirectory = directory
    this.$directoryIsOpen(true)
    return directory
  }

  /** Opens a note from the current data directory using a provided ID */
  async openNote(noteId: string) {
    if (!this.currentDirectory) {
      throw new Error("No data directory open")
    }
    const note = await this.currentDirectory.getNoteById(noteId)
    if (!note) {
      throw new Error(`Note with id ${noteId} not found`)
    }
    this.$currentNote(new NoteEditorManager(note))
  }
}
