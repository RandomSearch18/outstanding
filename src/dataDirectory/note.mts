// export interface NoteOptions {

import { Observable } from "voby"

// }

export abstract class Note {
  abstract id: string
  abstract label(): string
  abstract getContent(): Promise<string>
  abstract liveContent: Observable<string | null>
  abstract overwriteContent(content: string): Promise<void>
}
