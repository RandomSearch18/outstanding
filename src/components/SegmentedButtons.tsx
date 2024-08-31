import { isFunction } from "@fabiospampinato/is"
import { For, FunctionMaybe, If, createElement } from "voby"

export interface SegmentedButtonOptions {
  content: JSX.Child
  label?: string
  showLabel?: boolean
  onClick?: (e: MouseEvent) => void
  class?: JSX.ClassProperties
}

function SegmentedButtons({
  buttons,
}: {
  buttons: FunctionMaybe<SegmentedButtonOptions[]>
}) {
  return (
    <div class="row no-space">
      <For values={() => (isFunction(buttons) ? buttons() : buttons)}>
        {(button, i) => (
          <button
            class={{
              border: true,
              small: true,
              "left-round": i === 0,
              "right-round": i === buttons.length - 1,
              ...button.class,
            }}
            onClick={button.onClick}
            title={button.label}
          >
            {button.content}
            <If when={button.label}>
              <span
                class={{
                  "visually-hidden": button.showLabel === false,
                }}
              >
                {button.label}
              </span>
            </If>
          </button>
        )}
      </For>
    </div>
  )
}

export default SegmentedButtons
