import { Note } from "../../dataDirectory/note.mjs"
import { NamespacedId } from "../../registry/registry.mjs"
import { Editor, EditorProvider } from "./editorProvider.mjs"
import { editor as theMonacoEditor } from "monaco-editor"

// Resources:
//  - https://github.com/microsoft/monaco-editor/blob/main/docs/integrate-esm.md#using-vite

export class MonacoEditorEditor extends Editor {
  editorInstance: theMonacoEditor.IStandaloneCodeEditor | null = null

  addToDOM(parent: HTMLElement) {
    parent.innerHTML = ""
    this.editorInstance = theMonacoEditor.create(parent, {
      value: "Loading...",
      theme: document.body.matches(".dark") ? "vs-dark" : "vs",
      language: "markdown",
      renderLineHighlightOnlyWhenFocus: true,
      automaticLayout: true,
    })
    this.editorInstance.focus()
  }

  dispose() {
    if (!this.editorInstance) return
    this.editorInstance.dispose()
  }

  async loadContent() {
    // TODO
  }

  async saveContent() {
    //TODO
  }
}

async function getWorker(language?: string) {
  const importTarget = language
    ? `/node_modules/monaco-editor/esm/vs/language/${language}/${language}.worker?worker`
    : `/node_modules/monaco-editor/esm/vs/editor/editor.worker?worker`
  const { default: worker } = await import(/* @vite-ignore */ importTarget)
  return new worker()
}

export class MonacoEditorProvider extends EditorProvider<MonacoEditorEditor> {
  id: NamespacedId = "outstanding:monaco_editor"
  priority: number

  constructor(priority: number = 0) {
    super()
    this.priority = priority
  }

  createEditor(note: Note) {
    return new MonacoEditorEditor(note)
  }

  async init() {
    import("./MonacoEditor.css")
    ;(window as any).MonacoEnvironment = {
      getWorker: async function (_: string, label: string) {
        return label === "editorWorkerService" ? getWorker() : getWorker(label)
      },
    }
    return this
  }

  async isAvailable() {
    return true
  }
}
