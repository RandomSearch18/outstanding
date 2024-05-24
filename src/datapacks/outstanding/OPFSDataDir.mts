import {
  DataDirectoryHandle,
  DataDirectoryProvider,
} from "../../dataDirectory/dataDirProvider.mjs"
import { FilesystemDataDirectoryHandle } from "./filesystemDataDir.mjs"

/**
 * Uses the Origin-Private File System web API to provide a persistent store for data directories,
 * which doesn't correspond to a real filesystem directory on the user's computer.
 */
export class OPFSDataDirectoryProvider extends DataDirectoryProvider {
  id = "outstanding:origin_private_file_system" as const
  priority
  folderName

  constructor(folderName: string, priority: number) {
    super()
    this.priority = priority
    this.folderName = folderName
  }

  async isAvailable(): Promise<boolean> {
    return "getDirectory" in navigator.storage
  }

  async init() {
    return this
  }

  async openDataDirectory(): Promise<FilesystemDataDirectoryHandle> {
    const root = await navigator.storage.getDirectory()
    const directoryHandle = await root.getDirectoryHandle(this.folderName, {
      create: true,
    })
    return new FilesystemDataDirectoryHandle(directoryHandle, this).init()
  }
}
