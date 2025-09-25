import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function ContactPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Свържи се с екипа
          </h1>
          <p className="text-base leading-7 text-slate-600">
            Пиши ни за въпроси, предложения или идеи за нови приказки.
            Отговаряме в рамките на 24 часа в работни дни.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form
            className="space-y-5"
            action="mailto:hello@razkazvach.bg"
            method="post"
            encType="text/plain"
          >
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="name"
              >
                Име
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base leading-6 text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                id="name"
                name="name"
                type="text"
                placeholder="Твоето име"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="email"
              >
                Имейл
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base leading-6 text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="message"
              >
                Съобщение
              </label>
              <textarea
                className="min-h-[160px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-base leading-6 text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                id="message"
                name="message"
                placeholder="Как можем да помогнем?"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              Изпрати имейл
            </button>
          </form>
        </section>

        <div className="rounded-3xl bg-emerald-50 p-6 text-sm leading-6 text-emerald-800">
          <p>
            За техническа поддръжка ни пиши директно на{" "}
            <Link className="font-semibold" href="mailto:hello@razkazvach.bg">
              hello@razkazvach.bg
            </Link>
            . Ако си издател или автор, изпрати предложение на{" "}
            <Link
              className="font-semibold"
              href="mailto:partnerships@razkazvach.bg"
            >
              partnerships@razkazvach.bg
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
