import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import Card from "~/components/card";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <Card title="Welcome to my site!">
      You need to login or register before you can view this sites&apos; content.

      <Card.Actions>
        <button className="grow btn" onClick={() => navigate("/auth/login")}>
          Login
        </button>

        <button className="grow btn" onClick={() => navigate("/auth/register")}>
          Register
        </button>
      </Card.Actions>
    </Card>
  );
}
