"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        centerKey: form.get("centerKey")
      })
    });

    const data = (await response.json()) as { message?: string; error?: string };
    setIsError(!response.ok);
    setMessage(data.message ?? data.error ?? "Unable to register.");
    setIsLoading(false);

    if (response.ok) {
      event.currentTarget.reset();
    }
  }

  return (
    <main>
      <div className="container">
        <section className="card auth-card">
          <h1>Create account</h1>
          <p className="muted">
            Register using the fitness center key supplied by your gym.
          </p>
          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="centerKey">Fitness center key</label>
              <input id="centerKey" name="centerKey" required />
            </div>
            <button className="button" disabled={isLoading}>
              {isLoading ? "Creating..." : "Register"}
            </button>
          </form>
          {message && <p className={isError ? "error" : "success"}>{message}</p>}
          <p className="muted">
            Already registered? <Link href="/login">Login here</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
