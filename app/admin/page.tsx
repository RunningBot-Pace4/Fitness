import AdminDashboard from "@/components/admin-dashboard";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur"
  }).format(date);
}

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [users, classes] = await Promise.all([
    prisma.user.findMany({
      where: {
        fitnessCenterId: admin.fitnessCenterId,
        role: "USER"
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    }),
    prisma.classSlot.findMany({
      where: { fitnessCenterId: admin.fitnessCenterId },
      orderBy: { releaseAt: "desc" },
      include: {
        votes: { select: { value: true } }
      }
    })
  ]);

  return (
    <main>
      <div className="container stack">
        <header>
          <span className="badge">Administrator</span>
          <h1 className="page-title">{admin.fitnessCenter.name}</h1>
          <p className="subtitle">Manage members, class pools, and vote results.</p>
        </header>
        <AdminDashboard
          users={users}
          classes={classes.map((item) => ({
            id: item.id,
            title: item.title,
            releaseAt: formatDate(item.releaseAt),
            yesCount: item.votes.filter((vote) => vote.value === "YES").length,
            noCount: item.votes.filter((vote) => vote.value === "NO").length
          }))}
        />
      </div>
    </main>
  );
}
