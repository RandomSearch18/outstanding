// Based on Dev.to post at https://dev.to/marcogrcr/type-safe-eventtarget-subclasses-in-typescript-1nkf
// Thank you very much, Marco Gonzalez

// @ts-ignore - We're sorta abusing inheritance here since TypedEventTarget is not strictly compatible with EventTarget
export interface TypedEventTarget<EventMap> extends EventTarget {
  addEventListener<K extends keyof EventMap>(
    type: K,
    callback: (
      event: EventMap[K] extends Event ? EventMap[K] : never
    ) => EventMap[K] extends Event ? void : never,
    options?: boolean | AddEventListenerOptions
  ): void
}
