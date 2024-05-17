import { For, FunctionMaybe } from "voby"
import "./NoteList.css"

export interface NoteListItem {
  label: string
  onClick?: (e: MouseEvent) => void
}

function NoteList({ items }: { items: FunctionMaybe<NoteListItem[]> }) {
  return (
    <ul class="note-list">
      <For values={items}>
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
