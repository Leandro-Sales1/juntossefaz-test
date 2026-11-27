import { router } from "./trpc";
import { paymentRouter } from "./routers/payment.router";
import { transactionRouter } from "./routers/transaction.router";
import { dashboardRouter } from "./routers/dashboard.router";
export const appRouter = router({
  payments: paymentRouter,
  transactions: transactionRouter,
  dashboard: dashboardRouter,
});
export type AppRouter = typeof appRouter;
