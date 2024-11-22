import { Form } from "@remix-run/react";
import Card from "~/components/card";
import FormField from "~/components/formField";
import Dropdown from "~/components/dropDown";
import { FaMagnifyingGlass, FaPaperPlane } from "react-icons/fa6";
import { fullName } from "~/routes/protected.chat";
import { useEffect, useRef } from "react";
import { Profile } from "@prisma/client";

export interface DialogMessageCreationData {
  profile: Profile;
}

export interface DialogMessageCreationProps {
  data: DialogMessageCreationData | null;
  setData: (data: DialogMessageCreationData | null) => void;
}

export default function DialogMessageCreation({ data, setData }: DialogMessageCreationProps) {
  useEffect(() => {
    if (data) dialog.current?.showModal()
    else dialog.current?.close()
  }, [data])

  const dialog = useRef<HTMLDialogElement | null>(null);


  return (<dialog ref={dialog} className="rounded">
    <Form action="/actions/kudos/post" method="POST" navigate={false} onSubmit={() => setData(null)}>
      <input type="number" hidden={true} name="receiver" value={data ? data!.profile.id : ""} readOnly={true}/>

      <Card title={`Send Kudos to ${data ? fullName(data!.profile) : "?"}`} width="auto">
        <FormField name="message" placeholder={`Say something nice about ${data ? fullName(data!.profile) : "?"}`} fieldType="textarea" className="mb-2"/>

        {!dialog ? null :
          <div className="flex gap-4">
            <Dropdown name="backgroundColor" label="Background Color">
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="amber">Gold</option>
              <option value="lgbtqp">LGBTQ+</option>
              <option value="black">Goth</option>
            </Dropdown>

            <Dropdown name="textColor" label="Text Color">
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="amber">Gold</option>
              <option value="lgbtqp">LGBTQ+</option>
              <option value="black">Goth</option>
            </Dropdown>

            <Dropdown name="emoji" label="Emoji">
              {["😔", "💸", "🔫", "😱", "😶‍🌫️"].map(emoji => <option value={emoji} key={emoji}>{emoji}</option>)}
            </Dropdown>
          </div>
        }

        <Card.Actions>
          <div className="flex gap-2 w-full">
            <button className="btn shrink" onClick={() => setData(null)}>Cancel</button>
            <button className="btn flex items-center justify-center gap-2 shrink" onClick={() => setData(null)}>
              Preview
              <FaMagnifyingGlass/>
            </button>
            <button className="btn flex items-center justify-center gap-2 grow" type="submit">
              Send
              <FaPaperPlane/>
            </button>
          </div>
        </Card.Actions>
      </Card>
    </Form>
  </dialog>);
}
