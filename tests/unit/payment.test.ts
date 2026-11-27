import { describe, expect, it } from "vitest";
import { createPaymentSchema } from "@/server/modules/payment/payment.schema";
import { canTransition } from "@/server/modules/payment/payment-status";
describe("payment validation", () => {
  it("accepts a valid amount in cents", () =>
    expect(
      createPaymentSchema.parse({
        customerName: "Ana Silva",
        customerEmail: "ana@example.com",
        description: "Serviço",
        amount: 1990,
        method: "PIX",
      }).amount,
    ).toBe(1990));
  it("rejects zero amount", () =>
    expect(() =>
      createPaymentSchema.parse({
        customerName: "Ana",
        customerEmail: "ana@example.com",
        description: "Serviço",
        amount: 0,
        method: "PIX",
      }),
    ).toThrow());
});
describe("payment status transitions", () => {
  it("allows pending approval", () => expect(canTransition("PENDING", "APPROVED")).toBe(true));
  it("does not alter final statuses", () =>
    expect(canTransition("DECLINED", "APPROVED")).toBe(false));
  it("allows only approved refunds", () =>
    expect(canTransition("APPROVED", "REFUNDED")).toBe(true));
});
