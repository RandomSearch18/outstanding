import { createElement } from "voby"
import { Note } from "../../dataDirectory/note.mjs"
import { Provider, ProviderRegistry } from "../../registry/provider.mjs"
import { NamespacedId } from "../../registry/registry.mjs"
import { NotePane, NotePaneProvider } from "./notePane.mjs"
import { App } from "../../app.mjs"

export class EditorPaneProvider extends NotePaneProvider<Editor> {
  id: NamespacedId = "outstanding:editor"
  priority = 100
  selectedProvider: EditorProvider<Editor> | null = null
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
      "outstanding:editor"
    ) as ProviderRegistry<EditorProvider<Editor>>
    this.selectedProvider = await registry
      .getBestProvider()
      .then((p) => p.init())
    return this
  }

  createNotePane(note: Note, parent: Element): Editor {
    if (!this.selectedProvider)
      throw new Error("No pre-selected provider. Forgot to init?")
    return this.selectedProvider.createEditor(note, parent)
  }
}

export abstract class Editor extends NotePane {
  constructor(note: Note, element: Element) {
    super(note, element)
  }

  abstract render(): Promise<void>
  abstract loadContent(): Promise<void>
  abstract saveContent(): Promise<void>
  abstract dispose(): void
}

export abstract class EditorProvider<T extends Editor> extends Provider {
  abstract createEditor(note: Note, element: Element): T
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

  createEditor(note: Note, element: Element) {
    return new TextAreaEditor(note, element)
  }
}

export class TextAreaEditor extends Editor {
  textArea: HTMLTextAreaElement | null = null

  constructor(note: Note, element: Element) {
    super(note, element)
  }

  async render() {
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
    this.element.replaceChildren(wrapper)
    this.textArea = textarea
  }

  async loadContent() {
    this.note.liveContent(await this.note.getContent())
    if (!this.textArea) return
    this.textArea.value = this.note.liveContent()!
    this.textArea.addEventListener("input", () => {
      if (!this.textArea) return
      this.note.liveContent(this.textArea.value)
    })
  }

  async saveContent() {
    const content = this.note.liveContent()
    if (content === null) {
      return console.warn(
        "Tried to save content for note without an editor",
        this.note
      )
    }
    await this.note.overwriteContent(content)
  }

  dispose() {
    if (!this.textArea) return
    this.textArea.remove()
  }
}
