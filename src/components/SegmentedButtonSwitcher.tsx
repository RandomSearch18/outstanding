import { FunctionMaybe, Observable, useMemo } from "voby"
import SegmentedButtons, { SegmentedButtonOptions } from "./SegmentedButtons"
import { unfun } from "../utils/reactivity"

function SegmentedButtonSwitcher<K extends string | number | symbol>({
  buttons,
  selected,
}: {
  buttons: FunctionMaybe<Record<K, SegmentedButtonOptions>>
  selected: Observable<K>
}) {
  return (
    <SegmentedButtons
      buttons={useMemo(() => {
        const buttonsArray = Object.entries(unfun(buttons)) as [
          string,
          SegmentedButtonOptions
        ][]
        return buttonsArray.map(([key, button], i) => ({
          onClick: (e) => {
            selected(key as K)
            button.onClick?.(e)
          },
          class: { fill: () => key === selected(), ...button.class },
          ...button,
        }))
      })}
    />
  )
}

export default SegmentedButtonSwitcher
