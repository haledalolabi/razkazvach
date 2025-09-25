import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Начало" },
  { href: "/catalog", label: "Каталог" },
  { href: "/pricing", label: "Цени" },
  { href: "/about", label: "За нас" },
  { href: "/contact", label: "Контакт" },
];

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header className={cn("border-b border-slate-200 bg-white", className)}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-slate-900"
        >
          Разказвач
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/catalog"
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          Разгледай приказки
        </Link>
      </div>
    </header>
  );
}
