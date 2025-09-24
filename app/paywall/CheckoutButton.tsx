"use client";

import { useState, useTransition } from "react";

interface CheckoutButtonProps {
  plan: string;
}

export function CheckoutButton({ plan }: CheckoutButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <button
        className="w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const res = await fetch("/api/pay/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
              });
              const text = await res.text();
              const payload = text
                ? (JSON.parse(text) as Record<string, unknown>)
                : {};
              if (!res.ok) {
                throw new Error(
                  (payload.error as string | undefined) ?? "Checkout failed",
                );
              }
              const data = payload as { url?: string };
              if (!data.url) throw new Error("Missing checkout URL");
              window.location.href = data.url;
            } catch (err) {
              console.error("checkout failed", err);
              setError(err instanceof Error ? err.message : "Checkout failed");
            }
          });
        }}
        disabled={isPending}
      >
        {isPending ? "Redirecting..." : "Upgrade"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
