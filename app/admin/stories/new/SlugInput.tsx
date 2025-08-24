"use client";

import { toSlug } from "@/lib/slug";

export default function SlugInput() {
  return (
    <input
      name="slug"
      placeholder="slug"
      className="w-full rounded border p-2"
      onChange={(e) => (e.currentTarget.value = toSlug(e.currentTarget.value))}
    />
  );
}
