# Mariana Lash Beauty - Sistema de Agendamentos

Este é um sistema web moderno e responsivo desenvolvido para facilitar o agendamento de serviços de estética e extensão de cílios. O projeto oferece uma experiência fluida tanto para as clientes quanto para a administração do salão, permitindo gestão completa de horários e serviços.

## 📋 Funcionalidades

### Para Clientes
*   **Vitrine de Serviços:** Visualização elegante dos procedimentos disponíveis, com fotos, descrições, preços e duração estimada.
*   **Agendamento Intuitivo (Wizard):** Fluxo passo-a-passo simplificado para realização de agendamentos:
    1.  Seleção do Procedimento.
    2.  Escolha da Data (Calendário dinâmico).
    3.  Seleção de Horário (Verificação automática de disponibilidade).
    4.  Identificação e Confirmação.
*   **Autenticação Simplificada:** Sistema de cadastro e login utilizando telefone (WhatsApp) e senha.
*   **Confirmação Imediata:** Feedback visual e resumo do agendamento após a conclusão.
*   **Retomada de Fluxo:** Se o usuário fizer login no meio do agendamento, o sistema retoma o processo exatamente de onde parou.

### Para Administração (Painel de Gestão)
*   **Dashboard Administrativo:** Acesso exclusivo para gestores via login autenticado.
*   **Gestão de Agendamentos:**
    *   Listagem completa de todos os agendamentos (futuros e passados).
    *   Detalhes do cliente (Nome e Telefone).
    *   Status do agendamento (Confirmado/Cancelado).
*   **Edição e Controle:**
    *   Possibilidade de alterar a data, o horário ou o serviço de um agendamento existente.
    *   Funcionalidade para cancelar agendamentos.
*   **Gestão de Catálogo:**
    *   Cadastro de novos serviços.
    *   Upload/Visualização de imagens dos procedimentos.
    *   Definição de preços e tempo de duração.
    *   Exclusão de serviços.

## 🛠 Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna focada em performance e experiência do usuário:

*   **Frontend:** React 19 (TypeScript)
*   **Estilização:** Tailwind CSS (Design responsivo e componentes customizados)
*   **Ícones:** Lucide React
*   **Manipulação de Datas:** date-fns
*   **Backend & Banco de Dados:** Integração com Supabase (PostgreSQL)

## 🚀 Como Executar o Projeto

1.  **Instalação das dependências:**
    ```bash
    npm install
    ```

2.  **Execução em modo de desenvolvimento:**
    ```bash
    npm start
    ```

3.  **Build para produção:**
    ```bash
    npm run build
    ```

## 📱 Design e UX

O sistema conta com um design sofisticado ("Mariana Lash Beauty"), utilizando uma paleta de cores em tons de rosa e tipografia serifada para transmitir elegância. A interface é totalmente adaptável para dispositivos móveis (mobile-first) e desktops.
