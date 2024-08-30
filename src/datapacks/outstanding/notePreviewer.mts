import { Note } from "../../dataDirectory/note.mjs"
import { Provider } from "../../registry/provider.mjs"
import { NamespacedId } from "../../registry/registry.mjs"

export abstract class NotePreviewerProvider extends Provider {
  abstract renderNotePreview(note: Note, parent: Element): Promise<void>
}

export class MarkedNotePreviewer extends NotePreviewerProvider {
  id: NamespacedId = "outstanding:marked_note_previewer"
  marked: typeof import("marked") | null = null
  priority = 0

  async isAvailable() {
    return true
  }

  async init() {
    this.marked = await import("marked")
    return this
  }

  getMarked() {
    if (!this.marked) {
      throw new Error("Not initialized yet")
    }
    return this.marked
  }

  async renderNotePreview(note: Note, parent: Element) {
    const content = note.liveContent() || (await note.getContent())
    if (note.liveContent() === null) {
      console.warn("Rendering a note that hasn't been loaded yet")
    }
    const div = document.createElement("div")
    const result = await this.getMarked().parse(content)
    div.innerHTML = result
  }
}
