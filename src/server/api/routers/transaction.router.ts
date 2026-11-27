import { publicProcedure, router } from "../trpc";
import { listPaymentsSchema } from "@/server/modules/payment/payment.schema";
import { paymentService } from "@/server/modules/payment/payment.service";
export const transactionRouter = router({
  list: publicProcedure
    .input(listPaymentsSchema)
    .query(({ input }) => paymentService.list(input.query, input.status, input.page)),
});
