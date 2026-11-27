import { PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/database/prisma";
export const paymentRepository = {
  create: (data: Prisma.PaymentCreateArgs["data"]) =>
    prisma.payment.create({ data, include: { customer: true, events: true } }),
  findById: (id: string) =>
    prisma.payment.findUnique({
      where: { id },
      include: { customer: true, events: { orderBy: { createdAt: "asc" } } },
    }),
  list: (where: Prisma.PaymentWhereInput, skip: number) =>
    prisma.payment.findMany({
      where,
      skip,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
  count: (where: Prisma.PaymentWhereInput) => prisma.payment.count({ where }),
  dashboard: () =>
    prisma.payment.groupBy({ by: ["status"], _sum: { amount: true }, _count: { _all: true } }),
  recent: () =>
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
  transition: (
    id: string,
    previousStatus: PaymentStatus,
    newStatus: PaymentStatus,
    source: string,
    description: string,
  ) =>
    prisma.$transaction(async (tx) => {
      const result = await tx.payment.updateMany({
        where: { id, status: previousStatus },
        data: { status: newStatus },
      });
      if (result.count !== 1) return null;
      await tx.paymentEvent.create({
        data: { paymentId: id, previousStatus, newStatus, source, description },
      });
      return tx.payment.findUnique({
        where: { id },
        include: { customer: true, events: { orderBy: { createdAt: "asc" } } },
      });
    }),
};
