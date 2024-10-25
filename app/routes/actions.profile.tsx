import { ActionFunctionArgs, json } from "@remix-run/node";
import { getSession } from "~/sessions";
import { getUserByJWT, isJWTValid } from "~/.server/auth";
import { prisma } from "~/.server/prisma";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";

const profileSchema = z.object(
  {
    firstName: z.string(),
    lastName: z.string(),
    birtday: z.date(),
  }
);

export const action = async ({
                               request, params
                             }: ActionFunctionArgs) => {
  if (request.method !== "PUT") throw json({ error: "Method Not Allowed" }, {
    status: 405,
    statusText: "Method Not Allowed"
  })
  const submission = parseWithZod(await request.formData(), { schema: profileSchema });
  if (submission.status !== 'success') {
    return json(submission.reply(), { status: 400, statusText: "Bad Request" });
  }
  console.log("Validation passed! Trying PUT profile...");

  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("jwt") || !isJWTValid(session.get("jwt") ?? "")) throw json({ error: "Unauthorized Access" }, {
    status: 401,
    statusText: "Unauthorized"
  })

  const user = await getUserByJWT(session.get("jwt")!);
  if (!user) throw json({ error: "Unauthorized Access" }, { status: 401, statusText: "Unauthorized" })


  return json(await prisma.profile.update({
    data: submission.value,
    where: { id: user.profileId },
  }), { status: 200, statusText: "Updated" });
};
