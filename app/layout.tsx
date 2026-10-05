import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ProxyDate — Your agent dates for you",
  description: "AI agents built from public LinkedIn and Instagram profiles meet, date, and rank compatibility."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <nav className="nav">
            <Link href="/" className="brand">ProxyDate</Link>
            <div className="navlinks">
              <Link className="pill" href="/people">People</Link>
              <Link className="pill" href="/arena">Dating Arena</Link>
              <Link className="pill" href="/rankings">Rankings</Link>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
