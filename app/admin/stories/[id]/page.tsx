import { prisma } from "@/lib/prisma";
import { upsertStoryAction, publishStoryAction } from "@/app/admin/actions";

export default async function EditStory({
  params,
}: {
  params: { id: string };
}) {
  const s = await prisma.story.findUnique({
    where: { id: params.id },
    include: { body: true },
  });
  if (!s) return <div className="p-6">Not found</div>;

  const publish = publishStoryAction.bind(null, s.id);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Edit Story</h1>
      <form action={upsertStoryAction} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={s.id} />
        <input
          name="title"
          defaultValue={s.title}
          className="w-full rounded border p-2"
          required
          minLength={3}
          maxLength={120}
        />
        <input
          name="slug"
          defaultValue={s.slug}
          className="w-full rounded border p-2"
          required
          minLength={3}
          maxLength={140}
          pattern="[a-z0-9-]+"
        />
        <textarea
          name="description"
          defaultValue={s.description}
          className="w-full rounded border p-2"
          rows={3}
          required
          minLength={10}
          maxLength={500}
        />
        <input
          name="tags"
          defaultValue={s.tags.join(", ")}
          className="w-full rounded border p-2"
        />
        <div className="flex gap-2">
          <input
            name="ageMin"
            type="number"
            defaultValue={s.ageMin}
            className="w-24 rounded border p-2"
            min={3}
            max={12}
            required
          />
          <input
            name="ageMax"
            type="number"
            defaultValue={s.ageMax}
            className="w-24 rounded border p-2"
            min={3}
            max={12}
            required
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isInteractive"
            defaultChecked={s.isInteractive}
          />{" "}
          Interactive
        </label>
        <textarea
          name="bodyHtml"
          defaultValue={s.body?.html ?? ""}
          className="w-full rounded border p-2"
          rows={10}
        />
        <div className="flex items-center gap-3">
          <button className="rounded bg-black px-4 py-2 text-white">
            Save
          </button>
          {s.status !== "PUBLISHED" && (
            <button
              formAction={publish}
              className="rounded bg-green-600 px-4 py-2 text-white"
            >
              Publish
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
