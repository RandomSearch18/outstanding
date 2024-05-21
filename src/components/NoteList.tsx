import { For, FunctionMaybe, useMemo } from "voby"
import "./NoteList.css"

export interface NoteListItem {
  label: string
  onClick?: (e: MouseEvent) => void
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
              <a href="#">
                <div>{item.label}</div>
              </a>
            </li>
          )
        }}
      </For>
    </ul>
  )
}

export default NoteList

/*
function NoteList({
  items,
  sortByLabel = false,
  sortByCustom,
}: {
  items: () => NoteListItem[]
  sortByLabel?: boolean
  sortByCustom?: unknown[]
}) {
  const sortedItems = useMemo(() => {
    if (sortByLabel)
      return items().sort((a, b) => a.label.localeCompare(b.label))
    if (sortByCustom)
      return items().sort((a, b) => {
        const aIndex = sortByCustom.indexOf(a.label)
        const bIndex = sortByCustom.indexOf(b.label)
        return aIndex - bIndex
      })
  })
  */
