import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getUserByJWT, isJWTValid } from "~/.server/auth";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";
import "~/components/chatStyle.css";
import FormField from "~/components/formField";
import { FaSave, FaSearch } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import Card from "~/components/card";
import { FaPaperPlane } from "react-icons/fa6";
import { prisma } from "~/.server/prisma";
import { Profile, User } from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("jwt") || !isJWTValid(session.get("jwt") ?? "")) {
    throw redirect("/auth/login")
  }

  const user = await getUserByJWT(session.get("jwt")!);
  if (!user) throw redirect("/auth/login")
  const others = await prisma.profile.findMany({
    where: {
      id: {
        not: user.profileId
      }
    }
  });

  return json({
    self: user,
    users: others,
  });
};

interface DialogData {
  profile: Profile;
}

export default function ProtectedHome() {
  const { users, self } = useLoaderData<typeof loader>() as unknown as {
    users: Profile[],
    self: User & { profile: Profile }
  }
  const dialog = useRef<HTMLDialogElement | null>(null);
  const [dialogData, setDialogData] = useState<DialogData | null>(null)

  const selfDialog = useRef<HTMLDialogElement | null>(null);
  const [selfDialogOpen, setSelfDialogOpen] = useState(false);

  useEffect(() => {
    if (dialogData) dialog.current?.showModal()
    else dialog.current?.close()
  }, [dialogData])

  useEffect(() => {
    if (selfDialogOpen) selfDialog.current?.showModal();
    else selfDialog.current?.close()
  }, [selfDialogOpen]);

  return (
    <>
      <div className="grid grid-cols-3 grid-rows-2 h-full w-full">
        <div className="bg-gray-800 text-blue-700 font-bold text-xl col-span-1 flex justify-center items-center">
          My Team
        </div>

        <div className="bg-gray-800 col-span-2 flex justify-between p-4 items-center">
          <div className="w-1/2">
            <Form className="flex flex-row gap-2.5 w-full">
              <FormField placeholder="Search a message or name" className="grow">
                <FormField.AppendInner onClick={() => null}>
                  <FaSearch/>
                </FormField.AppendInner>
              </FormField>

              <select className="bg-gray-700 rounded text-gray-400 outline-none p-2 w-1/3 focus:text-white focus:bg-gradient-to-r focus:from-blue-900 focus:outline-indigo-500">
                <option value="date">Sort: Date</option>
                <option value="sender">Sort: Sender Name</option>
                <option value="emoji">Sort: Emoji</option>
              </select>
            </Form>
          </div>
          <div>
            <button className="bg-blue-400 rounded-full py-3 px-4 font-mono select-none" title={fullName(self.profile)} onClick={() => setSelfDialogOpen(true)}>
              {getShort(fullName(self.profile))}
            </button>
          </div>
        </div>

        <div className="bg-gray-600 flex flex-col items-center">
          {users.map((profile, i) =>
            <button className={`w-full flex justify-center ${i % 2 === 0 ? "bg-gray-500" : ""} py-2 select-none cursor-pointer`} title={fullName(profile)} key={i} onClick={() => {
              setDialogData({ profile: profile })
            }}>
              <div className="bg-blue-400 rounded-full py-7 px-8 font-mono">
                {getShort(fullName(profile))}
              </div>
            </button>
          )}
        </div>

        <div className="bg-gray-700 row-span-2">
          MAIN
        </div>

        <div className="bg-gray-800 row-span-2">
          RECENT
        </div>

        <div className="bg-gray-800 flex items-center justify-center">
          <Form action="/actions/auth/logout" method="POST">
            <button className="btn" type="submit">Sign out</button>
          </Form>
        </div>
      </div>

      <dialog ref={dialog} className="rounded">
        <Card title={`Send Kudos to ${dialogData ? fullName(dialogData!.profile) : "?"}`}>
          <Form>
            FORM
          </Form>

          <Card.Actions>
            <button className="btn w-full" onClick={() => setDialogData(null)}>Cancel</button>
            <button className="btn w-full flex items-center justify-center gap-2" onClick={() => setDialogData(null)}>
              Send
              <FaPaperPlane/>
            </button>
          </Card.Actions>
        </Card>
      </dialog>

      <dialog ref={selfDialog} className="rounded">
        <Card title="My Profile">
          <Form action="/actions/profile" method="PUT" navigate={false}>
            <FormField name="firstName" placeholder="First Name" label="First Name" defaultValue={self.profile.firstName}/>
            <FormField name="lastName" placeholder="Last Name" label="Last Name" defaultValue={self.profile.lastName}/>
            <FormField name="birtday" placeholder="Birthday" label="Birthday" defaultValue={formatDate(new Date(self.profile.birtday))}/>

            <Card.Actions>
              <button className="btn w-full" onClick={() => setSelfDialogOpen(false)}>Cancel</button>
              <button className="btn w-full flex items-center justify-center gap-2" onClick={() => setSelfDialogOpen(false)}>
                Submit
                <FaSave/>
              </button>
            </Card.Actions>
          </Form>
        </Card>
      </dialog>
    </>
  );
}

const intlDateFormatter = new Intl.DateTimeFormat("de", { dateStyle: "short" })

function formatDate(d: Date): string {
  return intlDateFormatter.format(d);
}

function fullName(profile: Profile) {
  return `${profile.firstName ?? ""} ${profile.lastName ?? ""}`
}

function getShort(s: string): string {
  const splitted = s.split(" ");
  return splitted.length > 1 ? splitted[0][0] + splitted[1][0] : splitted[0][0] + (splitted[0][1] ?? "?");
}

