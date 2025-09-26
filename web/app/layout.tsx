import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Bailanysta",
  description: "Минимально жизнеспособная социальная сеть"
};

const navItems = [
  { href: "/feed", label: "Лента" },
  { href: "/profile", label: "Профиль" },
  { href: "/notifications", label: "Уведомления" }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen bg-[rgb(var(--background))]">
            <header className="border-b bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                <Link href="/feed" className="text-lg font-semibold">
                  Bailanysta
                </Link>
                <nav className="flex items-center gap-4 text-sm">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-md px-3 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                      {item.label}
                    </Link>
                  ))}
                  <ThemeToggle />
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
