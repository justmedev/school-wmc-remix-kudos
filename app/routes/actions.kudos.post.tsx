import { ActionFunctionArgs, json } from "@remix-run/node";
import { getSession } from "~/sessions";
import { getUserByJWT, isJWTValid, UserWithProfile } from "~/.server/auth";
import { prisma } from "~/.server/prisma";
import { parseWithZod } from "@conform-to/zod";
import { userCreateSchema } from "~/.server/db.auth";
import { z } from "zod";
import { getAllProfiles, getProfileById } from "~/.server/db.profile";

export const postKudosSchema = z.object({
  emoji: z.string().min(1),
  message: z.string().min(1),
  receiver: z.number(),
});

export const action = async ({
                               request,
                             }: ActionFunctionArgs) => {
  if (request.method !== "POST") throw json({error: "Method Not Allowed"}, { status: 405, statusText: "Method Not Allowed" });
  const session = await getSession(
    request.headers.get("Cookie")
  );
  if (!session.has("jwt") || !isJWTValid(session.get("jwt") ?? "")) throw json({ error: "Unauthorized Access" }, { status: 401, statusText: "Unauthorized" });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: postKudosSchema });
  if (submission.status !== 'success') {
    return json({ data: submission.reply() });
  }
  console.log("Validation passed! Trying register...");

  const user = await getUserByJWT(session.get("jwt")!)
  const receiver = await getProfileById(submission.value.receiver);
  if (!receiver) throw json({ error: "Bad Request" }, { status: 400, statusText: "Bad Request" });

  return json(await prisma.kudos.create({
    data: {
      emoji: submission.value.emoji,
      message: submission.value.message,
      authorProfile: {
        connect: (user as UserWithProfile).profile
      },
      receiverProfile: {
        connect: receiver,
      }
    }
  }))
};
