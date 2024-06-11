import { Note } from "./dataDirectory/note.mjs"

export class NoteEditorManager {
  readonly note
  textarea: HTMLTextAreaElement | null = null
  private contentInMemory: string | null = null

  constructor(note: Note, editor?: HTMLTextAreaElement) {
    this.note = note
    editor && this.attachEditor(editor)
  }

  loadContent(content: string) {
    this.contentInMemory = content
    if (this.textarea) this.textarea.value = content
  }

  attachEditor(editor: HTMLTextAreaElement) {
    editor.value = "Loading..."
    this.textarea = editor
    this.note.getContent().then((content) => {
      this.loadContent(content)
      editor.addEventListener("input", () => {
        this.contentInMemory = editor.value
      })
    })
  }

  saveContent() {
    if (this.contentInMemory === null)
      return console.warn(
        "Tried to save content for note without an editor",
        this.note
      )
    this.note.overwriteContent(this.contentInMemory)
  }
}
