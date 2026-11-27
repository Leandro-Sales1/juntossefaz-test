import { z } from "zod";
const responseSchema = z.object({
  id: z.string(),
  status: z.string(),
  pix_code: z.string().optional(),
  simulated: z.boolean(),
  environment: z.string().optional(),
});
export class JuntosClient {
  async postPix(body: { amount: number; currency: "BRL"; reference: string; method: "pix" }) {
    const token = process.env.JUNTOS_SE_FAZ_TOKEN;
    if (!token) throw new Error("JUNTOS_SE_FAZ_TOKEN não configurado.");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch(
        `${process.env.JUNTOS_SE_FAZ_BASE_URL ?? "https://www.juntosefaz.com.br/gateway/api/v1"}/pix`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
          cache: "no-store",
        },
      );
      const json: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(`Gateway recusou a solicitação (${response.status}).`);
      return responseSchema.parse(json);
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error("Resposta inválida recebida do gateway.");
      if (error instanceof Error && error.name === "AbortError")
        throw new Error("Tempo de conexão com gateway excedido.");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}
