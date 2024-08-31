import { FunctionMaybe, Observable, useMemo } from "voby"
import SegmentedButtons, { SegmentedButtonOptions } from "./SegmentedButtons"

function SegmentedButtonSwitcher<K extends string | number | symbol>({
  buttons,
  selected,
}: {
  buttons: FunctionMaybe<Record<K, SegmentedButtonOptions>>
  selected: Observable<K>
}) {
  return (
    <SegmentedButtons
      buttons={useMemo(() =>
        Object.entries(buttons).map(([key, button], i) => ({
          onClick: () => {
            selected(key as K)
            button.onClick?.()
          },
          class: { fill: () => key === selected(), ...button.class },
          ...button,
        }))
      )}
    />
  )
}

export default SegmentedButtonSwitcher
