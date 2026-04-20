# Supabase Setup

Esta base inicial adiciona a estrutura para migrar o app do `localStorage` para Supabase sem quebrar o fluxo atual.

## Arquivos principais

- `src/lib/supabaseClient.js`
- `src/providers/AuthProvider.jsx`
- `src/services/authService.js`
- `src/services/profileService.js`
- `src/services/prestadoresService.js`
- `supabase/schema.sql`
- `mcp/supabase-server/`

## Frontend

1. Copie `.env.example` para `.env`
2. Preencha:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

3. Execute o schema em `supabase/schema.sql`
4. Instale as dependencias do projeto

## MCP

1. Entre em `mcp/supabase-server`
2. Copie `.env.example` para `.env`
3. Preencha:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

4. Instale as dependencias
5. Inicie com `npm start`

## Observacao

Sem variaveis do Supabase configuradas, o app continua usando o fluxo legado baseado em `localStorage`.
