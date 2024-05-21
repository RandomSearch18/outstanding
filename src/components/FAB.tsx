import { If } from "voby"
import Icon from "./Icon"

function FAB({
  icon,
  label,
  onClick,
}: {
  icon: string
  label?: JSX.Child
  onClick?: (event: MouseEvent) => void
}) {
  return (
    <button
      onClick={onClick}
      class="square round expanded extra medium-elevate"
    >
      <Icon>{icon}</Icon>
      <If when={label}>
        <span>{label}</span>
      </If>
    </button>
  )
}

export default FAB
