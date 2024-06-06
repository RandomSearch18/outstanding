import { For, FunctionMaybe, Observable } from "voby"

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
    <div class="row no-space">
      <For values={Object.entries(buttons)}>
        {([key, button], i) => (
          <button
            class={{
              border: true,
              small: true,
              fill: () => key === selected(),
              "left-round": i === 0,
              "right-round": i === Object.keys(buttons).length - 1,
            }}
            onClick={() => selected(key as K)}
          >
            {button.content}
          </button>
        )}
      </For>
    </div>
  )
}

export default SegmentedButtonSwitcher
