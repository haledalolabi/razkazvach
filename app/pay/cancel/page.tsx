import Link from "next/link";

export default function PayCancelPage() {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Плащането е прекъснато</h1>
      <p className="text-gray-600">
        Не успяхме да финализираме плащането. Можеш да опиташ отново, когато си
        готов.
      </p>
      <Link className="text-blue-600 underline" href="/paywall">
        Назад към плановете
      </Link>
    </main>
  );
}
