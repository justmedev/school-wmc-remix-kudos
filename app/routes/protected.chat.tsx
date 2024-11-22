import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getUserByJWT, isJWTValid } from "~/.server/auth";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";
import "~/components/chatStyle.css";
import FormField from "~/components/formField";
import { FaSave, FaSearch } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import Card from "~/components/card";
import { FaCircleXmark, FaMagnifyingGlass, FaPaperPlane } from "react-icons/fa6";
import { prisma } from "~/.server/prisma";
import { Kudos, Prisma, Profile, User } from "@prisma/client";
import Dropdown from "~/components/dropDown";
import Message, { ColorOptions } from "~/components/message";
import Realistic from "react-canvas-confetti/src/presets/realistic";
import { TConductorInstance, TDecorateOptionsFn, TOnInitPresetFn } from "react-canvas-confetti/src/types";
import confetti, { Origin } from "canvas-confetti";

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

  const params = new URL(request.url).searchParams;
  let orderBy: Prisma.KudosOrderByWithRelationInput = {};
  console.log(params)
  if (params.has("sort")) {
    const sort = params.get("sort");
    if (sort === "emoji") {
      orderBy = {
        emoji: 'desc',
      }
    } else if (sort === "author") {
      orderBy = {
        authorProfile: {
          firstName: "desc",
        }
      }
    } else {
      orderBy = {
        createdAt: 'desc',
      }
    }
  }

  let search: Prisma.KudosWhereInput = {};
  if (params.has("search")) {
    search = {
      message: {
        contains: params.get("search") ?? "",
      }
    }
  }
  console.log(search, params.has("search"), params.get("search"));

  const kudos = await prisma.kudos.findMany({
    where: {
      AND: [
        { receiverProfileId: user.profileId },
        search
      ]
    },
    orderBy,
    include: {
      authorProfile: true,
      receiverProfile: true,
    },
  });

  const recentKudos = await prisma.kudos.findMany({
    include: {
      authorProfile: true,
      receiverProfile: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return json({
    self: user,
    users: others,
    kudos,
    recentKudos,
  });
};

interface DialogData {
  profile: Profile;
}

type KudosWithProfiles = Kudos & { authorProfile: Profile, receiverProfile: Profile };

export default function ProtectedChat() {
  const { users, self, kudos, recentKudos } = useLoaderData<typeof loader>() as unknown as {
    users: Profile[],
    self: User & { profile: Profile }
    kudos: KudosWithProfiles[],
    recentKudos: KudosWithProfiles[],
  }
  const dialog = useRef<HTMLDialogElement | null>(null);
  const [dialogData, setDialogData] = useState<DialogData | null>(null)

  const selfDialog = useRef<HTMLDialogElement | null>(null);
  const [selfDialogOpen, setSelfDialogOpen] = useState(false);

  const confettiText = useRef<string>('🎂');
  const confettiOptions: TDecorateOptionsFn = (defaults) => {
    return {
      ...defaults,
      scalar: 3,
      shapes: [confetti.shapeFromText({ text: confettiText.current, scalar: 1 })],
    }
  }
  const confettiController = useRef<TConductorInstance>();

  const onInitHandler: TOnInitPresetFn = ({ conductor }) => {
    confettiController.current = conductor;
  };

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
        <div className="bg-gray-800 text-blue-600 font-bold text-xl col-span-1 flex justify-center items-center">
          My Team
        </div>

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

        <Realistic onInit={onInitHandler} decorateOptions={confettiOptions}/>
        <div className="bg-gray-700 row-span-2 overflow-scroll w-full h-full">
          {kudos.map(kudo => <div key={kudo.id}>
            <Message onClick={() => {
              confettiText.current = kudo.emoji
              confettiController.current?.shoot()
            }} author={fullName(kudo.authorProfile)} message={kudo.message} emoji={kudo.emoji} backgroundColor={kudo.backgroundColor as ColorOptions} textColor={kudo.textColor as ColorOptions}/>
          </div>)}
          {kudos.length > 0 ?
            null :
            <div className="flex flex-col items-center justify-center h-1/3 text-gray-400">
              <FaCircleXmark/>
              <div>No messages to display</div>
            </div>
          }
        </div>

        <div className="bg-gray-800 row-span-2 flex gap-2 flex-col items-center pt-2 overflow-scroll">
          <div className="text-lg font-medium text-blue-600">Recent Kudos</div>
          {recentKudos.map(kudo => (
            <div key={kudo.id} className="bg-blue-400 rounded-full py-7 px-8 w-min font-mono relative">
              {getShort(fullName(kudo.receiverProfile))}
              <div className="text-3xl absolute -bottom-2 -right-2 rounded-full">{kudo.emoji}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 flex items-center justify-center">
          <Form action="/actions/auth/logout" method="POST">
            <button className="btn" type="submit">Sign out</button>
          </Form>
        </div>
      </div>

      <dialog ref={dialog} className="rounded">
        <Form action="/actions/kudos/post" method="POST" navigate={false} onSubmit={() => setDialogData(null)}>
          <input type="number" hidden={true} name="receiver" value={dialogData ? dialogData!.profile.id : ""} readOnly={true}/>

          <Card title={`Send Kudos to ${dialogData ? fullName(dialogData!.profile) : "?"}`} width="auto">
            <FormField name="message" placeholder={`Say something nice about ${dialogData ? fullName(dialogData!.profile) : "?"}`} fieldType="textarea" className="mb-2"/>

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
                <button className="btn shrink" onClick={() => setDialogData(null)}>Cancel</button>
                <button className="btn flex items-center justify-center gap-2 shrink" onClick={() => setDialogData(null)}>
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
      </dialog>

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
              <button className="btn w-full" onClick={() => setSelfDialogOpen(false)}>Cancel</button>
              <button className="btn w-full flex items-center justify-center gap-2" onClick={() => setSelfDialogOpen(false)}>
                Send
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

export function formatDate(d: Date): string {
  return intlDateFormatter.format(d);
}

export function fullName(profile: Profile) {
  return `${profile.firstName ?? ""} ${profile.lastName ?? ""}`
}

export function getShort(s: string): string {
  const splitted = s.split(" ");
  return splitted.length > 1 ? splitted[0][0] + splitted[1][0] : splitted[0][0] + (splitted[0][1] ?? "?");
}

