import Card from "~/components/card";
import { Form } from "@remix-run/react";
import FormField from "~/components/formField";
import { FaSave } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { UserWithProfile } from "~/.server/auth";
import { fullName } from "~/routes/protected.chat";
import { FaFileImage } from "react-icons/fa6";
import ProfilePicture, { getShort } from "~/components/profilePicture";

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

  const fileInput = useRef<HTMLInputElement | null>(null);
  const [base64Image, setBase64Image] = useState<string | undefined>(undefined);
  const onFileChange = () => {
    const files = fileInput.current?.files;
    if (files && files.length == 1) {
      const reader = new FileReader();
      reader.onloadend = function() {
        console.log('RESULT', reader.result)
        setBase64Image(reader.result as string);
      }
      reader.readAsDataURL(files[0]);
    }
  }

  return (
    <dialog ref={selfDialog} className="rounded">
      <Card title="My Profile">
        <Form action="/actions/profile" method="PUT" navigate={false} onSubmit={() => setTimeout(() => window.location.reload(), 2_000)} encType="multipart/form-data">
          <div className="flex justify-between items-center">
            <div className="flex h-full mx-2">
              <div className="flex flex-col w-full items-center justify-center">
                <ProfilePicture profile={self.profile} base64Image={base64Image}/>
                <button className="btn w-full py-1 mt-2 flex items-center" type="button" onClick={() => fileInput.current?.click()}>
                  <FaFileImage/>Browse
                </button>
                <input
                  ref={fileInput}
                  hidden={true}
                  type="file"
                  name="profilePicture"
                  accept="image/jpeg"
                  onChange={onFileChange}
                />
              </div>
            </div>
            <div className="grow">
              <FormField name="firstName" placeholder="First Name" label="First Name" defaultValue={self.profile.firstName}/>
              <FormField name="lastName" placeholder="Last Name" label="Last Name" defaultValue={self.profile.lastName}/>
            </div>
          </div>
          <FormField type="date" name="birtday" placeholder="Birthday" label="Birthday" defaultValue={toDateInputValue(new Date(self.profile.birtday))}/>

          <Card.Actions>
            <button className="btn w-full" onClick={() => setOpen(false)} type="button">Cancel</button>
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

function toDateInputValue(date: Date){
  const local = new Date(date);
  local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return local.toJSON().slice(0,10);
}

const intlDateFormatter = new Intl.DateTimeFormat("de", { dateStyle: "short" })

export function formatDate(d: Date): string {
  return intlDateFormatter.format(d);
}
