import { App } from "../app"
import { Provider } from "./provider"
import { Registry } from "./registry"

export type SettingsKey = string

export interface SettingsData<T> {
  value: T
  /**
   * The owner of a setting is the person, process or thing that gave it its value
   *
   * For example, a datapack may set a specific setting to help it work better. We can then
   * keep track of that, so the setting can be reset on datapack uninstall. If the user
   * then decides to override the setting, the owner becomes the user, since they've explicitly
   * set thee value.
   */
  owner: SettingOwner
}

export abstract class SettingOwner {
  abstract toString(): string
}

// export abstract class AppDefaultSettingOwner extends SettingOwner {
//     toString = () => "app-provided default"
// }

export class UserSettingOwner extends SettingOwner {
  toString = () => "user"
}

export interface SetSettingOptions<T> {
  key: SettingsKey
  value: T
  owner: SettingOwner
}

/** Provides persistant storage of settings (key-value mappings) and associated metadata */
export abstract class SettingsProvider extends Provider {
  abstract has(key: SettingsKey): Promise<boolean>
  abstract set<T>(options: SetSettingOptions<T>): Promise<SettingsData<T>>
  abstract get<T>(key: SettingsKey): Promise<SettingsData<T> | null>
  abstract remove(key: SettingsKey): Promise<void>
  abstract getKeys(): Promise<SettingsKey[]>
}

interface SettingsFormattedForLocalStorage {
  version: number
  settings: {
    [key: SettingsKey]: SettingsData<unknown>
  }
}

export class LocalStorageSettingsProvider extends SettingsProvider {
  private readonly localStorageKey: string
  private readonly formatVersion = 1
  private data: Map<SettingsKey, SettingsData<unknown>>

  constructor(app: App, localStorageKey: string) {
    super(app)
    this.localStorageKey = localStorageKey
    this.data = new Map()
  }

  private loadFromLocalStorage() {
    const item = localStorage.getItem(this.localStorageKey)
    if (item === null)
      throw new Error(
        `Key ${this.localStorageKey} not present in local storage`
      )

    try {
      const parsedData = JSON.parse(item) as SettingsFormattedForLocalStorage

      if (parsedData.version !== this.formatVersion)
        throw new Error(
          `Data from local storage (${this.localStorageKey}) is from an incompatible version`
        )

      this.data = new Map(Object.entries(parsedData.settings))
      console.log("Successfully loaded settings from local storage", this.data)
    } catch (e) {
      throw e instanceof SyntaxError
        ? new Error(
            `Data from local storage (${this.localStorageKey}) is corrupt!`
          )
        : e
    }
  }

  private generateSettingsObject(): SettingsFormattedForLocalStorage {
    const settingsObject = Object.fromEntries(this.data.entries())

    return {
      version: this.formatVersion,
      settings: settingsObject,
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem(
      this.localStorageKey,
      JSON.stringify(this.generateSettingsObject())
    )
  }

  async isAvailable() {
    const isSupported = "localStorage" in window
    return isSupported
  }

  async init(importSettings?: Map<SettingsKey, SettingsData<unknown>>) {
    // If we're importing settings, overwrite any existing settings from localstorage with the new ones
    if (importSettings) {
      importSettings.forEach((data, key) => {
        this.data.set(key, data)
      })
      this.saveToLocalStorage()
      return
    }

    // Check if our key is already in local storage
    const existingEntry = localStorage.getItem(this.localStorageKey)
    if (existingEntry !== null) return this.loadFromLocalStorage()

    // If not, create a the key in local storage
    this.saveToLocalStorage()
  }

  async has(key: SettingsKey) {
    const keys = await this.getKeys()
    return keys.includes(key)
  }

  async getKeys(): Promise<string[]> {
    return Array.from(this.data.keys())
  }

  async get<T>(key: SettingsKey): Promise<SettingsData<T> | null> {
    const data = this.data.get(key)
    if (data === undefined) return null
    return data as SettingsData<T>
  }

  async set<T>(options: SetSettingOptions<T>): Promise<SettingsData<T>> {
    const { key, value, owner } = options
    const data = { value, owner }
    this.data.set(key, data)
    this.saveToLocalStorage()
    return data
  }

  async remove(key: SettingsKey) {
    this.data.delete(key)
    this.saveToLocalStorage()
  }
}
