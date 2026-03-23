# EPIC 12 — Service Calls (Chamar Garcom)

> Versao: 1.0 | Data: 2026-03-23
> Status: In Progress
> Owner: Platform Team

---

## Indice

1. [Visao Geral](#1-visao-geral)
2. [Contexto de Negocio](#2-contexto-de-negocio)
3. [User Stories](#3-user-stories)
4. [Features e Criterios de Aceitacao](#4-features-e-criterios-de-aceitacao)
5. [Especificacoes Tecnicas](#5-especificacoes-tecnicas)
6. [Chaves i18n](#6-chaves-i18n)
7. [Definition of Done (DoD)](#7-definition-of-done-dod)

---

## 1. Visao Geral

O EPIC 12 implementa o sistema de **Service Calls** (Chamados de Servico) da plataforma NOOWE. Clientes podem chamar garcom, gerente ou solicitar ajuda diretamente do celular enquanto estao sentados na mesa. A equipe do restaurante recebe alertas em tempo real e pode reconhecer/resolver chamados.

Atualmente, a tela `CallWaiterScreen` existe no app client mas nao possui backend real integrado. Este epic conecta o frontend ao backend com WebSocket para comunicacao em tempo real.

---

## 2. Contexto de Negocio

### Problema
- Clientes precisam levantar a mao ou fazer gestos para chamar o garcom, o que e ineficiente e pode ser desconfortavel
- Nao ha rastreamento de chamados para analytics
- A equipe do restaurante nao tem visibilidade centralizada dos chamados pendentes
- Tempo de resposta nao e mensuravel

### Solucao
- Sistema digital de chamados via app do cliente
- Notificacoes em tempo real para a equipe via WebSocket
- Dashboard de gestao de chamados para garcons e gerentes
- Logging completo para analytics e melhoria de servico

### Metricas de Sucesso
- Tempo medio de resposta a chamados < 3 minutos
- 90% dos chamados reconhecidos em < 1 minuto
- Reducao de reclamacoes sobre atendimento em 30%

---

## 3. User Stories

### Customer (Cliente)

| ID | Story | Prioridade |
|------|-------|-----------|
| US-12.1 | Como cliente em uma mesa, quero chamar o garcom pelo celular para nao precisar levantar a mao | Alta |
| US-12.2 | Como cliente, quero especificar o tipo do chamado (garcom, gerente, ajuda) para que a pessoa certa venha me atender | Alta |
| US-12.3 | Como cliente, quero adicionar uma mensagem ao chamado (ex: "guardanapos extras") para contextualizar minha necessidade | Media |
| US-12.4 | Como cliente, quero ver que meu chamado foi reconhecido ("garcom a caminho") para ter feedback | Alta |
| US-12.5 | Como cliente, quero poder cancelar um chamado pendente caso nao precise mais | Media |

### Waiter (Garcom)

| ID | Story | Prioridade |
|------|-------|-----------|
| US-12.6 | Como garcom, quero receber notificacao instantanea quando uma mesa chamar para responder rapidamente | Alta |
| US-12.7 | Como garcom, quero reconhecer um chamado ("estou indo") para que o cliente saiba que fui notificado | Alta |
| US-12.8 | Como garcom, quero resolver um chamado ("concluido") apos atender a mesa | Alta |

### Manager (Gerente)

| ID | Story | Prioridade |
|------|-------|-----------|
| US-12.9 | Como gerente, quero ver todos os chamados pendentes do restaurante para supervisionar o atendimento | Alta |
| US-12.10 | Como gerente, quero ver estatisticas de chamados (pendentes, tempo medio de resposta) para avaliar performance | Media |

### Owner (Proprietario)

| ID | Story | Prioridade |
|------|-------|-----------|
| US-12.11 | Como proprietario, quero que todos os chamados sejam registrados para analytics e relatorios | Media |

---

## 4. Features e Criterios de Aceitacao

### F-12.1: Criar Chamado (Cliente)

**Descricao:** Cliente cria um chamado de servico a partir do app.

**Criterios de Aceitacao:**
- [ ] Cliente autenticado pode criar chamado via `POST /calls`
- [ ] Tipos disponiveis: `waiter`, `manager`, `help`, `emergency`
- [ ] Mensagem opcional de ate 500 caracteres
- [ ] Chamado criado com status `pending`
- [ ] Evento WebSocket `call:new` emitido para a sala do restaurante
- [ ] Feedback visual de sucesso apos envio

### F-12.2: Reconhecer Chamado (Staff)

**Descricao:** Garcom/gerente reconhece um chamado pendente.

**Criterios de Aceitacao:**
- [ ] Staff pode reconhecer via `PATCH /calls/:id/acknowledge`
- [ ] Status muda de `pending` para `acknowledged`
- [ ] `acknowledged_at` e `acknowledged_by` sao preenchidos
- [ ] Evento WebSocket `call:updated` emitido
- [ ] Cliente ve "Garcom a caminho" no app

### F-12.3: Resolver Chamado (Staff)

**Descricao:** Garcom/gerente marca chamado como resolvido.

**Criterios de Aceitacao:**
- [ ] Staff pode resolver via `PATCH /calls/:id/resolve`
- [ ] Status muda para `resolved`
- [ ] `resolved_at` e `resolved_by` sao preenchidos
- [ ] Evento WebSocket `call:updated` emitido

### F-12.4: Cancelar Chamado (Cliente)

**Descricao:** Cliente cancela seu proprio chamado pendente.

**Criterios de Aceitacao:**
- [ ] Cliente pode cancelar via `PATCH /calls/:id/cancel`
- [ ] Apenas o criador do chamado pode cancelar
- [ ] Apenas chamados com status `pending` podem ser cancelados
- [ ] Status muda para `cancelled`
- [ ] Evento WebSocket `call:updated` emitido

### F-12.5: Listar Chamados (Staff)

**Descricao:** Dashboard de gestao de chamados para a equipe.

**Criterios de Aceitacao:**
- [ ] `GET /calls/restaurant/:restaurantId` retorna chamados com filtro por status
- [ ] `GET /calls/restaurant/:restaurantId/pending` retorna apenas pendentes
- [ ] Ordenacao por `called_at` ASC (mais antigo primeiro)
- [ ] Cada card mostra: mesa, tipo, tempo decorrido, mensagem, nome do cliente

### F-12.6: Dashboard de Chamados (Restaurant App)

**Descricao:** Tela `CallsManagementScreen` no app do restaurante.

**Criterios de Aceitacao:**
- [ ] Header com stats: contagem pendentes, tempo medio de resposta
- [ ] Tabs: Pendentes | Reconhecidos | Resolvidos (hoje)
- [ ] Cards com: numero da mesa, badge de tipo (colorido), tempo decorrido, mensagem
- [ ] Botoes de acao: "Reconhecer" (pendente) -> "Resolver" (reconhecido)
- [ ] WebSocket real-time: `call:new`, `call:updated`
- [ ] Estado vazio por tab
- [ ] Skeleton loading
- [ ] Haptic feedback nas acoes
- [ ] i18n completo (PT-BR/EN/ES)

### F-12.7: Real-Time via WebSocket

**Descricao:** Comunicacao em tempo real entre cliente e staff.

**Criterios de Aceitacao:**
- [ ] Namespace `/calls` no WebSocket
- [ ] Evento `joinRestaurant` para staff entrar na sala
- [ ] Evento `call:new` emitido quando novo chamado e criado
- [ ] Evento `call:updated` emitido quando chamado e reconhecido/resolvido/cancelado
- [ ] Cliente recebe `call:updated` quando seu chamado e reconhecido

---

## 5. Especificacoes Tecnicas

### 5.1 Entidade: ServiceCall

```typescript
@Entity('service_calls')
ServiceCall {
  id: UUID (PK, auto-generated)
  restaurant_id: string (FK -> restaurants.id, indexed)
  table_id: string | null
  user_id: string (FK -> profiles.id, who made the call)
  call_type: enum('waiter', 'manager', 'help', 'emergency')
  status: enum('pending', 'acknowledged', 'resolved', 'cancelled')
  message: string | null (max 500 chars)
  called_at: timestamp (auto = created_at)
  acknowledged_at: timestamp | null
  acknowledged_by: string | null (FK -> profiles.id)
  resolved_at: timestamp | null
  resolved_by: string | null (FK -> profiles.id)
  created_at: timestamp (auto)
  updated_at: timestamp (auto)
}
```

### 5.2 Endpoints REST

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/calls` | JWT | Any authenticated | Criar chamado |
| GET | `/calls/restaurant/:restaurantId` | JWT | WAITER, MANAGER, OWNER | Listar chamados (query: status?) |
| GET | `/calls/restaurant/:restaurantId/pending` | JWT | WAITER, MANAGER, OWNER | Listar chamados pendentes |
| PATCH | `/calls/:id/acknowledge` | JWT | WAITER, MANAGER, OWNER | Reconhecer chamado |
| PATCH | `/calls/:id/resolve` | JWT | WAITER, MANAGER, OWNER | Resolver chamado |
| PATCH | `/calls/:id/cancel` | JWT | Any authenticated (owner only) | Cancelar proprio chamado |

### 5.3 DTOs

**CreateCallDto:**
```typescript
{
  restaurant_id: string (UUID, required)
  table_id?: string (UUID, optional)
  call_type: 'waiter' | 'manager' | 'help' | 'emergency' (required)
  message?: string (optional, max 500)
}
```

**UpdateCallDto:**
```typescript
{
  note?: string (optional)
}
```

### 5.4 WebSocket

**Namespace:** `/calls`

**Events:**

| Event | Direction | Room | Payload |
|-------|-----------|------|---------|
| `joinRestaurant` | Client -> Server | - | `{ restaurantId: string }` |
| `leaveRestaurant` | Client -> Server | - | `{ restaurantId: string }` |
| `call:new` | Server -> Client | `restaurant:{id}:staff` | `ServiceCall` |
| `call:updated` | Server -> Client | `restaurant:{id}:staff` | `ServiceCall` |
| `call:cancelled` | Server -> Client | `restaurant:{id}:staff` | `{ id, status }` |

### 5.5 Arquitetura de Arquivos

```
backend/src/modules/calls/
  calls.module.ts
  calls.controller.ts
  calls.service.ts
  calls.gateway.ts
  entities/service-call.entity.ts
  dto/create-call.dto.ts
  dto/update-call.dto.ts
  __tests__/calls.service.spec.ts

backend/src/database/migrations/
  {timestamp}-CreateServiceCallsTable.ts

mobile/apps/client/src/screens/service/
  CallWaiterScreen.tsx (updated)

mobile/apps/restaurant/src/screens/calls/
  CallsManagementScreen.tsx (new)
```

---

## 6. Chaves i18n

### PT-BR

```typescript
calls: {
  title: 'Chamados de Servico',
  type: {
    waiter: 'Garcom',
    manager: 'Gerente',
    help: 'Ajuda',
    emergency: 'Emergencia',
  },
  status: {
    pending: 'Pendente',
    acknowledged: 'Reconhecido',
    resolved: 'Resolvido',
  },
  call: 'Chamar',
  acknowledge: 'Reconhecer',
  resolve: 'Resolver',
  cancel: 'Cancelar Chamado',
  message: 'Mensagem',
  tableNumber: 'Mesa {{number}}',
  timeAgo: 'ha {{time}}',
  empty: {
    pending: 'Nenhum chamado pendente',
    resolved: 'Nenhum chamado resolvido hoje',
  },
  avgResponseTime: 'Tempo medio de resposta',
  pendingCount: '{{count}} pendentes',
  acknowledgedTab: 'Reconhecidos',
  resolvedTab: 'Resolvidos (Hoje)',
  pendingTab: 'Pendentes',
  errorLoading: 'Erro ao carregar chamados',
  errorUpdating: 'Erro ao atualizar chamado',
}

callWaiter: {
  title: 'Chamar Garcom',
  selectType: 'Selecione o tipo de chamado',
  addMessage: 'Mensagem adicional (opcional)',
  send: 'Enviar Chamado',
  onMyWay: 'Garcom a caminho!',
  cancelCall: 'Cancelar Chamada',
  callSent: 'Chamado enviado!',
  staffNotified: 'Um membro da equipe vira atende-lo em breve.',
  waitingService: 'Aguardando atendimento...',
  selectReason: 'Selecione o motivo da chamada.',
  cancelConfirmTitle: 'Cancelar chamada',
  cancelConfirmMessage: 'Tem certeza que deseja cancelar a chamada do garcom?',
  paymentNote: 'O pagamento e realizado pelo aplicativo. Nao e necessario chamar o garcom para solicitar a conta.',
  reasonTitle: 'Motivo da chamada',
}
```

### EN

```typescript
calls: {
  title: 'Service Calls',
  type: {
    waiter: 'Waiter',
    manager: 'Manager',
    help: 'Help',
    emergency: 'Emergency',
  },
  status: {
    pending: 'Pending',
    acknowledged: 'Acknowledged',
    resolved: 'Resolved',
  },
  call: 'Call',
  acknowledge: 'Acknowledge',
  resolve: 'Resolve',
  cancel: 'Cancel Call',
  message: 'Message',
  tableNumber: 'Table {{number}}',
  timeAgo: '{{time}} ago',
  empty: {
    pending: 'No pending calls',
    resolved: 'No resolved calls today',
  },
  avgResponseTime: 'Average response time',
  pendingCount: '{{count}} pending',
  acknowledgedTab: 'Acknowledged',
  resolvedTab: 'Resolved (Today)',
  pendingTab: 'Pending',
  errorLoading: 'Error loading calls',
  errorUpdating: 'Error updating call',
}

callWaiter: {
  title: 'Call Waiter',
  selectType: 'Select call type',
  addMessage: 'Additional message (optional)',
  send: 'Send Call',
  onMyWay: 'Waiter on the way!',
  cancelCall: 'Cancel Call',
  callSent: 'Call sent!',
  staffNotified: 'A staff member will assist you shortly.',
  waitingService: 'Waiting for service...',
  selectReason: 'Please select the reason for the call.',
  cancelConfirmTitle: 'Cancel call',
  cancelConfirmMessage: 'Are you sure you want to cancel the waiter call?',
  paymentNote: 'Payment is handled through the app. No need to call the waiter to request the bill.',
  reasonTitle: 'Call reason',
}
```

### ES

```typescript
calls: {
  title: 'Llamadas de Servicio',
  type: {
    waiter: 'Mesero',
    manager: 'Gerente',
    help: 'Ayuda',
    emergency: 'Emergencia',
  },
  status: {
    pending: 'Pendiente',
    acknowledged: 'Reconocido',
    resolved: 'Resuelto',
  },
  call: 'Llamar',
  acknowledge: 'Reconocer',
  resolve: 'Resolver',
  cancel: 'Cancelar Llamada',
  message: 'Mensaje',
  tableNumber: 'Mesa {{number}}',
  timeAgo: 'hace {{time}}',
  empty: {
    pending: 'Sin llamadas pendientes',
    resolved: 'Sin llamadas resueltas hoy',
  },
  avgResponseTime: 'Tiempo promedio de respuesta',
  pendingCount: '{{count}} pendientes',
  acknowledgedTab: 'Reconocidos',
  resolvedTab: 'Resueltos (Hoy)',
  pendingTab: 'Pendientes',
  errorLoading: 'Error al cargar llamadas',
  errorUpdating: 'Error al actualizar llamada',
}

callWaiter: {
  title: 'Llamar Mesero',
  selectType: 'Seleccione el tipo de llamada',
  addMessage: 'Mensaje adicional (opcional)',
  send: 'Enviar Llamada',
  onMyWay: 'Mesero en camino!',
  cancelCall: 'Cancelar Llamada',
  callSent: 'Llamada enviada!',
  staffNotified: 'Un miembro del equipo lo atendera pronto.',
  waitingService: 'Esperando servicio...',
  selectReason: 'Seleccione el motivo de la llamada.',
  cancelConfirmTitle: 'Cancelar llamada',
  cancelConfirmMessage: 'Esta seguro que desea cancelar la llamada del mesero?',
  paymentNote: 'El pago se realiza por la aplicacion. No es necesario llamar al mesero para pedir la cuenta.',
  reasonTitle: 'Motivo de la llamada',
}
```

---

## 7. Definition of Done (DoD)

### Backend
- [ ] Entidade `ServiceCall` criada com TypeORM
- [ ] DTOs com validacao (class-validator)
- [ ] Controller com endpoints REST documentados (Swagger)
- [ ] Service com logica de negocio e emissao WebSocket
- [ ] Gateway WebSocket no namespace `/calls`
- [ ] Migration para criacao da tabela `service_calls`
- [ ] `CallsModule` registrado no `AppModule`
- [ ] Testes unitarios do service (>= 80% cobertura)
- [ ] Guards de autenticacao (JWT) e autorizacao (Roles)

### Mobile Client
- [ ] `CallWaiterScreen` atualizado com chamada real `POST /calls`
- [ ] Feedback visual apos envio (sucesso/erro)
- [ ] Estado "Garcom a caminho" via WebSocket
- [ ] Botao "Cancelar chamado" funcional
- [ ] i18n completo (sem strings hardcoded)

### Mobile Restaurant
- [ ] `CallsManagementScreen` criado
- [ ] Header com estatisticas
- [ ] Tabs de navegacao (Pendentes/Reconhecidos/Resolvidos)
- [ ] Cards de chamado com informacoes completas
- [ ] Botoes de acao (Reconhecer/Resolver)
- [ ] WebSocket real-time
- [ ] Estados vazios
- [ ] Skeleton loading
- [ ] Haptic feedback
- [ ] i18n completo (PT-BR/EN/ES)
- [ ] Adicionado a navegacao drawer

### i18n
- [ ] Chaves adicionadas em `pt-BR.ts`
- [ ] Chaves adicionadas em `en-US.ts`
- [ ] Chaves adicionadas em `es-ES.ts`
- [ ] Nenhuma string hardcoded em nenhuma tela

### Qualidade
- [ ] TypeScript strict (sem `any` desnecessario)
- [ ] Sem erros de lint
- [ ] Padroes NestJS seguidos (guards, decorators, TypeORM)
- [ ] Padroes React Native seguidos (useColors, useI18n, useMemo para styles)
