import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse Fitness Voting",
  description: "Fitness class slot voting and member approval portal."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="container nav-inner">
            <Link className="brand" href="/">
              PULSE / VOTE
            </Link>
            <div className="nav-links">
              {user ? (
                <>
                  <Link href="/dashboard">Classes</Link>
                  {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login">Login</Link>
                  <Link className="button" href="/register">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
