import { For, createElement } from "voby"

interface SegmentedButtonOptions {
  content: JSX.Child
  onClick?: (e: MouseEvent) => void
  class?: JSX.ClassProperties
}

function SegmentedButtons({ buttons }: { buttons: SegmentedButtonOptions[] }) {
  return (
    <div class="row no-space">
      <For values={buttons}>
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
          >
            {button.content}
          </button>
        )}
      </For>
    </div>
  )
}

export default SegmentedButtons
