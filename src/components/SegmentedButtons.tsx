import { isFunction } from "@fabiospampinato/is"
import { For, FunctionMaybe, If, createElement } from "voby"
import { unfun } from "../utils/reactivity"

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
      <For values={() => unfun(buttons)}>
        {(button, i) => (
          <button
            class={{
              border: true,
              small: true,
              "left-round": () => unfun(i) === 0,
              "right-round": () => unfun(i) === unfun(buttons).length - 1,
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
