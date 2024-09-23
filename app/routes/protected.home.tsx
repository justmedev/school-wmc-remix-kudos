import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { isJWTValid } from "~/.server/auth";
import { Form, redirect } from "@remix-run/react";
import { destroySession, getSession } from "~/sessions";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("jwt") || !isJWTValid(session.get("jwt") ?? "")) {
    throw redirect("/auth/login")
  }

  return json({ ok: true });
};


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

export default function ProtectedHome() {
  return (
    <>
      <div className="flex flex-col gap-2 justify-center items-center h-full">
        <div>This page is protected and shall not be accessed by non-logged-in users!</div>
        <Form method="post">
          <button className="btn shadow-[0_0_160px_-15px_rgba(0,0,0,0.7)] hover:shadow-none shadow-yellow-50">Logout</button>
        </Form>
      </div>
    </>
  );
}
