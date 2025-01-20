import { Form, useLocation } from "@remix-run/react";
import FormField from "~/components/formField";
import { FaSearch } from "react-icons/fa";
import Dropdown from "~/components/dropDown";
import ProfilePicture from "~/components/profilePicture";
import { UserWithProfile } from "~/.server/auth";

interface ChatTopBarProps {
  self: UserWithProfile,
  onOpenSelfManagementDialog: (open: boolean) => void,
}

export default function ChatTopBar({self, onOpenSelfManagementDialog}: ChatTopBarProps) {
  const searchParams = new URLSearchParams(useLocation().search)

  return (
    <div className="bg-gray-800 col-span-2 flex justify-between p-4 items-center">
      <div className="w-1/2">
        <Form className="flex flex-row items-center gap-2.5 w-full" method="GET" action="/protected/chat" navigate={true}>
          <FormField
            defaultValue={searchParams.get("search") ?? ''}
            name="search" placeholder="Search a message or name" className="grow">
            <FormField.AppendInner onClick={() => (document.getElementById("searchSubmitBtn") as HTMLButtonElement).click()}>
              <FaSearch/>
            </FormField.AppendInner>
          </FormField>

          <Dropdown name="sort" className="object-fill" defaultValue={searchParams.get("sort") ?? ''}
                    onChange={() => (document.getElementById("searchSubmitBtn") as HTMLButtonElement).click()}>
            <option value="date">Sort: Date</option>
            <option value="author">Sort: Sender Name</option>
            <option value="emoji">Sort: Emoji</option>
          </Dropdown>

          <button className="btn" type="submit" id={"searchSubmitBtn"}>Apply Filters</button>
        </Form>
      </div>
      <div>
        <ProfilePicture profile={self.profile} onClick={() => onOpenSelfManagementDialog(true)}/>
      </div>
    </div>);
}
