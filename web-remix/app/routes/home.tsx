import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { redirect, json } from "@remix-run/node";

import { useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { getSession } from "../components/session";

import { useLatest } from 'ahooks';

import { getUserById } from "../.server/user/user.server";

import axios from 'axios';

import { useEffect, useState, useRef } from "react";

import IMDetail from "../components/IM";
import { IMUser } from "~/components/IM/types/models/User";


export const meta: MetaFunction = () => {
  return [
    { title: "Home" },
    { name: "description", content: "Welcome!" },
  ];
};

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

  const userId = session.get("userId");
  const { user } = await getUserById(userId!);
  console.info('====userId', userId, user?.name)
  return { user };
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const userId = session.get("userId");
  const { user } = await getUserById(userId!);

  if (!user) {
    return null
  }

  const form = await request.formData();
  const submitText = form.get("text");
  // console.log('====qqq submitText', submitText)

  if (submitText && submitText !== '' && typeof(submitText) === 'string') {
    const text = submitText
    const params = {'message': text, 'uid': user.userId, 'username': user.name}
    const response = await axios.post('http://localhost:8080/api/post/message', params, {
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer',
    })

    const contentType = response.headers['content-type']
    if (/application\/json/.test(contentType)) {
      // 处理 JSON 响应
      const jsonData = Buffer.from(response.data, 'binary').toString('utf-8')
      // console.log('====qqq jsonData', jsonData)
      // { 'status':x, 'data':{ 'type': xx, 'data': xx } }
      const data = JSON.parse(jsonData)
      const useData = data.data
      if (useData.type === 'text') {
        return useData
      }
    } else if (/image\/jpeg/.test(contentType)) {
      const data = response.data
      const base64Img = Buffer.from(response.data, 'binary').toString('base64')
      return { 'type': 'image', 'data': base64Img }
    }

    return null
  }

  return null
}


export default function Home() {
  const { user } = useLoaderData<typeof loader>();
  // const actionData = useActionData<typeof action>()
  // const actionType = actionData?.type
  // const navigation = useNavigation()
  const [firstSkip, setFirstSkip] = useState(0);
  const test = useRef(0)

  useEffect(() => {
    console.log('home use effect', firstSkip, test.current);
    test.current = test.current + 1
    setFirstSkip(test.current)
  }, [])

    return (
        <div>
            <div>
              Welcome, {user?.name}
              <a href="./logout" type="link" className="text-blue-500">  Logout</a>
            </div>
            {/* <form method="POST" className="mt-10">
              <fieldset
                  disabled={navigation.state === "submitting"}
              >
                <label>
                  Text: <input type="text" name="text" />
                </label>
                <button
                  type="submit"
                  className="mt-5 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
                >
                  Send
                </button>
              </fieldset>
            </form> */}

            {/* {actionData && actionType === 'text' && (
              <div className="mt-10">
                <p>{actionData.text}</p>
              </div>
            )}
            {actionData && actionType === 'image' && (
              <div className="mt-10">
                <img
                  alt="Image"
                  id="actionImg"
                  src={`data:image/jpeg;base64,${actionData.data}`} />
              </div>
            )} */}

          { firstSkip >= 1 && <IMDetail user={user as IMUser} />}
        </div>
    )
}
