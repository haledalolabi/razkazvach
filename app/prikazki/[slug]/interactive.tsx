"use client";

import { useEffect, useMemo, useState } from "react";

type Choice = {
  id: string;
  label: string;
  toNodeId: string;
};

type InteractiveNode = {
  id: string;
  title: string;
  bodyHtml: string;
  choices: Choice[];
};

const STORAGE_PREFIX = "rz:progress:";

function getStorageKey(storyId: string) {
  return `${STORAGE_PREFIX}${storyId}`;
}

export function InteractiveReader({
  storyId,
  nodes,
  initialNodeId,
}: {
  storyId: string;
  nodes: InteractiveNode[];
  initialNodeId: string;
}) {
  const nodesById = useMemo(() => {
    const map = new Map<string, InteractiveNode>();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  const storageKey = useMemo(() => getStorageKey(storyId), [storyId]);
  const [currentNodeId, setCurrentNodeId] = useState(initialNodeId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { currentNodeId?: string };
      if (parsed.currentNodeId && nodesById.has(parsed.currentNodeId)) {
        setCurrentNodeId(parsed.currentNodeId);
      }
    } catch (err) {
      console.warn("Failed to read interactive progress", err);
    }
  }, [nodesById, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ currentNodeId }),
      );
    } catch (err) {
      console.warn("Failed to persist interactive progress", err);
    }
  }, [currentNodeId, storageKey]);

  const currentNode =
    nodesById.get(currentNodeId) ?? nodesById.get(initialNodeId);

  const handleChoice = (choice: Choice) => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setCurrentNodeId(choice.toNodeId);
  };

  const handleRestart = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setCurrentNodeId(initialNodeId);
  };

  if (!currentNode) {
    return null;
  }

  return (
    <div className="space-y-6" aria-live="polite">
      <div
        className="space-y-4 text-[1.125rem] leading-[1.75] text-slate-900"
        dangerouslySetInnerHTML={{ __html: currentNode.bodyHtml }}
      />
      <div className="flex flex-col gap-3">
        {currentNode.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => handleChoice(choice)}
            className="w-full min-h-[56px] rounded-2xl border-2 border-emerald-200 bg-white px-4 py-3 text-left text-base font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            {choice.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleRestart}
          className="mt-2 w-full min-h-[52px] rounded-2xl border border-slate-200 px-4 py-3 text-base font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          Започни отначало
        </button>
      </div>
    </div>
  );
}
