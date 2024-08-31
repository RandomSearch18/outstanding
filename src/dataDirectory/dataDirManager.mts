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
import { NotePane } from "../datapacks/outstanding/notePane.mjs"
import { Note } from "./note.mjs"

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

  /** Opens a note from the current data directory using a provided ID */
  async openNote(noteId: string) {
    if (!this.currentDirectory) {
      throw new Error("No data directory open")
    }
    const note = await this.currentDirectory.getNoteById(noteId)
    if (!note) {
      throw new Error(`Note with id ${noteId} not found`)
    }
    const existingEditor = this.$currentEditor()
    if (existingEditor) {
      existingEditor.dispose()
    }
    const editorProviders = this.app.registries.getItem(
      "outstanding:editor"
    ) as ProviderRegistry<EditorProvider<Editor>> | undefined
    if (!editorProviders) {
      throw new Error("Editor provider registry is not present!")
    }
    const editorProvider = await editorProviders
      .getBestProvider()
      .then((provider) => provider.init())
    const editor = editorProvider.createEditor(note)
    const targetElement = document.querySelector(".main-editor-wrapper")
    if (!targetElement) throw new Error("Main editor wrapper is missing")
    editor.addToDOM(targetElement)
    editor.loadContent()
    this.$currentEditor(editor)
  }
}
