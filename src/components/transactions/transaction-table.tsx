"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PaymentStatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/formatters/currency";
import { trpcClient } from "@/lib/trpc/client";
import type { PaymentStatus } from "@prisma/client";
export function TransactionTable() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PaymentStatus | undefined>();
  const [data, setData] =
    useState<Awaited<ReturnType<typeof trpcClient.transactions.list.query>>>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    const t = setTimeout(
      () =>
        trpcClient.transactions.list
          .query({ query: query || undefined, status })
          .then(setData)
          .catch((e) => setError(e.message)),
      250,
    );
    return () => clearTimeout(t);
  }, [query, status]);
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar referência, cliente ou descrição"
          className="rounded-md border bg-white px-3 py-2 text-sm sm:w-80"
        />
        <select
          value={status ?? ""}
          onChange={(e) => setStatus((e.target.value || undefined) as PaymentStatus | undefined)}
          className="rounded-md border bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          {["PENDING", "APPROVED", "DECLINED", "FAILED", "CANCELLED", "EXPIRED", "REFUNDED"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
      </div>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {["Referência", "Cliente", "Descrição", "Valor", "Método", "Status", "Criado"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.items.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-green-700">
                    <Link href={`/transactions/${p.id}`}>{p.reference}</Link>
                  </td>
                  <td className="px-4 py-3">{p.customer.name}</td>
                  <td className="max-w-48 truncate px-4 py-3">{p.description}</td>
                  <td className="px-4 py-3">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3">PIX</td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
              {data && !data.items.length && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
