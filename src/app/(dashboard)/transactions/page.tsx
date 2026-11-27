import { TransactionTable } from "@/components/transactions/transaction-table";
export default function TransactionsPage() {
  return (
    <>
      <p className="text-sm text-slate-500">Histórico</p>
      <h1 className="mt-1 text-2xl font-bold">Transações</h1>
      <p className="mt-2 mb-6 text-sm text-slate-600">
        Acompanhe todas as cobranças registradas no PayFlow.
      </p>
      <TransactionTable />
    </>
  );
}
