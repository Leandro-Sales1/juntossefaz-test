import type { PaymentStatus } from "@prisma/client";
export const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ["APPROVED", "DECLINED", "FAILED", "CANCELLED", "EXPIRED"],
  APPROVED: ["REFUNDED"],
  DECLINED: [],
  FAILED: [],
  CANCELLED: [],
  EXPIRED: [],
  REFUNDED: [],
};
export const canTransition = (from: PaymentStatus, to: PaymentStatus) =>
  allowedTransitions[from].includes(to);
