export type Anything =
  | object
  | Function
  | string
  | number
  | boolean
  | null
  | undefined

export type AnythingBut<T> = Exclude<Anything, T>
