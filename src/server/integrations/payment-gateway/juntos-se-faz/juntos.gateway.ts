import type {
  GatewayCreatePayment,
  GatewayPayment,
  PaymentGateway,
} from "../payment-gateway.interface";
import { JuntosClient } from "./juntos.client";
export class JuntosGateway implements PaymentGateway {
  constructor(private readonly client = new JuntosClient()) {}
  async createPayment(input: GatewayCreatePayment): Promise<GatewayPayment> {
    const raw = await this.client.postPix({
      amount: input.amountInCents / 100,
      currency: "BRL",
      reference: input.reference,
      method: "pix",
    });
    return {
      providerId: raw.id,
      status: raw.status.toUpperCase() === "APPROVED" ? "APPROVED" : "PENDING",
      pixCode: raw.pix_code,
      simulated: raw.simulated,
    };
  }
}
