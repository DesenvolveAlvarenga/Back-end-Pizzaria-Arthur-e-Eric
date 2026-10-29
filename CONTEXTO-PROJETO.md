# Contexto do projeto — Back-end Pizzaria

## Visão geral

API REST para o sistema de uma pizzaria, implementada em TypeScript com Node.js e Express. O projeto já possui fluxos de usuários/autenticação e criação de categorias. Produtos, pedidos e itens estão modelados no banco, mas ainda não possuem rotas, controllers ou services implementados.

## Arquitetura

O fluxo pretendido é:

```text
Requisição HTTP
  -> rota (define o endpoint e os middlewares)
  -> controller (lê a requisição e chama o service)
  -> service (executa a regra de negócio e acessa o banco via Prisma)
  -> controller (envia a resposta HTTP)
  -> cliente
```

- **Rotas:** centralizadas em `src/routes.ts`; associam método/caminho, validação, autenticação/autorização e controller.
- **Controllers:** em `src/controllers/`; recebem `Request`/`Response` e fazem a ponte entre HTTP e services.
- **Services:** em `src/services/`; concentram operações e regras de negócio, comunicando-se com o PostgreSQL pelo Prisma.
- **Schemas:** em `src/schemas/`; definem validação de payloads com Zod.
- **Middlewares:** em `src/middlewares/`; validam entrada e controlam autenticação/permissão.
- **Persistência:** Prisma Client gerado em `src/generated/prisma/`, inicializado com o adaptador PostgreSQL em `src/prisma/index.ts`.

## Organização de pastas

```text
.
├── prisma/
│   ├── migrations/             # Migrações versionadas
│   └── schema.prisma           # Modelos, enum e relações do banco
├── src/
│   ├── @types/express/         # Extensão de tipos do Express (req.user_id)
│   ├── controllers/
│   │   ├── category/
│   │   └── user/
│   ├── generated/prisma/       # Código gerado pelo Prisma; não editar manualmente
│   ├── middlewares/
│   ├── prisma/                 # Instância compartilhada do Prisma Client
│   ├── schemas/
│   ├── services/
│   │   ├── category/
│   │   └── user/
│   ├── routes.ts               # Registro das rotas
│   └── server.ts               # Configuração e inicialização do Express
├── docker-compose.yml          # PostgreSQL e pgAdmin para desenvolvimento
├── prisma7.config.ts           # Configuração de schema, migrations e datasource
├── package.json                # Scripts e dependências
└── tsconfig.json               # Configuração TypeScript
```

## Endpoints implementados

Não há prefixo global de API nem versão (`/api/v1`) configurados. Os caminhos abaixo são registrados diretamente no router.

| Método | Caminho | Acesso | Validação | Descrição |
|---|---|---|---|---|
| `POST` | `/users` | Público | `createUserSchema` | Cria usuário com nome, e-mail e senha. A senha é armazenada como hash bcrypt; a resposta omite a senha. |
| `POST` | `/session` | Público | `authUserSchema` | Autentica por e-mail e senha e retorna dados do usuário e token JWT com validade de 30 dias. |
| `GET` | `/me` | Token JWT | — | Consulta os dados do usuário autenticado. **A implementação atual tem uma inconsistência:** `isAuthenticated` grava o ID em `req.user_id`, mas `DetailUserController` passa `req.body` ao service; por isso, o fluxo não utiliza o ID autenticado como esperado e precisa ser corrigido. |
| `GET` | `/category` | Token JWT | — | Lista todas as categorias cadastradas, em ordem alfabética pelo nome, retornando `id`, `name` e `createdAt`. Não exige perfil `ADMIN`. |
| `POST` | `/category` | Token JWT + perfil `ADMIN` | `createCategorySchema` | Cria uma categoria e responde com status `201`. |

### Formatos de entrada

`POST /users`:

```json
{
  "name": "Nome do usuário",
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

`POST /session`:

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

`POST /category`:

```json
{
  "name": "Pizzas"
}
```

As rotas autenticadas esperam o token no header `Authorization` (formato convencional `Bearer <token>`). A implementação verifica a assinatura usando `JWT_SECRET`.

## Schemas e validação

O middleware `validateSchema` valida o objeto composto por `body`, `query` e `params` da requisição usando `parseAsync` do Zod. Os schemas atuais especificam as regras do `body`:

- **Criar usuário:** `name` é texto com pelo menos 3 caracteres; `email` deve ser e-mail válido; `password` é texto com pelo menos 6 caracteres.
- **Autenticar:** `email` deve ser e-mail válido; `password` é texto não vazio.
- **Criar categoria:** `name` é texto com pelo menos 2 caracteres.

Falhas de validação retornam `400` com `error: "Erro de validação"` e uma lista `details` contendo as mensagens das issues do Zod.

## Middlewares

- **`validateSchema(schema)`** — valida body/query/params; retorna `400` em erros Zod e `500` para outros erros ocorridos durante a validação.
- **`isAuthenticated`** — lê `Authorization`, verifica JWT com `JWT_SECRET` e armazena o `sub` do token em `req.user_id`. Sem token ou com token inválido retorna `401`.
- **`isAdmin`** — procura o usuário de `req.user_id` no banco e exige `role === "ADMIN"`; usuário ausente ou sem privilégio retorna `401`. É usado depois de `isAuthenticated` na rota de criação de categoria.
- **Tratamento de erros do Express** — registrado ao final de `src/server.ts`. No estado atual, erros que chegam como instâncias de `Error` são respondidos com status `400`; os demais recebem `500`.

## Modelagem do banco de dados

Banco PostgreSQL, definido em `prisma/schema.prisma`. As tabelas usam nomes em minúsculo/plural via `@@map`; os nomes das colunas correspondem aos campos Prisma.

| Modelo / tabela | Campos principais | Relações e regras |
|---|---|---|
| `User` / `users` | `id` UUID; `name`; `email` único; `password` (hash); `role` (`STAFF` por padrão); `createdAt`; `updateAt` | `Role` admite `STAFF` e `ADMIN`. |
| `Category` / `categories` | `id` UUID; `name`; `createdAt`; `updateAt` | Uma categoria possui vários produtos. |
| `Product` / `products` | `id` UUID; `name`; `price` inteiro; `description`; `banner`; `Disabled` (`false` por padrão); `category_id`; `createdAt`; `updateAt` | Pertence a uma categoria; exclusão da categoria propaga para produtos. Pode aparecer em vários itens de pedido. |
| `Order` / `orders` | `id` UUID; `table` inteiro; `status` (`false` por padrão); `draft` (`true` por padrão); `name` opcional; `createdAt`; `updateAt` | Possui vários itens. |
| `Item` / `items` | `id` UUID; `amount` inteiro; `order_id`; `product_id`; `createdAt`; `updateAt` | Pertence a um pedido e a um produto. Exclusão do pedido ou produto propaga para os itens. |

Todos os IDs são strings UUID geradas por padrão. `createdAt` é preenchido na criação e `updateAt` é atualizado pelo Prisma. A migração inicial cria índice único para `users.email` e as chaves estrangeiras descritas acima. Não há, no schema atual, validações de domínio adicionais para preço, quantidade ou status.

## Bibliotecas e versões

Versões resolvidas em `package-lock.json` (não os intervalos `^` declarados no `package.json`):

| Biblioteca | Versão | Uso |
|---|---:|---|
| `express` | 5.3.0 | Servidor HTTP e rotas |
| `@types/express` | 5.0.6 | Tipos Express |
| `@prisma/client` | 7.10.1 | Cliente de acesso ao banco |
| `prisma` | 7.10.1 | Schema, migrações e geração do cliente |
| `@prisma/adapter-pg` | 7.10.1 | Adaptador Prisma para PostgreSQL |
| `pg` | 8.23.1 | Driver PostgreSQL |
| `@types/pg` | 8.23.1 | Tipos do driver PostgreSQL |
| `zod` | 4.6.7 | Validação de schemas |
| `bcryptjs` | 3.0.3 | Hash e comparação de senhas |
| `jsonwebtoken` | 9.0.3 | Geração e verificação de JWT |
| `@types/jsonwebtoken` | 9.0.10 | Tipos JWT |
| `cors` | 2.8.6 | Middleware CORS |
| `@types/cors` | 2.8.19 | Tipos CORS |
| `dotenv` | 18.0.9 | Carregamento de variáveis de ambiente |
| `tsx` | 4.23.15 | Execução TypeScript em desenvolvimento |
| `typescript` | 7.0.2 | Compilador e verificação de tipos |
| `@types/node` | 26.6.5 | Tipos do Node.js |

## Configuração e execução

- Script disponível: `npm run dev`, que executa `tsx watch src/server.ts`.
- Porta: `PORT`, com fallback para `3333`.
- Banco: `DATABASE_URL`, carregada por `dotenv` e utilizada pelo adaptador PostgreSQL.
- JWT: `JWT_SECRET`, usada para assinar e verificar tokens.
- O `docker-compose.yml` disponibiliza PostgreSQL 15 Alpine na porta `5432` e pgAdmin na porta `5050`. Os valores de credenciais da configuração local não são reproduzidos neste documento; use variáveis e segredos apropriados ao ambiente.
- A configuração Prisma aponta para `prisma/schema.prisma` e `prisma/migrations`. O cliente é gerado em `src/generated/prisma`.
- O `package.json` atualmente não declara scripts de teste, build, lint ou migração; o único script é `dev`.
- O TypeScript está configurado em modo estrito (`strict`) e compila os arquivos de `src/`.

## Estado e limites conhecidos

- Somente os quatro endpoints listados estão registrados; não há API implementada ainda para produtos, pedidos ou itens.
- A rota `GET /me` precisa alinhar o controller ao ID preenchido pelo middleware de autenticação (`req.user_id`).
- O comportamento do handler global de erros é o atualmente implementado, inclusive o retorno `400` para instâncias de `Error`.
- Não há paginação, documentação OpenAPI/Swagger, suíte de testes ou scripts de build configurados no `package.json`.
