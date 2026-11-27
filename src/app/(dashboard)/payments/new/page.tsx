import { PaymentForm } from "@/components/payments/payment-form";
export default function NewPaymentPage() {
  return (
    <>
      <p className="text-sm text-slate-500">Cobranças</p>
      <h1 className="mt-1 text-2xl font-bold">Criar cobrança</h1>
      <p className="mt-2 mb-6 text-sm text-slate-600">
        Gere uma cobrança PIX de demonstração no ambiente sandbox.
      </p>
      <PaymentForm />
    </>
  );
}
