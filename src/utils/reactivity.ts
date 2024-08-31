import { AnythingBut } from "./typeUtils"

/**
 * "Unwraps" a FunctionMaybe.
 *
 * * Returns either the provided value, or the return value of the provided function.
 * * The only limitation is that a FunctionMaybe<Function> is not allowed, because we wouldn't know whether to call the argument or not!
 */
export function unfun<T extends AnythingBut<Function>>(
  functionMaybe: T | (() => T)
): T {
  if (typeof functionMaybe !== "function") return functionMaybe
  return functionMaybe()
}
