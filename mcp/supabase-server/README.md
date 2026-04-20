# Supabase MCP

Servidor MCP inicial para consultas e operacoes controladas no Supabase do projeto.

## Variaveis

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Rodando

```bash
npm install
npm start
```

## Tools iniciais

- `list_tables`
- `list_prestadores`
- `get_user_profile`
- `create_prestador`

O servidor usa whitelist de tabelas e evita SQL arbitrario nesta primeira base.

