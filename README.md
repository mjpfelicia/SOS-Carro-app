# SOS Carro App

Aplicacao frontend criada com React e Vite para conectar motoristas a prestadores de servicos automotivos proximos, com foco em buscas rapidas, visualizacao em mapa e contato via WhatsApp.

## Visao geral

O projeto simula um fluxo de socorro automotivo no navegador:

- o usuario pode navegar pela home, login e telas de cadastro;
- prestadores cadastrados ficam salvos no `localStorage`;
- a home lista profissionais proximos com filtro por categoria;
- o mapa exibe os prestadores ao redor da localizacao atual ou buscada.

No estado atual, a aplicacao funciona inteiramente no frontend, sem integracao com backend.

## Tecnologias utilizadas

- React 19
- Vite 8
- React Router DOM
- React Leaflet
- Leaflet
- `localStorage` para persistencia local
- OpenStreetMap/Nominatim para busca de localidade

## Como rodar o projeto

### Requisitos

- Node.js 18 ou superior
- npm

### Instalacao

```bash
npm install
```

### Ambiente de desenvolvimento

```bash
npm run dev
```

Depois, abra no navegador o endereco exibido pelo Vite, normalmente:

```bash
http://localhost:5173
```

### Gerar build de producao

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
    BottomMenu/
    Mapa/
    ServiceCard/
  pages/
    Home/
    Login/
    CadastroCliente/
    CadastroPrestador/
  services/
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
3. Clique no botao central do menu inferior.
4. Acesse `Cadastrar prestador`.
5. Cadastre um ou mais profissionais.
6. Volte para a home.
7. Use a busca e os filtros para validar a listagem.
8. Abra o mapa e teste o link de WhatsApp.

## Persistencia de dados

Os prestadores sao armazenados localmente no navegador usando `localStorage`, na chave:

```text
prestadores
```

Isso significa que:

- os dados persistem entre recargas no mesmo navegador;
- os dados nao sao compartilhados entre dispositivos;
- limpar o armazenamento do navegador remove os cadastros.

## Limitacoes atuais

Para manter o README fiel ao estado do projeto, vale registrar alguns pontos:

- nao existe backend ou banco de dados;
- login e cadastro de cliente ainda nao salvam dados reais;
- a lista de favoritos ainda nao possui pagina implementada;
- as distancias e posicoes dos prestadores no mapa sao simuladas a partir da coordenada atual;
- existe base para evolucao do modulo `services`, mas sem API conectada no momento.

## Ideias para futuras features

- autenticacao real com backend e controle de sessao;
- painel administrativo para gerenciar prestadores;
- favoritos com pagina dedicada e persistencia por usuario;
- historico de chamados e servicos solicitados;
- avaliacao por estrelas e comentarios dos prestadores;
- filtro por disponibilidade imediata e horario de atendimento;
- integracao com pagamento online;
- chat interno no app alem do WhatsApp;
- rastreamento em tempo real do prestador a caminho;
- cadastro com upload de documentos e validacao de prestadores;
- estimativa de preco por tipo de servico;
- suporte a multiplas cidades com cobertura por regiao;
- botao de emergencia com abertura real de chamado prioritario;
- integracao com notificacoes push;
- internacionalizacao e melhorias de acessibilidade.

## Scripts disponiveis

- `npm run dev`: inicia o servidor de desenvolvimento
- `npm run build`: gera a build de producao
- `npm run preview`: serve a build gerada localmente

## Proximos passos sugeridos

Se a ideia for evoluir esse projeto, uma boa ordem seria:

1. conectar cadastro e login a uma API;
2. substituir dados simulados por coordenadas reais dos prestadores;
3. implementar favoritos e perfil;
4. criar fluxo real de solicitacao de socorro automotivo.
