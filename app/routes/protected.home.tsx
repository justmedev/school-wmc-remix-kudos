import { json, LoaderFunctionArgs } from "@remix-run/node";
import { isJWTValid } from "~/.server/auth";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";
import "~/components/chatStyle.css";
import FormField from "~/components/formField";
import { FaSearch } from "react-icons/fa";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("jwt") || !isJWTValid(session.get("jwt") ?? "")) {
    throw redirect("/auth/login")
  }

  return json({
    self: {
      username: "justmedev",
      birthday: new Date(),
      profilePicture: null
    },
    users: [
      {
        username: "StefanLenk",
        birthday: new Date(),
        profilePicture: null
      }
    ]
  });
};


export default function ProtectedHome() {
  const { users, self } = useLoaderData<typeof loader>()

  /*
  <div className="grid grid-cols-1 h-full">
        <div className="col-span-2 bg-blue-500">04</div>
        <div className="bg-red-500 w-1/4 row-span-12">
          <div className="bg-green-800 p-4 py-5 justify-between flex items-center">
            <div className="flex flex-row items-center gap-8">
              {
                !self.profilePicture
                  ? <div className="rounded-full w-14 h-14 bg-white"/>
                  : <img src="/" alt="Profile" className="rounded-full w-1.5"/>
              }

              <span>{self.username}</span>
            </div>
            <Form method="post" action="/actions/auth/logout">
              <button className="btn">Logout</button>
            </Form>
          </div>
        </div>
        <div className="col-span-2 bg-blue-500">04</div>
      </div>
   */

  /*
  <div className="flex flex-col h-full w-full">
        <div className="bg-green-400 w-full"> CHAT </div>
        <div className="w-full h-full flex flex-grow">
          <div className="bg-green-800 h-full">
            <div className="flex items-center px-4 py-2 gap-4 bg-gray-800">
              <div className="flex items-center gap-4">
                {
                  !self.profilePicture
                    ? <div className="rounded-full w-14 h-14 bg-white"/>
                    : <img src="/" alt="Profile" className="rounded-full w-1.5"/>
                }

                <span>{self.username}</span>
              </div>
              <Form method="post" action="/actions/auth/logout">
                <button className="btn">Logout</button>
              </Form>
            </div>
          </div>

          <div className="bg-red-800 w-full h-full flex-grow"></div>
        </div>
        <div className="bg-red-400 w-full"> MSGBOX</div>
      </div>
   */

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
          <div>PROFILE PIC</div>
        </div>

        <div className="bg-gray-700">
          TEAM
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
    </>
  );
}
