import { Note } from "../../dataDirectory/note.mjs"
import { Provider } from "../../registry/provider.mjs"

export abstract class NotePaneProvider<T extends NotePane> extends Provider {
  abstract createNotePane(note: Note, parent: Element): T
  icon: HTMLElement | null = null
  friendlyName: string | null = null
}

export abstract class NotePane {
  readonly note: Note
  readonly element: Element

  constructor(note: Note, element: Element) {
    this.note = note
    this.element = element
  }

  abstract render(): Promise<void>
  abstract dispose(): void
}
