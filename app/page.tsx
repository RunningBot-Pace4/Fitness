import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <div className="container">
        <section className="hero">
          <span className="badge">Fitness class attendance, simplified</span>
          <h1>Vote for your next class slot.</h1>
          <p>
            Register with your fitness center key, wait for approval, and vote
            Yes or No when each class pool opens.
          </p>
          <div className="actions">
            <Link className="button" href="/register">
              Create account
            </Link>
            <Link className="button secondary" href="/login">
              Member login
            </Link>
          </div>
        </section>
        <section className="grid grid-2">
          <article className="card">
            <h2>Controlled registration</h2>
            <p className="muted">
              Only members with a valid center key can register. An admin must
              approve every account before voting is enabled.
            </p>
          </article>
          <article className="card">
            <h2>Timed voting pools</h2>
            <p className="muted">
              Classes stay locked until their configured release time. Each
              approved member gets one Yes or No vote per class.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
