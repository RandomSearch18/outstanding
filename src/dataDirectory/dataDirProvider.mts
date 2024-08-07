import { Observable } from "voby"
import { Provider } from "../registry/provider.mjs"
import { Note } from "./note.mjs"

export abstract class DataDirectoryProvider extends Provider {
  abstract openDataDirectory(): Promise<DataDirectoryHandle>
}

export interface CreateNoteOptions {
  filename: string
}

export abstract class DataDirectoryHandle {
  abstract label(): string
  abstract dataDirProvider: DataDirectoryProvider
  abstract wasInitializedThisSession: boolean
  abstract $notes: Observable<Note[]>

  abstract getNotes(): Promise<Note[]>
  abstract getNoteById(id: string): Promise<Note | null>

  abstract createNote(options: CreateNoteOptions): Promise<Note>
}
