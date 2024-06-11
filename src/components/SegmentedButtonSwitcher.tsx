import { For, FunctionMaybe, Observable } from "voby"
import SegmentedButtons from "./SegmentedButtons"

interface SegmentedButtonSwitcherButton {
  content: JSX.Child
}

function SegmentedButtonSwitcher<K extends string | number | symbol>({
  buttons,
  selected,
}: {
  buttons: FunctionMaybe<Record<K, SegmentedButtonSwitcherButton>>
  selected: Observable<K>
}) {
  return (
    <SegmentedButtons
      buttons={Object.entries(buttons).map(([key, button], i) => ({
        content: button.content,
        onClick: () => selected(key as K),
        class: { fill: () => key === selected() },
      }))}
    />
  )
}

export default SegmentedButtonSwitcher
