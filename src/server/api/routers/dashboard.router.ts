import { publicProcedure, router } from "../trpc";
import { paymentService } from "@/server/modules/payment/payment.service";
export const dashboardRouter = router({
  summary: publicProcedure.query(() => paymentService.dashboard()),
});
