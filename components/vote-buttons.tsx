"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  classSlotId: string;
};

export default function VoteButtons({ classSlotId }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function vote(value: "YES" | "NO"): Promise<void> {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classSlotId, value })
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Unable to submit vote.");
      setIsLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <>
      <div className="vote-actions">
        <button className="button" disabled={isLoading} onClick={() => vote("YES")}>
          Yes, I will join
        </button>
        <button
          className="button secondary"
          disabled={isLoading}
          onClick={() => vote("NO")}
        >
          No, cannot join
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </>
  );
}
