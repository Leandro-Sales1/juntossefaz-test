"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentStatus } from "@prisma/client";
import { trpcClient } from "@/lib/trpc/client";
export function SimulationActions({ id, status }: { id: string; status: PaymentStatus }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  if (status !== "PENDING") return null;
  const change = async (next: "APPROVED" | "DECLINED") => {
    try {
      await trpcClient.payments.simulate.mutate({ id, status: next });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro na simulação");
    }
  };
  return (
    <div className="mt-6 border-t pt-5">
      <p className="text-sm font-medium">Simulação interna (somente sandbox)</p>
      <div className="mt-3 flex gap-3">
        <button
          onClick={() => change("APPROVED")}
          className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Simular aprovação
        </button>
        <button
          onClick={() => change("DECLINED")}
          className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
        >
          Simular recusa
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
