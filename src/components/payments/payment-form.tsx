"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPaymentSchema,
  type CreatePaymentInput,
} from "@/server/modules/payment/payment.schema";
import { trpcClient } from "@/lib/trpc/client";
export function PaymentForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePaymentInput>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: { method: "PIX" },
  });
  const submit = async (data: CreatePaymentInput) => {
    setError(undefined);
    try {
      const payment = await trpcClient.payments.create.mutate(data);
      router.push(`/transactions/${payment.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar a cobrança.");
    }
  };
  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="max-w-2xl space-y-5 rounded-lg border bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome do cliente" error={errors.customerName?.message}>
          <input {...register("customerName")} />
        </Field>
        <Field label="E-mail" error={errors.customerEmail?.message}>
          <input type="email" {...register("customerEmail")} />
        </Field>
      </div>
      <Field label="Descrição da cobrança" error={errors.description?.message}>
        <input {...register("description")} placeholder="Ex.: Serviço mensal" />
      </Field>
      <Field label="Valor (centavos)" error={errors.amount?.message}>
        <input
          type="number"
          min="1"
          {...register("amount", { valueAsNumber: true })}
          placeholder="Ex.: 1990"
        />
        <span className="mt-1 block text-xs text-slate-500">
          Armazenado em centavos. 1990 = R$ 19,90.
        </span>
      </Field>
      <input type="hidden" {...register("method")} />
      <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
        Método selecionado: <strong>PIX</strong>
      </div>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button
        disabled={isSubmitting}
        className="rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
      >
        {isSubmitting ? "Criando cobrança..." : "Criar cobrança PIX"}
      </button>
    </form>
  );
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="mt-1 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:px-3 [&_input]:py-2 [&_input]:outline-none [&_input:focus]:border-green-600">
        {children}
      </div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
