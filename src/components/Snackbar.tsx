import { $, If, Observable, Portal, useEffect } from "voby"

export function Snackbar({
  children,
  timeoutSeconds = 5,
  when,
}: {
  children: JSX.Element
  timeoutSeconds?: number
  when: Observable<boolean>
}) {
  // const shouldShow = $(when())
  const hasTriggered = $(false)
  const isVisible = $(false)

  useEffect(() => {
    if (!when() && !isVisible()) {
      // If the trigger goes to false, and the snackbar has gone, prime it to trigger on next rising edge
      // We only do this once the snackbar has gone to prevent them "stacking up" if a button is spammed or something
      hasTriggered(false)
    }

    if (when() && !isVisible() && !hasTriggered()) {
      isVisible(true)
      hasTriggered(true)
      setTimeout(() => {
        isVisible(false)
      }, timeoutSeconds * 1000)
    }
  })

  return (
    <Portal mount={document.querySelector("#app")}>
      <If when={isVisible}>
        <div
          class={{
            snackbar: true,
            active: true,
          }}
          onClick={() => isVisible(false)}
        >
          {children}
        </div>
      </If>
    </Portal>
  )
}
