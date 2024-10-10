import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
  } from "@remix-run/node"; // or cloudflare/deno
  import { json, redirect } from "@remix-run/node"; // or cloudflare/deno
  import { useLoaderData } from "@remix-run/react";

  import { getSession, commitSession } from "../components/session";
  import { validateUser } from "../.server/user/user.server";

  export async function loader({
    request,
  }: LoaderFunctionArgs) {
    const session = await getSession(
      request.headers.get("Cookie")
    );

    console.info('\n=====get cookie', session, session.get('userId'));

    if (session.has("userId")) {
      // Redirect to the home page if they are already signed in.
      return redirect("/home");
    }

    const data = { error: session.get("error") };

    return json(data, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const validateCredentials = async (
    username: FormDataEntryValue | null,
    password: FormDataEntryValue | null
  ) => {
    if (typeof(username) !== 'string' || typeof(password) !== 'string') {
      return null;
    }

    const { user } = await validateUser(username, password);
    if (!user) {
      return null;
    }

    return user;

  };

  export async function action({
    request,
  }: ActionFunctionArgs) {
    const session = await getSession(
      request.headers.get("Cookie")
    );
    const form = await request.formData();
    const username = form.get("username");
    const password = form.get("password");

    const user = await validateCredentials(
      username,
      password
    );

    if (user?.userId == null) {
      session.flash("error", "Invalid username/password");

      // Redirect back to the login page with errors.
      return redirect("/login", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    session.set("userId", user.userId);

    // Login succeeded, send them to the home page.
    return redirect("/home", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  export default function RegisterUser() {
    const { error } = useLoaderData<typeof loader>();

    return (
      <div>
        <form method="POST">
          <div>
            <p>Please sign in. No account? <a href="./registerUser" type="link" className="text-blue-500">Register</a></p>
          </div>
          <label>
            Username: <input type="text" name="username" />
          </label>
          <label>
            Password:{" "}
            <input type="password" name="password" />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Log in
          </button>
        </form>
      </div>
    );
  }
