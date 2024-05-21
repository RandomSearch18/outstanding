import { FunctionMaybe } from "voby"

function Icon({ children }: { children: FunctionMaybe<string> }) {
  return (
    <svg viewBox="0 0 24 24">
      <path d={children} />
    </svg>
  )
}

export default Icon
