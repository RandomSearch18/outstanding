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
    new PlaceholderContentWidget("Loading...", this.editorInstance)
  }

  dispose() {
    if (!this.editorInstance) return
    this.editorInstance.dispose()
  }

  currentModel() {
    const currentModel = this.editorInstance?.getModel()
    if (!currentModel) throw new Error("No editor instance/model is present")
    return currentModel
  }

  async loadContent() {
    const text = await this.note.getContent()
    this.currentModel().setValue(text)
  }

  async saveContent() {
    const text = this.currentModel().getValue()
    await this.note.overwriteContent(text)
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

/**
 * Represents an placeholder renderer for monaco editor
 * - Roughly based on https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/codeEditor/browser/untitledTextEditorHint/untitledTextEditorHint.ts
 * - Source: https://github.com/microsoft/monaco-editor/issues/568#issuecomment-1499966160
 */
class PlaceholderContentWidget implements theMonacoEditor.IContentWidget {
  private static readonly ID = "editor.widget.placeholderHint"

  private domNode: HTMLElement | undefined

  constructor(
    private readonly placeholder: string,
    private readonly editor: theMonacoEditor.ICodeEditor
  ) {
    // register a listener for editor code changes
    editor.onDidChangeModelContent(() => this.onDidChangeModelContent())
    // ensure that on initial load the placeholder is shown
    this.onDidChangeModelContent()
  }

  private onDidChangeModelContent(): void {
    if (this.editor.getValue() === "") {
      this.editor.addContentWidget(this)
    } else {
      this.editor.removeContentWidget(this)
    }
  }

  getId(): string {
    return PlaceholderContentWidget.ID
  }

  getDomNode(): HTMLElement {
    if (!this.domNode) {
      this.domNode = document.createElement("div")
      this.domNode.style.width = "max-content"
      this.domNode.style.pointerEvents = "none"
      this.domNode.textContent = this.placeholder
      this.domNode.style.fontStyle = "italic"
      this.editor.applyFontInfo(this.domNode)
    }

    return this.domNode
  }

  getPosition(): theMonacoEditor.IContentWidgetPosition | null {
    return {
      position: { lineNumber: 1, column: 1 },
      preference: [theMonacoEditor.ContentWidgetPositionPreference.EXACT],
    }
  }

  dispose(): void {
    this.editor.removeContentWidget(this)
  }
}
