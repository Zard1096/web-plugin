import type { MetaFunction } from "@remix-run/node";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"; // or cloudflare/deno
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";
import { getSession, commitSession } from "../components/session";
import { getUserByName, insertDBUser } from "../.server/user/user.server";

export async function loader({
    request,
  }: LoaderFunctionArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    
    const data = { error: session.get("error") };
    
    return json(data, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
  }
  
  export async function action({
    request,
  }: ActionFunctionArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
      );
    const form = await request.formData();
    const username = form.get("username");
    const password = form.get("password");

    if (typeof(username) !== 'string' || typeof(password) !== 'string') {
        session.flash("error", "need username and password");

        return redirect("/registerUser", {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
      }
  
    const { user } = await getUserByName(username);
    if (user) {
        //已有用户，直接展示错误
        session.flash("error", "username already exists, please login");

        return redirect("/registerUser", {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
    }

    const { user: newUser, error } = await insertDBUser(username, password);
    console.info('====qqq register newUser', newUser)
    if (error) {
        session.flash("error", error);
        return redirect("/registerUser", {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
    }
    session.set("userId", newUser.userId);

    // Login succeeded, send them to the home page.
    return redirect("/home", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    
  }
  
  export default function Login() {
    const { error } = useLoaderData<typeof loader>();
  
    return (
      <div>
        <form method="POST">
          <div>
            <p>Already has account? <a href="./login" type="link" className="text-blue-500">Login</a></p>
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
            Register
          </button>
        </form>
      </div>
    );
  }