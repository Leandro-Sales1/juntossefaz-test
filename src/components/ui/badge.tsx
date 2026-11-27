import { PaymentStatus } from "@prisma/client";
const styles: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  DECLINED: "bg-red-50 text-red-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  EXPIRED: "bg-slate-100 text-slate-600",
  REFUNDED: "bg-blue-50 text-blue-700",
};
const labels: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  DECLINED: "Recusado",
  FAILED: "Falhou",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
};
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
