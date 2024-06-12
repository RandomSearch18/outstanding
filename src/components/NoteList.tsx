import { For, FunctionMaybe, useMemo } from "voby"
import "./NoteList.css"

export interface NoteListItem {
  label: string
  onClick?: (e: MouseEvent) => void
  isActive?: () => boolean
}

function NoteList({
  items,
  sortByLabel = false,
  ifEmpty = <></>,
}: {
  items: () => NoteListItem[]
  sortByLabel?: boolean
  ifEmpty?: JSX.Child
}) {
  const sortedItems = useMemo(() =>
    sortByLabel
      ? items().sort((a, b) => a.label.localeCompare(b.label))
      : items()
  )

  return (
    <ul class="note-list">
      <For
        values={sortedItems}
        fallback={<div class="empty-list-fallback">{ifEmpty}</div>}
      >
        {(item) => {
          return (
            <li onClick={item.onClick}>
              <a
                href="#"
                class={{
                  active: () => item.isActive?.() ?? false,
                }}
              >
                <div class="wave">{item.label}</div>
              </a>
            </li>
          )
        }}
      </For>
    </ul>
  )
}

export default NoteList
