import { initTRPC, TRPCError } from "@trpc/server";
export const createContext = async () => ({});
const t = initTRPC.context<Awaited<ReturnType<typeof createContext>>>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
export { TRPCError };
