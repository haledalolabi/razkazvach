import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Мисията на Разказвач
          </h1>
          <p className="text-base leading-7 text-slate-600">
            Вярваме, че българският език заслужава повече истории, които да
            запалят любопитството на децата. Затова създаваме модерна библиотека
            с качествено съдържание и уважение към семействата.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Нашата работа
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Събираме автори, редактори и артисти, за да подготвим всяка
              история с внимание към детайла. От текста и аудиото до
              интерактивните възможности – всичко е създадено за възраст 3–8.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Доверие и сигурност
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Няма реклами, няма проследяване. Прогресът в интерактивните
              приказки се пази само локално на устройството. Винаги поставяме
              сигурността и спокойствието на семействата на първо място.
            </p>
          </article>
        </section>

        <section className="rounded-3xl bg-emerald-50 p-8 shadow-inner">
          <h2 className="text-2xl font-semibold text-emerald-900">
            Какво предстои
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-800">
            Подготвяме нови серии с образователни теми, повече интерактивни
            избори и богата музикална колекция. Ако искаш да ни помогнеш или да
            се включиш като автор, пиши на hello@razkazvach.bg.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
