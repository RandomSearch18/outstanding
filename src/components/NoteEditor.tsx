import "./NoteEditor.css"
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
    <div class="note-editor height-full">
      <textarea
        class="height-full width-full"
        value={textAreaContent}
      ></textarea>
    </div>
  )
}

export default NoteEditor
