import { App } from "../app.mjs"
import { Provider } from "./provider.mjs"
import areDeeplyEqual from "are-deeply-equal"
import { NamespacedId } from "./registry.mjs"
import { Observable } from "voby"
import { ReactiveMap as ObservableMap, anyObject } from "../utilities.mjs"

export type SettingsKey = string

/** Types that can be losslessly serialised and deserialised to/from JSON */
export type JSONSafe =
  | string
  | number
  | boolean
  | null
  // | JSONSafeObject
  | Record<string, anyObject>
  | JSONSafe[]

export type JSONSafeObject = {
  [key: string]: JSONSafe
}

export interface SettingsData<T extends JSONSafe> {
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
  abstract name: string
  toString(): string {
    return this.name
  }
}

export class AppSettingOwner extends SettingOwner {
  name = "internal app data"
}

export class DefaultSettingOwner extends SettingOwner {
  name = "default"
}

export class UserSettingOwner extends SettingOwner {
  name = "user"
}

export class DebugSettingOwner extends SettingOwner {
  name = "debugging aid (used during development)"
}

export interface SetSettingOptionsWithoutKey<T> {
  value: T
  owner: SettingOwner
}

export interface SetSettingOptions<T> extends SetSettingOptionsWithoutKey<T> {
  key: SettingsKey
}

/** Provides persistant storage of settings (key-value mappings) and associated metadata */
export abstract class SettingsProvider extends Provider {
  abstract init(importSettings?: SettingsMap): Promise<this>
  abstract accessor<T extends JSONSafe>(key: SettingsKey): SettingAccessor<T>
  abstract has(key: SettingsKey): boolean
  abstract set<T extends JSONSafe>(
    options: SetSettingOptions<T>
  ): SettingAccessor<T>
  abstract setIfNonexistent<T extends JSONSafe>(
    options: SetSettingOptions<T>
  ): SettingAccessor<T>
  abstract get<T extends JSONSafe>(key: SettingsKey): SettingsData<T> | null
  abstract getWithDefault<T extends JSONSafe>(
    key: SettingsKey,
    defaultValue: SetSettingOptionsWithoutKey<T>
  ): SettingsData<T>
  abstract remove(key: SettingsKey): void
  abstract getKeys(): SettingsKey[]
  abstract getObservable<T extends JSONSafe>(
    key: SettingsKey
  ): Observable<SettingsData<T>>

  debugSet<T extends JSONSafe>(key: SettingsKey, value: T) {
    // Helps us when we need to quickly set a setting in the console for testing purposes
    return this.set({ key, value, owner: new DebugSettingOwner() })
  }
}

export class SettingsWithDefaults extends SettingsProvider {
  private settings: SettingsProvider
  private defaults: Map<SettingsKey, unknown>
  id: NamespacedId
  priority: number

  constructor(
    settingsProvider: SettingsProvider,
    defaults: Map<SettingsKey, unknown>
  ) {
    super()
    this.id = settingsProvider.id
    this.priority = settingsProvider.priority
    this.settings = settingsProvider
    this.defaults = defaults
  }

  accessor<T extends JSONSafe>(key: SettingsKey): SettingAccessor<T> {
    return this.settings.accessor<T>(key)
  }

  getDefaultData<T extends JSONSafe>(key: SettingsKey): SettingsData<T> {
    const value = this.defaults.get(key) as T
    if (value === undefined)
      throw new Error(`Default setting ${key} does not exist`)
    return { value, owner: new DefaultSettingOwner() }
  }

  get<T extends JSONSafe>(key: SettingsKey): SettingsData<T> | null {
    if (this.settings.has(key)) return this.settings.get<T>(key)!
    return this.getDefaultData<T>(key)
  }

  getWithDefault<T extends JSONSafe>(): SettingsData<T> {
    throw new Error("getWithDefault() not available on SettingsWithDefaults")
  }

  getExplicitKeys(): string[] {
    return this.settings.getKeys()
  }

  getKeys(): string[] {
    const explicitKeys = this.getExplicitKeys()
    const defaultKeys = Array.from(this.defaults.keys())
    return Array.from(new Set([...explicitKeys, ...defaultKeys]))
  }

  has(key: SettingsKey) {
    return this.hasExplicitValue(key) || this.hasDefaultValue(key)
  }

  hasExplicitValue(key: SettingsKey) {
    return this.settings.has(key)
  }

  hasDefaultValue(key: SettingsKey) {
    return this.defaults.has(key)
  }

  set<T extends JSONSafe>(options: SetSettingOptions<T>): SettingAccessor<T> {
    return this.settings.set(options)
  }

  setIfNonexistent<T extends JSONSafe>(
    options: SetSettingOptions<T>
  ): SettingAccessor<T> {
    return this.settings.setIfNonexistent(options)
  }

  remove(key: SettingsKey) {
    return this.settings.remove(key)
  }

  async init(importSettings?: SettingsMap) {
    this.settings.init(importSettings)
    return this
  }

  async isAvailable() {
    return this.settings.isAvailable()
  }

  debugSet<T extends JSONSafe>(key: SettingsKey, value: T) {
    return this.settings.debugSet(key, value)
  }

  getObservable<T extends JSONSafe>(
    key: SettingsKey
  ): Observable<SettingsData<T>> {
    return this.settings.getObservable(key)
  }
}

export class SettingAccessor<T extends JSONSafe> {
  constructor(private settings: SettingsProvider, private key: SettingsKey) {}

  exists(): boolean {
    return this.settings.has(this.key)
  }

  get(): T {
    if (!this.exists()) throw new Error(`Setting ${this.key} does not exist`)
    return this.settings.get<T>(this.key)!.value
  }

  getData(): SettingsData<T> {
    if (!this.exists()) throw new Error(`Setting ${this.key} does not exist`)
    return this.settings.get<T>(this.key)!
  }

  async set(options: SetSettingOptionsWithoutKey<T>) {
    return this.settings.set({ ...options, key: this.key })
  }

  async remove() {
    return this.settings.remove(this.key)
  }
}

interface BackendStorageChange {
  oldState: SettingsFormattedForJSONBackend
  newState: SettingsFormattedForJSONBackend
}

export enum ImportSettingsResult {
  Imported,
  NotImported,
}

export type SettingsMap = Map<SettingsKey, SettingsData<JSONSafe>>

export abstract class FileLikeSettingsProvider extends SettingsProvider {
  readonly formatVersion = 1
  map: ObservableMap<SettingsKey, SettingsData<JSONSafe>>
  backendIsDirty: boolean
  priority: number

  constructor(priority: number) {
    super()
    this.priority = priority
    this.map = new ObservableMap()
    this.backendIsDirty = false
  }

  async importFromSettingsMap(settings: SettingsMap) {
    settings.forEach((data, key) => {
      this.map.set(key, data)
    })
    await this.saveSettingsToBackend()
  }

  async importSettings(
    settingsMaybe: SettingsMap | undefined
  ): Promise<ImportSettingsResult> {
    if (!settingsMaybe) return ImportSettingsResult.NotImported
    await this.importFromSettingsMap(settingsMaybe)
    return ImportSettingsResult.Imported
  }

  generateSettingsObject(): SettingsFormattedForJSONBackend {
    const settingsObject = this.map.toPlainObject()
    return {
      version: this.formatVersion,
      settings: settingsObject,
    }
  }

  abstract readFromBackend(): Promise<string>

  /**
   * Reads the settings from a file-like backend and initialises this.map with the settings
   * @throws {Error} If the back-end storage is corrupt or unusable somehow
   */
  async loadSettingsFromBackend() {
    const jsonString = await this.readFromBackend()
    let parsedData: SettingsFormattedForJSONBackend
    try {
      parsedData = JSON.parse(jsonString)
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error
      console.error("Unable to parse JSON", jsonString)
      throw error
    }

    try {
      if (parsedData.version !== this.formatVersion)
        throw new Error(
          `Data from storage backend is from an incompatible version`
        )

      // Actually load the settings
      this.map = new ObservableMap(Object.entries(parsedData.settings))
      console.log("Successfully loaded settings from local storage", this.map)
    } catch (e) {
      throw e instanceof SyntaxError
        ? new Error(`Data from storage backend is corrupt!`)
        : e
    }
  }

  /**
   * Updates the settings stored in the back-end with the current settings in this.map
   */
  async saveSettingsToBackend(): Promise<void> {
    await this.writeToBackend(this.generateSettingsObject()).then(() =>
      console.debug("Saved")
    )
  }

  abstract writeToBackend(data: SettingsFormattedForJSONBackend): Promise<void>

  abstract isAvailable(): Promise<boolean>

  abstract init(importSettings?: SettingsMap): Promise<this>

  accessor<T extends JSONSafe>(key: SettingsKey): SettingAccessor<T> {
    if (!this.has(key)) throw new Error(`Setting ${key} does not exist`)
    return new SettingAccessor<T>(this, key)
  }

  has(key: SettingsKey) {
    const keys = this.getKeys()
    return keys.includes(key)
  }

  getKeys(): string[] {
    return Array.from(this.map.keys())
  }

  get<T extends JSONSafe>(key: SettingsKey): SettingsData<T> | null {
    const data = this.map.get(key)
    if (data === undefined) return null
    return data() as SettingsData<T>
  }

  getObservable<T extends JSONSafe>(
    key: SettingsKey
  ): Observable<SettingsData<T>> {
    if (!this.has(key)) throw new Error(`Setting ${key} does not exist`)
    const observable = this.map.get(key)!
    return observable as unknown as Observable<SettingsData<T>>
  }

  getWithDefault<T extends JSONSafe>(
    key: SettingsKey,
    defaultValue: SetSettingOptionsWithoutKey<T>
  ): SettingsData<T> {
    if (!this.has(key)) return this.set({ ...defaultValue, key }).getData()
    return this.get<T>(key)!
  }

  markDirty() {
    this.backendIsDirty = true
    this.saveSettingsToBackend().then(() => {
      this.backendIsDirty = false
    })
  }

  set<T extends JSONSafe>(options: SetSettingOptions<T>): SettingAccessor<T> {
    const { key, value, owner } = options
    const data = { value, owner }
    this.map.set(key, data)
    this.markDirty()
    return this.accessor<T>(key)
  }

  setIfNonexistent<T extends JSONSafe>(
    options: SetSettingOptions<T>
  ): SettingAccessor<T> {
    const { key, value, owner } = options
    if (this.has(key)) return this.accessor<T>(key)!
    return this.set({ key, value, owner })
  }

  remove(key: SettingsKey) {
    this.map.delete(key)
    this.markDirty()
  }

  private loadChangesFromBackend(newState: SettingsFormattedForJSONBackend) {
    const currentState = this.generateSettingsObject()
    Object.entries(newState.settings).forEach(([key, data]) => {
      const currentData = currentState.settings[key]
      if (currentData === undefined) {
        // This is a newly-added setting
        this.map.set(key, data)
        return
      }
      if (!areDeeplyEqual(data, currentData)) {
        // This setting has been modified
        this.map.set(key, data)
      }
    })
  }

  /**
   * Handles the stored data in the backend being changed while the app is running
   */
  handleBackendChange(change: BackendStorageChange) {
    const { oldState, newState } = change
    const ourState = this.generateSettingsObject()
    const oldStateMatchesOurs = areDeeplyEqual(oldState, ourState)
    const newStateMatchesOurs = areDeeplyEqual(newState, ourState)

    if (oldStateMatchesOurs && newStateMatchesOurs) {
      // Both the old and new states are consistent with our internal state,
      // so possibly some superficial change like whitespace was made
      return
    }
    if (oldStateMatchesOurs && !newStateMatchesOurs) {
      // The settings have been updated by another process
      this.loadChangesFromBackend(newState)
      return
    }
    if (!oldStateMatchesOurs && newStateMatchesOurs) {
      // This shouldn't really happen but we can probably just ignore it
      // since we're already in sync with the new state
      return
    }
    // If we get here, we've managed to lose track of the localstorage state
    console.warn(
      "Settings stored in local storage were modified without our knowledge"
    )
    // Let's cut our losses and load the settings as if we were just starting up
    this.loadSettingsFromBackend()
  }
}

export interface SettingsFormattedForJSONBackend {
  version: number
  settings: {
    [key: SettingsKey]: SettingsData<JSONSafe>
  }
}

export class LocalStorageSettingsProvider extends FileLikeSettingsProvider {
  private readonly localStorageKey: string
  id: NamespacedId = "outstanding:local_storage"

  constructor(localStorageKey: string, priority: number) {
    super(priority)
    this.localStorageKey = localStorageKey
  }

  async readFromBackend() {
    const data = localStorage.getItem(this.localStorageKey)
    if (data === null) {
      throw new Error(
        `Key ${this.localStorageKey} not present in local storage`
      )
    }
    return data
  }

  async writeToBackend(data: SettingsFormattedForJSONBackend) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(data))
  }

  private writeToBackendSync(data: SettingsFormattedForJSONBackend) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(data))
  }

  private saveToLocalStorage() {
    this.writeToBackendSync(this.generateSettingsObject())
  }

  async isAvailable() {
    const isSupported = "localStorage" in window
    return isSupported
  }

  private async initialiseStorage(importSettings?: SettingsMap): Promise<void> {
    // If we're importing settings, overwrite any existing settings from localstorage with the new ones
    const importResult = await this.importSettings(importSettings)
    if (importResult === ImportSettingsResult.Imported) return

    // Check if our key is already in local storage
    const existingEntry = localStorage.getItem(this.localStorageKey)
    if (existingEntry !== null) return this.loadSettingsFromBackend()

    // If not, create a the key in local storage
    this.saveToLocalStorage()
  }

  async init(importSettings?: SettingsMap) {
    await this.initialiseStorage(importSettings)
    // Handle settings being changed by another open tab
    window.addEventListener("storage", (event) => {
      if (event.key !== this.localStorageKey) return
      if (!event.oldValue || !event.newValue) return
      this.handleBackendChange({
        oldState: JSON.parse(event.oldValue),
        newState: JSON.parse(event.newValue),
      })
    })

    return this
  }
}
