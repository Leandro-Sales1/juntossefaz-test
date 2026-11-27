import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PayFlow",
  description: "Plataforma de gerenciamento de pagamentos",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
