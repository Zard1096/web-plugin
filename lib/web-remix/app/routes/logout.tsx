import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getSession, destroySession } from "../components/session";
import { Form, Link } from "@remix-run/react";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );

  if (!session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/login");
  }

  return null;
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export default function LogoutRoute() {
  return (
    <>
      <p>Are you sure you want to log out?</p>
      <Form method="post">
        <button>Logout</button>
      </Form>
      <Link to="/">Never mind</Link>
    </>
  );
}