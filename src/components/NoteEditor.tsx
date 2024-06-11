import { $ } from "voby"
import { Note } from "../dataDirectory/note.mjs"

function NoteEditor({ note }: { note: Note }) {
  // if (!note) {
  //   return <div class="note-editor">No note :(</div>
  // }

  const textAreaContent = $("Loading...")
  note.getContent().then((content) => {
    textAreaContent(content)
  })

  return (
    <div class="note-editor">
      <textarea value={textAreaContent} alt={textAreaContent}></textarea>
    </div>
  )
}

export default NoteEditor
