import { NextResponse } from "next/server";
import { simulationSchema } from "@/server/modules/payment/payment.schema";
import { paymentService } from "@/server/modules/payment/payment.service";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const input = simulationSchema.parse({ id, ...(body && typeof body === "object" ? body : {}) });
    return NextResponse.json(await paymentService.simulate(input.id, input.status));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
