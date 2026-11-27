export type GatewayCreatePayment = { amountInCents: number; reference: string; method: "PIX" };
export type GatewayPayment = {
  providerId: string;
  status: "PENDING" | "APPROVED";
  pixCode?: string;
  simulated: boolean;
};
export interface PaymentGateway {
  createPayment(input: GatewayCreatePayment): Promise<GatewayPayment>;
}
