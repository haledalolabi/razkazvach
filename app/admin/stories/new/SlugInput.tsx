"use client";

import { toSlug } from "@/lib/slug";

export default function SlugInput() {
  return (
    <input
      name="slug"
      placeholder="slug"
      className="w-full rounded border p-2"
      minLength={3}
      maxLength={140}
      pattern="[a-z0-9-]+"
      required
      onChange={(e) => (e.currentTarget.value = toSlug(e.currentTarget.value))}
    />
  );
}
