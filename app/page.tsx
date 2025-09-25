import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const highlights = [
  {
    title: "Аудио версии",
    description: "Всяка любима приказка има топло озвучаване за уютни вечери.",
  },
  {
    title: "Интерактивни избори",
    description:
      "Децата участват активно, избират посоки и откриват нови финали.",
  },
  {
    title: "Безопасно пространство",
    description:
      "Няма реклами, няма следене. Само качествени истории на български.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-emerald-50/60 to-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-16">
        <section className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-1 text-sm font-medium text-emerald-700 shadow">
              Приказки за възраст 3–8
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Уютни български истории с интерактивни избори и аудио магия
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-700">
              Разказвач събира любими приказки и нови приключения за малките
              читатели. Прочети, изслушай или играй заедно – всичко е готово в
              една безопасна библиотека.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                href="/catalog"
              >
                Разгледай каталога
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-6 py-3 text-base font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                href="/pricing"
              >
                Виж плановете
              </Link>
            </div>
          </div>
          <div className="relative isolate mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-emerald-100">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
                Днешна препоръка
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                Приключението на звездната рибка
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Играйте заедно и помогнете на рибката Луна да избере правилния
                път към морското светлинно шоу.
              </p>
              <dl className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                <div>
                  <dt className="font-semibold text-slate-700">
                    Продължителност
                  </dt>
                  <dd>5 мин · аудио</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Теми</dt>
                  <dd>приятелство, избор</dd>
                </div>
              </dl>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <Link
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                href="/catalog"
              >
                Към историята
              </Link>
              <span className="text-sm font-medium text-emerald-600">
                За възраст 4–7
              </span>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Защо семейства избират Разказвач
            </h2>
            <p className="text-base leading-7 text-slate-700">
              Подбрахме най-важното, за да бъде всяко четене незабравимо – от
              красиви гласове до смели решения в интерактивните приказки.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
