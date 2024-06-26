// export interface NoteOptions {

// }

export abstract class Note {
  abstract id: string
  abstract label(): string
  abstract getContent(): Promise<string>
  abstract overwriteContent(content: string): Promise<void>
}
