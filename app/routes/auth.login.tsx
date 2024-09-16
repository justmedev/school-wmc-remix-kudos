import Card from "~/components/card";
import FormField from "~/components/formField";
import { Form, useActionData } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useState } from "react";

interface FormErrors {
  username?: string;
  password?: string;
}

export async function action({
                               request,
                             }: ActionFunctionArgs) {
  const body = await request.formData();
  const errors: FormErrors = {};

  const username = body.get("username");
  if (!username || typeof username !== "string" || username.length < 3) errors.username = "Username must be at least 3 characters";

  const password = body.get("password");
  if (!password || typeof password !== "string" || password.length < 3) errors.password = "Password must be at least 3 characters";

  return json({ errors });
}

export default function Login() {
  const data = useActionData<typeof action>();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <>
      <Card title="Login">
        <Form method="post">
          <FormField name="username" label="Username" errorHint={data?.errors.username} className="mb-1 w-full"/>

          <FormField name="password" label="Password" type={passwordVisible ? 'text' : 'password'} errorHint={data?.errors.password} className="w-full">
            <FormField.AppendInner onClick={() => setPasswordVisible(!passwordVisible)}>
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
