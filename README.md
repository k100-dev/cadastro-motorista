# Trackia - Sistema de Cadastro de Motoristas

Sistema completo de cadastro e gerenciamento de motoristas para empresas de transporte e logística, desenvolvido com React, TypeScript e Supabase.

## 🚛 Sobre o Projeto

O Trackia é uma solução moderna para simplificar o processo de registro e verificação de motoristas, oferecendo:

- **Cadastro Completo**: Formulário intuitivo com validação em tempo real
- **Captura de Fotos**: Sistema avançado de captura facial com 3 posições (perfil esquerdo, direito e frontal)
- **Dashboard Administrativo**: Painel completo para gestores aprovarem e gerenciarem registros
- **Sistema de Status**: Controle de aprovação (Pendente, Aprovado, Rejeitado)
- **Notificações**: Sistema de emails automáticos para confirmações e atualizações

## ✨ Funcionalidades Principais

### Para Motoristas:
- ✅ Cadastro com dados pessoais e da empresa
- ✅ Captura de 3 fotos faciais com câmera integrada
- ✅ Dashboard pessoal com status do cadastro
- ✅ Autenticação segura

### Para Administradores:
- ✅ Dashboard administrativo completo
- ✅ Visualização de todos os cadastros
- ✅ Sistema de aprovação/rejeição
- ✅ Busca e filtros avançados
- ✅ Visualização detalhada com fotos

## 🛠 Tecnologias

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database + Auth + Storage)
- **Formulários**: React Hook Form
- **Roteamento**: React Router DOM
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ 
- Conta no Supabase

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd trackia-driver-registration
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
   - Crie um projeto no [Supabase](https://supabase.com)
   - Execute as migrations em `supabase/migrations/`
   - Configure o bucket de storage para `driver-photos`

4. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

5. **Execute o projeto**
```bash
npm run dev
```

## 📊 Estrutura do Banco de Dados

### Tabela `drivers`
- Dados pessoais e da empresa
- Status de aprovação
- Referência ao usuário autenticado

### Tabela `driver_photos` 
- Fotos de identificação (3 tipos)
- URLs do Supabase Storage
- Vinculação com motorista

### Storage `driver-photos`
- Armazenamento seguro das imagens
- Políticas de acesso controlado

## 🔐 Autenticação e Permissões

### **Sistema de Autenticação Duplo**

#### **Motoristas (Supabase Auth)**
- Registro via email/senha
- Acesso aos próprios dados
- Dashboard pessoal

#### **Administradores (JWT + PostgreSQL)**
- Login separado com credenciais próprias
- Senhas criptografadas com bcrypt
- Sessão via JWT (24h de duração)
- Acesso total ao sistema

### **Credenciais Padrão do Admin**
```
E-mail: admin@admin.com
Senha: admin123
```

### **Segurança Implementada**
- **Row Level Security (RLS)**: Proteção a nível de linha
- **Storage Policies**: Controle de acesso às imagens
- **JWT Authentication**: Tokens seguros para admins
- **Password Hashing**: bcrypt com salt rounds 12
- **Session Management**: Controle automático de expiração

## 🌐 Funcionalidades por Página

### `/` - Página Inicial
- Apresentação do sistema
- Links para cadastro e login
- Informações sobre funcionalidades

### `/register` - Cadastro de Motorista
- Formulário completo com validação
- Captura de fotos com câmera
- Feedback visual em tempo real

### `/login` - Login Motorista
- Autenticação segura
- Redirecionamento para dashboard

### `/admin-login` - Login Administrativo  
- Sistema de autenticação JWT
- Validação de credenciais no PostgreSQL
- Redirecionamento automático se já logado
- Mensagens de erro em português

### `/dashboard` - Dashboard Motorista
- Visualização do perfil completo
- Status do cadastro
- Fotos capturadas

### `/admin` - Dashboard Administrativo
- **Protegido por autenticação JWT**
- Lista de todos os motoristas
- Filtros e busca
- Aprovação/rejeição em massa
- Estatísticas do sistema
- Header com informações do admin logado
- Botão de logout

## 📱 Design Responsivo

- **Mobile First**: Otimizado para dispositivos móveis
- **Breakpoints**: Tablet (768px+) e Desktop (1024px+)
- **Componentes Adaptativos**: Interface se ajusta automaticamente

## 🎨 Sistema de Design

- **Cores Primárias**: Azul (#2563EB), Verde (#10B981)
- **Espaçamento**: Sistema baseado em 8px
- **Tipografia**: Hierarquia clara com 3 pesos de fonte
- **Animações**: Micro-interações suaves
- **Acessibilidade**: Contraste adequado e navegação por teclado

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Verificação de código
```

## 🔐 Configuração de Segurança

### **Alterar Senha Padrão do Admin**
1. Faça login com as credenciais padrão
2. Execute no PostgreSQL:
```sql
UPDATE admin_users 
SET password_hash = hash_password('nova_senha_aqui')
WHERE email = 'admin@admin.com';
```

### **Adicionar Novos Administradores**
```sql
INSERT INTO admin_users (email, password_hash, full_name)
VALUES (
  'novo@admin.com',
  hash_password('senha_segura'),
  'Nome do Administrador'
);
```

### **Configurar JWT Secret (Produção)**
```bash
# Adicione no .env
JWT_SECRET=sua_chave_secreta_super_segura_aqui
```

## 📁 Estrutura de Pastas

```
src/
├── components/
│   ├── Admin/           # Componentes administrativos
│   │   ├── AdminLogin.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── ProtectedAdminRoute.tsx
│   │   └── AdminDashboard.tsx
│   ├── Auth/            # Autenticação e proteção
│   ├── Dashboard/       # Dashboards
│   ├── Forms/           # Formulários
│   ├── Layout/          # Layout e navegação
│   └── PhotoCapture/    # Captura de fotos
├── contexts/            # Context API (Auth)
│   ├── AuthContext.tsx      # Auth motoristas
│   └── AdminAuthContext.tsx # Auth administradores
├── lib/                 # Configurações
│   ├── supabase.ts         # Cliente Supabase
│   └── auth.ts             # Funções JWT
├── pages/               # Páginas principais
└── App.tsx              # Componente raiz
```

## 🛡️ Funcionalidades de Segurança

### **Autenticação JWT**
- Tokens com expiração de 24 horas
- Verificação automática de validade
- Logout automático em caso de token expirado
- Armazenamento seguro no localStorage

### **Proteção de Rotas**
- Middleware de autenticação para rotas admin
- Redirecionamento automático para login
- Verificação de permissões em tempo real

### **Criptografia de Senhas**
- bcrypt com 12 salt rounds
- Funções PostgreSQL para hash/verificação
- Senhas nunca armazenadas em texto plano

## 🚀 Deploy

O projeto está configurado para deploy no Netlify:

1. **Build automático** com `npm run build`
2. **Variáveis de ambiente** configuradas no painel
3. **Redirecionamentos** para SPA configurados

## 📄 Licença

Este projeto foi desenvolvido para a Trackia como solução proprietária de gerenciamento de motoristas.

## 👥 Suporte

Para dúvidas técnicas ou solicitações de funcionalidades, entre em contato com a equipe de desenvolvimento.

### **Troubleshooting Comum**

**Problema:** "Usuário ou senha inválidos"
- Verifique se está usando as credenciais corretas
- Confirme se o usuário está ativo no banco

**Problema:** Token expirado
- Faça login novamente
- Verifique se o JWT_SECRET está configurado

**Problema:** Erro de permissão no banco
- Verifique se as funções PostgreSQL foram criadas
- Confirme se as políticas RLS estão ativas