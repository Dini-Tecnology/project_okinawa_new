# ÉPICO 8 — Config Hub: Central de Configuração (Owner + Manager)

**Prioridade:** ALTA | **Sprint:** 4
**Complexidade:** Maxima — cérebro da plataforma

---

## Visão Geral

O Config Hub é o **núcleo central de controle** da plataforma NOOWE. Toda configuração definida aqui reverbera em cascata por todos os apps (Restaurant App, Client App, KDS, Waiter App) e pelo backend. Não existe outra parte do sistema com maior superfície de impacto.

O Owner (Dono) e o Manager (Gerente) acessam este hub pelo restaurant app. O Owner tem controle total sobre todas as 9 sub-telas de configuração. O Manager tem acesso restrito a subconjuntos operacionais de algumas delas. Nenhum outro role (Maitre, Chef, Barman, Cook, Waiter) tem visibilidade deste módulo.

Quando uma configuração é alterada (ex: desabilitar reservas, adicionar uma mesa, alterar a taxa de serviço), o backend emite um WebSocket event `config:updated` para todos os dispositivos conectados daquele restaurante, garantindo sincronia em tempo real.

**Arquivos existentes mapeados:**
- Demo UI: `/src/components/demo/restaurant/ConfigHubScreens.tsx` (1630 linhas, 9 telas completas com CRUD interativo)
- Demo Setup: `/src/components/demo/restaurant/SetupScreens.tsx` (wizard 4 passos)
- Tipos e RBAC: `/src/components/demo/restaurant/RestaurantDemoShared.tsx`
- Mobile (Native): `/mobile/apps/restaurant/src/screens/service-config/ServiceConfigScreen.tsx`
- Mobile Setup Hub: `/mobile/apps/restaurant/src/screens/setup-hub/SetupHubScreen.tsx`
- Backend Controller: `/backend/src/modules/restaurants/restaurants.controller.ts`
- Backend Entity: `/backend/src/modules/restaurants/entities/restaurant-service-config.entity.ts`

---

## Arquitetura do Config Hub

```
Config Hub (Owner/Manager)
       |
       |--[PATCH /config/:restaurantId]--> RestaurantConfig (PostgreSQL)
       |                                         |
       |                                         +--> WebSocket: config:updated
       |                                                  |
       |                            +--------------------+--------------------+
       |                            |                    |                    |
       |                     Restaurant App         Client App           KDS Screen
       |                     (NavigationGuards,     (UI inteiramente     (Estações, routing,
       |                      RBAC, TipsScreen)      definida pelo        timers, KDS screens)
       |                                             service_type)
       |
       +-- Sub-telas (9):
             config-profile      --> Identidade do restaurante
             config-service-types--> Muda toda a UI do Client App
             config-experience   --> Feature flags por tipo
             config-floor        --> TableListScreen, FloorPlanScreen
             config-menu         --> MenuScreen categorias e visibilidade
             config-team         --> RBAC, TipsScreen, turnos
             config-kitchen      --> KDSScreen routing, CookStation
             config-payments     --> PaymentScreen métodos e split
             config-features     --> Feature gates globais em toda a plataforma
```

---

## RBAC: Owner vs Manager

| Config Area             | Owner (Dono) | Manager (Gerente) | Observacao                                         |
|-------------------------|:------------:|:-----------------:|---------------------------------------------------|
| config-profile          | Acesso total | Sem acesso        | Dados legais e identidade da marca                |
| config-service-types    | Acesso total | Sem acesso        | Muda estrutura do Client App                      |
| config-experience       | Acesso total | Acesso parcial    | Manager: flags operacionais apenas                |
| config-floor            | Acesso total | Sem acesso        | Manager nao pode alterar layout fisico            |
| config-menu             | Acesso total | Acesso parcial    | Manager: visibilidade de itens, nao pricing       |
| config-team             | Acesso total | Read-only         | Manager ve mas nao edita roles/permissoes         |
| config-kitchen          | Acesso total | Acesso total      | Ambos podem editar estacoes e routing             |
| config-payments         | Acesso total | Sem acesso        | Dados financeiros e credenciais                   |
| config-features         | Acesso total | Sem acesso        | Feature flags globais e contratos                 |

**Implementacao no NavigationGuard:**
```typescript
// mobile/apps/restaurant/src/navigation/guards/ConfigAccessGuard.ts
const MANAGER_ALLOWED_CONFIG_SCREENS = [
  'config-experience',  // apenas flags operacionais
  'config-menu',        // apenas visibilidade, nao pricing
  'config-team',        // read-only
  'config-kitchen',     // acesso total
];

function canAccessConfig(role: StaffRole, screen: string): boolean {
  if (role === 'owner') return true;
  if (role === 'manager') return MANAGER_ALLOWED_CONFIG_SCREENS.includes(screen);
  return false;
}
```

---

## Modulo Backend: service-config

### Entity RestaurantConfig (schema completo)

O arquivo existente em `/backend/src/modules/restaurants/entities/restaurant-service-config.entity.ts` ja contem a entity `RestaurantServiceConfig` com campos por tipo de servico. A evolucao necessaria para o Epic 8 expande esse modelo para cobrir todos os aspectos do Config Hub.

**Entity expandida a criar:**

```typescript
// backend/src/modules/service-config/entities/restaurant-config.entity.ts
@Entity('restaurant_configs')
export class RestaurantConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  restaurantId: string;

  // --- Perfil ---
  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  coverUrl: string;

  @Column({ nullable: true })
  cnpj: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  businessHours: Array<{
    day: string;
    open: string;
    close: string;
    active: boolean;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  cuisineTypes: string[];

  @Column({ nullable: true })
  priceRange: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  // --- Tipos de Servico ---
  @Column({ nullable: true })
  primaryServiceType: string;

  @Column({ type: 'simple-array', nullable: true })
  enabledServiceTypes: string[];

  // --- Experiencia ---
  @Column({ type: 'jsonb', nullable: true })
  experienceFlags: {
    reservationsEnabled: boolean;
    virtualQueueEnabled: boolean;
    familyModeEnabled: boolean;
    qrOrderingEnabled: boolean;
    billSharingEnabled: boolean;
    aiHarmonizationEnabled: boolean;
    workModeEnabled: boolean;
    happyHourEnabled: boolean;
    autoAcceptOrders: boolean;
    feedbackPostVisit: boolean;
    smartSeating: boolean;
  };

  @Column({ nullable: true })
  welcomeMessage: string;

  @Column({ nullable: true })
  primaryLanguage: string;

  // --- Cozinha ---
  @Column({ type: 'jsonb', nullable: true })
  kitchenStations: Array<{
    id: string;
    name: string;
    items: string;
    kdsTarget: string;
    avgPrepTime: number;
    color: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  kitchenConfig: {
    kdsScreens: number;
    defaultPrepTime: number;
    autoRouting: boolean;
    priorityAlerts: boolean;
    fireOrder: boolean;
    batchCooking: boolean;
  };

  // --- Pagamentos ---
  @Column({ type: 'jsonb', nullable: true })
  paymentConfig: {
    serviceChargeEnabled: boolean;
    serviceChargePercent: number;
    serviceChargeType: 'optional' | 'mandatory';
    tipsEnabled: boolean;
    tipPercentages: number[];
    customTipAllowed: boolean;
    splitModes: {
      individual: boolean;
      equal: boolean;
      byItem: boolean;
      fixedAmount: boolean;
    };
    methods: {
      pix: boolean;
      credit: boolean;
      debit: boolean;
      applePay: boolean;
      googlePay: boolean;
      tapToPay: boolean;
      cash: boolean;
    };
    tipsDistribution: 'equal' | 'weighted' | 'manual';
  };

  // --- Feature Flags Globais ---
  @Column({ type: 'jsonb', nullable: true })
  enabledFeatures: {
    loyaltyProgram: boolean;
    eventsModule: boolean;
    happyHourEngine: boolean;
    aiRecommendations: boolean;
    vipProgram: boolean;
    experiencePackages: boolean;
    smartReviews: boolean;
    advancedAnalytics: boolean;
    driveThruMode: boolean;
    multiLanguageSupport: boolean;
    analyticsTracking: boolean;
    pushNotifications: boolean;
    webhookIntegrations: boolean;
  };

  // --- Equipe ---
  @Column({ type: 'jsonb', nullable: true })
  teamConfig: {
    rolePermissions: Record<string, string[]>;
    tipsPolicy: {
      distribution: 'equal' | 'weighted' | 'manual';
      pooling: boolean;
    };
  };

  // --- Setup Progress ---
  @Column({ type: 'simple-array', nullable: true })
  completedSetupSteps: string[];

  @Column({ type: 'jsonb', nullable: true })
  sectionProgress: Record<string, number>;

  // --- Metadata ---
  @Column({ nullable: true })
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;
}
```

**FloorTable entity (adicionar campos a tabela existente):**

```typescript
// backend/src/modules/tables/entities/floor-table.entity.ts (adicoes)
@Column({ nullable: true })
section: string;   // 'main', 'terrace', 'bar', 'vip', 'private'

@Column({ type: 'enum', enum: ['round', 'rect', 'long'], default: 'rect' })
shape: 'round' | 'rect' | 'long';

@Column({ type: 'jsonb', nullable: true })
position: { x: number; y: number; rotation?: number };

@Column({ nullable: true })
qrCodeUrl: string;

@Column({ nullable: true })
qrCodeGeneratedAt: Date;
```

### Controller Endpoints

Arquivo existente: `/backend/src/modules/restaurants/restaurants.controller.ts`

**Endpoints ja existentes (a manter e expandir):**
```
GET    /restaurants/:id/service-config     -- Obter config atual (OWNER/MANAGER)
PATCH  /restaurants/:id/service-config     -- Atualizar config (OWNER/MANAGER com restricoes)
GET    /restaurants/:id/setup-progress     -- Obter progresso do setup
PATCH  /restaurants/:id/setup-progress     -- Atualizar progresso do setup
```

**Endpoints a criar no novo modulo service-config:**
```
GET    /config/:restaurantId               -- Config completa (OWNER/MANAGER)
PATCH  /config/:restaurantId               -- Atualizar config completa
PATCH  /config/:restaurantId/profile       -- Atualizar apenas perfil (OWNER)
PATCH  /config/:restaurantId/service-types -- Atualizar tipos de servico (OWNER)
PATCH  /config/:restaurantId/experience    -- Atualizar experiencia (OWNER/MANAGER-parcial)
PATCH  /config/:restaurantId/floor         -- Atualizar layout (OWNER)
PATCH  /config/:restaurantId/kitchen       -- Atualizar cozinha (OWNER/MANAGER)
PATCH  /config/:restaurantId/payments      -- Atualizar pagamentos (OWNER)
PATCH  /config/:restaurantId/features      -- Atualizar features (OWNER)
POST   /config/setup                       -- Setup wizard inicial (OWNER)

GET    /config/:restaurantId/floor/tables  -- Listar mesas
POST   /config/:restaurantId/floor/tables  -- Criar mesa
PATCH  /config/:restaurantId/floor/tables/:tableId  -- Editar mesa
DELETE /config/:restaurantId/floor/tables/:tableId  -- Remover mesa
POST   /config/:restaurantId/floor/tables/:tableId/qr-code  -- Gerar QR Code
```

### DTOs

```typescript
// backend/src/modules/service-config/dto/update-config-profile.dto.ts
export class UpdateConfigProfileDto {
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsString() cnpj?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsUrl() website?: string;
  @IsOptional() address?: AddressDto;
  @IsOptional() @IsArray() businessHours?: BusinessHourDto[];
  @IsOptional() @IsArray() @IsString({ each: true }) cuisineTypes?: string[];
  @IsOptional() @IsString() priceRange?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5000) capacity?: number;
}

// backend/src/modules/service-config/dto/update-config-experience.dto.ts
export class UpdateConfigExperienceDto {
  @IsOptional() @IsBoolean() reservationsEnabled?: boolean;
  @IsOptional() @IsBoolean() virtualQueueEnabled?: boolean;
  @IsOptional() @IsBoolean() familyModeEnabled?: boolean;
  @IsOptional() @IsBoolean() qrOrderingEnabled?: boolean;
  @IsOptional() @IsBoolean() billSharingEnabled?: boolean;
  // ... demais flags
  @IsOptional() @IsString() @MaxLength(200) welcomeMessage?: string;
  @IsOptional() @IsString() primaryLanguage?: string;
}
```

### WebSocket Event: config:updated

```typescript
// backend/src/modules/service-config/service-config.gateway.ts
@WebSocketGateway({ namespace: '/restaurant' })
export class ServiceConfigGateway {
  @WebSocketServer() server: Server;

  emitConfigUpdated(restaurantId: string, section: string, updatedBy: string) {
    this.server
      .to(`restaurant:${restaurantId}`)
      .emit('config:updated', {
        restaurantId,
        section,
        updatedBy,
        timestamp: new Date().toISOString(),
      });
  }
}

// Payload example recebido por todos os dispositivos conectados:
{
  "event": "config:updated",
  "data": {
    "restaurantId": "uuid-xxxx",
    "section": "config-payments",
    "updatedBy": "user-uuid",
    "timestamp": "2026-03-23T14:32:00Z"
  }
}
```

### Migration

```sql
-- migration: CreateRestaurantConfigTable
CREATE TABLE restaurant_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "restaurantId" UUID NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(100),
  description TEXT,
  "logoUrl" VARCHAR(500),
  "coverUrl" VARCHAR(500),
  cnpj VARCHAR(20),
  phone VARCHAR(30),
  website VARCHAR(200),
  address JSONB,
  "businessHours" JSONB,
  "cuisineTypes" TEXT[],
  "priceRange" VARCHAR(10),
  capacity INTEGER,
  "primaryServiceType" VARCHAR(50),
  "enabledServiceTypes" TEXT[],
  "experienceFlags" JSONB,
  "welcomeMessage" VARCHAR(200),
  "primaryLanguage" VARCHAR(10),
  "kitchenStations" JSONB,
  "kitchenConfig" JSONB,
  "paymentConfig" JSONB,
  "enabledFeatures" JSONB,
  "teamConfig" JSONB,
  "completedSetupSteps" TEXT[],
  "sectionProgress" JSONB,
  "updatedBy" UUID REFERENCES users(id),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- migration: AddFloorFieldsToTables
ALTER TABLE tables ADD COLUMN IF NOT EXISTS section VARCHAR(50);
ALTER TABLE tables ADD COLUMN IF NOT EXISTS shape VARCHAR(10) DEFAULT 'rect';
ALTER TABLE tables ADD COLUMN IF NOT EXISTS position JSONB;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS "qrCodeUrl" VARCHAR(500);
ALTER TABLE tables ADD COLUMN IF NOT EXISTS "qrCodeGeneratedAt" TIMESTAMP;
```

---

## FEATURE 8.0 — Config Hub Index Screen

### US-8.0.1 — Ver hub de configuracoes com progresso de setup

**Como** Owner ou Manager,
**Quero** ver um hub central com cards para cada area de configuracao e o progresso de setup,
**Para** saber o que ja esta configurado e o que precisa atencao.

**Criterios de aceite:**
1. O hub exibe 9 cards de configuracao, cada um com icone, label, descricao e barra de progresso individual.
2. Um card de progresso geral mostra a porcentagem ponderada de conclusao de todas as areas (calculada pelo `sectionProgress` no backend).
3. Cards com progresso < 60% exibem badge amarelo "Pendente". Entre 60-99% exibem "Configurado". Em 100% exibem "Completo" em verde.
4. Um guia contextual (dismissivel) orienta a ordem recomendada: Perfil > Tipos de Servico > Experiencia.
5. Acoes rapidas permitem navegar diretamente a sub-telas comuns: Atualizar fotos, Editar precos, Escalar equipe, Ajustar mesas.
6. Manager nao ve os cards de areas sem acesso (config-profile, config-payments, config-features, config-service-types). Ele ve apenas 4 ou 5 cards conforme seu nivel de acesso.
7. O campo `updatedAt` de cada secao exibe "Ultima alteracao: X tempo atras" em cada card.

**Specs tecnicos:**

Arquivo mobile a criar:
`mobile/apps/restaurant/src/screens/config-hub/ConfigHubIndexScreen.tsx`

```typescript
// Estrutura do componente
interface ConfigModule {
  id: string;
  screen: string;
  icon: string;
  labelKey: string;
  descKey: string;
  progress: number;
  status: 'complete' | 'configured' | 'needs-attention' | 'locked';
  ownerOnly: boolean;
  lastUpdated?: Date;
}
```

API call:
`GET /config/:restaurantId` — Retorna `sectionProgress` para calcular badges.

**i18n keys:**

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `configHub.title` | Central de Configuracao | Configuration Hub | Centro de Configuracion |
| `configHub.overallProgress` | Progresso geral | Overall progress | Progreso general |
| `configHub.statusComplete` | Completo | Complete | Completo |
| `configHub.statusConfigured` | Configurado | Configured | Configurado |
| `configHub.statusPending` | Pendente | Pending | Pendiente |
| `configHub.guideTip` | Dica: Configure na ordem | Tip: Configure in order | Consejo: Configure en orden |
| `configHub.quickActions` | Acoes Rapidas | Quick Actions | Acciones Rapidas |
| `configHub.lastUpdated` | Ultima alteracao | Last updated | Ultima actualizacion |

**Cenarios de teste:**

- Happy: Owner acessa o hub e ve 9 cards com progresso variado.
- Happy: Manager acessa e ve apenas os cards permitidos (kitchen, experience, menu, team).
- Error: Falha de rede ao carregar config — exibir estado de erro com botao de retry.
- Permission: Outro role (waiter, chef) tenta acessar a rota — redirecionar para tela principal do role.

---

## FEATURE 8.1 — config-profile

### US-8.1.1 — Editar perfil completo do restaurante (Owner)

**Como** Owner,
**Quero** editar o perfil completo do restaurante incluindo nome, descricao, logo, foto de capa, contato, endereco e horarios,
**Para** que as informacoes corretas apaream no app do cliente e nas plataformas externas.

**Criterios de aceite:**
1. O formulario e dividido em tres abas: Info, Horarios, Contato.
2. Cada campo e editavel em linha (inline edit): ao tocar o campo, ele muda para um input; o botao Salvar persiste localmente e envia `PATCH /config/:id/profile`.
3. Upload de logo e foto de capa usa a camera/galeria do dispositivo. Preview imediato antes de confirmar o upload.
4. Validacao em tempo real: nome obrigatorio (min 3, max 100 chars), CNPJ com mascara e validacao de digito verificador, telefone com mascara BR, website com validacao de URL.
5. Horarios de funcionamento por dia da semana. Cada dia tem toggle ativo/inativo, e campos de abertura e fechamento. Horario de fechamento pode ser no dia seguinte (ex: 23h-03h, indicado como +1 dia).
6. Contatos multiplos (telefone, WhatsApp, email) com CRUD: adicionar, editar, remover.
7. Redes sociais (Instagram, Facebook, TikTok, Google Business): conectar/desconectar.
8. Ao salvar com sucesso, o backend emite `config:updated` com section = 'profile'.
9. Apenas Owner acessa esta tela. Manager recebe erro 403.

**Specs tecnicos:**

Arquivo mobile:
`mobile/apps/restaurant/src/screens/config-hub/ConfigProfileScreen.tsx`

Schema Zod:
```typescript
// shared/schemas/config-profile.schema.ts
const configProfileSchema = z.object({
  name: z.string().min(3, t('validation.nameTooShort')).max(100),
  description: z.string().max(500).optional(),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, t('validation.invalidCnpj')).optional(),
  phone: z.string().min(10).max(20).optional(),
  website: z.string().url(t('validation.invalidUrl')).optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(1),
    number: z.string().min(1),
    neighborhood: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zip: z.string().regex(/^\d{5}-\d{3}$/, t('validation.invalidCep')),
  }).optional(),
  capacity: z.number().int().min(1).max(5000).optional(),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
});
```

Image upload:
- Usar `expo-image-picker` com crop area configuravel (logo: 1:1, capa: 16:9).
- Upload via `POST /uploads` com multipart/form-data.
- Retorna URL publica para armazenar em `logoUrl` / `coverUrl`.
- Comprimir para max 1MB antes de enviar.

**i18n keys:**

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `profile.title` | Perfil do Restaurante | Restaurant Profile | Perfil del Restaurante |
| `profile.tabInfo` | Info | Info | Info |
| `profile.tabHours` | Horarios | Hours | Horarios |
| `profile.tabContact` | Contato | Contact | Contacto |
| `profile.name` | Nome | Name | Nombre |
| `profile.description` | Descricao | Description | Descripcion |
| `profile.cnpj` | CNPJ | CNPJ | CNPJ |
| `profile.phone` | Telefone | Phone | Telefono |
| `profile.website` | Website | Website | Sitio web |
| `profile.address` | Endereco | Address | Direccion |
| `profile.capacity` | Capacidade | Capacity | Capacidad |
| `profile.priceRange` | Faixa de Preco | Price Range | Rango de precios |
| `profile.businessHours` | Horarios de Funcionamento | Business Hours | Horario de apertura |
| `profile.changeLogo` | Alterar Logo | Change Logo | Cambiar logo |
| `profile.changeCover` | Alterar Banner | Change Cover | Cambiar portada |
| `profile.closed` | Fechado | Closed | Cerrado |
| `profile.addContact` | Novo Contato | New Contact | Nuevo contacto |
| `profile.socialNetworks` | Redes Sociais | Social Networks | Redes sociales |
| `profile.connect` | Conectar | Connect | Conectar |
| `profile.disconnect` | Desconectar | Disconnect | Desconectar |
| `profile.savedSuccess` | Perfil atualizado! | Profile updated! | Perfil actualizado! |
| `validation.nameTooShort` | Nome muito curto (min 3) | Name too short (min 3) | Nombre muy corto (min 3) |
| `validation.invalidCnpj` | CNPJ invalido | Invalid CNPJ | CNPJ invalido |
| `validation.invalidUrl` | URL invalida | Invalid URL | URL invalida |
| `validation.invalidCep` | CEP invalido | Invalid ZIP code | CEP invalido |

**Cenarios de teste:**

- Happy: Owner edita o nome, salva — backend confirma, WebSocket dispara `config:updated`.
- Happy: Upload de logo — preview mostra antes de confirmar, apos confirmacao URL e salva.
- Error: CNPJ invalido — erro inline no campo, botao Salvar bloqueado.
- Error: Upload de imagem > 1MB — exibir mensagem "Imagem muito grande (max 1MB)".
- Error: Falha de rede ao salvar — toast de erro, dado local nao e perdido, pode tentar novamente.
- Permission: Manager tenta acessar config-profile — 403, redirecionar para config-hub.

---

## FEATURE 8.2 — config-service-types

### US-8.2.1 — Selecionar tipo primario de servico (Owner)

**Como** Owner,
**Quero** selecionar o tipo primario de operacao do meu restaurante entre os 11 tipos disponiveis,
**Para** que a plataforma configure automaticamente as features e a UI do app do cliente para o meu modelo de negocio.

**Criterios de aceite:**
1. Os 11 tipos disponiveis sao apresentados como cards selecionaveis: Fine Dining, Casual Dining, Fast Casual, Cafe & Padaria, Buffet, Pub & Bar, Drive-Thru, Food Truck, Chef's Table, Quick Service, Club & Balada.
2. Cada card mostra o nome, descricao curta e a quantidade de features habilitadas para aquele tipo.
3. Apenas 1 tipo pode ser o primario. A selecao do primario e obrigatoria (nao pode ser desmarcado sem selecionar outro).
4. Ao selecionar um tipo, exibe um painel expansivel listando as features que serao habilitadas (ex: Fine Dining: Reservas Online, Wine Pairing, Sommelier, Split por Item).
5. O admin pode ativar/desativar individualmente cada feature dentro do tipo selecionado.
6. Um banner de alerta avisa: "Alterar o tipo primario afetara a experiencia visual do app do cliente. Esta acao requer confirmacao."
7. Ao confirmar, `PATCH /config/:id/service-types` e enviado. Backend emite `config:updated` com section = 'service-types'.
8. IMPACTO: O Client App usa `primaryServiceType` para determinar o layout, o flow de navegacao, os tipos de pedido disponivel e os modulos especificos de cada vertical.

**Criterios de aceite adicionais — IMPACTO no Client App:**
- Fine Dining: ativa reservas obrigatorias, menu de degustacao course-by-course, sommelier.
- Cafe: ativa Work Mode, refill, Wi-Fi info.
- Pub & Bar: ativa comanda digital, round builder, consumo minimo.
- Drive-Thru: ativa geofencing GPS, preparo antecipado.
- Food Truck: ativa mapa em tempo real, fila virtual.
- Club & Balada: ativa ingressos QR, mapa VIP, consumo minimo.

### US-8.2.2 — Habilitar servicos multiplos (Owner)

**Como** Owner,
**Quero** habilitar tipos de servico secundarios alem do primario,
**Para** que meu estabelecimento com perfil hibrido (ex: Cafe com servico de Casual Dining no almoco) suporte multiplos modelos.

**Criterios de aceite:**
1. Apos definir o tipo primario, o Owner pode ativar tipos adicionais da lista.
2. Cada tipo adicional habilitado incrementa o contador de features totais.
3. A UI do Client App exibe os flows de acordo com o horario (ex: Work Mode ativo ate 11h, Casual Dining apos 12h).
4. Um tooltip explica: "Tipos secundarios adicionam features, mas o layout principal segue o tipo primario."

**Specs tecnicos:**

```typescript
// Zod schema
const serviceTypesSchema = z.object({
  primaryServiceType: z.enum([
    'fine_dining', 'casual_dining', 'fast_casual', 'cafe_bakery',
    'buffet', 'pub_bar', 'drive_thru', 'food_truck',
    'chefs_table', 'quick_service', 'club',
  ]),
  enabledServiceTypes: z.array(z.string()).optional(),
});
```

**i18n keys:**

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `serviceTypes.title` | Tipos de Servico | Service Types | Tipos de Servicio |
| `serviceTypes.primaryType` | Tipo Primario | Primary Type | Tipo primario |
| `serviceTypes.additionalTypes` | Tipos Adicionais | Additional Types | Tipos adicionales |
| `serviceTypes.featuresEnabled` | features ativas | features enabled | funciones activas |
| `serviceTypes.impactWarning` | Alterar o tipo primario afeta a UI do cliente | Changing primary type affects client UI | Cambiar el tipo primario afecta la UI del cliente |
| `serviceTypes.confirmChange` | Confirmar alteracao de tipo | Confirm type change | Confirmar cambio de tipo |
| `serviceTypes.fineDining` | Fine Dining | Fine Dining | Fine Dining |
| `serviceTypes.casualDining` | Casual Dining | Casual Dining | Casual Dining |
| `serviceTypes.fastCasual` | Fast Casual | Fast Casual | Fast Casual |
| `serviceTypes.cafeBakery` | Cafe e Padaria | Cafe & Bakery | Cafe y Panaderia |
| `serviceTypes.pubBar` | Pub e Bar | Pub & Bar | Pub y Bar |
| `serviceTypes.drivethru` | Drive-Thru | Drive-Thru | Drive-Thru |
| `serviceTypes.foodTruck` | Food Truck | Food Truck | Food Truck |
| `serviceTypes.chefsTable` | Mesa do Chef | Chef's Table | Mesa del Chef |
| `serviceTypes.quickService` | Servico Rapido | Quick Service | Servicio Rapido |
| `serviceTypes.club` | Club e Balada | Club & Nightclub | Club y Discoteca |

**Cenarios de teste:**

- Happy: Owner seleciona Fine Dining como primario, expande card e ve as 5 features listadas.
- Happy: Owner desativa individualmente "Sommelier" da lista — salva com sucesso.
- Warning: Owner tenta trocar o tipo primario de Fine Dining para Quick Service — modal de confirmacao aparece.
- Permission: Manager tenta acessar config-service-types — 403.

---

## FEATURE 8.3 — config-experience

### US-8.3.1 — Configurar feature flags por tipo de servico (Owner)

**Como** Owner,
**Quero** configurar quais features da experiencia do cliente estao habilitadas,
**Para** personalizar o flow de atendimento conforme o perfil do meu restaurante.

**Criterios de aceite:**
1. Tres secoes de toggles: Canais de Entrada (Reservas, Fila Virtual, Eventos), Modelo de Atendimento (Mesa, QR, Balcao, Auto-servico), Inteligencia (Alocacao inteligente, Feedback pos-visita).
2. Um painel interativo "Jornada do Cliente" mostra as etapas ativas/inativas com base nas flags configuradas (Descoberta > Reserva > Chegada > Cardapio > Pedido > Acompanhamento > Consumo > Conta > Pagamento > Pos-visita).
3. Ao habilitar Reservas, expande secao de configuracoes de reserva: antecedencia maxima (dias), tolerancia de atraso (minutos), exigir deposito.
4. Ao habilitar Fila Virtual, exibe config: tempo estimado visivel ao cliente, drinks no aguardo habilitados.
5. Flags de IA (Alocacao inteligente) so disponiveis se a feature 'ai_recommendations' estiver ativa em config-features.
6. Flags de Happy Hour so disponiveis se a feature 'happy_hour' estiver ativa em config-features.
7. Idioma principal do restaurante: selecao entre PT-BR, EN, ES — define o idioma default do Client App para este restaurante.
8. Mensagem de boas-vindas customizavel (max 200 chars) exibida na tela inicial do Client App.

### US-8.3.2 — Configurar flags operacionais (Manager)

**Como** Manager,
**Quero** ativar ou desativar flags operacionais como fila virtual, reservas e pedido por QR,
**Para** ajustar o flow de atendimento conforme o dia ou evento especial.

**Criterios de aceite:**
1. Manager acessa config-experience mas com escopo reduzido: apenas flags que afetam operacao imediata.
2. Manager NAO pode alterar: tipo de atendimento estrutural (mesa vs balcao), configuracoes de IA, idioma principal, mensagem de boas-vindas.
3. Manager PODE alterar: habilitar/desabilitar reservas para o dia, habilitar fila virtual, alterar tempo de tolerancia de reserva.
4. A UI difere para Manager: campos nao permitidos aparecem com icone de cadeado e tooltip "Apenas o Dono pode alterar".

**Specs tecnicos:**

```typescript
// RBAC middleware no backend
async function canEditExperienceFlag(
  userId: string,
  restaurantId: string,
  flag: string,
): Promise<boolean> {
  const userRole = await getUserRole(userId, restaurantId);
  const OWNER_ONLY_FLAGS = [
    'qrOrderingEnabled', 'billSharingEnabled', 'aiHarmonizationEnabled',
    'workModeEnabled', 'happyHourEnabled', 'primaryLanguage', 'welcomeMessage',
  ];
  if (userRole === 'owner') return true;
  if (userRole === 'manager') return !OWNER_ONLY_FLAGS.includes(flag);
  return false;
}
```

**i18n keys:**

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `experience.title` | Experiencia do Cliente | Customer Experience | Experiencia del cliente |
| `experience.entryChannels` | Canais de Entrada | Entry Channels | Canales de entrada |
| `experience.reservations` | Reservas Online | Online Reservations | Reservas online |
| `experience.virtualQueue` | Fila Virtual | Virtual Queue | Cola virtual |
| `experience.eventBookings` | Reserva de Eventos | Event Bookings | Reserva de eventos |
| `experience.serviceModel` | Modelo de Atendimento | Service Model | Modelo de atencion |
| `experience.tableService` | Atendimento na Mesa | Table Service | Servicio en mesa |
| `experience.qrOrdering` | Pedido por QR Code | QR Code Ordering | Pedido por QR |
| `experience.counterService` | Atendimento no Balcao | Counter Service | Servicio en mostrador |
| `experience.selfService` | Auto-servico | Self Service | Autoservicio |
| `experience.intelligence` | Inteligencia | Intelligence | Inteligencia |
| `experience.smartSeating` | Alocacao inteligente | Smart Seating | Asignacion inteligente |
| `experience.feedbackPostVisit` | Feedback pos-visita | Post-visit Feedback | Feedback post-visita |
| `experience.customerJourney` | Jornada do Cliente | Customer Journey | Recorrido del cliente |
| `experience.activeSteps` | etapas ativas | active steps | pasos activos |
| `experience.advanceDays` | Antecedencia maxima (dias) | Max advance booking (days) | Anticipacion maxima (dias) |
| `experience.gracePeriod` | Tolerancia (min) | Grace period (min) | Tolerancia (min) |
| `experience.requireDeposit` | Exigir deposito | Require deposit | Exigir deposito |
| `experience.welcomeMessage` | Mensagem de boas-vindas | Welcome message | Mensaje de bienvenida |
| `experience.primaryLanguage` | Idioma principal | Primary language | Idioma principal |
| `experience.ownerOnlyField` | Apenas o Dono pode alterar | Only the Owner can change | Solo el Dueno puede cambiar |

**Cenarios de teste:**

- Happy: Owner desabilita Reservas — jornada do cliente remove o passo "Reserva".
- Happy: Owner habilita Reservas + configura antecedencia de 15 dias, tolerancia 20min.
- Partial: Manager acessa e ve cadeados nos campos de idioma e mensagem.
- Permission: Tentativa de PATCH por Manager em campo owner-only — 403 do backend.

---

## FEATURE 8.4 — config-floor

### US-8.4.1 — Criar e editar mesas (Owner)

**Como** Owner,
**Quero** criar, editar e remover mesas com numero, formato, capacidade e zona,
**Para** que o FloorPlanScreen do restaurant app e o Client App reflitam o layout real do meu estabelecimento.

**Criterios de aceite:**
1. CRUD completo de mesas: criar nova mesa (numero auto-incrementado, formato, capacidade, zona), editar mesa existente, remover mesa com confirmacao.
2. Formatos de mesa disponiveis: Redonda (round), Retangular (rect), Longa (long — ocupa 2 colunas na grade visual).
3. Mini-visualizacao da planta em grade: cada mesa aparece como um bloco colorido pela sua zona. Mesas "long" ocupam 2 celulas horizontais.
4. Filtro por zona: exibir apenas as mesas da zona selecionada na listagem detalhada.
5. Validacao: numero de mesa unico dentro do restaurante, capacidade minima 1, maxima 50.
6. Ao remover mesa com pedidos ativos — exibir aviso mas permitir remocao com forcamento.
7. IMPACTO: `FloorPlanScreen` e `TableListScreen` do restaurant app consomem estes dados. Apos mudanca, emitir `config:updated` com section = 'floor' para recarregar os dados.

### US-8.4.2 — Configurar secoes do salao (Owner)

**Como** Owner,
**Quero** criar e gerenciar zonas/secoes do salao (Salao Principal, Terraço, Bar, VIP, Privativo),
**Para** organizar mesas por area e facilitar a gestao do Maitre e dos Garcons.

**Criterios de aceite:**
1. CRUD de zonas: criar nova zona com nome livre, editar nome, remover zona.
2. Ao remover uma zona que tem mesas associadas: exibir modal de confirmacao informando quantas mesas serao perdidas. Opcao de mover mesas para outra zona antes de confirmar.
3. Cada zona tem uma cor automatica atribuida (ciclica, sem repeticao nas primeiras 6).
4. Maximo de 10 zonas por restaurante.
5. Zonas sao usadas como filtros no FloorPlanScreen (tabs) e no painel do Maitre.

### US-8.4.3 — Gerar QR Codes para mesas (Owner)

**Como** Owner,
**Quero** gerar QR Codes por mesa que redirecionam para a experiencia do cliente naquela mesa,
**Para** que clientes possam escanear e abrir o app do cliente ja com a mesa pre-selecionada.

**Criterios de aceite:**
1. Botao "Gerar QR Code" em cada mesa na listagem.
2. QR Code encoda uma URL: `https://app.noowe.com/r/{restaurantId}/t/{tableId}`.
3. Preview do QR Code no dispositivo antes de imprimir/compartilhar.
4. Exportacao: compartilhar via Share API (PDF ou imagem PNG).
5. Exportacao em lote: gerar QR Codes de todas as mesas de uma zona em um PDF para impressao.
6. O campo `qrCodeGeneratedAt` e atualizado no banco. Se a mesa for renumerada, o QR Code e regenerado automaticamente.
7. IMPACTO: Client App valida o QR Code e abre diretamente na tela de cardapio com `tableId` e `restaurantId` preenchidos.

**Specs tecnicos:**

```typescript
// API endpoint
POST /config/:restaurantId/floor/tables/:tableId/qr-code
// Response: { qrCodeUrl: string, qrCodeData: string, generatedAt: Date }

// QR Code URL format
const qrData = `https://app.noowe.com/r/${restaurantId}/t/${tableId}`;

// Biblioteca: react-native-qrcode-svg
import QRCode from 'react-native-qrcode-svg';
<QRCode value={qrData} size={200} />
```

**i18n keys:**

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `floor.title` | Mapa do Salao | Floor Plan | Mapa del salon |
| `floor.tables` | Mesas | Tables | Mesas |
| `floor.zones` | Zonas | Zones | Zonas |
| `floor.capacity` | Lugares | Capacity | Capacidad |
| `floor.addTable` | Nova Mesa | New Table | Nueva mesa |
| `floor.addZone` | Nova Zona | New Zone | Nueva zona |
| `floor.tableNumber` | Mesa | Table | Mesa |
| `floor.seats` | Lugares | Seats | Asientos |
| `floor.shape` | Formato | Shape | Formato |
| `floor.shapeRound` | Redonda | Round | Redonda |
| `floor.shapeRect` | Retangular | Rectangular | Rectangular |
| `floor.shapeLong` | Longa | Long | Larga |
| `floor.zone` | Zona | Zone | Zona |
| `floor.mainHall` | Salao Principal | Main Hall | Salon principal |
| `floor.terrace` | Terraco | Terrace | Terraza |
| `floor.bar` | Bar | Bar | Bar |
| `floor.vip` | Area VIP | VIP Area | Area VIP |
| `floor.private` | Privativo | Private | Privado |
| `floor.generateQR` | Gerar QR Code | Generate QR Code | Generar codigo QR |
| `floor.exportQR` | Exportar QR Codes | Export QR Codes | Exportar codigos QR |
| `floor.deleteZoneWarning` | Todas as mesas desta zona serao removidas | All tables in this zone will be removed | Todas las mesas de esta zona seran eliminadas |
| `floor.visualPlan` | Planta Visual | Visual Floor Plan | Planta visual |

**Cenarios de teste:**

- Happy: Owner cria mesa 9 na zona "Terraco", formato longa, 8 lugares — aparece no mini-mapa.
- Happy: Owner remove zona "VIP" com 2 mesas — confirmacao mostra "2 mesas serao removidas".
- Happy: Owner gera QR Code da mesa 3 — QR exibido na tela, botao de compartilhar ativo.
- Error: Tentativa de criar mesa com numero duplicado — erro inline "Numero ja existe".
- Error: Numero de zonas atinge 10 — botao "Nova Zona" desabilitado com tooltip.
- Permission: Manager tenta acessar config-floor — 403.

---

## FEATURE 8.5 — config-menu

### US-8.5.1 — Gerenciar categorias do cardapio (Owner + Manager limitado)

**Como** Owner ou Manager (com restricoes),
**Quero** criar, reordenar e gerenciar categorias do cardapio e seus itens,
**Para** que o MenuScreen do Client App exiba as categorias e itens corretos.

**Criterios de aceite:**
1. CRUD de categorias: criar, renomear, reordenar (drag-and-drop ou botoes de subir/descer), remover (com confirmacao quando tem itens).
2. CRUD de itens dentro de cada categoria: criar item (nome, preco, tempo de preparo, alergenos), editar, ativar/desativar, remover.
3. Cada item tem: nome, preco (R$), tempo de preparo (min), alergenos (multi-select), foto (opcional), descricao curta.
4. Owner pode editar precos. Manager vê precos mas nao pode alterar (campo desabilitado com cadeado).
5. Itens desativados aparecem riscados na listagem mas nao aparecem no Client App.
6. Contador de itens por categoria exibido no cabecalho da categoria.
7. IMPACTO: `MenuScreen` do Client App consome estas categorias e itens em tempo real via API.

### US-8.5.2 — Configurar visibility rules por turno (Owner)

**Como** Owner,
**Quero** configurar regras de visibilidade de categorias por horario/turno,
**Para** que itens de cafe-da-manha so aparecam ate 11h e itens de jantar so a partir das 18h.

**Criterios de aceite:**
1. Cada categoria tem uma opcao "Visibilidade por Horario" que, quando ativada, exibe campos de horario inicial e final.
2. Exemplos configurados: "Cafe da Manha" visivel 07h-11h; "Carta de Vinho" visivel 18h-23h.
3. Se a categoria estiver fora do horario configurado, ela e ocultada automaticamente no Client App sem necessidade de intervencao manual.
4. Taxa de servico por categoria: Owner pode definir uma taxa diferente da taxa global para uma categoria especifica (ex: Carta de Vinhos tem taxa de 12% vs 10% global).

**Specs tecnicos:**

Arquivo mobile:
`mobile/apps/restaurant/src/screens/config-hub/ConfigMenuScreen.tsx`

```typescript
// Schema Zod para item de menu
const menuItemSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().positive().max(10000),
  prepTime: z.number().int().min(0).max(120),
  allergens: z.array(z.string()),
  description: z.string().max(300).optional(),
  photoUrl: z.string().url().optional(),
  active: z.boolean().default(true),
  categoryId: z.string().uuid(),
});

// Schema de visibilidade
const categoryVisibilitySchema = z.object({
  timeRestrictionEnabled: z.boolean(),
  visibleFrom: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  visibleUntil: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  serviceFeeOverride: z.number().min(0).max(100).optional(),
});
```

**i18n keys:**

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `menu.title` | Gestao do Cardapio | Menu Management | Gestion del menu |
| `menu.categories` | Categorias | Categories | Categorias |
| `menu.items` | Itens | Items | Articulos |
| `menu.addCategory` | Categoria | Category | Categoria |
| `menu.addItem` | Novo Item | New Item | Nuevo articulo |
| `menu.itemName` | Nome | Name | Nombre |
| `menu.itemPrice` | Preco (R$) | Price | Precio |
| `menu.itemPrepTime` | Tempo (min) | Prep Time (min) | Tiempo (min) |
| `menu.itemAllergens` | Alergenos | Allergens | Alergenos |
| `menu.activeItems` | Ativos | Active | Activos |
| `menu.visibilityRules` | Regras de Visibilidade | Visibility Rules | Reglas de visibilidad |
| `menu.visibleFrom` | Visivel das | Visible from | Visible desde |
| `menu.visibleUntil` | ate | until | hasta |
| `menu.serviceFeeOverride` | Taxa diferenciada | Custom service fee | Cargo diferenciado |
| `menu.priceLockedManager` | Preco: apenas o Dono pode editar | Price: only Owner can edit | Precio: solo el Dueno puede editar |

**Cenarios de teste:**

- Happy: Owner cria categoria "Happy Hour", adiciona 4 itens com desconto, define visibilidade 17h-20h.
- Happy: Manager acessa a tela, ve categorias e itens, tenta editar preco — campo bloqueado.
- Happy: Owner reordena categorias — nova ordem refletida imediatamente no Client App.
- Error: Criar item sem nome — erro de validacao inline.
- Cascade: Remocao de categoria com itens — modal lista quantos itens serao perdidos.

---

## FEATURE 8.6 — config-team

### US-8.6.1 — Definir permissoes por role (Owner)

**Como** Owner,
**Quero** definir as permissoes por cargo (role) e gerenciar os membros da equipe,
**Para** controlar o que cada funcionario pode ver e fazer no restaurant app.

**Criterios de aceite:**
1. Listagem de membros com avatar, nome, cargo, turno e status online/pausa/folga.
2. CRUD de membros: adicionar (nome, cargo, turno, email para convite), editar, remover.
3. Ao adicionar membro, sistema envia email de convite com link para criar conta e instalar o app.
4. O status do membro pode ser alternado manualmente pelo Owner: online > pausa > folga.
5. Cada cargo tem permissoes pre-configuradas (perfil de permissoes padrao) que o Owner pode customizar.
6. Visualizacao por turno: filtrar quem esta de servico "agora".
7. IMPACTO: As permissoes configuradasaqui alimentam o `NavigationGuard` e o RBAC do restaurant app.

### US-8.6.2 — Configurar politica de gorjetas (Owner)

**Como** Owner,
**Quero** definir como as gorjetas sao distribuidas entre a equipe,
**Para** garantir uma politica justa e transparente.

**Criterios de aceite:**
1. Tres modos de distribuicao: Igual para todos, Por peso (percentual por cargo), Manual (Owner/Manager distribui manualmente no fechamento).
2. Modo "Por Peso": configurar o percentual por cargo (ex: Garcom 50%, Chef 30%, Cozinheiro 20%).
3. Toggle: incluir ou excluir gerentes e donos do pool de gorjetas.
4. IMPACTO: `TipsScreen` do restaurant app usa esta configuracao para calcular e exibir as gorjetas de cada colaborador.

**Specs tecnicos:**

Arquivo mobile:
`mobile/apps/restaurant/src/screens/config-hub/ConfigTeamScreen.tsx`

**i18n keys:**

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `team.title` | Equipe e Permissoes | Team & Permissions | Equipo y Permisos |
| `team.members` | Membros da Equipe | Team Members | Miembros del equipo |
| `team.addMember` | Novo Membro | New Member | Nuevo miembro |
| `team.fullName` | Nome completo | Full name | Nombre completo |
| `team.role` | Cargo | Role | Cargo |
| `team.shift` | Turno | Shift | Turno |
| `team.statusOnline` | Online | Online | En linea |
| `team.statusBreak` | Pausa | Break | Pausa |
| `team.statusOff` | Folga | Day off | Dia libre |
| `team.tipsPolicy` | Politica de Gorjetas | Tips Policy | Politica de propinas |
| `team.tipsEqual` | Igual para todos | Equal for all | Igual para todos |
| `team.tipsByWeight` | Por Peso | By Weight | Por peso |
| `team.tipsManual` | Manual | Manual | Manual |
| `team.includeManagement` | Incluir gerencia no pool | Include management in pool | Incluir gerencia en el pool |
| `team.inviteSent` | Convite enviado! | Invitation sent! | Invitacion enviada! |
| `team.managerReadOnly` | Gerente: visualizacao apenas | Manager: view only | Gerente: solo lectura |

**Cenarios de teste:**

- Happy: Owner adiciona novo membro "Joao Silva - Garcom" — convite enviado para email.
- Happy: Owner configura distribuicao por peso: Garcom 50%, Chef 30%, Barman 20%.
- Read-only: Manager acessa config-team, ve lista mas todos os botoes de edicao estao desabilitados.
- Permission: PATCH por Manager em role permissions — 403.

---

## FEATURE 8.7 — config-kitchen

### US-8.7.1 — Criar estacoes de cozinha (Owner + Manager)

**Como** Owner ou Manager,
**Quero** criar e gerenciar estacoes de preparo com seus itens associados e a tela KDS de destino,
**Para** que pedidos sejam roteados corretamente para a estacao certa e o KDS exiba apenas os itens relevantes.

**Criterios de aceite:**
1. CRUD de estacoes: nome, lista de itens que prepara (texto livre), KDS de destino (KDS 1, KDS 2, KDS Bar), tempo medio de preparo (minutos).
2. Cor visual automatica por estacao (6 cores ciclicas).
3. Visualizacao do fluxo de producao como diagrama horizontal: Pedido > KDS > Estacao > Pronto > Entregue.
4. Configuracoes KDS: numero de telas KDS, tempo padrao de preparo global, roteamento automatico on/off.
5. Toggle "Fire Order": quando ativo, o Chef controla quando cada prato comeca a ser preparado (nao inicia automaticamente ao receber o pedido).
6. Toggle "Batch Cooking": agrupa itens identicos para preparo simultaneo.
7. IMPACTO: `KDSScreen` usa `kitchenStations` e `kitchenConfig` para filtrar tickets por estacao e configurar os timers.

### US-8.7.2 — Mapear itens de menu para estacoes (Owner + Manager)

**Como** Owner,
**Quero** mapear cada categoria ou item de menu para uma estacao de cozinha especifica,
**Para** que ao entrar um pedido, o sistema saiba automaticamente para onde rotear cada item.

**Criterios de aceite:**
1. Interface de mapeamento: lista de categorias do menu, cada uma com um seletor da estacao de destino.
2. Itens individuais podem sobrescrever a regra da categoria (ex: categoria "Pratos" vai para Grill, mas "Sashimi" vai para Frios).
3. Itens sem mapeamento vao para a estacao default (KDS 1).

### US-8.7.3 — Configurar routing cozinha vs bar (Owner + Manager)

**Como** Owner,
**Quero** definir quais categorias de items vao para o KDS da Cozinha e quais vao para o KDS do Bar,
**Para** que drinks e comidas sejam preparados nas areas certas e nao haja confusao.

**Criterios de aceite:**
1. Toggle global por categoria: "Cozinha" ou "Bar".
2. Exemplos de mapeamento padrao: Bebidas > Bar, Cocktails > Bar, Entradas > Cozinha, Pratos > Cozinha, Sobremesas > Cozinha.
3. IMPACTO: `KDSScreen` (cozinha) filtra apenas itens com destino "Cozinha". `KDSScreen` (bar) filtra apenas itens com destino "Bar".

**Specs tecnicos:**

Arquivo mobile:
`mobile/apps/restaurant/src/screens/config-hub/ConfigKitchenScreen.tsx`

**i18n keys:**

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `kitchen.title` | Cozinha e Bar | Kitchen & Bar | Cocina y Bar |
| `kitchen.stations` | Estacoes de Preparo | Prep Stations | Estaciones de preparacion |
| `kitchen.addStation` | Nova Estacao | New Station | Nueva estacion |
| `kitchen.stationName` | Nome | Station Name | Nombre |
| `kitchen.stationItems` | Itens que prepara | Items prepared | Articulos preparados |
| `kitchen.kdsTarget` | KDS de destino | KDS Target | KDS de destino |
| `kitchen.avgPrepTime` | Tempo medio (min) | Avg prep time (min) | Tiempo promedio (min) |
| `kitchen.kdsConfig` | Configuracoes KDS | KDS Settings | Configuracion KDS |
| `kitchen.kdsScreens` | Telas KDS | KDS Screens | Pantallas KDS |
| `kitchen.defaultPrepTime` | Tempo padrao (min) | Default time (min) | Tiempo por defecto (min) |
| `kitchen.autoRouting` | Roteamento automatico | Auto Routing | Enrutamiento automatico |
| `kitchen.priorityAlerts` | Alertas de prioridade | Priority alerts | Alertas de prioridad |
| `kitchen.fireOrder` | Fire Order | Fire Order | Fire Order |
| `kitchen.batchCooking` | Batch Cooking | Batch Cooking | Coccion en lote |
| `kitchen.productionFlow` | Fluxo de Producao | Production Flow | Flujo de produccion |
| `kitchen.routing.kitchen` | Cozinha | Kitchen | Cocina |
| `kitchen.routing.bar` | Bar | Bar | Bar |

**Cenarios de teste:**

- Happy: Owner cria estacao "Sushi Bar", mapeia para KDS 2, tempo medio 10min.
- Happy: Manager edita tempo medio da estacao "Grill" de 12 para 15min — salvo com sucesso.
- Happy: Owner ativa "Fire Order" — KDS passa a exibir botao "Iniciar" antes de comecar o timer.
- Happy: Owner mapeia categoria "Bebidas" para Bar — KDS bar comeca a receber esses itens.
- Error: Criar estacao sem nome — erro de validacao.

---

## FEATURE 8.8 — config-payments

### US-8.8.1 — Habilitar metodos de pagamento (Owner)

**Como** Owner,
**Quero** definir quais metodos de pagamento estao disponiveis no meu restaurante,
**Para** que o PaymentScreen exiba apenas as opcoes que meu estabelecimento aceita.

**Criterios de aceite:**
1. Grid visual de metodos com toggle individual: Credito, Debito, PIX, Apple Pay, Google Pay, TAP to Pay, Dinheiro.
2. Metodos ativos aparecem com borda colorida e checkmark. Inativas ficam com opacidade reduzida.
3. Pelo menos 1 metodo deve estar ativo (validacao ao salvar).
4. Credenciais de integracao de pagamento (chave PIX, credenciais do gateway de cartao) em secao separada com campos protegidos (mascarados).
5. IMPACTO: `PaymentScreen` e `WaiterPaymentScreen` exibem apenas os metodos habilitados aqui.

### US-8.8.2 — Configurar taxa de servico e gorjeta (Owner)

**Como** Owner,
**Quero** configurar a taxa de servico e as opcoes de gorjeta apresentadas ao cliente,
**Para** garantir que o sistema calcule e cobre corretamente estas taxas.

**Criterios de aceite:**
1. Toggle "Taxa de servico": quando ativo, exibe campo percentual (default 10%) e selector opcional/obrigatoria.
2. Toggle "Gorjetas": quando ativo, exibe chips editaveis com os percentuais sugeridos (default: 10%, 15%, 20%). Owner pode adicionar/remover percentuais.
3. Toggle "Gorjeta personalizada": permite ao cliente digitar um valor livre.
4. Quatro modos de split de conta com toggles individuais: Individual, Dividir Igualmente, Por Item, Valor Fixo.
5. Preview em tempo real: simulacao da tela de pagamento do cliente com as configuracoes atuais.
6. IMPACTO: `PaymentScreen` usa `paymentConfig` para exibir os chips de gorjeta, calcular a taxa de servico e exibir os modos de split disponiveis.

**Specs tecnicos:**

Arquivo mobile:
`mobile/apps/restaurant/src/screens/config-hub/ConfigPaymentsScreen.tsx`

Schema Zod:
```typescript
const paymentsConfigSchema = z.object({
  serviceCharge: z.object({
    enabled: z.boolean(),
    percentage: z.number().min(0).max(30),
    type: z.enum(['optional', 'mandatory']),
  }),
  tips: z.object({
    enabled: z.boolean(),
    defaultPercentages: z.array(z.number().int().min(1).max(50)).min(1).max(6),
    allowCustom: z.boolean(),
    distribution: z.enum(['equal', 'weighted', 'manual']),
  }),
  splitModes: z.object({
    individual: z.boolean(),
    equal: z.boolean(),
    byItem: z.boolean(),
    fixedAmount: z.boolean(),
  }).refine(
    (data) => Object.values(data).some(Boolean),
    { message: 'Pelo menos um modo de split deve estar ativo' }
  ),
  methods: z.object({
    pix: z.boolean(),
    credit: z.boolean(),
    debit: z.boolean(),
    applePay: z.boolean(),
    googlePay: z.boolean(),
    tapToPay: z.boolean(),
    cash: z.boolean(),
  }).refine(
    (data) => Object.values(data).some(Boolean),
    { message: 'Pelo menos um metodo de pagamento deve estar ativo' }
  ),
});
```

**i18n keys:**

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `payments.title` | Pagamentos | Payments | Pagos |
| `payments.methods` | Metodos Aceitos | Accepted Methods | Metodos aceptados |
| `payments.credit` | Credito | Credit | Credito |
| `payments.debit` | Debito | Debit | Debito |
| `payments.pix` | PIX | PIX | PIX |
| `payments.applePay` | Apple Pay | Apple Pay | Apple Pay |
| `payments.googlePay` | Google Pay | Google Pay | Google Pay |
| `payments.tapToPay` | TAP to Pay | TAP to Pay | TAP para pagar |
| `payments.cash` | Dinheiro | Cash | Efectivo |
| `payments.serviceCharge` | Taxa de Servico | Service Charge | Cargo por servicio |
| `payments.chargePercent` | Percentual | Percentage | Porcentaje |
| `payments.chargeOptional` | Opcional | Optional | Opcional |
| `payments.chargeMandatory` | Obrigatoria | Mandatory | Obligatorio |
| `payments.tips` | Gorjetas | Tips | Propinas |
| `payments.suggestedPercentages` | Percentuais sugeridos | Suggested percentages | Porcentajes sugeridos |
| `payments.customTip` | Gorjeta personalizada | Custom tip | Propina personalizada |
| `payments.splitBill` | Divisao de Conta | Split Bill | Division de cuenta |
| `payments.splitIndividual` | Individual | Individual | Individual |
| `payments.splitEqual` | Dividir igualmente | Split equally | Dividir equitativamente |
| `payments.splitByItem` | Por item | By item | Por articulo |
| `payments.splitFixed` | Valor fixo | Fixed amount | Monto fijo |
| `payments.preview` | Pre-visualizacao | Preview | Vista previa |
| `payments.atLeastOneMethod` | Pelo menos um metodo deve estar ativo | At least one method must be active | Al menos un metodo debe estar activo |

**Cenarios de teste:**

- Happy: Owner desabilita Apple Pay e Google Pay, mantém PIX, Credito, Debito — salva, PaymentScreen nao exibe mais os metodos desabilitados.
- Happy: Owner muda taxa de servico de 10% para 12%, tipo "Obrigatoria" — preview atualiza em tempo real.
- Error: Owner desabilita todos os metodos de pagamento — erro "Pelo menos um metodo deve estar ativo".
- Error: Owner remove todos os chips de gorjeta — erro de validacao.
- Permission: Manager tenta acessar config-payments — 403.

---

## FEATURE 8.9 — config-features

### US-8.9.1 — Gerenciar feature flags globais (Owner)

**Como** Owner,
**Quero** ativar ou desativar modulos avancados (features globais) da plataforma,
**Para** habilitar funcionalidades premium como programa de fidelidade, IA de recomendacoes e gestao de eventos.

**Criterios de aceite:**
1. Lista de 8 features com card expansivel: Programa de Fidelidade, Gestao de Eventos, Happy Hour Engine, IA de Recomendacoes, Programa VIP, Pacotes de Experiencia, Avaliacoes Inteligentes, Analytics Avancado.
2. Cada card mostra: icone gradiente, nome, descricao curta, tier (Premium/Pro/Gratis), toggle on/off.
3. Ao expandir um card, exibe descricao detalhada do modulo e, se ativo, um banner "Modulo ativo e operacional".
4. Features com tier "Premium" ou "Pro" exibem badge colorido. Features "Gratis" nao exibem restricao.
5. Contador no cabecalho: X ativos / Y disponiveis / Z gratis.
6. Ao ativar uma feature Premium sem plano correspondente: exibir modal de upgrade de plano (stub, a integrar com billing).
7. IMPACTO CASCATA: Cada feature ativada aqui desbloqueia elementos em outras partes do sistema:
   - `loyalty` habilitado -> LoyaltyScreen aparece no Client App e no menu do Owner.
   - `ai_recommendations` habilitado -> botao de harmonizacao aparece no CardapioScreen do cliente.
   - `events` habilitado -> tab "Eventos" aparece no Client App.
   - `happy_hour` habilitado -> engine de precificacao dinamica entra em acao.
   - `advanced_analytics` habilitado -> Dashboard do Owner exibe metricas avancadas e predicoes.

**Specs tecnicos:**

Arquivo mobile:
`mobile/apps/restaurant/src/screens/config-hub/ConfigFeaturesScreen.tsx`

```typescript
// Feature gate hook usado em toda a plataforma
// shared/hooks/useFeatureGate.ts
export function useFeatureGate(featureId: string): boolean {
  const { config } = useRestaurantConfig();
  return config?.enabledFeatures?.[featureId] ?? false;
}

// Uso em qualquer tela:
const isLoyaltyEnabled = useFeatureGate('loyaltyProgram');
if (!isLoyaltyEnabled) return null; // ou redirecionar
```

**i18n keys:**

| Key | PT-BR | EN | ES |
|-----|-------|----|----|
| `features.title` | Marketplace de Features | Feature Marketplace | Marketplace de funciones |
| `features.active` | Ativos | Active | Activos |
| `features.available` | Disponiveis | Available | Disponibles |
| `features.free` | Gratis | Free | Gratis |
| `features.loyalty` | Programa de Fidelidade | Loyalty Program | Programa de fidelidad |
| `features.loyaltyDesc` | Pontos, recompensas e leaderboard | Points, rewards and leaderboard | Puntos, recompensas y clasificacion |
| `features.events` | Gestao de Eventos | Event Management | Gestion de eventos |
| `features.eventsDesc` | Eventos, ingressos e check-in | Events, tickets and check-in | Eventos, entradas y check-in |
| `features.happyHour` | Happy Hour | Happy Hour | Happy Hour |
| `features.happyHourDesc` | Precos automaticos por horario | Automatic prices by time | Precios automaticos por horario |
| `features.aiRecs` | IA de Recomendacoes | AI Recommendations | Recomendaciones de IA |
| `features.aiRecsDesc` | Sugestoes inteligentes e harmonizacao | Smart suggestions and pairing | Sugerencias inteligentes y maridaje |
| `features.vip` | Programa VIP | VIP Program | Programa VIP |
| `features.vipDesc` | Areas exclusivas e beneficios | Exclusive areas and benefits | Areas exclusivas y beneficios |
| `features.experiences` | Pacotes de Experiencia | Experience Packages | Paquetes de experiencia |
| `features.reviews` | Avaliacoes Inteligentes | Smart Reviews | Resenas inteligentes |
| `features.analytics` | Analytics Avancado | Advanced Analytics | Analytics avanzado |
| `features.tierPremium` | Premium | Premium | Premium |
| `features.tierPro` | Pro | Pro | Pro |
| `features.tierFree` | Gratis | Free | Gratis |
| `features.upgradeRequired` | Requer upgrade de plano | Requires plan upgrade | Requiere actualizacion de plan |
| `features.moduleActive` | Modulo ativo e operacional | Module active and running | Modulo activo y operativo |

**Cenarios de teste:**

- Happy: Owner ativa "Programa de Fidelidade" — banner de confirmacao, LoyaltyScreen passa a ser visivel no Client App.
- Happy: Owner expande o card de "IA de Recomendacoes", le a descricao, ativa — toast de sucesso.
- Upgrade: Owner tenta ativar "Analytics Avancado" (Premium) sem plano — modal de upgrade exibido (stub).
- Permission: Manager tenta acessar config-features — 403.

---

## Efeitos em Cascata (Config para Platform)

| Configuracao Alterada | Partes Afetadas do Sistema |
|----------------------|---------------------------|
| `primaryServiceType` | Client App inteiro: layout, navegacao, flows, features disponiveis |
| `enabledServiceTypes` | Client App: features secundarias habilitadas por tipo |
| `reservationsEnabled` (experience) | Client App: exibir/ocultar tela de reservas; Maitre App: modo de operacao |
| `virtualQueueEnabled` (experience) | Client App: tela de fila virtual; Maitre App: painel de fila |
| `qrOrderingEnabled` (experience) | Client App: exibir QR como canal de pedido; config-floor: gerar QR Codes |
| `kitchenStations` | KDSScreen: tabs de estacoes; CookStation: tickets filtrados por estacao |
| `kitchenConfig.autoRouting` | Order Service: routing automatico de itens para estacoes |
| `kitchenConfig.kdsScreens` | KDS Gateway: numero de canais de WebSocket de KDS |
| Floor tables (CRUD) | FloorPlanScreen: mapa visual; TableListScreen: lista de mesas; Maitre: alocacao |
| Floor QR Codes | Client App: entrada via QR com tableId pre-carregado |
| `paymentConfig.methods` | PaymentScreen: botoes de metodo; WaiterPaymentScreen: opcoes de TAP |
| `paymentConfig.serviceChargePercent` | Order total: calculo automatico; PaymentScreen: linha de taxa |
| `paymentConfig.tipPercentages` | PaymentScreen: chips de gorjeta; TipsScreen: registro |
| `paymentConfig.splitModes` | PaymentScreen: modos de divisao disponiveis |
| Menu categories/items | MenuScreen: categorias e itens; KDS: mapeamento para estacoes |
| Category visibility rules | MenuScreen: ocultar/exibir categorias por horario automaticamente |
| `teamConfig.rolePermissions` | NavigationGuard: acessos por role; RBAC em todos os endpoints |
| `teamConfig.tipsPolicy` | TipsScreen: calculo e distribuicao de gorjetas |
| `enabledFeatures.loyaltyProgram` | Client App: LoyaltyScreen; Owner Dashboard: modulo de fidelidade |
| `enabledFeatures.aiRecommendations` | Client App: botao de harmonizacao/pairing; sugestoes inteligentes |
| `enabledFeatures.happyHourEngine` | Pricing Service: precificacao dinamica por horario |
| `enabledFeatures.eventsModule` | Client App: tab Eventos; Owner: gestao de ingressos |
| `enabledFeatures.advancedAnalytics` | Owner Dashboard: metricas avancadas e predicoes por IA |
| WebSocket `config:updated` | Todos os dispositivos conectados recarregam a secao afetada |

---

## Setup Wizard Inicial (4 Steps)

Para novos restaurantes, o Setup Wizard guia o Owner pelos 4 passos essenciais antes de comecar a operar. Mapeado do `SetupScreens.tsx` e do `SetupHubScreen.tsx` existentes.

**Arquivo existente:** `/mobile/apps/restaurant/src/screens/setup-hub/SetupHubScreen.tsx`

### Step 1 — Perfil

- Campos: Nome do restaurante, descricao curta, foto de perfil (camera/galeria), endereco, telefone, horario de funcionamento.
- Mesmo schema de `config-profile` mas em modo wizard (progressivo).
- Ao completar: marca step '1' como concluido via `PATCH /restaurants/:id/setup-progress`.

### Step 2 — Tipo de Servico

- Grid com os 11 tipos. Selecao de 1 tipo primario obrigatoria.
- Preview das features que serao habilitadas ao selecionar cada tipo.
- Ao completar: salva `primaryServiceType` e marca step '2' como concluido.

### Step 3 — Recursos (Features & Experiencia)

- Lista de features basicas com toggles: Wi-Fi, Estacionamento, Acessivel, Pet Friendly, Terraco, Carta de Vinhos, Reservas Online, QR Code nas Mesas.
- Ao completar: salva `experienceFlags` e marca step '3' como concluido.

### Step 4 — Pagamentos

- Configuracao basica: taxa de servico (percentual), gorjeta (sim/nao, percentuais sugeridos), split bill (modos disponiveis), metodos aceitos.
- Ao completar: salva `paymentConfig` e marca step '4' como concluido.
- Tela de sucesso: "Configuracao Completa! Seu restaurante esta pronto para operar." com botao para ir ao Dashboard.

**API Endpoint para Setup Wizard:**
```
POST /config/setup
Body: {
  restaurantId: string;
  profile: UpdateConfigProfileDto;
  primaryServiceType: string;
  experienceFlags: Partial<ExperienceFlagsDto>;
  paymentConfig: Partial<PaymentConfigDto>;
}
// Cria o registro RestaurantConfig com todos os defaults e os dados fornecidos.
// Resposta: { configId: string; completedSteps: string[]; setupProgress: number }
```

**Progresso calculado no SetupHubScreen:**
```typescript
const requiredSteps = steps.filter(s => s.required); // passos 1-5
const completedRequired = requiredSteps.filter(s => s.completed).length;
const progress = completedRequired / requiredSteps.length; // 0 a 1
```

---

## Sequencia de Implementacao

### Sprint 4 — Fase 1: Fundacao (Semanas 1-2)

1. **Backend:** Criar entidade `RestaurantConfig` e migration.
2. **Backend:** Criar modulo `service-config` com controller, service e gateway WebSocket.
3. **Backend:** Expandir tabela `tables` com campos `section`, `shape`, `position`, `qrCodeUrl`.
4. **Mobile:** Criar `ConfigHubIndexScreen` com listagem de modulos e progresso.
5. **Mobile:** Implementar `ConfigGuard` (RBAC para config screens).

### Sprint 4 — Fase 2: Features Criticas (Semanas 3-4)

6. **Mobile:** `ConfigProfileScreen` com inline edit, upload de imagem, horarios.
7. **Mobile:** `ConfigServiceTypesScreen` com selecao de tipo primario e features.
8. **Mobile:** `ConfigFloorScreen` com CRUD de mesas, zonas e geracao de QR Code.
9. **Mobile:** `ConfigPaymentsScreen` com metodos, taxa de servico e split modes.
10. **Backend + Mobile:** Setup Wizard (POST /config/setup) integrado ao SetupHubScreen.

### Sprint 5 — Fase 3: Features Operacionais

11. **Mobile:** `ConfigKitchenScreen` com estacoes de preparo e routing KDS.
12. **Mobile:** `ConfigExperienceScreen` com feature flags e jornada do cliente.
13. **Mobile:** `ConfigMenuScreen` com CRUD de categorias, itens e visibility rules.
14. **Mobile:** `ConfigTeamScreen` com membros, roles e politica de gorjetas.
15. **Mobile:** `ConfigFeaturesScreen` com marketplace de features globais.

### Sprint 5 — Fase 4: Integracao e Cascata

16. Integrar `useFeatureGate` hook em todas as telas que dependem de feature flags.
17. Integrar `config:updated` WebSocket para recarregar configs em tempo real.
18. Testes E2E: fluxo completo Owner, fluxo Manager com restricoes de RBAC.
19. Testes de cascata: alterar config e verificar reflexo no Client App.

---

## Definition of Done

Para cada User Story deste epico:

- [ ] Componente mobile implementado com `useColors()` e `useMemo` para styles.
- [ ] Validacao com React Hook Form + Zod em todos os campos do formulario.
- [ ] i18n implementado nos 3 idiomas (PT-BR, EN, ES) — zero string hardcoded visivel ao usuario.
- [ ] RBAC implementado: Owner e Manager com niveis corretos de acesso; outros roles redirecionados.
- [ ] API integrada: GET para carregar, PATCH para salvar. Loading state e error state implementados.
- [ ] Toast de sucesso apos salvar. Toast de erro descritivo em caso de falha.
- [ ] WebSocket `config:updated` emitido pelo backend apos cada PATCH bem-sucedido.
- [ ] Testes unitarios para o service do modulo (jest).
- [ ] Testes de integracao para os endpoints do controller (supertest).
- [ ] Swagger documentado para cada endpoint (ApiOperation, ApiResponse, ApiBearerAuth).
- [ ] Snapshot/component test para a tela mobile.
- [ ] Cenarios de erro testados: rede off, 403, 404, 422 (validacao).
- [ ] Design tokens usados (sem cores hardcoded).
- [ ] Acessibilidade: labels em todos os inputs, hints para screen readers.
- [ ] Efeito em cascata verificado manualmente: alterar a config e confirmar que as telas dependentes refletem a mudanca.
