# EPICO 4 — Manager Profile: Ops Panel + Approvals + Daily Report

**Prioridade:** ALTA | **Sprint:** 3
**Roles autorizados:** MANAGER, OWNER
**App:** Restaurant App (React Native 0.74 + Expo 51)
**Backend:** NestJS 10.4 + PostgreSQL + TypeORM + Socket.IO

---

## Visao Geral

Este epico cobre o conjunto de funcionalidades exclusivas do perfil MANAGER no Restaurant App. O gerente possui uma visao operacional diferente do OWNER: enquanto o dono tem acesso a dashboards financeiros e configuracoes estrategicas, o gerente atua na camada tatica — monitorando pedidos em tempo real, autorizando operacoes sensiveis (cancelamentos, cortesias, estornos, descontos) e consultando o fechamento diario do estabelecimento.

A tela central e o Manager Ops Panel (Feature 4.1), que agrega alertas criticos, KPIs operacionais, status da equipe em servico, aprovacoes pendentes em preview e um feed ao vivo de pedidos. As Features 4.2 e 4.3 correspondem, respectivamente, a tela completa de aprovacoes e ao relatorio de fechamento do dia.

**Diferencial em relacao ao OWNER Dashboard:** o OWNER tem acesso a modulos financeiros avancados (`GET /financial/profit-loss`, exportacoes, previsoes). O MANAGER ve KPIs operacionais em tempo real (`GET /analytics/realtime`) mas nao tem acesso a modulos de configuracao estrutural do restaurante.

---

## Pre-requisitos

- [ ] Epico 1 concluido: autenticacao JWT, guards `JwtAuthGuard` + `RolesGuard`, enum `UserRole.MANAGER`
- [ ] Epico 2 concluido: modulo `orders` com entidade `Order` e enum `OrderStatus`
- [ ] Epico 3 concluido: modulo `tables` com entidade `RestaurantTable`
- [ ] Modulo `analytics` existente com endpoint `GET /analytics/realtime` (ver `analytics.controller.ts`)
- [ ] Modulo `hr` existente com dados de equipe (ver `hr.controller.ts`)
- [ ] Navegacao do Restaurant App configurada com tab/stack para role MANAGER
- [ ] Contexto i18n configurado (PT-BR, EN, ES) via hook `useI18n`
- [ ] Design tokens definidos: `--primary`, `--success`, `--warning`, `--destructive`

---

## Novo Modulo Backend: approvals

O modulo `approvals` nao existe ainda no backend. Precisa ser criado do zero seguindo os padroes do projeto (ver `backend/src/modules/orders/` como referencia de estrutura).

### Localizacao dos arquivos

```
backend/src/modules/approvals/
  approvals.module.ts
  approvals.controller.ts
  approvals.service.ts
  approvals.gateway.ts           # WebSocket gateway
  entities/
    approval.entity.ts
  dto/
    create-approval.dto.ts
    resolve-approval.dto.ts
  migrations/
    YYYYMMDDHHMMSS-CreateApprovalsTable.ts
```

### Entity Approval

```typescript
// backend/src/modules/approvals/entities/approval.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Profile } from '../../users/entities/profile.entity';

export enum ApprovalType {
  CANCEL    = 'cancel',    // Cancelamento de pedido — destructive
  COURTESY  = 'courtesy',  // Cortesia (item gratuito) — info
  REFUND    = 'refund',    // Estorno de pagamento — warning
  DISCOUNT  = 'discount',  // Desconto manual — secondary
}

export enum ApprovalStatus {
  PENDING  = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('approvals')
@Index(['restaurant_id'])
@Index(['status'])
@Index(['requester_id'])
@Index(['created_at'])
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'enum', enum: ApprovalType })
  type: ApprovalType;

  @Column()
  item_name: string;            // Nome do item/pedido envolvido

  @Column('uuid', { nullable: true })
  table_id: string;             // Mesa onde ocorreu

  @Column('uuid')
  requester_id: string;         // Funcionario que solicitou (WAITER, CHEF, BARMAN)

  @Column('uuid', { nullable: true })
  resolver_id: string;          // Gerente/Dono que resolveu

  @Column({ type: 'text' })
  reason: string;               // Justificativa do solicitante

  @Column({ type: 'text', nullable: true })
  resolution_note: string;      // Nota do gerente ao resolver

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;               // Valor financeiro impactado

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status: ApprovalStatus;

  @Column('uuid', { nullable: true })
  order_id: string;             // Pedido relacionado (opcional)

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'requester_id' })
  requester: Profile;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'resolver_id' })
  resolver: Profile;
}
```

### DTOs

```typescript
// dto/create-approval.dto.ts
export class CreateApprovalDto {
  restaurant_id: string;   // UUID
  type: ApprovalType;
  item_name: string;
  table_id?: string;
  reason: string;
  amount: number;
  order_id?: string;
}

// dto/resolve-approval.dto.ts
export class ResolveApprovalDto {
  decision: 'approved' | 'rejected';
  note?: string;           // Nota opcional do gerente
}
```

### Controller Endpoints

```typescript
// backend/src/modules/approvals/approvals.controller.ts

@ApiTags('approvals')
@Controller('approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApprovalsController {

  // GET /approvals?restaurantId=&status=
  // Roles: MANAGER, OWNER
  // Retorna lista de aprovacoes, filtrando por status se informado
  // Query params:
  //   restaurantId: string (obrigatorio)
  //   status: 'pending' | 'approved' | 'rejected' (opcional)
  //   date: string ISO (opcional, filtra por data para relatorio diario)
  @Get()
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  findAll(
    @Query('restaurantId') restaurantId: string,
    @Query('status') status?: ApprovalStatus,
    @Query('date') date?: string,
  ) { ... }

  // POST /approvals
  // Roles: WAITER, CHEF, BARMAN, MAITRE (solicitantes)
  // Cria uma nova solicitacao de aprovacao e emite WebSocket approval:new
  @Post()
  @Roles(UserRole.WAITER, UserRole.CHEF, UserRole.BARMAN, UserRole.MAITRE)
  create(@Body() dto: CreateApprovalDto, @CurrentUser() user: any) { ... }

  // PATCH /approvals/:id/resolve
  // Roles: MANAGER, OWNER
  // Aprova ou recusa uma solicitacao pendente
  // Body: { decision: 'approved' | 'rejected', note?: string }
  // Emite WebSocket approval:resolved apos persistencia
  @Patch(':id/resolve')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveApprovalDto,
    @CurrentUser() user: any,
  ) { ... }

  // GET /approvals/stats?restaurantId=&date=
  // Roles: MANAGER, OWNER
  // Retorna: { pending, approvedToday, rejectedToday, totalImpact }
  @Get('stats')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  getStats(
    @Query('restaurantId') restaurantId: string,
    @Query('date') date?: string,
  ) { ... }
}
```

### WebSocket Events (approvals.gateway.ts)

O gateway deve estender o gateway de notificacoes existente ou ser criado de forma independente usando `@WebSocketGateway`.

| Evento              | Direcao      | Payload                                              | Destinatarios                      |
|---------------------|--------------|------------------------------------------------------|------------------------------------|
| `approval:new`      | server → client | `{ id, type, itemName, table, requesterName, amount, reason, createdAt }` | Roles MANAGER e OWNER conectados ao restaurante |
| `approval:resolved` | server → client | `{ id, decision, note, resolvedBy, resolvedAt }` | Solicitante original (`requester_id`) |
| `approval:subscribe` | client → server | `{ restaurantId, role }`                           | — (join room)                      |

```typescript
// Estrutura do gateway
@WebSocketGateway({ namespace: '/approvals', cors: true })
export class ApprovalsGateway implements OnGatewayConnection {

  @WebSocketServer()
  server: Server;

  // Chamado pelo ApprovalsService.create()
  emitNewApproval(restaurantId: string, approval: Approval) {
    this.server
      .to(`restaurant:${restaurantId}:managers`)
      .emit('approval:new', approval);
  }

  // Chamado pelo ApprovalsService.resolve()
  emitResolved(requesterId: string, result: { id, decision, note, resolvedBy }) {
    this.server
      .to(`user:${requesterId}`)
      .emit('approval:resolved', result);
  }
}
```

### Migration

```typescript
// Criar via: npx typeorm migration:create src/modules/approvals/migrations/CreateApprovalsTable

export class CreateApprovalsTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE approval_type_enum AS ENUM ('cancel', 'courtesy', 'refund', 'discount');
      CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected');

      CREATE TABLE approvals (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id  UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        type           approval_type_enum NOT NULL,
        item_name      VARCHAR(255) NOT NULL,
        table_id       UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
        requester_id   UUID NOT NULL REFERENCES profiles(id),
        resolver_id    UUID REFERENCES profiles(id),
        reason         TEXT NOT NULL,
        resolution_note TEXT,
        amount         DECIMAL(10,2) NOT NULL DEFAULT 0,
        status         approval_status_enum NOT NULL DEFAULT 'pending',
        order_id       UUID REFERENCES orders(id) ON DELETE SET NULL,
        created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        resolved_at    TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX idx_approvals_restaurant ON approvals(restaurant_id);
      CREATE INDEX idx_approvals_status ON approvals(status);
      CREATE INDEX idx_approvals_requester ON approvals(requester_id);
      CREATE INDEX idx_approvals_created ON approvals(created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS approvals;
      DROP TYPE IF EXISTS approval_type_enum;
      DROP TYPE IF EXISTS approval_status_enum;
    `);
  }
}
```

---

## FEATURE 4.1 — Manager Ops Panel

**Descricao:** Tela principal do gerente no restaurant app. Diferente do Dashboard do Owner (que exibe graficos financeiros e metricas de longo prazo), o Manager Ops Panel e focado em operacoes do dia presente: pedidos em andamento, equipe de plantao, aprovacoes pendentes e alertas criticos.

**Referencia de implementacao no demo:** `src/components/demo/restaurant/RoleScreens.tsx` — componente `ManagerOpsScreen` (linhas 20-154).

---

### US-4.1.1 — Ver painel operacional resumido

**Como** gerente, **quero** ver um painel consolidado com alertas, KPIs do dia, equipe ativa e aprovacoes pendentes, **para** ter situational awareness completo sem precisar navegar por varias telas.

#### Criterios de aceite

- [ ] Exibir alert banner vermelho pulsante quando houver pedidos com atraso > 15 minutos
- [ ] Exibir alert banner laranja clicavel quando houver aprovacoes pendentes; ao clicar, navegar para Approvals Screen
- [ ] Grid 2x2 com KPIs: Pedidos Ativos, Receita Hoje, Equipe Ativa, Ocupacao
- [ ] Cada KPI card deve mostrar valor principal + sub-informacao (ex: "3 prontos", "+12% vs ontem")
- [ ] Lista scrollable "Equipe em Servico" mostrando avatar, nome, role, turno e indicador ativo/folga
- [ ] Preview de ate 3 aprovacoes pendentes com badge de tipo e valor
- [ ] Botao "Ver todas" nas aprovacoes pendentes, navegando para Approvals Screen
- [ ] Feed de pedidos ativos (max 6) com elapsed time, destacando pedidos atrasados (> 15min) em vermelho
- [ ] Skeleton loading enquanto dados carregam
- [ ] Pull-to-refresh para atualizar metricas

#### Specs tecnicos

**Arquivo a criar:**
```
mobile/apps/restaurant/src/screens/manager/ManagerOpsScreen.tsx
```

**APIs consumidas:**
- `GET /analytics/realtime?restaurant_id={id}` — KPIs em tempo real (modulo existente)
- `GET /orders?restaurantId={id}&status=active` — pedidos ativos
- `GET /hr/staff?restaurantId={id}&status=on_duty` — equipe em servico
- `GET /approvals?restaurantId={id}&status=pending` — aprovacoes pendentes (NOVO)

**WebSocket subscription:**
- Conectar ao namespace `/approvals` ao montar o componente
- Ouvir evento `approval:new` para atualizar o counter de aprovacoes pendentes em tempo real
- Ouvir evento `order:updated` (modulo existente) para atualizar o feed de pedidos

**Estrutura do componente:**
```tsx
// mobile/apps/restaurant/src/screens/manager/ManagerOpsScreen.tsx

export default function ManagerOpsScreen({ navigation }) {
  const { t } = useI18n();
  const colors = useColors();
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
  const [staffOnDuty, setStaffOnDuty] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // lateOrders: orders com elapsed > 15min
  const lateOrders = activeOrders.filter(o =>
    getElapsedMinutes(o.created_at) > 15
  );

  // ... fetch, websocket setup, render
}
```

**Regras de cor para status de pedidos (usar design tokens):**
```
pending    → bg: backgroundTertiary, text: foregroundSecondary
preparing  → bg: warning/10, text: warning
ready      → bg: success/10, text: success
late       → bg: destructive/5, border: destructive/20
```

**Navegacao:**
```
// Arquivo de navegacao a modificar:
mobile/apps/restaurant/src/navigation/ManagerNavigator.tsx  (criar se nao existir)

// Stack screens:
ManagerOps        → ManagerOpsScreen
ManagerApprovals  → ApprovalsScreen
ManagerReport     → DailyReportScreen
```

#### Chaves i18n

```json
// PT-BR (locale/pt-BR.json)
{
  "manager": {
    "ops": {
      "title": "Painel Operacional",
      "alertLateOrders": "{{count}} pedido(s) com atraso (>15min)",
      "alertPendingApprovals": "{{count}} aprovacao(oes) pendente(s)",
      "kpiActiveOrders": "Pedidos Ativos",
      "kpiActiveOrdersSub": "{{count}} prontos",
      "kpiRevenueToday": "Receita Hoje",
      "kpiRevenueSub": "+{{pct}}% vs ontem",
      "kpiActiveStaff": "Equipe Ativa",
      "kpiActiveStaffSub": "{{count}} em folga",
      "kpiOccupancy": "Ocupacao",
      "kpiOccupancySub": "{{count}} mesas livres",
      "staffOnDuty": "Equipe em Servico",
      "staffActive": "Ativo",
      "staffOff": "Folga",
      "pendingApprovals": "Aprovacoes Pendentes",
      "viewAll": "Ver todas",
      "liveOrders": "Feed de Pedidos em Tempo Real",
      "lateLabel": "{{min}}min",
      "emptyOrders": "Nenhum pedido ativo no momento"
    }
  }
}

// EN (locale/en.json)
{
  "manager": {
    "ops": {
      "title": "Operations Panel",
      "alertLateOrders": "{{count}} late order(s) (>15min)",
      "alertPendingApprovals": "{{count}} pending approval(s)",
      "kpiActiveOrders": "Active Orders",
      "kpiActiveOrdersSub": "{{count}} ready",
      "kpiRevenueToday": "Today's Revenue",
      "kpiRevenueSub": "+{{pct}}% vs yesterday",
      "kpiActiveStaff": "Active Staff",
      "kpiActiveStaffSub": "{{count}} off duty",
      "kpiOccupancy": "Occupancy",
      "kpiOccupancySub": "{{count}} tables free",
      "staffOnDuty": "Staff on Duty",
      "staffActive": "Active",
      "staffOff": "Off",
      "pendingApprovals": "Pending Approvals",
      "viewAll": "View all",
      "liveOrders": "Live Orders Feed",
      "lateLabel": "{{min}}min",
      "emptyOrders": "No active orders at the moment"
    }
  }
}

// ES (locale/es.json)
{
  "manager": {
    "ops": {
      "title": "Panel Operacional",
      "alertLateOrders": "{{count}} pedido(s) con retraso (>15min)",
      "alertPendingApprovals": "{{count}} aprobacion(es) pendiente(s)",
      "kpiActiveOrders": "Pedidos Activos",
      "kpiActiveOrdersSub": "{{count}} listos",
      "kpiRevenueToday": "Ingresos Hoy",
      "kpiRevenueSub": "+{{pct}}% vs ayer",
      "kpiActiveStaff": "Equipo Activo",
      "kpiActiveStaffSub": "{{count}} de descanso",
      "kpiOccupancy": "Ocupacion",
      "kpiOccupancySub": "{{count}} mesas libres",
      "staffOnDuty": "Equipo en Servicio",
      "staffActive": "Activo",
      "staffOff": "Descanso",
      "pendingApprovals": "Aprobaciones Pendientes",
      "viewAll": "Ver todas",
      "liveOrders": "Feed de Pedidos en Vivo",
      "lateLabel": "{{min}}min",
      "emptyOrders": "No hay pedidos activos en este momento"
    }
  }
}
```

#### Cenarios de teste

| ID     | Cenario                                              | Resultado esperado                                              |
|--------|------------------------------------------------------|-----------------------------------------------------------------|
| T4.1.1 | Abrir tela sem dados                                 | Skeleton loading visivel; apos fetch, empty state em pedidos   |
| T4.1.2 | Pedido criado ha 20 minutos esta ativo               | Alert banner vermelho pulsante com "1 pedido com atraso"       |
| T4.1.3 | Existem 2 aprovacoes pendentes                       | Banner laranja clickavel; preview mostra ate 3 cards           |
| T4.1.4 | Clicar em "Ver todas" nas aprovacoes                 | Navegar para ApprovalsScreen                                   |
| T4.1.5 | Pull-to-refresh executado                            | Indicador de refreshing aparece; dados atualizam               |
| T4.1.6 | WebSocket emite `approval:new`                       | Counter de aprovacoes pendentes incrementa sem reload          |
| T4.1.7 | Equipe: 4 de 6 membros online                        | KPI "Equipe Ativa" exibe "4/6"; sub exibe "2 em folga"         |
| T4.1.8 | Sem pedidos atrasados e sem aprovacoes               | Nenhum alert banner e exibido                                  |

---

## FEATURE 4.2 — Approvals Screen

**Descricao:** Tela dedicada para o gerente revisar e processar solicitacoes de operacoes sensiveis enviadas por garcons, chefs e barmans. Cada aprovacao envolve um impacto financeiro e exige decisao consciente do gerente.

**Referencia de implementacao no demo:** `src/components/demo/restaurant/RoleScreens.tsx` — componente `ApprovalsScreen` (linhas 156-232).

**Tipos de aprovacao e suas semanticas:**

| Tipo        | Design Token  | Icone         | Significado                                  |
|-------------|---------------|---------------|----------------------------------------------|
| `cancel`    | destructive   | XCircle       | Cancelar item ou pedido inteiro               |
| `courtesy`  | info          | Star          | Oferecer item sem cobranca (cortesia)         |
| `refund`    | warning       | ArrowDown     | Estornar valor ja pago                        |
| `discount`  | secondary     | DollarSign    | Aplicar desconto manual no total              |

---

### US-4.2.1 — Ver aprovacoes pendentes

**Como** gerente, **quero** ver a lista completa de aprovacoes pendentes com todos os detalhes necessarios, **para** tomar uma decisao informada sem precisar buscar informacao adicional.

#### Criterios de aceite

- [ ] Exibir stats no topo: Pendentes, Aprovadas Hoje, Recusadas Hoje, Total Impacto
- [ ] Lista de cards por aprovacao pendente com: badge de tipo, timestamp (ex: "ha 3 min"), nome do item, mesa, nome do solicitante, razao/justificativa e valor financeiro
- [ ] Cards ainda nao processados tem borda padrao; cards processados ficam opacos (opacity 0.5) com indicador "Processado"
- [ ] Skeleton loading na carga inicial
- [ ] Estado vazio quando nao ha pendencias ("Nenhuma aprovacao pendente hoje")

#### Specs tecnicos

**Arquivo a criar:**
```
mobile/apps/restaurant/src/screens/manager/ApprovalsScreen.tsx
```

**APIs consumidas:**
- `GET /approvals?restaurantId={id}&status=pending` — lista pendentes
- `GET /approvals/stats?restaurantId={id}&date={hoje}` — stats do header

**Tipo `Approval` (frontend):**
```typescript
// mobile/apps/restaurant/src/types/approval.ts
export type ApprovalType = 'cancel' | 'courtesy' | 'refund' | 'discount';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  type: ApprovalType;
  itemName: string;
  tableId: string | null;
  tableNumber: number | null;
  requesterId: string;
  requesterName: string;
  reason: string;
  amount: number;
  status: ApprovalStatus;
  createdAt: string;  // ISO 8601
  resolvedAt: string | null;
}

export interface ApprovalStats {
  pending: number;
  approvedToday: number;
  rejectedToday: number;
  totalImpact: number;
}
```

#### Chaves i18n

```json
// PT-BR
{
  "approvals": {
    "title": "Aprovacoes",
    "statsPending": "Pendentes",
    "statsApproved": "Aprovadas Hoje",
    "statsRejected": "Recusadas Hoje",
    "statsTotalImpact": "Total Impacto",
    "typeCancel": "Cancelamento",
    "typeCourtesy": "Cortesia",
    "typeRefund": "Estorno",
    "typeDiscount": "Desconto",
    "tableLabel": "Mesa {{number}}",
    "requestedBy": "Solicitado por",
    "processedLabel": "Processado",
    "emptyTitle": "Nenhuma aprovacao pendente",
    "emptySubtitle": "Todas as solicitacoes do dia foram processadas"
  }
}
```

```json
// EN
{
  "approvals": {
    "title": "Approvals",
    "statsPending": "Pending",
    "statsApproved": "Approved Today",
    "statsRejected": "Rejected Today",
    "statsTotalImpact": "Total Impact",
    "typeCancel": "Cancellation",
    "typeCourtesy": "Courtesy",
    "typeRefund": "Refund",
    "typeDiscount": "Discount",
    "tableLabel": "Table {{number}}",
    "requestedBy": "Requested by",
    "processedLabel": "Processed",
    "emptyTitle": "No pending approvals",
    "emptySubtitle": "All requests for today have been processed"
  }
}
```

```json
// ES
{
  "approvals": {
    "title": "Aprobaciones",
    "statsPending": "Pendientes",
    "statsApproved": "Aprobadas Hoy",
    "statsRejected": "Rechazadas Hoy",
    "statsTotalImpact": "Impacto Total",
    "typeCancel": "Cancelacion",
    "typeCourtesy": "Cortesia",
    "typeRefund": "Devolucion",
    "typeDiscount": "Descuento",
    "tableLabel": "Mesa {{number}}",
    "requestedBy": "Solicitado por",
    "processedLabel": "Procesado",
    "emptyTitle": "No hay aprobaciones pendientes",
    "emptySubtitle": "Todas las solicitudes del dia han sido procesadas"
  }
}
```

#### Cenarios de teste

| ID     | Cenario                                        | Resultado esperado                                                     |
|--------|------------------------------------------------|------------------------------------------------------------------------|
| T4.2.1 | Tela abre com 4 aprovacoes pendentes           | 4 cards visiveis; stat "Pendentes" = 4                                |
| T4.2.2 | Aprovacao do tipo `cancel` renderizada         | Badge vermelho "Cancelamento"; icone XCircle; valor em destructive     |
| T4.2.3 | Aprovacao do tipo `courtesy` renderizada       | Badge info "Cortesia"; icone Star                                      |
| T4.2.4 | Sem aprovacoes pendentes                       | Empty state com ilustracao e texto i18n                                |
| T4.2.5 | WebSocket recebe `approval:new` enquanto na tela | Novo card aparece no topo da lista sem reload manual                 |

---

### US-4.2.2 — Aprovar ou recusar operacao sensivel

**Como** gerente, **quero** aprovar ou recusar uma solicitacao pendente, **para** autorizar (ou bloquear) a execucao de uma operacao sensivel e notificar o funcionario solicitante.

#### Criterios de aceite

- [ ] Botao "Aprovar" (verde, icone CheckCircle2) e botao "Recusar" (vermelho outline, icone XCircle) visiveis apenas em cards com status `pending`
- [ ] Ao tocar "Recusar": exibir dialog de confirmacao com campo opcional de nota ("Motivo da recusa")
- [ ] Ao confirmar qualquer decisao: card transiciona para estado processado (opacity 0.5 + indicador "Processado") de forma otimista (antes do retorno da API)
- [ ] Toast de sucesso apos retorno 200 da API: "Aprovacao processada com sucesso"
- [ ] Toast de erro se API falhar: "Erro ao processar aprovacao. Tente novamente."
- [ ] Em caso de erro, reverter o estado otimista e reexibir os botoes
- [ ] Counter "Pendentes" no header de stats atualiza imediatamente apos acao

#### Specs tecnicos

**API chamada:**
```
PATCH /approvals/:id/resolve
Authorization: Bearer {jwt}
Content-Type: application/json

Body:
{
  "decision": "approved" | "rejected",
  "note": "Motivo opcional"       // opcional, relevante para rejeicoes
}

Response 200:
{
  "id": "uuid",
  "status": "approved" | "rejected",
  "resolvedBy": "Nome do Gerente",
  "resolvedAt": "2026-03-23T14:30:00Z"
}
```

**Fluxo de estado otimista:**
```typescript
const handleResolve = async (approvalId: string, decision: 'approved' | 'rejected', note?: string) => {
  // 1. Atualizar estado local imediatamente (otimista)
  setApprovals(prev => prev.map(a =>
    a.id === approvalId ? { ...a, status: decision } : a
  ));

  try {
    // 2. Chamar API
    await ApiService.resolveApproval(approvalId, { decision, note });
    // 3. Toast de sucesso
    showToast({ type: 'success', message: t('approvals.resolveSuccess') });
    // 4. Atualizar stats
    refreshStats();
  } catch (error) {
    // 5. Reverter estado otimista
    setApprovals(prev => prev.map(a =>
      a.id === approvalId ? { ...a, status: 'pending' } : a
    ));
    showToast({ type: 'error', message: t('approvals.resolveError') });
  }
};
```

**Dialog de confirmacao para recusa (destrutivo):**
```tsx
// Usar componente Alert/ConfirmDialog do projeto (padrao de confirmacoes destrutivas)
<ConfirmDialog
  visible={showRejectDialog}
  title={t('approvals.rejectTitle')}
  message={t('approvals.rejectMessage')}
  confirmLabel={t('approvals.rejectConfirm')}
  confirmVariant="destructive"
  onConfirm={(note) => handleResolve(selectedId, 'rejected', note)}
  onCancel={() => setShowRejectDialog(false)}
  showNoteInput={true}
  notePlaceholder={t('approvals.rejectNotePlaceholder')}
/>
```

#### Chaves i18n adicionais

```json
// PT-BR
{
  "approvals": {
    "approveButton": "Aprovar",
    "rejectButton": "Recusar",
    "rejectTitle": "Recusar solicitacao",
    "rejectMessage": "Tem certeza que deseja recusar esta solicitacao? O funcionario sera notificado.",
    "rejectConfirm": "Sim, recusar",
    "rejectNotePlaceholder": "Motivo da recusa (opcional)",
    "resolveSuccess": "Aprovacao processada com sucesso",
    "resolveError": "Erro ao processar aprovacao. Tente novamente."
  }
}
```

```json
// EN
{
  "approvals": {
    "approveButton": "Approve",
    "rejectButton": "Reject",
    "rejectTitle": "Reject request",
    "rejectMessage": "Are you sure you want to reject this request? The staff member will be notified.",
    "rejectConfirm": "Yes, reject",
    "rejectNotePlaceholder": "Reason for rejection (optional)",
    "resolveSuccess": "Approval processed successfully",
    "resolveError": "Error processing approval. Please try again."
  }
}
```

```json
// ES
{
  "approvals": {
    "approveButton": "Aprobar",
    "rejectButton": "Rechazar",
    "rejectTitle": "Rechazar solicitud",
    "rejectMessage": "¿Estas seguro de que deseas rechazar esta solicitud? El empleado sera notificado.",
    "rejectConfirm": "Si, rechazar",
    "rejectNotePlaceholder": "Motivo del rechazo (opcional)",
    "resolveSuccess": "Aprobacion procesada con exito",
    "resolveError": "Error al procesar la aprobacion. Intentalo de nuevo."
  }
}
```

#### Cenarios de teste

| ID     | Cenario                                              | Resultado esperado                                                    |
|--------|------------------------------------------------------|-----------------------------------------------------------------------|
| T4.2.6 | Toque em "Aprovar" em card pendente                  | Card imediatamente opacos + "Processado"; toast de sucesso apos API  |
| T4.2.7 | Toque em "Recusar" em card pendente                  | Dialog de confirmacao exibido com campo de nota                       |
| T4.2.8 | Confirmar recusa no dialog                           | Card processado; toast sucesso; WS emite `approval:resolved`          |
| T4.2.9 | API retorna erro 500 ao aprovar                      | Estado otimista revertido; botoes reaparecem; toast de erro           |
| T4.2.10| Recusar com nota preenchida                          | Nota enviada no body da requisicao PATCH                              |
| T4.2.11| Cancelar dialog de recusa                            | Dialog fecha; card permanece pendente                                 |

---

## FEATURE 4.3 — Daily Report Screen

**Descricao:** Tela de fechamento do dia. Disponivel para MANAGER e OWNER. Apresenta um resumo executivo das metricas do dia: receita total, numero de pedidos, ticket medio e satisfacao do cliente, alem de itens mais vendidos, desempenho individual da equipe e distribuicao da receita por hora.

**Referencia de implementacao no demo:** `src/components/demo/restaurant/RoleScreens.tsx` — componente `DailyReportScreen` (linhas 1100-1188).

---

### US-4.3.1 — Ver fechamento do dia

**Como** gerente, **quero** consultar o relatorio de fechamento do dia com KPIs, itens mais vendidos e desempenho da equipe, **para** avaliar a performance do turno e identificar areas de melhoria.

#### Criterios de aceite

- [ ] Hero card com gradiente mostrando data atual e badge de variacao percentual vs semana anterior
- [ ] Grid 2x2 de KPIs: Receita Total, Pedidos, Ticket Medio, Satisfacao do Cliente
- [ ] Secao "Mais Vendidos" com top 5 itens (posicao, nome, quantidade vendida)
- [ ] Secao "Desempenho da Equipe" ordenada por valor de vendas decrescente (nome, role, vendas, gorjetas)
- [ ] Grafico de barras "Receita por Hora" (todas as horas de operacao do dia)
- [ ] Tooltip no grafico ao tocar em uma barra: exibir valor da hora formatado (ex: "R$ 1,2k")
- [ ] Skeleton loading na carga inicial
- [ ] Botao "Exportar" que dispara chamada para `GET /financial/export?format=pdf`
- [ ] Badge de comparacao usa `--success` para positivo e `--destructive` para negativo

#### Specs tecnicos

**Arquivo a criar:**
```
mobile/apps/restaurant/src/screens/manager/DailyReportScreen.tsx
```

**APIs consumidas:**
- `GET /analytics/dashboard?restaurant_id={id}` — KPIs do dia (modulo existente)
- `GET /financial/daily-summary?restaurant_id={id}&start_date={hoje}&end_date={hoje}` — receita por hora e top sellers (modulo existente)
- `GET /hr/staff?restaurantId={id}` — dados de equipe para performance
- `GET /financial/export?restaurant_id={id}&start_date={hoje}&end_date={hoje}&format=pdf&report_type=summary` — exportar relatorio

**Tipos frontend:**
```typescript
interface DailyReportData {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  customerSatisfaction: number;
  weekOverWeekChange: number;  // percentual, pode ser negativo
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  staffPerformance: Array<{
    name: string;
    role: string;
    avatarUrl: string;
    sales: number;
    tips: number;
  }>;
  hourlyRevenue: Array<{ hour: string; revenue: number }>;
}
```

**Grafico de barras (react-native-chart-kit):**
```tsx
// Usar BarChart do 'react-native-chart-kit' (ja utilizado em DashboardScreen.tsx)
import { BarChart } from 'react-native-chart-kit';

<BarChart
  data={{
    labels: reportData.hourlyRevenue.map(h => h.hour),
    datasets: [{ data: reportData.hourlyRevenue.map(h => h.revenue) }],
  }}
  width={screenWidth - 64}
  height={200}
  chartConfig={chartConfig}  // mesmo config do DashboardScreen
  style={{ borderRadius: 16 }}
/>
```

#### Chaves i18n

```json
// PT-BR
{
  "dailyReport": {
    "title": "Fechamento do Dia",
    "weekComparison": "+{{pct}}% vs semana passada",
    "weekComparisonNeg": "{{pct}}% vs semana passada",
    "kpiRevenue": "Receita Total",
    "kpiOrders": "Pedidos",
    "kpiAvgTicket": "Ticket Medio",
    "kpiSatisfaction": "Satisfacao",
    "topSellers": "Mais Vendidos",
    "staffPerformance": "Desempenho Equipe",
    "hourlyRevenue": "Receita por Hora",
    "exportButton": "Exportar PDF",
    "exportSuccess": "Relatorio exportado com sucesso",
    "exportError": "Erro ao exportar relatorio"
  }
}
```

```json
// EN
{
  "dailyReport": {
    "title": "Daily Report",
    "weekComparison": "+{{pct}}% vs last week",
    "weekComparisonNeg": "{{pct}}% vs last week",
    "kpiRevenue": "Total Revenue",
    "kpiOrders": "Orders",
    "kpiAvgTicket": "Avg Ticket",
    "kpiSatisfaction": "Satisfaction",
    "topSellers": "Top Sellers",
    "staffPerformance": "Staff Performance",
    "hourlyRevenue": "Hourly Revenue",
    "exportButton": "Export PDF",
    "exportSuccess": "Report exported successfully",
    "exportError": "Error exporting report"
  }
}
```

```json
// ES
{
  "dailyReport": {
    "title": "Cierre del Dia",
    "weekComparison": "+{{pct}}% vs semana pasada",
    "weekComparisonNeg": "{{pct}}% vs semana pasada",
    "kpiRevenue": "Ingresos Totales",
    "kpiOrders": "Pedidos",
    "kpiAvgTicket": "Ticket Promedio",
    "kpiSatisfaction": "Satisfaccion",
    "topSellers": "Mas Vendidos",
    "staffPerformance": "Desempeno del Equipo",
    "hourlyRevenue": "Ingresos por Hora",
    "exportButton": "Exportar PDF",
    "exportSuccess": "Informe exportado con exito",
    "exportError": "Error al exportar el informe"
  }
}
```

#### Cenarios de teste

| ID     | Cenario                                               | Resultado esperado                                                  |
|--------|-------------------------------------------------------|---------------------------------------------------------------------|
| T4.3.1 | Abrir tela em dia com dados completos                 | Hero card com data, KPIs e badge de comparacao visiveis            |
| T4.3.2 | Semana atual pior que semana passada (var. negativa)  | Badge usa cor `--destructive`; texto mostra sinal negativo         |
| T4.3.3 | Top sellers listados                                  | Posicao 1 destacada com cor primary; demais em muted               |
| T4.3.4 | Equipe ordenada por vendas                            | Membro com maior vendas aparece primeiro                           |
| T4.3.5 | Tocar em barra do grafico                             | Tooltip exibe valor formatado (ex: "R$ 1,2k")                      |
| T4.3.6 | Toque em "Exportar PDF"                               | Toast "Exportando..."; apos sucesso, toast de confirmacao          |
| T4.3.7 | Exportar com erro de rede                             | Toast de erro com mensagem i18n                                    |
| T4.3.8 | Carga inicial                                         | Skeleton loading visivel ate dados chegarem                        |

---

## Sequencia de Implementacao

A ordem abaixo respeita as dependencias entre backend e frontend:

1. **Backend — Migration:** criar tabela `approvals` no banco de dados
2. **Backend — Entity + DTOs:** implementar `Approval` entity, `CreateApprovalDto`, `ResolveApprovalDto`
3. **Backend — Service:** implementar `ApprovalsService` com metodos `findAll`, `create`, `resolve`, `getStats`
4. **Backend — Controller:** implementar `ApprovalsController` com endpoints GET, POST, PATCH
5. **Backend — Gateway:** implementar `ApprovalsGateway` com eventos `approval:new` e `approval:resolved`
6. **Backend — Module:** registrar tudo em `ApprovalsModule` e importar em `AppModule`
7. **Frontend — Types:** criar `mobile/apps/restaurant/src/types/approval.ts`
8. **Frontend — API Service:** adicionar metodos `getApprovals`, `createApproval`, `resolveApproval`, `getApprovalStats` em `ApiService`
9. **Frontend — US-4.2.1:** implementar `ApprovalsScreen` (listagem)
10. **Frontend — US-4.2.2:** adicionar logica de aprovacao/rejeicao na `ApprovalsScreen`
11. **Frontend — US-4.1.1:** implementar `ManagerOpsScreen` (consome approvals + outros endpoints)
12. **Frontend — US-4.3.1:** implementar `DailyReportScreen`
13. **Frontend — Navegacao:** configurar `ManagerNavigator` e registrar nas tabs por role

---

## Definition of Done

- [ ] Tabela `approvals` criada no banco via migration sem erros
- [ ] Todos os endpoints do modulo `approvals` retornam respostas corretas e documentados no Swagger
- [ ] WebSocket `approval:new` emitido ao criar aprovacao; `approval:resolved` emitido ao resolver
- [ ] `ManagerOpsScreen` exibe dados reais da API com skeleton loading e pull-to-refresh
- [ ] Alert banners aparecem/desaparecem corretamente conforme o estado dos dados
- [ ] `ApprovalsScreen` processa aprovacoes com estado otimista e reversao em caso de erro
- [ ] `DailyReportScreen` exibe grafico de receita por hora com tooltip funcional
- [ ] Todas as 3 telas testadas em PT-BR, EN e ES sem quebras de layout
- [ ] Nenhuma chamada de API sem autorizacao: guards `JwtAuthGuard` + `RolesGuard` ativos em todos os endpoints
- [ ] Testes E2E basicos cobrindo os cenarios criticos (T4.1.2, T4.2.6, T4.2.9, T4.3.1)
- [ ] Code review aprovado sem comentarios bloqueantes
