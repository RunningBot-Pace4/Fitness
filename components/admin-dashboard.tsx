"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UserItem = {
  id: string;
  name: string;
  email: string;
  keyFob: string;
  membershipType: "MEMBER" | "NON_MEMBER";
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
    data: {
      status?: "APPROVED" | "REJECTED";
      membershipType?: "MEMBER" | "NON_MEMBER";
      keyFob?: string;
    }
  ): Promise<void> {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = (await response.json()) as {
      error?: string;
      message?: string;
    };

    setMessage(result.message ?? result.error ?? "");

    if (response.ok) {
      router.refresh();
    }
  }

  async function updateMemberDetails(
    event: FormEvent<HTMLFormElement>,
    userId: string
  ): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await updateUser(userId, {
      keyFob: String(formData.get("keyFob") ?? ""),
      membershipType: String(
        formData.get("membershipType")
      ) as "MEMBER" | "NON_MEMBER"
    });
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
              <input
                id="releaseAt"
                name="releaseAt"
                type="datetime-local"
                required
              />
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
        <h2>Member management</h2>

        <div className="stack">
          {users.length === 0 && <p className="muted">No users found.</p>}

          {users.map((user) => (
            <article className="card" key={user.id}>
              <div className="row">
                <div>
                  <strong>{user.name}</strong>
                  <div className="muted">{user.email}</div>
                </div>

                <div className="actions">
                  <span className="badge">{user.membershipType}</span>
                  <span className="badge">{user.status}</span>
                </div>
              </div>

              <hr />

              <form
                className="form"
                onSubmit={(event) => updateMemberDetails(event, user.id)}
              >
                <div className="grid grid-2">
                  <div className="field">
                    <label htmlFor={`keyFob-${user.id}`}>Key fob</label>
                    <input
                      id={`keyFob-${user.id}`}
                      name="keyFob"
                      defaultValue={user.keyFob}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor={`membershipType-${user.id}`}>
                      Membership type
                    </label>
                    <select
                      id={`membershipType-${user.id}`}
                      name="membershipType"
                      defaultValue={user.membershipType}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="NON_MEMBER">Non-member</option>
                    </select>
                  </div>
                </div>

                <div className="actions">
                  <button className="button secondary">
                    Save member details
                  </button>

                  <button
                    className="button"
                    type="button"
                    onClick={() =>
                      updateUser(user.id, { status: "APPROVED" })
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="button danger"
                    type="button"
                    onClick={() =>
                      updateUser(user.id, { status: "REJECTED" })
                    }
                  >
                    Reject
                  </button>
                </div>
              </form>
            </article>
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
