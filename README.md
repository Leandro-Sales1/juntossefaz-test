# PayFlow

> Plataforma de gerenciamento e acompanhamento de cobranças PIX em ambiente sandbox.

O PayFlow é um MVP full stack criado para demonstrar uma integração de gateway de pagamentos de forma objetiva, segura e explicável em entrevista técnica. Ele não é uma loja virtual e não processa dinheiro real: o foco é criar cobranças demonstrativas, acompanhar seus estados e manter um histórico auditável no banco de dados.

## Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Integração com Juntos Se Faz](#integração-com-juntos-se-faz)
- [Persistência e regras de negócio](#persistência-e-regras-de-negócio)
- [Execução local](#execução-local)
- [API e fluxos](#api-e-fluxos)
- [Qualidade e segurança](#qualidade-e-segurança)
- [Testes executados](#testes-executados)
- [Limitações e próximos passos](#limitações-e-próximos-passos)
- [Uso de IA e processo spec-driven](#uso-de-ia-e-processo-spec-driven)

## Funcionalidades

- Dashboard com total aprovado, quantidade de transações, pendências, falhas/recusas e transações recentes.
- Criação de cobrança PIX com validação de cliente, descrição, método e valor em centavos.
- Integração server-side com o gateway Juntos Se Faz em ambiente de staging.
- Histórico pesquisável e filtrável por status, com ordenação por data mais recente.
- Detalhes da cobrança: referência interna, dados do cliente, identificador externo, PIX demonstrativo e linha do tempo de eventos.
- Simulação interna de aprovação ou recusa exclusivamente no backend e somente fora de produção.
- Persistência de clientes, pagamentos e eventos de status no PostgreSQL do Supabase.

## Tecnologias

| Camada                  | Tecnologia                                                                       |
| ----------------------- | -------------------------------------------------------------------------------- |
| Interface               | Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS, Lucide React |
| Formulários e validação | React Hook Form, Zod, `@hookform/resolvers`                                      |
| Comunicação interna     | tRPC 11 e Next.js Route Handlers                                                 |
| Persistência            | PostgreSQL no Supabase, Prisma ORM                                               |
| Testes e qualidade      | Vitest, ESLint e Prettier                                                        |
| Gateway                 | Juntos Se Faz, ambiente sandbox/staging                                          |

## Arquitetura

O projeto usa um monólito modular com responsabilidades separadas e sem microserviços ou abstrações artificiais:

```text
src/
├── app/                         # Rotas, páginas e Route Handlers do Next.js
├── components/                  # Componentes visuais próprios
├── lib/                         # Cliente tRPC e formatadores
└── server/
    ├── api/                     # Contexto, routers tRPC e composição da API
    ├── database/                # Prisma Client
    ├── integrations/            # Interface, cliente HTTP e adapter do gateway
    └── modules/payment/         # Schema, serviço, repositório e regras de status
```

Fluxo de criação de cobrança:

```text
PaymentForm → tRPC router → PaymentService → JuntosGateway → Juntos Se Faz
                              │
                              └→ PaymentRepository → Prisma → Supabase PostgreSQL
```

Os componentes React nunca chamam o gateway diretamente. O adapter `JuntosGateway` implementa uma interface de gateway para permitir a inclusão ou substituição de provedores no futuro sem alterar as regras de negócio ou as páginas.

## Integração com Juntos Se Faz

O contrato foi consultado na [documentação oficial do gateway](https://www.juntosefaz.com.br/gateway/docs).

- Base URL: `https://www.juntosefaz.com.br/gateway/api/v1`
- Endpoint utilizado: `POST /pix`
- Autenticação: `Authorization: Bearer <token>`
- Payload: `amount` decimal em BRL, `currency`, `reference` e `method: "pix"`
- Dados relevantes de resposta: `id`, `status`, `simulated` e `pix_code`

O PayFlow guarda valores internamente em centavos (`Int`) e converte para decimal somente no limite externo da integração. O cliente HTTP tem timeout de 8 segundos, trata respostas HTTP inválidas e valida o payload retornado com Zod. Nenhum token é exposto ao navegador.

### Sandbox e simulação

O gateway de staging retorna códigos PIX demonstrativos que não podem movimentar dinheiro e não mantém o ciclo de vida das cobranças como fonte confiável. Por isso, o PostgreSQL é a fonte de verdade do PayFlow.

A rota e a ação de simulação são internas ao backend. Elas só funcionam com `PAYFLOW_ENABLE_SANDBOX_SIMULATION=true` e são bloqueadas em produção. A interface identifica visivelmente pagamentos simulados; a simulação nunca é apresentada como confirmação real do gateway.

## Persistência e regras de negócio

### Modelos

| Modelo         | Responsabilidade                                                                       |
| -------------- | -------------------------------------------------------------------------------------- |
| `Customer`     | Nome, e-mail e relacionamento com cobranças.                                           |
| `Payment`      | Referência interna, valor em centavos, método, status, dados do provedor e código PIX. |
| `PaymentEvent` | Trilha de auditoria imutável de todas as mudanças de status.                           |

Há índices para status e data de criação, referência única e índice composto de eventos por pagamento/data. A migration inicial está em `prisma/migrations/`.

### Transições internas permitidas

| Estado atual   | Próximos estados permitidos                              |
| -------------- | -------------------------------------------------------- |
| `PENDING`      | `APPROVED`, `DECLINED`, `FAILED`, `CANCELLED`, `EXPIRED` |
| `APPROVED`     | `REFUNDED`                                               |
| Demais estados | Nenhuma transição                                        |

Toda transição válida cria um `PaymentEvent` na mesma transação do banco. O status enviado pelo frontend nunca é aceito como fonte de verdade.

## Execução local

### Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Projeto PostgreSQL ativo no Supabase
- Token sandbox do Juntos Se Faz para criar cobranças reais no ambiente de demonstração

### Variáveis de ambiente

Crie `.env` a partir de `.env.example`. Não versione esse arquivo.

```env
# Runtime (pooler de transações Supabase)
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1"

# Migrations (pooler de sessão Supabase)
DIRECT_URL="postgresql://...:5432/postgres?sslmode=require"

JUNTOS_SE_FAZ_TOKEN=""
JUNTOS_SE_FAZ_BASE_URL="https://www.juntosefaz.com.br/gateway/api/v1"
PAYFLOW_ENABLE_SANDBOX_SIMULATION="true"
```

Use as URLs apresentadas em **Supabase → Connect**. A URL de transações (`:6543`) é adequada para runtime serverless; a de sessão (`:5432`) é usada pelo Prisma nas migrations. Ambas devem usar TLS.

### Instalação e inicialização

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A rota inicial redireciona para `/dashboard`.

Para visualizar os registros no banco:

```bash
npx prisma studio
```

## API e fluxos

O frontend usa tRPC para comunicação interna. O Route Handler é exposto em `/api/trpc/[trpc]` e os routers públicos são:

| Router         | Procedimento | Finalidade                                         |
| -------------- | ------------ | -------------------------------------------------- |
| `payments`     | `create`     | Cria cliente/cobrança e chama o gateway PIX.       |
| `payments`     | `byId`       | Obtém uma cobrança com cliente e eventos.          |
| `payments`     | `simulate`   | Aprova ou recusa uma cobrança pendente no sandbox. |
| `transactions` | `list`       | Lista transações com busca, filtro e paginação.    |
| `dashboard`    | `summary`    | Retorna indicadores e transações recentes.         |

Também existe o Route Handler `POST /api/sandbox/payments/:id/simulate`, destinado à simulação backend-only. Ele não substitui confirmação de pagamento pelo gateway.

## Qualidade e segurança

- TypeScript em modo estrito.
- Validação server-side com Zod para entradas e respostas do gateway.
- Valores monetários persistidos exclusivamente como inteiros em centavos.
- Credenciais apenas em variáveis de ambiente; `.env` está no `.gitignore`.
- Timeout, tratamento de erro e mensagens amigáveis para falhas do gateway.
- Atualização de status consistente e auditável dentro de transação Prisma.
- Simulador bloqueado em produção e identificável na interface.
- Nenhum dado de cartão é recebido ou persistido.

## Testes executados

Os testes unitários em `tests/unit/payment.test.ts` cobrem validação de criação e transições críticas de status.

Comandos executados durante o desenvolvimento:

```bash
npm run lint       # aprovado
npm test           # 5 testes aprovados
npm run build      # aprovado
```

A migration inicial foi gerada e `prisma migrate deploy` confirmou que não havia migrations pendentes no banco Supabase configurado.

## Limitações e próximos passos

Itens fora do escopo deste MVP ou que dependem de configuração externa:

1. Configurar `JUNTOS_SE_FAZ_TOKEN` e realizar o teste manual ponta a ponta de criação no sandbox.
2. Testar manualmente no navegador os fluxos de criação, busca, filtro e simulação com uma base Supabase acessível.
3. Adicionar testes de integração para repositórios/serviços e testes end-to-end com Playwright.
4. Adicionar autenticação e autorização antes de qualquer uso multiusuário ou exposição pública.
5. Implementar consulta ou webhook apenas se um contrato oficial de status for disponibilizado pelo gateway.
6. Configurar deploy e variáveis de produção; não há URL de deploy nesta entrega.

## Uso de IA e processo spec-driven

O desenvolvimento foi conduzido com um processo **spec-driven**. Antes de cada etapa, os requisitos fornecidos para o desafio foram usados como especificação de referência: escopo, stack obrigatória, restrições, arquitetura, modelagem, segurança, comportamento do sandbox e critérios de entrega.

O trabalho foi organizado em incrementos pequenos: fundação do projeto, persistência, backend/tRPC, integração isolada do gateway, interface, simulação, testes e documentação. Decisões que alteravam infraestrutura, configuração do Supabase, estratégia de conexão ou escopo foram apresentadas ao responsável pelo projeto e executadas após sua aprovação. Esse acompanhamento humano definiu as prioridades e aceitou cada avanço relevante.

O Codex/OpenAI foi utilizado como ferramenta de apoio para:

- transformar a especificação em estrutura inicial de arquivos e código;
- elaborar componentes, validações, testes unitários e documentação;
- consultar o contrato público do gateway;
- executar comandos de qualidade, build e migrations sob autorização;
- identificar problemas de configuração e propor correções verificáveis.

A IA não recebeu nem deve receber tokens, senhas ou outras credenciais reais. O responsável revisa as alterações, preserva o controle das decisões e aprova ações com impacto externo. As verificações listadas nesta documentação foram efetivamente executadas; itens não testados, como a criação real no sandbox sem token configurado, estão declarados como pendências.
