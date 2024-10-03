import { ActionFunctionArgs } from "@remix-run/node";
import { destroySession, getSession } from "~/sessions";
import { redirect } from "@remix-run/react";

export const action = async ({
                               request,
                             }: ActionFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  return redirect("/auth/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};
