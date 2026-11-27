import Link from "next/link";
import { paymentService } from "@/server/modules/payment/payment.service";
import { formatCurrency, formatDate } from "@/lib/formatters/currency";
import { PaymentStatusBadge } from "@/components/ui/badge";
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const data = await paymentService.dashboard();
  const cards = [
    ["Aprovado", formatCurrency(data.approvedAmount)],
    ["Transações", String(data.transactions)],
    ["Pendentes", String(data.pending)],
    ["Recusadas ou falhas", String(data.unsuccessful)],
  ];
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">Visão geral</p>
          <h1 className="mt-1 text-2xl font-bold">Dashboard</h1>
        </div>
        <Link
          href="/payments/new"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Nova cobrança
        </Link>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <section className="mt-8 rounded-lg border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-semibold">Transações recentes</h2>
          <Link className="text-sm font-medium text-green-700" href="/transactions">
            Ver histórico
          </Link>
        </div>
        <div className="divide-y">
          {data.recent.length ? (
            data.recent.map((p) => (
              <Link
                href={`/transactions/${p.id}`}
                key={p.id}
                className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium">{p.customer.name}</p>
                  <p className="text-sm text-slate-500">
                    {p.reference} · {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(p.amount)}</p>
                  <PaymentStatusBadge status={p.status} />
                </div>
              </Link>
            ))
          ) : (
            <p className="p-6 text-sm text-slate-500">Ainda não há transações.</p>
          )}
        </div>
      </section>
    </>
  );
}
