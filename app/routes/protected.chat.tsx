import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getUserByJWT, isJWTValid, UserWithProfile } from "~/.server/auth";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";
import "~/components/chatStyle.css";
import { useRef, useState } from "react";
import { FaCircleXmark } from "react-icons/fa6";
import { prisma } from "~/.server/prisma";
import { Kudos, Prisma, Profile } from "@prisma/client";
import Message, { ColorOptions } from "~/components/message";
import { TConductorInstance, TDecorateOptionsFn, TOnInitPresetFn } from "react-canvas-confetti/src/types";
import confetti from "canvas-confetti";
import Pride from "react-canvas-confetti/src/presets/pride";
import DialogSelfManagement from "~/components/dialogSelfManagement";
import DialogMessageCreation, { DialogMessageCreationData } from "~/components/dialogMessageCreation";
import ChatTopBar from "~/components/chatTopBar";
import ProfilePicture from "~/components/profilePicture";

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

type KudosWithProfiles = Kudos & { authorProfile: Profile, receiverProfile: Profile };

export default function ProtectedChat() {
  const { users, self, kudos, recentKudos } = useLoaderData<typeof loader>() as unknown as {
    users: Profile[],
    self: UserWithProfile
    kudos: KudosWithProfiles[],
    recentKudos: KudosWithProfiles[],
  }

  const [dialogMessageCreationData, setDialogMessageCreationData] = useState<DialogMessageCreationData | null>(null)
  const [dialogSelfOpen, setDialogSelfOpen] = useState(false);

  const confettiText = useRef<string>('🎂');
  const confettiOptions: TDecorateOptionsFn = (defaults) => {
    return {
      ...defaults,
      scalar: 3,
      particleCount: 30,
      shapes: [confetti.shapeFromText({ text: confettiText.current, scalar: 3 })],
    }
  }
  const confettiController = useRef<TConductorInstance>();

  const onInitHandler: TOnInitPresetFn = ({ conductor }) => {
    confettiController.current = conductor;
  };

  return (
    <>
      <div className="grid grid-cols-3 grid-rows-2 h-full w-full">
        <div className="bg-gray-800 text-blue-600 font-bold text-xl col-span-1 flex justify-center items-center">
          My Team
        </div>

        <ChatTopBar self={self} onOpenSelfManagementDialog={setDialogSelfOpen}/>

        <div className="bg-gray-600 flex flex-col items-center">
          {users.map((profile, i) =>
            <button className={`w-full flex justify-center ${i % 2 === 0 ? "bg-gray-500" : ""} py-2 select-none cursor-pointer`} title={fullName(profile)} key={i} onClick={() => {
              setDialogMessageCreationData({ profile: profile })
            }}>
              <ProfilePicture profile={profile}/>
            </button>
          )}
        </div>

        <div className="bg-gray-700 row-span-2 overflow-scroll w-full h-full">
          {kudos.map(kudo => <div key={kudo.id}>
            <Message onClick={() => {
              confettiText.current = kudo.emoji
              confettiController.current?.run({ duration: 1_000, delay: 50, speed: 25 })
            }} author={kudo.authorProfile} message={kudo.message} emoji={kudo.emoji} backgroundColor={kudo.backgroundColor as ColorOptions} textColor={kudo.textColor as ColorOptions}/>
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
          {
            recentKudos.map(kudo => (
              <ProfilePicture profile={kudo.receiverProfile} key={kudo.id} emoji={kudo.emoji} size="lg"/>
            ))
          }
        </div>

        <div className="bg-gray-800 flex items-center justify-center">
          <Form action="/actions/auth/logout" method="POST">
            <button className="btn" type="submit">Sign out</button>
          </Form>
        </div>
      </div>

      <DialogMessageCreation data={dialogMessageCreationData} setData={setDialogMessageCreationData}/>
      <DialogSelfManagement self={self} open={dialogSelfOpen} setOpen={setDialogSelfOpen}/>

      <Pride onInit={onInitHandler} decorateOptions={confettiOptions}/>
    </>
  );
}

export function fullName(profile: Profile) {
  return `${profile.firstName ?? ""} ${profile.lastName ?? ""}`
}

