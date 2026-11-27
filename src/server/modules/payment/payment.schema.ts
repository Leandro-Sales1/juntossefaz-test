import { z } from "zod";
export const createPaymentSchema = z.object({
  customerName: z.string().trim().min(2, "Informe o nome do cliente").max(120),
  customerEmail: z.string().trim().email("Informe um e-mail válido").max(160),
  description: z.string().trim().min(3, "Informe uma descrição").max(240),
  amount: z.number().int().positive("O valor deve ser maior que zero").max(100_000_000),
  method: z.literal("PIX"),
});
export const listPaymentsSchema = z.object({
  query: z.string().trim().max(100).optional(),
  status: z
    .enum(["PENDING", "APPROVED", "DECLINED", "FAILED", "CANCELLED", "EXPIRED", "REFUNDED"])
    .optional(),
  page: z.number().int().positive().default(1),
});
export const simulationSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["APPROVED", "DECLINED"]),
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
