"use client";
import { useState } from "react";

interface Hit {
  id: string;
  title: string;
  description: string;
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Search</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
          const j = await r.json();
          setHits((j.hits as Hit[]) || []);
        }}
        className="mt-4"
      >
        <input
          className="w-full rounded border p-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Търси приказка..."
        />
      </form>
      <ul className="mt-4 space-y-2">
        {hits.map((h) => (
          <li key={h.id} className="rounded border p-3">
            <div className="font-medium">{h.title}</div>
            <div className="text-sm text-gray-600">{h.description}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
