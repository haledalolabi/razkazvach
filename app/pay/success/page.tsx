import Link from "next/link";

export default function PaySuccessPage() {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Плащането е успешно!</h1>
      <p className="text-gray-600">
        Благодарим ти, абонаментът е активиран. Провери пощата си за
        потвърждение от Stripe.
      </p>
      <Link className="text-blue-600 underline" href="/">
        Назад към началото
      </Link>
    </main>
  );
}
