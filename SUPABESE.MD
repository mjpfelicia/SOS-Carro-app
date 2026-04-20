**Plano**

Pelo que existe hoje no projeto, o app concentra tudo em `src/services/storage.js`: autenticação, usuários, prestadores, favoritos, chamados, avaliações, pacotes e assinaturas. Então o caminho mais seguro é migrar por camadas, sem tentar trocar tudo de uma vez.

1. Preparar o Supabase
2. Modelar as tabelas com base nas estruturas já usadas no app
3. Integrar autenticação
4. Criar uma nova camada `services/supabase`
5. Migrar tela por tela
6. Ativar segurança com RLS
7. Validar fluxos e remover dependência do `localStorage`

**Passos de implementação**

1. Criar o projeto no Supabase e guardar:
   `SUPABASE_URL`
   `SUPABASE_ANON_KEY`

2. Instalar dependências no frontend:
   `@supabase/supabase-js`

3. Criar o client:
   `src/lib/supabaseClient.js`

4. Modelar o banco com estas entidades:
   `profiles`
   Campos: `id`, `nome`, `email`, `telefone`, `role`, `created_at`

   `prestadores`
   Campos: `id`, `nome`, `telefone`, `tipo`, `cidade`, `created_at`

   `favoritos`
   Campos: `id`, `user_id`, `prestador_id`, `created_at`

   `chamados`
   Campos: `id`, `user_id`, `prestador_id`, `problema`, `detalhes`, `localizacao`, `prioridade`, `status`, `created_at`

   `avaliacoes`
   Campos: `id`, `user_id`, `prestador_id`, `nota`, `comentario`, `created_at`

   `pacotes`
   Campos: `id`, `nome`, `preco`, `periodo`, `descricao`, `max_chamados`

   `assinaturas`
   Campos: `id`, `user_id`, `pacote_id`, `data_inicio`, `data_fim`, `status`, `chamados_usados`

5. Definir autenticação:
   usar `supabase.auth.signUp`
   usar `supabase.auth.signInWithPassword`
   usar `supabase.auth.signOut`
   sincronizar sessão no React em vez de `getUsuarioAtual()` do `localStorage`

6. Substituir `storage.js` por uma camada nova, por exemplo:
   `src/services/authService.js`
   `src/services/prestadoresService.js`
   `src/services/chamadosService.js`
   `src/services/favoritosService.js`
   `src/services/avaliacoesService.js`
   `src/services/assinaturasService.js`

7. Ordem ideal de migração das telas:
   `Login.jsx`
   `CadastroCliente.jsx`
   `Profile.jsx`
   `AdminPrestadores.jsx`
   `Socorro.jsx`
   `Favoritos.jsx`
   `Historico.jsx`
   `Pacotes.jsx`

8. Criar policies RLS:
   cliente só vê/edita o próprio perfil
   cliente só vê/cria os próprios favoritos/chamados/assinaturas
   admin pode gerenciar `prestadores`
   avaliações podem ser públicas para leitura, mas criação só por usuário autenticado

9. Fazer seed inicial:
   admin padrão
   prestadores iniciais
   pacotes iniciais

10. Depois da validação, remover o uso legado de `localStorage`

**Estratégia recomendada para este projeto**

Como o app já funciona, eu faria em 3 fases:

1. Fase 1
   Subir Supabase, criar schema, seeds e autenticação.

2. Fase 2
   Migrar apenas login, cadastro e perfil.
   Isso resolve sessão real e baseia o resto em usuário autenticado.

3. Fase 3
   Migrar prestadores, favoritos, chamados, avaliações e assinaturas.
   Só no fim remover `storage.js`.

**Plano para criar um MCP para Supabase**

Se a ideia é um MCP para você consultar e operar o Supabase via ferramentas de IA, o escopo pode ser este:

1. Criar uma pasta separada para o servidor MCP, por exemplo:
   `mcp/supabase-server`

2. Inicializar um projeto Node:
   `package.json`
   `index.js` ou `server.js`

3. Instalar dependências:
   `@modelcontextprotocol/sdk`
   `@supabase/supabase-js`
   `zod`

4. Configurar variáveis:
   `SUPABASE_URL`
   `SUPABASE_SERVICE_ROLE_KEY`

5. Expor tools úteis:
   `list_tables`
   `run_select`
   `insert_row`
   `update_row`
   `delete_row`
   `get_user_profile`
   `list_prestadores`
   `create_prestador`
   `list_chamados`
   `create_seed_data`

6. Expor resources opcionais:
   schema atual
   policies RLS
   queries frequentes
   documentação interna do banco

7. Adicionar proteções:
   whitelist de tabelas permitidas
   bloquear SQL arbitrário no início
   logs
   validação com `zod`

8. Registrar o MCP no cliente que você usa

**Sugestão de ordem para o MCP**

1. Primeiro criar tools só de leitura
2. Depois incluir escrita em `prestadores`
3. Depois incluir operações administrativas
4. Só por último considerar queries livres

**Próximo passo que faz mais sentido**

Se você quiser, eu posso seguir agora de forma prática e montar a base inicial no projeto com:

1. instalação e configuração do Supabase no frontend
2. `supabaseClient.js`
3. nova estrutura de services
4. esqueleto do MCP em `mcp/supabase-server`

Se quiser, eu já implemento essa primeira base no repositório.