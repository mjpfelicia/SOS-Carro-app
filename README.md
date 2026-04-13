# SOS Carro App

Aplicação frontend criada com React e Vite para conectar motoristas a prestadores de serviços automotivos próximos, com foco em buscas rápidas, visualização em mapa, contato via WhatsApp e sistema de pacotes mensais para fidelização de clientes.

## Visão geral

O projeto simula um fluxo completo de socorro automotivo no navegador:

- o usuário pode navegar pela home, login, telas de cadastro e perfil;
- prestadores cadastrados ficam salvos no `localStorage`;
- a home lista profissionais próximos com filtro por categoria;
- o mapa exibe os prestadores ao redor da localização atual ou buscada;
- sistema de pacotes mensais com valores fixos para serviços de emergência;
- edição de perfil e validação de dados.

No estado atual, a aplicação funciona inteiramente no frontend, sem integração com backend.

## Tecnologias utilizadas

- React 19
- Vite 8
- React Router DOM
- React Leaflet
- Leaflet
- `localStorage` para persistência local
- OpenStreetMap/Nominatim para busca de localidade

## Como rodar o projeto

### Requisitos

- Node.js 18 ou superior
- npm

### Instalação

```bash
npm install
```

### Ambiente de desenvolvimento

```bash
npm run dev
```

Depois, abra no navegador o endereço exibido pelo Vite, normalmente:

```bash
http://localhost:5174
```

### Gerar build de produção

```bash
npm run build
```

### Visualizar a build localmente

```bash
npm run preview
```

## Estrutura principal

```text
src/
  components/
    EmergencyButton.jsx
    HomeBackButton.jsx
    PrestadorCard.jsx
    PrimaryActionButton.jsx
    WhatsAppButton.jsx
    Mapa/
      Mapa.jsx
  pages/
    AdminPrestadores.jsx
    Favoritos.jsx
    Historico.jsx
    Profile.jsx
    CadastroCliente/
      CadastroCliente.jsx
    CadastroPrestador/
      CadastroPrestador.jsx
    Home/
      Home.jsx
    Login/
      Login.jsx
    Pacotes.jsx
    Socorro/
      Socorro.jsx
  services/
    api.js
    storage.js
```

## Features presentes

### 1. Home com busca de servicos automotivos

A pagina inicial centraliza a experiencia principal do app:

- exibe a localizacao atual do usuario;
- permite buscar uma cidade ou localidade pelo campo de busca;
- mostra categorias rapidas de servico;
- lista profissionais proximos com nome, tipo, cidade e distancia estimada;
- oferece um atalho para contato direto via WhatsApp.

### 2. Geolocalizacao do usuario

A home solicita permissao de GPS ao navegador para definir as coordenadas atuais do usuario. Quando a permissao e concedida, a listagem e o mapa passam a se basear nessa posicao.

### 3. Busca de localidade por texto

O usuario pode digitar um local e acionar a busca para reposicionar o contexto da tela. A aplicacao usa o servico do OpenStreetMap/Nominatim para localizar a cidade e atualizar:

- nome do local exibido;
- coordenadas usadas no mapa;
- referencia para a listagem de prestadores.

### 4. Filtro rapido por categoria

Na home existe uma grade de servicos com opcoes como:

- Mecanico
- Borracheiro
- Bateria
- Guincho
- Chaveiro
- Ar Condicionado
- Troca de Oleo
- Auto Eletrica

Ao tocar em uma categoria, a lista passa a mostrar apenas os prestadores daquele tipo.

### 5. Busca textual por nome, tipo ou cidade

O campo de busca tambem filtra os prestadores cadastrados localmente com base em:

- nome do profissional;
- tipo de servico;
- cidade informada no cadastro.

### 6. Cadastro de prestadores

A tela de cadastro de prestador permite registrar:

- nome;
- telefone/WhatsApp;
- tipo de servico;
- cidade.

Esses dados sao salvos no `localStorage` do navegador e passam a aparecer na home.

### 7. Cadastro de cliente

Existe uma tela dedicada ao cadastro de cliente com campos basicos de:

- nome;
- email;
- senha.

Atualmente esse fluxo funciona como interface local e exibe uma mensagem de sucesso apos o envio do formulario.

### 8. Tela de login

O projeto possui uma tela de login com campos de email e senha, alem de link para cadastro de cliente. No estado atual, ela representa o fluxo visual de autenticacao, sem integracao real com API.

### 9. Visualizacao em mapa

O componente de mapa usa `react-leaflet` com tiles do OpenStreetMap para mostrar os prestadores em volta do centro atual da busca. Cada marcador abre um popup com:

- nome do profissional;
- tipo de servico.

### 10. Contato rapido via WhatsApp

Cada card de profissional gera um link `wa.me` com mensagem pronta para acelerar o contato do cliente com o prestador.

### 11. Menu inferior de navegacao

O app possui um menu inferior com atalhos visuais para:

- home;
- favoritos;
- abrir menu de acao;
- login/perfil.

Hoje o atalho de cadastro de prestador e o principal fluxo funcional desse menu.

## Como testar rapidamente o fluxo atual

1. Rode `npm run dev`.
2. Abra a home.
3. Clique no botão central do menu inferior.
4. Acesse `Cadastrar prestador`.
5. Cadastre um ou mais profissionais.
6. Volte para a home.
7. Use a busca e os filtros para validar a listagem.
8. Abra o mapa e teste o link de WhatsApp.
9. Teste o sistema de pacotes em `/pacotes`.
10. Faça login e edite o perfil.
11. Teste o fluxo de socorro com validação de pacote.

## Persistência de dados

Os dados são armazenados localmente no navegador usando `localStorage`, nas chaves:

```text
prestadores
usuarios
usuarioAtual
favoritosPorUsuario
chamadosPorUsuario
avaliacoesPorPrestador
pacotes
assinaturasPorUsuario
```

Isso significa que:

- os dados persistem entre recargas no mesmo navegador;
- os dados não são compartilhados entre dispositivos;
- limpar o armazenamento do navegador remove os cadastros.

## Limitações atuais

Para manter o README fiel ao estado do projeto, vale registrar alguns pontos:

- não existe backend ou banco de dados;
- login e cadastro funcionam localmente com validação básica;
- as distâncias e posições dos prestadores no mapa são simuladas;
- sistema de pacotes é local, sem integração de pagamento;
- existe base para evolução do módulo `services`, mas sem API conectada.

## Ideias para futuras features

- integração com backend real e banco de dados;
- autenticação segura com JWT e controle de sessão;
- painel administrativo completo para gerenciar prestadores;
- integração com APIs de pagamento para pacotes;
- notificações push para status de chamados;
- chat interno no app além do WhatsApp;
- rastreamento em tempo real do prestador a caminho;
- upload de documentos e validação de prestadores;
- estimativa de preço por tipo de serviço;
- suporte a múltiplas cidades com cobertura por região;
- botão de emergência com abertura real de chamado prioritário;
- internacionalização e melhorias de acessibilidade;
- sistema de avaliação por estrelas e comentários;
- filtro por disponibilidade imediata e horário de atendimento.

## Scripts disponiveis

- `npm run dev`: inicia o servidor de desenvolvimento
- `npm run build`: gera a build de producao
- `npm run preview`: serve a build gerada localmente

## Próximos passos sugeridos

Se a ideia for evoluir esse projeto, uma boa ordem seria:

1. conectar cadastro e login a uma API backend;
2. implementar sistema de pagamento para pacotes;
3. substituir dados simulados por coordenadas reais dos prestadores;
4. adicionar notificações push e chat em tempo real;
5. criar fluxo de validação e onboarding de prestadores;
6. implementar sistema de avaliação e comentários;
7. adicionar filtros avançados e busca por disponibilidade.
