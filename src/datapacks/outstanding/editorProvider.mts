import { createElement } from "voby"
import { Note } from "../../dataDirectory/note.mjs"
import { Provider } from "../../registry/provider.mjs"
import { NamespacedId } from "../../registry/registry.mjs"

export abstract class Editor {
  readonly note

  constructor(note: Note) {
    this.note = note
  }

  abstract addToDOM(parent: Element): void
  abstract loadContent(): Promise<void>
  abstract saveContent(): Promise<void>
  abstract dispose(): void
}

export abstract class EditorProvider<T extends Editor> extends Provider {
  abstract createEditor(note: Note): T
}

export class TextAreaEditorProvider extends EditorProvider<TextAreaEditor> {
  id: NamespacedId = "outstanding:textarea"
  priority = 0

  async isAvailable() {
    return true
  }

  async init() {
    return this
  }

  createEditor(note: Note) {
    return new TextAreaEditor(note)
  }
}

export class TextAreaEditor extends Editor {
  element: HTMLTextAreaElement | null = null
  private contentInMemory: string | null = null

  constructor(note: Note) {
    super(note)
  }

  addToDOM(parent: Element) {
    import("./TextAreaEditor.css") // FIXME: Add a proper way to include CSS files in datapacks
    const textarea = createElement("textarea", {
      class: "height-full width-full",
      placeholder: "Click here to start writing...",
      autoCapitalize: "sentences",
      spellCheck: true,
      oninput: console.log,
      value: "Loading...",
    })()
    const wrapper = createElement(
      "div",
      { class: "text-area-editor note-editor height-full" },
      textarea
    )() as Element
    if (!(textarea instanceof HTMLTextAreaElement))
      throw new Error("Voby createElement did not work as expected :O")
    parent.replaceChildren(wrapper)
    this.element = textarea
  }

  async loadContent() {
    this.contentInMemory = await this.note.getContent()
    if (!this.element) return
    this.element.value = this.contentInMemory
    this.element.addEventListener("input", () => {
      if (!this.element) return
      this.contentInMemory = this.element?.value
    })
  }

  async saveContent() {
    if (this.contentInMemory === null) {
      return console.warn(
        "Tried to save content for note without an editor",
        this.note
      )
    }
    await this.note.overwriteContent(this.contentInMemory)
  }
}
