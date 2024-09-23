import Card from "~/components/card";
import FormField from "~/components/formField";
import { Form, redirect, useActionData, useNavigate, useRouteError } from "@remix-run/react";
import { ActionFunctionArgs, json, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import React, { useState } from "react";
import { AuthResponse, ResponseError } from "~/.server/auth";
import { commitSession, getSession } from "~/sessions";
import { createUserWithPassword } from "~/.server/auth.db";

interface FormErrors {
  username?: string;
  password?: string;
}

interface ActionResponse {
  errors: FormErrors;
  data: AuthResponse | ResponseError | null;
}

export async function action({
                               request,
                             }: ActionFunctionArgs): Promise<Promise<TypedResponse<ActionResponse>> | null> {
  const body = await request.formData();
  const errors: FormErrors = {};

  const email = body.get("email");
  if (!email || typeof email !== "string" || email.length < 3) errors.username = "Email must be at least 3 characters";

  const password = body.get("password");
  if (!password || typeof password !== "string" || password.length < 3) errors.password = "Password must be at least 3 characters";

  if (Object.keys(errors).length > 0) return json({ errors, data: null });

  console.log("Trying register...");
  //const session = await getSession(request.headers.get("Cookie"));

  const newUser = await createUserWithPassword({ email: (email as string) }, password as string);
  if (!newUser) throw json({ error: 'User with email already exists' }, { status: 401, statusText: 'Unauthorized' });

  //session.set("jwt", (await (await login(email as string, password as string)).json()).jwt)

  return redirect("/auth/login");

  /*return json({ data: null, errors: {} }, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });*/
}

export async function loader({
                               request,
                             }: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );

  if (session.has("jwt")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/protected/home");
  }

  const data = { error: session.get("error") };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Login() {
  const data = useActionData<ActionResponse>();
  const dataError = Object.hasOwn(data?.data ?? {}, "error") ? (data?.data as ResponseError).error : null;
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <>
      <Card title="Register">
        <div hidden={dataError === null}>{dataError}</div>

        <Form method="post">
          <FormField name="email" label="Email" errorHint={data?.errors?.username} className="mb-1 w-full"/>

          <FormField name="password" label="Password" type={passwordVisible ? 'text' : 'password'} errorHint={data?.errors.password} className="w-full">
            <FormField.AppendInner type="button" onClick={() => setPasswordVisible(!passwordVisible)}>
              {passwordVisible ? <FaEye/> : <FaEyeSlash/>}
            </FormField.AppendInner>
          </FormField>

          <Card.Actions>
            <button className="btn grow" type="submit">Submit & Login</button>
          </Card.Actions>
        </Form>
      </Card>
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError() as unknown as { data?: { error: string } };
  const navigate = useNavigate();
  console.error(error);
  return (
    <>
      <Card title="Login failed!">
        <div className="bg-red-400 rounded p-1 mb-2">
          {Object.hasOwn(error ?? {}, "data") ? error?.data?.error : ""}
        </div>
        Retry login?
        <Card.Actions>
          <button className="btn grow" onClick={() => navigate(-1)}>Back to Register</button>
        </Card.Actions>
      </Card>
    </>
  );
}
