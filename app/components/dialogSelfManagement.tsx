import Card from "~/components/card";
import { Form } from "@remix-run/react";
import FormField from "~/components/formField";
import { FaSave } from "react-icons/fa";
import { useEffect, useRef } from "react";
import { UserWithProfile } from "~/.server/auth";

interface DialogSelfManagementProps {
  self: UserWithProfile,
  open: boolean,
  setOpen: (open: boolean) => void,
}

export default function DialogSelfManagement({ self, open, setOpen }: DialogSelfManagementProps) {
  const selfDialog = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    if (open) selfDialog.current?.showModal();
    else selfDialog.current?.close()
  }, [open]);

  return (
    <dialog ref={selfDialog} className="rounded">
      <Card title="My Profile">
        <Form action="/actions/profile" method="PUT" navigate={false}>
          <div className="flex justify-between">
            ABC
            <div>
              <FormField name="firstName" placeholder="First Name" label="First Name" defaultValue={self.profile.firstName}/>
              <FormField name="lastName" placeholder="Last Name" label="Last Name" defaultValue={self.profile.lastName}/>
            </div>
          </div>
          <FormField name="birtday" placeholder="Birthday" label="Birthday" defaultValue={formatDate(new Date(self.profile.birtday))}/>

          <Card.Actions>
            <button className="btn w-full" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn w-full flex items-center justify-center gap-2" onClick={() => setOpen(false)}>
              Send
              <FaSave/>
            </button>
          </Card.Actions>
        </Form>
      </Card>
    </dialog>
  );
}
const intlDateFormatter = new Intl.DateTimeFormat("de", { dateStyle: "short" })

export function formatDate(d: Date): string {
  return intlDateFormatter.format(d);
}
