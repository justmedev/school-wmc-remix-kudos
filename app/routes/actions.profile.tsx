import { ActionFunctionArgs, json } from "@remix-run/node";
import { getSession } from "~/sessions";
import { getUserByJWT, isJWTValid } from "~/.server/auth";
import { prisma } from "~/.server/prisma";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import fsp from 'node:fs/promises';
import * as path from "node:path";
import { sanitizeFilePath } from "mlly";

const MAX_FILE_SIZE = 1_048_576 * 5 /* 5 MB */;

function checkFileType(file: File) {
  return file.type.includes("image/jpeg");
}

const profileSchema = z.object(
  {
    firstName: z.string(),
    lastName: z.string(),
    birtday: z.date(),
    profilePicture: z.any()
      .refine((file: File | undefined) => file == undefined || file.size < MAX_FILE_SIZE, "Max size is 5MB.")
      .refine((file: File | undefined) => file == undefined || checkFileType(file), "Only image/jpeg formats are supported."),
  }
);

export const action = async ({
                               request
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

  console.log(submission.value.profilePicture);
  if (submission.value.profilePicture != null) {
    console.log("Writing profile picture...")
    const upDir = path.join(process.cwd(), "public", "up-profile-pics");
    try {
      await fsp.mkdir(upDir)
    } catch { /* empty */ }finally {
      await fsp.writeFile(
        path.join(upDir, `${sanitizeFilePath(user.id.toString())}.jpg`),
        Buffer.from(await (submission.value.profilePicture as File).arrayBuffer())
      )
    }
  }
  delete submission.value.profilePicture;

  return json(await prisma.profile.update({
    data: submission.value,
    where: { id: user.profileId },
  }), { status: 200, statusText: "Updated" });
};
