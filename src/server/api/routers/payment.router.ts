import { z } from "zod";
import { publicProcedure, router, TRPCError } from "../trpc";
import { createPaymentSchema, simulationSchema } from "@/server/modules/payment/payment.schema";
import { paymentService } from "@/server/modules/payment/payment.service";
const serviceError = (cause: unknown) =>
  new TRPCError({
    code: "BAD_REQUEST",
    message: cause instanceof Error ? cause.message : "Não foi possível concluir a operação.",
  });
export const paymentRouter = router({
  create: publicProcedure.input(createPaymentSchema).mutation(async ({ input }) => {
    try {
      return await paymentService.create(input);
    } catch (e) {
      throw serviceError(e);
    }
  }),
  byId: publicProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ input }) => {
    const payment = await paymentService.get(input.id);
    if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Pagamento não encontrado." });
    return payment;
  }),
  simulate: publicProcedure.input(simulationSchema).mutation(async ({ input }) => {
    try {
      return await paymentService.simulate(input.id, input.status);
    } catch (e) {
      throw serviceError(e);
    }
  }),
});
