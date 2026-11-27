import { PaymentStatus, Prisma } from "@prisma/client";
import { paymentRepository } from "./payment.repository";
import type { CreatePaymentInput } from "./payment.schema";
import { JuntosGateway } from "@/server/integrations/payment-gateway/juntos-se-faz/juntos.gateway";
import { canTransition } from "./payment-status";
const reference = () =>
  `PF-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
export const paymentService = {
  async create(input: CreatePaymentInput) {
    const gateway = new JuntosGateway();
    const ref = reference();
    const remote = await gateway.createPayment({
      amountInCents: input.amount,
      reference: ref,
      method: input.method,
    });
    return paymentRepository.create({
      reference: ref,
      customer: {
        connectOrCreate: {
          where: { email: input.customerEmail.toLowerCase() },
          create: { name: input.customerName, email: input.customerEmail.toLowerCase() },
        },
      },
      description: input.description,
      amount: input.amount,
      method: input.method,
      providerId: remote.providerId,
      pixCode: remote.pixCode,
      simulated: remote.simulated,
      status: remote.status,
      events: {
        create: {
          newStatus: remote.status,
          source: "GATEWAY",
          description: "Cobrança criada pelo gateway de sandbox.",
        },
      },
    });
  },
  async simulate(id: string, next: "APPROVED" | "DECLINED") {
    if (
      process.env.NODE_ENV === "production" ||
      process.env.PAYFLOW_ENABLE_SANDBOX_SIMULATION !== "true"
    )
      throw new Error("Simulação não está habilitada neste ambiente.");
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new Error("Pagamento não encontrado.");
    if (!canTransition(payment.status, next)) throw new Error("Transição de status inválida.");
    const updated = await paymentRepository.transition(
      id,
      payment.status,
      next,
      "SANDBOX_SIMULATION",
      `Status alterado por simulação interna para ${next}.`,
    );
    if (!updated) throw new Error("O pagamento foi atualizado simultaneamente. Tente novamente.");
    return updated;
  },
  async list(query?: string, status?: PaymentStatus, page = 1) {
    const where: Prisma.PaymentWhereInput = {
      ...(status ? { status } : {}),
      ...(query
        ? {
            OR: [
              { reference: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { customer: { is: { name: { contains: query, mode: "insensitive" } } } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      paymentRepository.list(where, (page - 1) * 10),
      paymentRepository.count(where),
    ]);
    return { items, total, page, pageSize: 10 };
  },
  get: (id: string) => paymentRepository.findById(id),
  async dashboard() {
    const [groups, recent] = await Promise.all([
      paymentRepository.dashboard(),
      paymentRepository.recent(),
    ]);
    const by = (s: PaymentStatus) => groups.find((x) => x.status === s)?._count._all ?? 0;
    return {
      approvedAmount: groups.find((x) => x.status === "APPROVED")?._sum.amount ?? 0,
      transactions: groups.reduce((a, x) => a + x._count._all, 0),
      pending: by("PENDING"),
      unsuccessful: by("DECLINED") + by("FAILED"),
      recent,
    };
  },
};
