import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useLocation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getNote, updateNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const note = await getNote({ userId, id: params.noteId });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ note });
}

export default function EditNotePage() {
  const data = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <>
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Title: </span>
            <input
              defaultValue={data.note.title}
              required
              name="title"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            />
          </label>
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Body: </span>
            <textarea
              defaultValue={data.note.body}
              required
              name="body"
              rows={8}
              className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            />
          </label>
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
        </div>
      </Form>
      <div>
        This Form after-submit behavior changes depending how you navigated to
        it.
        <ul className="list-inside list-disc">
          <li>
            If you access it via an <Link to=".">internal Link</Link>, its
            inputs will not update from loader after submit.
          </li>
          <li>
            If you access it via a browser refresh (
            <a href={location.pathname} target="_blank" rel="noreferrer">
              or url directly
            </a>
            ), its inputs will update from loader after submit.
          </li>
        </ul>
      </div>
    </>
  );
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);

  invariant(params.noteId, "noteId not found");

  const formData = await request.formData();
  const title = String(formData.get("title"));
  const body = String(formData.get("body"));

  await updateNote({
    title: "[Edit]: " + title,
    body,
    userId,
    id: params.noteId,
  });

  return null;
}
