import { notFound } from "next/navigation";
import { paymentService } from "@/server/modules/payment/payment.service";
import { formatCurrency, formatDate } from "@/lib/formatters/currency";
import { PaymentStatusBadge } from "@/components/ui/badge";
import { SimulationActions } from "./simulation-actions";
export const dynamic = "force-dynamic";
export default async function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await paymentService.get(id);
  if (!p) notFound();
  const rows = [
    ["Referência", p.reference],
    ["Gateway ID", p.providerId ?? "Não disponibilizado"],
    ["Cliente", p.customer.name],
    ["E-mail", p.customer.email],
    ["Descrição", p.description],
    ["Valor", formatCurrency(p.amount)],
    ["Método", p.method],
    ["Criado em", formatDate(p.createdAt)],
  ];
  return (
    <>
      <p className="text-sm text-slate-500">Transações / {p.reference}</p>
      <div className="mt-1 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Detalhes do pagamento</h1>
        <PaymentStatusBadge status={p.status} />
      </div>
      {p.simulated && (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Ambiente de demonstração: este PIX é simulado e não pode ser pago.
        </p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Informações</h2>
          <dl className="mt-4 divide-y">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-3 py-3 text-sm">
                <dt className="text-slate-500">{k}</dt>
                <dd className="col-span-2 font-medium break-all">{v}</dd>
              </div>
            ))}
          </dl>
          {p.pixCode && (
            <div className="mt-4">
              <p className="text-sm text-slate-500">Código PIX demonstrativo</p>
              <code className="mt-1 block break-all rounded bg-slate-100 p-3 text-xs">
                {p.pixCode}
              </code>
            </div>
          )}
          <SimulationActions id={p.id} status={p.status} />
        </section>
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Histórico de status</h2>
          <ol className="mt-5 space-y-5 border-l-2 border-slate-200 pl-5">
            {p.events.map((e) => (
              <li key={e.id}>
                <p className="font-medium">{e.newStatus}</p>
                <p className="text-sm text-slate-600">{e.description}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {e.source} · {formatDate(e.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
