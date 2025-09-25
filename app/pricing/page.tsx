import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CheckoutButton } from "@/app/paywall/CheckoutButton";

const DEFAULT_PLANS = [
  {
    id: "monthly",
    label: "Месечен план",
    price: process.env.NEXT_PUBLIC_PRICE_MONTHLY ?? "9.99 лв / месец",
    description: "Пълен достъп до цялата библиотека и аудио за всяка история.",
  },
  {
    id: "semiannual",
    label: "6-месечен план",
    price: process.env.NEXT_PUBLIC_PRICE_SEMIANNUAL ?? "54.99 лв / 6 месеца",
    description:
      "Най-търсеният план за семейства, които четат и слушат всеки ден.",
  },
  {
    id: "annual",
    label: "Годишен план",
    price: process.env.NEXT_PUBLIC_PRICE_ANNUAL ?? "99.99 лв / година",
    description: "Спести и получи бонус истории в интерактивния каталог.",
  },
];

const BENEFITS = [
  "Неограничено четене на всички истории",
  "Аудио версии с професионални гласове",
  "Интерактивни приключения с локален прогрес",
  "Една библиотека за всички деца в семейството",
];

export default function PricingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Готови планове за читатели и мечтатели
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
            Избери план, който отговаря на темпото на твоето семейство. Отменяш
            по всяко време, без скрити такси.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {DEFAULT_PLANS.map((plan) => (
            <article
              key={plan.id}
              className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  {plan.label}
                </h2>
                <p className="text-lg font-semibold text-emerald-600">
                  {plan.price}
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>
              </div>
              <div className="mt-6">
                <CheckoutButton plan={plan.id} />
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl bg-emerald-50 p-8 shadow-inner">
          <h2 className="text-2xl font-semibold text-emerald-900">
            Какво получаваш
          </h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-emerald-800 md:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500"
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
