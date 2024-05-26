import "./Mainbar.css"
import { mdiEye, mdiLeadPencil } from "@mdi/js"
import Icon from "./Icon"

function MainbarLayout({ children }: { children: JSX.Child }) {
  return (
    <>
      <div class="toolbar">
        <div class="toolbar-items row no-space">
          <button class="border left-round fill small">
            <Icon>{mdiLeadPencil}</Icon>
          </button>
          <button class="border right-round small">
            <Icon>{mdiEye}</Icon>
          </button>
        </div>
      </div>
      <div class="mainbar-content">{children}</div>
    </>
  )
}

export default MainbarLayout
