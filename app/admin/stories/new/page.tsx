import { upsertStory } from "@/app/admin/actions";
import { toSlug } from "@/lib/slug";

export default function NewStory() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">New Story</h1>
      <form action={upsertStory} className="mt-4 space-y-3">
        <input
          name="title"
          placeholder="Title"
          className="w-full rounded border p-2"
          required
        />
        <input
          name="slug"
          placeholder="slug"
          className="w-full rounded border p-2"
          onChange={(e) =>
            (e.currentTarget.value = toSlug(e.currentTarget.value))
          }
        />
        <textarea
          name="description"
          placeholder="Short description"
          className="w-full rounded border p-2"
          rows={3}
        />
        <input
          name="tags"
          placeholder="tag1, tag2"
          className="w-full rounded border p-2"
        />
        <div className="flex gap-2">
          <input
            name="ageMin"
            type="number"
            defaultValue={3}
            min={3}
            max={12}
            className="w-24 rounded border p-2"
          />
          <input
            name="ageMax"
            type="number"
            defaultValue={8}
            min={3}
            max={12}
            className="w-24 rounded border p-2"
          />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isInteractive" /> Interactive
        </label>
        <textarea
          name="bodyHtml"
          placeholder="Story HTML (flow text)"
          className="w-full rounded border p-2"
          rows={10}
        />
        <button className="rounded bg-black px-4 py-2 text-white">Save</button>
      </form>
    </main>
  );
}
