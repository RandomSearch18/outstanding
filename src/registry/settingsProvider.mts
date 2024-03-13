import { App } from "../app.mjs"
import { Provider } from "./provider.mjs"
import areDeeplyEqual from "are-deeply-equal"
import { NamespacedId } from "./registry.mjs"
import { $, Observable, store } from "voby"
import { ReactiveMap as ObservableMap } from "../utilities.mjs"

export type SettingsKey = string

/** Types that can be losslessly serialised and deserialised to/from JSON */
export type JSONSafe =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONSafe }
  | JSONSafe[]

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
    super(settingsProvider.app)
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

  async init() {
    this.settings.init()
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

interface SettingsFormattedForLocalStorage {
  version: number
  settings: {
    [key: SettingsKey]: SettingsData<JSONSafe>
  }
}

export class LocalStorageSettingsProvider extends SettingsProvider {
  private readonly localStorageKey: string
  private readonly formatVersion = 1
  private map: ObservableMap<SettingsKey, SettingsData<JSONSafe>>
  id: NamespacedId = "outstanding:local_storage"
  priority: number

  constructor(app: App, localStorageKey: string, priority: number) {
    super(app)
    this.localStorageKey = localStorageKey
    this.priority = priority
    this.map = new ObservableMap()
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

      // Actually load the settings
      this.map = new ObservableMap(Object.entries(parsedData.settings))
      console.log("Successfully loaded settings from local storage", this.map)
    } catch (e) {
      throw e instanceof SyntaxError
        ? new Error(
            `Data from local storage (${this.localStorageKey}) is corrupt!`
          )
        : e
    }
  }

  private generateSettingsObject(): SettingsFormattedForLocalStorage {
    const settingsObject = this.map.toPlainObject()
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

  private initialiseStorage(
    importSettings?: Map<SettingsKey, SettingsData<JSONSafe>>
  ) {
    // If we're importing settings, overwrite any existing settings from localstorage with the new ones
    if (importSettings) {
      importSettings.forEach((data, key) => {
        this.map.set(key, data)
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

  async init(importSettings?: Map<SettingsKey, SettingsData<JSONSafe>>) {
    this.initialiseStorage(importSettings)
    window.addEventListener("storage", this.onStoredSettingsUpdate.bind(this))

    return this
  }

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

  set<T extends JSONSafe>(options: SetSettingOptions<T>): SettingAccessor<T> {
    const { key, value, owner } = options
    const data = { value, owner }
    this.map.set(key, data)
    this.saveToLocalStorage()
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
    this.saveToLocalStorage()
  }

  private loadChangesFromLocalStorage(
    newState: SettingsFormattedForLocalStorage
  ) {
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

  private onStoredSettingsUpdate(event: StorageEvent) {
    if (event.key !== this.localStorageKey) return
    if (!event.oldValue || !event.newValue) return
    const oldState = JSON.parse(
      event.oldValue
    ) as SettingsFormattedForLocalStorage
    const newState = JSON.parse(
      event.newValue
    ) as SettingsFormattedForLocalStorage

    const ourState = this.generateSettingsObject()
    const oldStateMatchesOurs = areDeeplyEqual(oldState, ourState)
    const newStateMatchesOurs = areDeeplyEqual(newState, ourState)

    if (oldStateMatchesOurs && newStateMatchesOurs) {
      // Both the old and new states are consistent with our internal state,
      // so possibly some superficial change like whitespace was made
      return
    }
    if (oldStateMatchesOurs && !newStateMatchesOurs) {
      // The settings have been updated by another tab
      this.loadChangesFromLocalStorage(newState)
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
    this.loadFromLocalStorage()
  }
}
