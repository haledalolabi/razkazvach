import Link from "next/link";
import { CheckoutButton } from "./CheckoutButton";

const PLANS: Array<{
  id: string;
  label: string;
  priceLabel: string;
  description: string;
}> = [
  {
    id: "monthly",
    label: "Месечно",
    priceLabel: "9.99 лв / месец",
    description: "Отпушва всички приказки и аудио версии.",
  },
  {
    id: "semiannual",
    label: "6 месеца",
    priceLabel: "54.99 лв / 6 месеца",
    description: "Най-добра стойност за редовни читатели.",
  },
  {
    id: "annual",
    label: "Годишно",
    priceLabel: "99.99 лв / година",
    description: "Подарък за цялото семейство.",
  },
];

export default function PaywallPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const slug =
    typeof searchParams?.slug === "string" ? searchParams.slug : undefined;
  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Разкачи пълната библиотека</h1>
        <p className="text-gray-600">
          Вече изчерпа свободните приказки за този месец. Надгради, за да
          получиш неограничен достъп до всички истории и аудио версии.
        </p>
        {slug && (
          <p className="text-sm text-gray-500">
            След плащането ще те върнем към приказката{" "}
            <span className="font-semibold">{slug}</span>.
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="flex h-full flex-col rounded border p-4 shadow-sm"
          >
            <div className="space-y-2 text-left">
              <h2 className="text-xl font-semibold">{plan.label}</h2>
              <p className="text-lg">{plan.priceLabel}</p>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </div>
            <div className="mt-6">
              <CheckoutButton plan={plan.id} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500">
        Имаш въпроси? Пиши ни на{" "}
        <Link className="underline" href="mailto:hi@razkazvach.bg">
          hi@razkazvach.bg
        </Link>
        .
      </p>
    </main>
  );
}
