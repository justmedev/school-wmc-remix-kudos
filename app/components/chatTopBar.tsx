import { Form } from "@remix-run/react";
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
  return (
    <div className="bg-gray-800 col-span-2 flex justify-between p-4 items-center">
      <div className="w-1/2">
        <Form className="flex flex-row items-center gap-2.5 w-full">
          <FormField name="search" placeholder="Search a message or name" className="grow">
            <FormField.AppendInner onClick={() => (document.getElementById("kudosSearchForm") as HTMLFormElement).submit()}>
              <FaSearch/>
            </FormField.AppendInner>
          </FormField>

          <Dropdown name="sort" className="object-fill">
            <option value="date">Sort: Date</option>
            <option value="author">Sort: Sender Name</option>
            <option value="emoji">Sort: Emoji</option>
          </Dropdown>

          <button className="btn" type="submit">Apply Filters</button>
        </Form>
      </div>
      <div>
        <ProfilePicture profile={self.profile} onClick={() => onOpenSelfManagementDialog(true)}/>
      </div>
    </div>);
}
