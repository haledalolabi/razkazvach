"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-gray-600">
        Enter your email to receive a magic link.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await signIn("nodemailer", { email });
        }}
        className="mt-4 space-y-3"
      >
        <input
          className="w-full rounded border p-2"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <button className="rounded bg-black px-4 py-2 text-white">
          Send link
        </button>
      </form>
      <p className="mt-4 text-xs text-gray-500">
        Dev: open Mailpit at{" "}
        <a className="underline" href="http://localhost:8025" target="_blank">
          localhost:8025
        </a>
      </p>
    </main>
  );
}
