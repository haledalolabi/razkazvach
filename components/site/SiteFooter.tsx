import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Разказвач. Всички права запазени.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link className="hover:text-slate-900" href="/about">
            За Разказвач
          </Link>
          <Link className="hover:text-slate-900" href="/contact">
            Подкрепа
          </Link>
          <Link
            className="hover:text-slate-900"
            href="mailto:hello@razkazvach.bg"
          >
            hello@razkazvach.bg
          </Link>
        </div>
      </div>
    </footer>
  );
}
