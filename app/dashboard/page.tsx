import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VoteButtons from "@/components/vote-buttons";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur"
  }).format(date);
}

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.status !== "APPROVED") {
    return (
      <main>
        <div className="container">
          <section className="card auth-card">
            <span className="badge">{user.status}</span>
            <h1>Account awaiting access</h1>
            <p className="muted">
              Your account must be approved by {user.fitnessCenter.name} before
              you can vote.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const classes = await prisma.classSlot.findMany({
    where: { fitnessCenterId: user.fitnessCenterId },
    orderBy: { releaseAt: "desc" },
    include: {
      votes: {
        where: { userId: user.id },
        select: { value: true }
      }
    }
  });

  const now = new Date();

  return (
    <main>
      <div className="container stack">
        <header>
          <span className="badge">{user.fitnessCenter.name}</span>
          <h1 className="page-title">Hi, {user.name}</h1>
          <p className="subtitle">Vote when a class pool is open.</p>
        </header>

        {classes.length === 0 && (
          <section className="card">
            <h2>No classes yet</h2>
            <p className="muted">The fitness center has not published any class slots.</p>
          </section>
        )}

        {classes.map((classSlot) => {
          const existingVote = classSlot.votes[0]?.value;
          const isReleased = now >= classSlot.releaseAt;
          const isClosed = classSlot.closesAt ? now >= classSlot.closesAt : false;

          return (
            <article className="card" key={classSlot.id}>
              <div className="row">
                <div>
                  <h2>{classSlot.title}</h2>
                  <p className="muted">{classSlot.description || "No description."}</p>
                </div>
                <span className="badge">
                  {!isReleased ? "Locked" : isClosed ? "Closed" : "Open"}
                </span>
              </div>

              <p>Opens: {formatDate(classSlot.releaseAt)}</p>
              {classSlot.closesAt && <p>Closes: {formatDate(classSlot.closesAt)}</p>}

              {!isReleased && <p className="notice">Voting has not opened yet.</p>}
              {isClosed && <p className="notice">Voting is closed.</p>}
              {existingVote && (
                <p className="success">Your vote: {existingVote === "YES" ? "Yes" : "No"}</p>
              )}
              {isReleased && !isClosed && !existingVote && (
                <VoteButtons classSlotId={classSlot.id} />
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
