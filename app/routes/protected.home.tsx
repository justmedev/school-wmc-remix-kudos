import { json, LoaderFunctionArgs } from "@remix-run/node";
import { isJWTValid } from "~/.server/auth";
import { redirect } from "@remix-run/react";
import { getSession } from "~/sessions";

export const loader = async ({
                               request,
                             }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("jwt") || !isJWTValid(session.get("jwt") ?? "")) {
    throw redirect("/auth/login")
  }

  return json({ ok: true });
};
export default function ProtectedHome() {
  return (
    <div>This page is protected and shall not be accessed by non-logged-in users!</div>
  );
}
