import { Observable } from "voby"

export abstract class Note {
  abstract id: string
  abstract label(): string
  abstract getContent(): Promise<string>
  abstract liveContent: Observable<string | null>
  abstract overwriteContent(content: string): Promise<void>
  async saveContent() {
    const content = this.liveContent()
    if (content === null) {
      return console.warn(
        "Tried to save content for note without an editor",
        this
      )
    }
    await this.overwriteContent(content)
  }
}
