import Card from "~/components/card";
import FormField from "~/components/formField";
import { Link, redirect, useActionData, useNavigate, useRouteError } from "@remix-run/react";
import { ActionFunctionArgs, json, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useState } from "react";
import { AuthResponse, isJWTValid, login, ResponseError } from "~/.server/auth";
import { commitSession, getSession } from "~/sessions";
import { createUserWithPassword } from "~/.server/db.auth";
import { SubmissionResult, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { userCreateSchema } from "~/.shared/schema.user";

interface ActionResponse {
  data: AuthResponse | ResponseError | SubmissionResult | null;
}

export async function action({
                               request,
                             }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse> | null> {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: userCreateSchema });
  if (submission.status !== 'success') {
    return json({ data: submission.reply() });
  }
  console.log("Validation passed! Trying register...");

  const session = await getSession(request.headers.get("Cookie"));
  const newUser = await createUserWithPassword({
    email: submission.value.email,
    firstName: submission.value.firstName,
    lastName: submission.value.lastName,
    birtday: submission.value.birtday,
    profilePicture: null,
  }, submission.value.password);
  if (!newUser) throw json({ error: 'User with email already exists' }, { status: 401, statusText: 'Unauthorized' });

  session.set("jwt", (await (await login(submission.value.email, submission.value.password)).json()).jwt);
  return json({ data: null }, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function loader({
                               request,
                             }: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );

  if (session.has("jwt") && isJWTValid(session.get("jwt") ?? "")) {
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

  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: userCreateSchema });
    },
  });

  return (
    <>
      <Card title="Register">
        <div hidden={dataError === null}>{dataError}</div>

        <div className="-mt-3 text-gray-400 mb-3">
          or <Link to="/auth/login" className="text-blue-500 hover:text-indigo-400 transition-all">Login</Link>
        </div>

        <form method="post" id={form.id} onSubmit={form.onSubmit}>
          <FormField name={fields.email.name} label="Email" errorHint={fields.email.errors?.join(", ")} className="mb-1 w-full"/>

          <FormField name={fields.firstName.name} label="First Name" errorHint={fields.firstName.errors?.join(", ")} className="mb-1 w-full"/>

          <FormField name={fields.lastName.name} label="Last Name" errorHint={fields.lastName.errors?.join(", ")} className="mb-1 w-full"/>

          <FormField name={fields.birtday.name} label="Birthday" type="date" errorHint={fields.birtday.errors?.join(", ")} className="mb-1 w-full"/>


          <FormField name={fields.password.name} label="Password" errorHint={fields.password.errors?.join(", ")} type={passwordVisible ? 'text' : 'password'} className="w-full">
            <FormField.AppendInner type="button" onClick={() => setPasswordVisible(!passwordVisible)}>
              {passwordVisible ? <FaEye/> : <FaEyeSlash/>}
            </FormField.AppendInner>
          </FormField>

          <Card.Actions>
            <button className="btn grow" type="submit">Submit & Login</button>
          </Card.Actions>
        </form>
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
