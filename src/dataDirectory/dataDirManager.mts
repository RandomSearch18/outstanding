import { $, Observable, useEffect } from "voby"
import { ProviderRegistry } from "../registry/provider.mjs"
import {
  DataDirectoryHandle,
  DataDirectoryProvider,
} from "./dataDirProvider.mjs"
import { App } from "../app.mjs"
import {
  Editor,
  EditorProvider,
} from "../datapacks/outstanding/editorProvider.mjs"
import {
  NotePane,
  NotePaneProvider,
} from "../datapacks/outstanding/notePane.mjs"
import { Note } from "./note.mjs"
import { NotePaneRegistry } from "../datapacks/outstanding/index.mjs"

export class DataDirectoryManager {
  app
  providerRegistry: ProviderRegistry<DataDirectoryProvider>
  activeProvider: DataDirectoryProvider | null = null
  currentDirectory: DataDirectoryHandle | null = null
  /** @deprecated */
  $currentEditor: Observable<Editor | null> = $<Editor | null>(null)
  $currentPane: Observable<NotePane | null> = $<NotePane | null>(null)
  $currentNote: Observable<Note | null> = $<Note | null>(null)
  $directoryIsOpen = $(false)

  constructor(
    app: App,
    providerRegistry: ProviderRegistry<DataDirectoryProvider>
  ) {
    this.providerRegistry = providerRegistry
    this.app = app

    useEffect(() => {
      app.contextKeys.set("dataDirectoryOpen", this.$directoryIsOpen())
      app.contextKeys.set("editorOpen", !!this.$currentEditor())
    })
  }

  async chooseProvider() {
    const newProvider = await this.providerRegistry
      .getBestProvider()
      .then((provider) => provider.init())
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

  async openDataDirectory(providedProvider?: DataDirectoryProvider) {
    const provider = providedProvider || (await this.getActiveProvider())
    const directory = await provider.openDataDirectory()
    this.currentDirectory = directory
    this.$directoryIsOpen(true)
    return directory
  }

  activatePane(paneProvider: NotePaneProvider<NotePane>) {
    const note = this.$currentNote()
    if (!note) return console.warn("Not opening pane: no note open!")
    const targetElement = document.querySelector(".main-editor-wrapper")
    if (!targetElement) throw new Error("Main editor wrapper is missing")
    const pane = paneProvider.createNotePane(note, targetElement)
    this.$currentPane()?.dispose()
    pane.render()
    this.$currentPane(pane)
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
    this.$currentNote(note)
    const paneRegistry = this.app.registries.getItem(
      "outstanding:note_pane"
    ) as NotePaneRegistry | undefined
    if (!paneRegistry) {
      throw new Error("No note pane registry available")
    }
    const defaultPaneProvider = await paneRegistry.getBestProvider()
    this.activatePane(await defaultPaneProvider.init())
  }
}
