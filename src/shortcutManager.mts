import ContextKeys from "context-keys"
import { Expression, Key } from "context-keys/dist/types"
import ShoSho from "shosho"
import { Disposer, Format } from "shosho/dist/types"

export interface ShortcutOptions {
  shortcut: Key
  callback: () => void
  when: Expression
}

interface AddedShortcut {
  shortcut: Key | `-${Key}`
  callback: () => void
  when: Expression
  dispose: Disposer
}

export function keybindingsAreEqual(a: Key, b: Key): boolean {
  const format: Format = "short-inflexible-directional"
  return ShoSho.format(a, format) === ShoSho.format(b, format)
}

export class ShortcutsManager {
  shoSho
  contextKeys
  shortcuts: AddedShortcut[] = []

  constructor(shoSho: ShoSho, contextKeys: ContextKeys) {
    this.shoSho = shoSho
    this.contextKeys = contextKeys
  }

  private handleShortcutPress(shortcut: ShortcutOptions): boolean {
    const shouldRun = !shortcut.when || this.contextKeys.eval(shortcut.when)
    if (!shouldRun) return false
    shortcut.callback()
    return true
  }

  add(shortcut: ShortcutOptions) {
    // Starting a keybinding with a minus sign removes all previously-registered shortcuts for that keybinding
    if (shortcut.shortcut.startsWith("-")) {
      const keybinding = shortcut.shortcut.slice(1)
      this.remove(keybinding)
      return
    }

    const disposer = this.shoSho.register(shortcut.shortcut, () =>
      this.handleShortcutPress(shortcut)
    )
    this.shortcuts.push({ ...shortcut, dispose: disposer })
  }

  remove(keybinding: Key) {
    this.shortcuts = this.shortcuts.filter((shortcut) => {
      const shouldRemove = keybindingsAreEqual(shortcut.shortcut, keybinding)
      if (shouldRemove) shortcut.dispose()
      return !shouldRemove
    })
  }

  clearShortcuts() {
    this.shoSho.reset()
    this.shortcuts = []
  }

  start() {
    this.shoSho.start()
  }

  stop() {
    this.shoSho.stop()
  }
}
