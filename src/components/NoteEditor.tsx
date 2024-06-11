import "./NoteEditor.css"
import { $, useEffect } from "voby"
import { Note } from "../dataDirectory/note.mjs"

function NoteEditor({ note }: { note: Note }) {
  // if (!note) {
  //   return <div class="note-editor">No note :(</div>
  // }

  const initialContent = $("Loading...")
  note.getContent().then((content) => {
    initialContent(content)
  })

  return (
    <div class="note-editor height-full">
      <textarea
        class="height-full width-full"
        value={initialContent}
        placeholder="Click here to start writing..."
        autoCapitalize="sentences"
        spellCheck="true"
        onInput={console.log}
      ></textarea>
    </div>
  )
}

export default NoteEditor
