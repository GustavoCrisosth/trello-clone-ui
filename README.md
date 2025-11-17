Interface TaskFlow (Clone do Trello/Asana)

Este é o repositório do front-end para a aplicação de gestão de projetos TaskFlow. Esta interface foi construída do zero com React, TypeScript e Vite, utilizando TailwindCSS e shadcn/ui para uma UI moderna, responsiva e com tema escuro (dark mode).

Este projeto consome a API do Back-end (Node.js) que foi hospedada separadamente.

 Links do Projeto

Aplicação no Ar (Vercel): [https://trello-clone-ui-one.vercel.app/]

Aviso Importante: O back-end está hospedado no plano gratuito do Render. A primeira inicialização (ao registrar-se ou fazer login) pode demorar 30-60 segundos para "acordar" o servidor. Após isso, o uso é instantâneo.

Stack de Tecnologias

Core: React, TypeScript, Vite

Estilização: TailwindCSS, shadcn/ui (Componentes UI)

Gerenciamento de Estado: Zustand (para o token de autenticação)

Formulários: React Hook Form & Zod (para validação)

Requisições API: Axios (com interceptors para o token JWT)

Drag-and-Drop: dnd-kit (para o Kanban)

Hospedagem: Vercel


 Principais Funcionalidades

Autenticação de Usuário: Páginas de Login e Registro que se comunicam com a API e armazenam o JWT de forma segura no localStorage (via Zustand).

Rotas Protegidas: O usuário não pode acessar os quadros (/boards) sem estar logado.

Dashboard de Quadros: Busca e exibe todos os quadros do usuário, permitindo criar, editar (in-place) e deletar quadros (com modal de confirmação).

Visualização Kanban Completa:

Renderiza listas e cartões vindos da API.

Drag-and-Drop: Funcionalidade completa para arrastar e soltar cartões entre listas ou reordená-los, com atualização otimista na UI e chamada de API para persistir a mudança.

Edição "In-place": Permite editar títulos de listas e quadros clicando diretamente neles.

CRUD de Cartões: Modal para criar cartões e editar seus detalhes (título e descrição).

CRUD de Listas: Modal para criar novas listas (colunas).

Tema Escuro (Dark Mode): Um seletor de tema (Claro, Escuro, Sistema) que persiste a escolha do usuário.

Design Responsivo (Básico): A interface é funcional e minimalista.

Local Setup (Como Rodar Localmente)

Clone este repositório:

Bash

git clone https://github.com/seu-usuario/trello-clone-ui.git
cd trello-clone-ui
Instale as dependências:

Bash

npm install
Crie um arquivo .env.local na raiz para apontar para a sua API local (o back-end):

Snippet de código

VITE_API_URL=http://localhost:3001/api
(Certifique-se de que o projeto trello-clone-api esteja rodando localmente na porta 3001)

Inicie o servidor de desenvolvimento do Vite:

Bash

npm run dev
O site estará disponível em http://localhost:5173.
