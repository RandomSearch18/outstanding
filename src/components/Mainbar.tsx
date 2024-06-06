import "./Mainbar.css"
import { mdiEye, mdiLeadPencil } from "@mdi/js"
import Icon from "./Icon"
import SegmentedButtonSwitcher from "./SegmentedButtonSwitcher"
import { $, Observable } from "voby"
import { ValueOf } from "../utilities.mjs"

export type EditMode = ValueOf<typeof EditMode>
export const EditMode = {
  Edit: "edit",
  Preview: "preview",
} as const

function MainbarLayout({ children }: { children: JSX.Child }) {
  const editMode: Observable<EditMode> = $<EditMode>(EditMode.Edit)

  return (
    <>
      <div class="toolbar">
        <div class="toolbar-items">
          <SegmentedButtonSwitcher
            selected={editMode}
            buttons={{
              edit: {
                content: () => <Icon>{mdiLeadPencil}</Icon>,
              },
              preview: {
                content: () => <Icon>{mdiEye}</Icon>,
              },
            }}
          />
        </div>
      </div>
      <div class="mainbar-content">{children}</div>
    </>
  )
}

export default MainbarLayout
