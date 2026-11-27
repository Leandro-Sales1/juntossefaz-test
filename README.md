# PayFlow

Plataforma de gerenciamento e acompanhamento de cobranças PIX em ambiente sandbox. O objetivo é demonstrar uma integração full stack pequena, clara e explicável para pequenos negócios e prestadores de serviço.

## Tecnologias

Next.js (App Router), React, TypeScript estrito, Tailwind CSS, React Hook Form, Zod, tRPC, Prisma, PostgreSQL gerenciado no Supabase e Vitest.

## Funcionalidades

- Dashboard com métricas reais calculadas a partir do PostgreSQL.
- Criação de cobrança PIX, histórico pesquisável/filtrável e página de detalhes.
- Persistência de cliente, pagamento e eventos de status.
- Integração isolada com Juntos Se Faz; token somente no servidor.
- Simulação interna de aprovação/recusa, bloqueada em produção e identificada na interface.

## Arquitetura

Monólito modular: componentes e páginas em `src/app`/`src/components`; tRPC em `src/server/api`; regras no serviço de pagamentos; repositório Prisma; e adapter HTTP do gateway em `src/server/integrations`. O banco é a fonte de verdade, pois o sandbox do gateway não mantém o ciclo de vida persistente.

## Integração Juntos Se Faz

O adapter usa `POST /pix` da base `https://www.juntosefaz.com.br/gateway/api/v1`, com Bearer Token. O contrato confirmado usa `amount` decimal em BRL, `currency`, `reference` e `method: "pix"`; a resposta fornece `id`, `status`, `simulated` e `pix_code`. Valores internos são sempre inteiros em centavos e só são convertidos na chamada externa. O PIX retornado no staging é demonstrativo e não movimenta dinheiro.

## Execução

1. Crie um projeto Supabase e copie as URLs de pooler para o `.env` (não use a URL de API). Use o pooler de transações (`:6543`, com `pgbouncer=true`) em `DATABASE_URL` e o de sessão (`:5432`) em `DIRECT_URL`; inclua `sslmode=require`.
2. Copie `.env.example` para `.env`, configure as URLs e, quando disponível, o token de sandbox.
3. `npm install`
4. `npm run prisma:generate`
5. `npm run prisma:migrate -- --name init`
6. `npm run dev`

Abra `http://localhost:3000`. Para validar: `npm test`, `npm run lint` e `npm run build`.

## Banco

`Customer` possui pagamentos; `Payment` registra valor em centavos, dados de gateway e status; `PaymentEvent` forma a trilha de auditoria. Índices atendem status, data e referência única.

## Limitações conhecidas

Não há autenticação nesta versão, webhooks não foram implementados porque a documentação consultada não os disponibiliza, e a consulta de estado do gateway não é usada como fonte de verdade no sandbox.

## Uso de IA

Este projeto foi desenvolvido com auxílio de Codex/OpenAI para estruturar o MVP, gerar implementações iniciais, documentação e testes unitários. O candidato deve revisar cada alteração, configurar credenciais próprias, executar migrations/testes/build e validar manualmente o fluxo sandbox antes da entrega. A IA não recebeu nem deve receber credenciais reais.
