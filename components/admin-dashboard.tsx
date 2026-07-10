"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UserItem = {
  id: string;
  name: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

type ClassItem = {
  id: string;
  title: string;
  releaseAt: string;
  yesCount: number;
  noCount: number;
};

type Props = {
  users: UserItem[];
  classes: ClassItem[];
};

export default function AdminDashboard({ users, classes }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function updateUser(
    userId: string,
    status: "APPROVED" | "REJECTED"
  ): Promise<void> {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const data = (await response.json()) as { error?: string; message?: string };
    setMessage(data.message ?? data.error ?? "");
    router.refresh();
  }

  async function createClass(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const releaseAt = new Date(String(form.get("releaseAt"))).toISOString();
    const closesRaw = String(form.get("closesAt") ?? "");
    const closesAt = closesRaw ? new Date(closesRaw).toISOString() : null;

    const response = await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        releaseAt,
        closesAt
      })
    });

    const data = (await response.json()) as { error?: string; message?: string };
    setMessage(data.message ?? data.error ?? "");

    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <div className="stack">
      {message && <p className="notice">{message}</p>}

      <section className="card">
        <h2>Create class pool</h2>
        <form className="form" onSubmit={createClass}>
          <div className="field">
            <label htmlFor="title">Class title</label>
            <input id="title" name="title" required />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="releaseAt">Release time</label>
              <input id="releaseAt" name="releaseAt" type="datetime-local" required />
            </div>
            <div className="field">
              <label htmlFor="closesAt">Closing time (optional)</label>
              <input id="closesAt" name="closesAt" type="datetime-local" />
            </div>
          </div>
          <button className="button">Publish class</button>
        </form>
      </section>

      <section className="card">
        <h2>Member approvals</h2>
        <div className="stack">
          {users.length === 0 && <p className="muted">No members found.</p>}
          {users.map((user) => (
            <div className="row" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <div className="muted">{user.email}</div>
                <span className="badge">{user.status}</span>
              </div>
              <div className="actions">
                <button
                  className="button"
                  onClick={() => updateUser(user.id, "APPROVED")}
                >
                  Approve
                </button>
                <button
                  className="button danger"
                  onClick={() => updateUser(user.id, "REJECTED")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Vote results</h2>
        <div className="stack">
          {classes.length === 0 && <p className="muted">No class pools created.</p>}
          {classes.map((item) => (
            <div className="row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <div className="muted">{item.releaseAt}</div>
              </div>
              <div className="actions">
                <span className="badge">YES: {item.yesCount}</span>
                <span className="badge">NO: {item.noCount}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
