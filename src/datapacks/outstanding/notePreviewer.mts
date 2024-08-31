import { parse as markedParse } from "marked"
import { App } from "../../app.mjs"
import { Note } from "../../dataDirectory/note.mjs"
import { Provider, ProviderRegistry } from "../../registry/provider.mjs"
import { NamespacedId } from "../../registry/registry.mjs"
import { NotePane, NotePaneProvider } from "./notePane.mjs"
import { mdiEye } from "@mdi/js"

export class PreviewPaneProvider extends NotePaneProvider<NotePreviewer> {
  id: NamespacedId = "outstanding:preview"
  friendlyName = "Preview"
  icon = mdiEye
  priority = 0
  selectedProvider: NotePreviewerProvider | null = null
  app

  constructor(app: App) {
    super()
    this.app = app
  }

  async isAvailable() {
    return true
  }

  async init() {
    const registry = this.app.registries.getItem(
      "outstanding:note_previewer"
    ) as ProviderRegistry<NotePreviewerProvider>
    this.selectedProvider = await registry.getBestProvider()
    return this
  }

  createNotePane(note: Note, parent: Element): NotePreviewer {
    if (!this.selectedProvider)
      throw new Error("No pre-selected provider. Forgot to init?")
    return this.selectedProvider.createNotePreviewer(note, parent)
  }
}

export abstract class NotePreviewerProvider extends Provider {
  abstract createNotePreviewer(note: Note, parent: Element): NotePreviewer
}

export class MarkedNotePreviewerProvider extends NotePreviewerProvider {
  id: NamespacedId = "outstanding:marked"
  priority = 0

  async init() {
    return this
  }

  async isAvailable() {
    return true
  }

  createNotePreviewer(note: Note, parent: Element) {
    return new MarkedNotePreviewer(note, parent)
  }
}

export abstract class NotePreviewer extends NotePane {}

export class MarkedNotePreviewer extends NotePreviewer {
  constructor(note: Note, parent: Element) {
    super(note, parent)
  }

  async render() {
    const content = this.note.liveContent() || (await this.note.getContent())
    if (this.note.liveContent() === null) {
      console.warn("Rendering a note that hasn't been loaded yet")
    }
    const div = document.createElement("div")
    const result = await markedParse(content)
    div.innerHTML = result
  }

  dispose() {
    // Probably nothing to do here
  }
}
