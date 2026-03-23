# EPICO 5 — Stock / Inventory Management

**Prioridade:** ALTA | **Sprint:** 3
**Roles autorizados:** MANAGER, OWNER, CHEF, BARMAN
**App:** Restaurant App (React Native 0.74 + Expo 51)
**Backend:** NestJS 10.4 + PostgreSQL + TypeORM

---

## Visao Geral

Este epico cobre o sistema de controle de estoque do NOOWE. O objetivo e dar visibilidade em tempo real ao nivel de insumos e bebidas, emitindo alertas automaticos quando itens atingem niveis criticos, e permitir que o gerente, chef ou barman atualizem os niveis manualmente apos recebimento de mercadorias ou consumo extraordinario.

A tela de estoque (Feature 5.1) e **compartilhada entre roles diferentes**, porem com permissoes distintas: Manager e Owner podem ver tudo e atualizar qualquer item; Chef visualiza e atualiza apenas itens da categoria cozinha (Carnes, Graos, Hortalicas, Lacticinios, etc.); Barman visualiza e atualiza apenas itens de bebidas e insumos de bar.

O sistema de alertas usa tres niveis visuais baseados no percentual de estoque restante em relacao ao minimo configurado:
- **OK** (verde / `--success`): nivel atual >= 50% do minimo
- **Baixo / Low** (laranja / `--warning`): nivel atual entre 20% e 49% do minimo
- **Critico / Critical** (vermelho / `--destructive`): nivel atual < 20% do minimo

**Referencia de implementacao no demo:** `src/components/demo/restaurant/RoleScreens.tsx` — componente `StockScreen` (linhas 521-594).

---

## Pre-requisitos

- [ ] Epico 1 concluido: autenticacao JWT, guards `JwtAuthGuard` + `RolesGuard`
- [ ] Roles `MANAGER`, `OWNER`, `CHEF`, `BARMAN` definidos no enum `UserRole` (ver `backend/src/common/enums/user-role.enum.ts`)
- [ ] Modulo `restaurants` existente com entidade `Restaurant`
- [ ] Modulo `menu-items` existente (referencia para categorias de itens)
- [ ] Contexto i18n configurado (PT-BR, EN, ES) via hook `useI18n`
- [ ] Design tokens definidos: `--success`, `--warning`, `--destructive`

---

## Novo Modulo Backend: inventory

O modulo `inventory` nao existe ainda no backend. Deve ser criado seguindo os padroes do projeto, similar ao modulo `menu-items` (CRUD + queries filtradas).

### Localizacao dos arquivos

```
backend/src/modules/inventory/
  inventory.module.ts
  inventory.controller.ts
  inventory.service.ts
  entities/
    inventory-item.entity.ts
  dto/
    create-inventory-item.dto.ts
    update-inventory-item.dto.ts
    update-item-level.dto.ts
  migrations/
    YYYYMMDDHHMMSS-CreateInventoryItemsTable.ts
```

### Entity InventoryItem

```typescript
// backend/src/modules/inventory/entities/inventory-item.entity.ts

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

export enum InventoryCategory {
  MEATS      = 'meats',       // Carnes
  GRAINS     = 'grains',      // Graos e cereais
  VEGETABLES = 'vegetables',  // Hortalicas e legumes
  DAIRY      = 'dairy',       // Lacticinios
  BEVERAGES  = 'beverages',   // Bebidas
  SPIRITS    = 'spirits',     // Destilados e alcoolicos
  CONDIMENTS = 'condiments',  // Temperos e condimentos
  PACKAGING  = 'packaging',   // Embalagens e descartaveis
  CLEANING   = 'cleaning',    // Produtos de limpeza
  OTHER      = 'other',       // Outros
}

export enum InventoryUnit {
  KG   = 'kg',
  G    = 'g',
  L    = 'l',
  ML   = 'ml',
  UN   = 'un',     // Unidades
  CX   = 'cx',     // Caixas
  PCT  = 'pct',    // Pacotes
  DZ   = 'dz',     // Duzias
}

@Entity('inventory_items')
@Index(['restaurant_id'])
@Index(['category'])
@Index(['restaurant_id', 'category'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column()
  name: string;                       // Nome do insumo (ex: "File Mignon", "Cachaça Artesanal")

  @Column({ type: 'enum', enum: InventoryCategory })
  category: InventoryCategory;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  current_level: number;              // Quantidade atual em estoque

  @Column({ type: 'enum', enum: InventoryUnit })
  unit: InventoryUnit;                // Unidade de medida

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  min_level: number;                  // Nivel minimo aceitavel (dispara alertas)

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  max_level: number;                  // Nivel maximo (para planejamento de compras)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_cost: number;                  // Custo unitario (para calculo de valor do estoque)

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;                      // Observacoes livres

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;                   // Ultimo update (auditoria de quando o nivel mudou)

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  // Campo virtual calculado (nao persistido)
  // status: 'ok' | 'low' | 'critical'
  // Calculado com base em: (current_level / min_level) * 100
  // >50% = ok, 20-50% = low, <20% = critical
}
```

### Logica de calculo de status

O status de um item NAO deve ser persistido no banco (evitar inconsistencias). Deve ser calculado no service ao montar a resposta:

```typescript
// backend/src/modules/inventory/inventory.service.ts

function computeStatus(item: InventoryItem): 'ok' | 'low' | 'critical' {
  const pct = (item.current_level / item.min_level) * 100;
  if (pct < 20) return 'critical';
  if (pct < 50) return 'low';
  return 'ok';
}

// InventoryItemResponse inclui status calculado
interface InventoryItemResponse extends InventoryItem {
  status: 'ok' | 'low' | 'critical';
  level_pct: number;  // percentual para barra de progresso
}
```

### DTOs

```typescript
// dto/create-inventory-item.dto.ts
export class CreateInventoryItemDto {
  restaurant_id: string;        // UUID
  name: string;                 // max 100 chars
  category: InventoryCategory;
  current_level: number;        // >= 0
  unit: InventoryUnit;
  min_level: number;            // > 0
  max_level?: number;           // opcional, > min_level se informado
  unit_cost?: number;           // >= 0
  notes?: string;
}

// dto/update-inventory-item.dto.ts
export class UpdateInventoryItemDto extends PartialType(CreateInventoryItemDto) {}

// dto/update-item-level.dto.ts
// Endpoint dedicado para atualizacao rapida de nivel (uso operacional)
export class UpdateItemLevelDto {
  current_level: number;   // novo nivel
  notes?: string;          // motivo da atualizacao (ex: "Entrega recebida")
}
```

### Controller Endpoints

```typescript
// backend/src/modules/inventory/inventory.controller.ts

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {

  // GET /inventory?restaurantId=&category=&status=
  // Roles: MANAGER, OWNER, CHEF, BARMAN
  // Retorna lista completa com status calculado
  // Query params:
  //   restaurantId: string (obrigatorio)
  //   category: InventoryCategory (opcional)
  //   status: 'ok' | 'low' | 'critical' (opcional, para filtro frontend)
  @Get()
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  findAll(
    @Query('restaurantId') restaurantId: string,
    @Query('category') category?: InventoryCategory,
    @Query('status') status?: string,
  ) { ... }

  // GET /inventory/alerts?restaurantId=
  // Roles: MANAGER, OWNER, CHEF, BARMAN
  // Retorna apenas itens com status 'low' ou 'critical', ordenados por urgencia
  // Usado por: Manager Ops Panel (preview de alertas), Barman Station, Config Kitchen
  @Get('alerts')
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  getAlerts(@Query('restaurantId') restaurantId: string) { ... }

  // GET /inventory/stats?restaurantId=
  // Roles: MANAGER, OWNER
  // Retorna: { total, ok, low, critical, estimatedStockValue }
  @Get('stats')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  getStats(@Query('restaurantId') restaurantId: string) { ... }

  // GET /inventory/:id
  // Roles: MANAGER, OWNER, CHEF, BARMAN
  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  findOne(@Param('id') id: string) { ... }

  // POST /inventory
  // Roles: MANAGER, OWNER
  // Cria novo item de estoque
  @Post()
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  create(@Body() dto: CreateInventoryItemDto) { ... }

  // PATCH /inventory/:id
  // Roles: MANAGER, OWNER
  // Atualiza configuracoes do item (nome, categoria, minimo, maximo, custo)
  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) { ... }

  // PATCH /inventory/:id/level
  // Roles: MANAGER, OWNER, CHEF, BARMAN
  // Atualizacao rapida do nivel atual (operacao de campo)
  // Mais granular e auditavel que PATCH :id
  @Patch(':id/level')
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  updateLevel(
    @Param('id') id: string,
    @Body() dto: UpdateItemLevelDto,
    @CurrentUser() user: any,
  ) { ... }

  // DELETE /inventory/:id
  // Roles: MANAGER, OWNER
  // Soft delete (is_active = false)
  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  remove(@Param('id') id: string) { ... }
}
```

**Resposta padrao de item (com status calculado):**
```json
{
  "id": "uuid-aqui",
  "name": "File Mignon",
  "category": "meats",
  "current_level": 2.5,
  "unit": "kg",
  "min_level": 10,
  "max_level": 30,
  "unit_cost": 89.90,
  "status": "critical",
  "level_pct": 25,
  "notes": null,
  "updated_at": "2026-03-23T14:30:00Z"
}
```

### Migration

```typescript
// Criar via: npx typeorm migration:create src/modules/inventory/migrations/CreateInventoryItemsTable

export class CreateInventoryItemsTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE inventory_category_enum AS ENUM (
        'meats', 'grains', 'vegetables', 'dairy',
        'beverages', 'spirits', 'condiments', 'packaging', 'cleaning', 'other'
      );
      CREATE TYPE inventory_unit_enum AS ENUM (
        'kg', 'g', 'l', 'ml', 'un', 'cx', 'pct', 'dz'
      );

      CREATE TABLE inventory_items (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id  UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        name           VARCHAR(100) NOT NULL,
        category       inventory_category_enum NOT NULL,
        current_level  DECIMAL(10,3) NOT NULL CHECK (current_level >= 0),
        unit           inventory_unit_enum NOT NULL,
        min_level      DECIMAL(10,3) NOT NULL CHECK (min_level > 0),
        max_level      DECIMAL(10,3),
        unit_cost      DECIMAL(10,2),
        is_active      BOOLEAN NOT NULL DEFAULT TRUE,
        notes          TEXT,
        created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX idx_inventory_restaurant ON inventory_items(restaurant_id);
      CREATE INDEX idx_inventory_category ON inventory_items(category);
      CREATE INDEX idx_inventory_restaurant_category ON inventory_items(restaurant_id, category);
      CREATE INDEX idx_inventory_active ON inventory_items(restaurant_id, is_active);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS inventory_items;
      DROP TYPE IF EXISTS inventory_category_enum;
      DROP TYPE IF EXISTS inventory_unit_enum;
    `);
  }
}
```

---

## FEATURE 5.1 — Stock Screen

**Descricao:** Tela de visualizacao e gestao de estoque. Compartilhada entre roles MANAGER, OWNER, CHEF e BARMAN. Exibe todos os insumos do restaurante com alertas visuais de nivel, filtros por status e a possibilidade de atualizar o nivel de um item diretamente pelo app.

---

### US-5.1.1 — Ver estoque atual com alertas visuais

**Como** gerente/chef/barman, **quero** ver o nivel de todos os insumos com indicadores visuais de status, **para** identificar rapidamente o que precisa ser reposto antes que acabe.

#### Criterios de aceite

- [ ] Exibir stats no topo: OK (verde), Baixo (laranja), Critico (vermelho) com contador de itens em cada estado
- [ ] Lista de itens com: icone de Package colorido por status, nome, categoria, nivel atual + unidade, nivel minimo e barra de progresso colorida
- [ ] Barra de progresso: largura = `(current_level / min_level) * 100%` (limitado a 100%), cor baseada no status
- [ ] Itens criticos tem fundo vermelho claro (`bg-destructive/5`); itens com nivel baixo tem fundo laranja claro (`bg-warning/5`)
- [ ] Itens OK tem fundo neutro (sem destaque)
- [ ] Lista ordenada: criticos primeiro, despois low, depois ok
- [ ] Skeleton loading na carga inicial
- [ ] Pull-to-refresh para atualizar dados

#### Specs tecnicos

**Arquivo a criar:**
```
mobile/apps/restaurant/src/screens/stock/StockScreen.tsx
```

**APIs consumidas:**
- `GET /inventory?restaurantId={id}` — lista completa de itens com status calculado
- `GET /inventory/stats?restaurantId={id}` — contadores para o header

**Tipo frontend:**
```typescript
// mobile/apps/restaurant/src/types/inventory.ts

export type InventoryStatus = 'ok' | 'low' | 'critical';
export type InventoryCategory =
  | 'meats' | 'grains' | 'vegetables' | 'dairy'
  | 'beverages' | 'spirits' | 'condiments' | 'packaging' | 'cleaning' | 'other';
export type InventoryUnit = 'kg' | 'g' | 'l' | 'ml' | 'un' | 'cx' | 'pct' | 'dz';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  currentLevel: number;
  unit: InventoryUnit;
  minLevel: number;
  maxLevel: number | null;
  unitCost: number | null;
  status: InventoryStatus;    // calculado pelo backend
  levelPct: number;           // percentual para a barra de progresso
  notes: string | null;
  updatedAt: string;          // ISO 8601
}

export interface InventoryStats {
  total: number;
  ok: number;
  low: number;
  critical: number;
  estimatedStockValue: number | null;
}
```

**Mapeamento de status para design tokens:**
```typescript
// Utilitario de cores por status
export const inventoryStatusConfig = {
  ok: {
    color: colors.success,
    backgroundColor: colors.success + '1A',  // ~10% opacity
    label: t('stock.statusOk'),
  },
  low: {
    color: colors.warning,
    backgroundColor: colors.warning + '1A',
    label: t('stock.statusLow'),
  },
  critical: {
    color: colors.destructive,
    backgroundColor: colors.destructive + '0D',  // ~5% opacity
    label: t('stock.statusCritical'),
  },
};
```

**Ordenacao dos itens:**
```typescript
const sortedItems = useMemo(() => {
  const order = { critical: 0, low: 1, ok: 2 };
  return [...items].sort((a, b) => order[a.status] - order[b.status]);
}, [items]);
```

**Estrutura do componente principal:**
```tsx
export default function StockScreen({ navigation }) {
  const { t } = useI18n();
  const colors = useColors();
  const { restaurantId, userRole } = useAuth();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'low' | 'critical'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canEdit = [UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN]
    .includes(userRole);

  const filteredItems = useMemo(() => {
    const sorted = sortByStatus(items);
    if (filter === 'all') return sorted;
    if (filter === 'critical') return sorted.filter(i => i.status === 'critical');
    return sorted.filter(i => i.status !== 'ok');  // low + critical
  }, [items, filter]);

  // ... load, refresh, render
}
```

#### Chaves i18n

```json
// PT-BR
{
  "stock": {
    "title": "Estoque",
    "statsOk": "OK",
    "statsLow": "Baixo",
    "statsCritical": "Critico",
    "filterAll": "Todos",
    "filterLow": "Baixo Estoque",
    "filterCritical": "Critico",
    "statusOk": "OK",
    "statusLow": "Baixo",
    "statusCritical": "Critico",
    "minLevel": "min: {{value}} {{unit}}",
    "categoryMeats": "Carnes",
    "categoryGrains": "Graos",
    "categoryVegetables": "Hortalicas",
    "categoryDairy": "Lacticinios",
    "categoryBeverages": "Bebidas",
    "categorySpirits": "Destilados",
    "categoryCondiments": "Temperos",
    "categoryPackaging": "Embalagens",
    "categoryCleaning": "Limpeza",
    "categoryOther": "Outros",
    "emptyTitle": "Nenhum item no estoque",
    "emptySubtitle": "Adicione itens para comecar o controle de estoque",
    "emptyFilterTitle": "Nenhum item nesta categoria",
    "emptyFilterSubtitle": "Tente outro filtro"
  }
}
```

```json
// EN
{
  "stock": {
    "title": "Inventory",
    "statsOk": "OK",
    "statsLow": "Low",
    "statsCritical": "Critical",
    "filterAll": "All",
    "filterLow": "Low Stock",
    "filterCritical": "Critical",
    "statusOk": "OK",
    "statusLow": "Low",
    "statusCritical": "Critical",
    "minLevel": "min: {{value}} {{unit}}",
    "categoryMeats": "Meats",
    "categoryGrains": "Grains",
    "categoryVegetables": "Vegetables",
    "categoryDairy": "Dairy",
    "categoryBeverages": "Beverages",
    "categorySpirits": "Spirits",
    "categoryCondiments": "Condiments",
    "categoryPackaging": "Packaging",
    "categoryCleaning": "Cleaning",
    "categoryOther": "Other",
    "emptyTitle": "No items in stock",
    "emptySubtitle": "Add items to start tracking inventory",
    "emptyFilterTitle": "No items in this category",
    "emptyFilterSubtitle": "Try a different filter"
  }
}
```

```json
// ES
{
  "stock": {
    "title": "Inventario",
    "statsOk": "OK",
    "statsLow": "Bajo",
    "statsCritical": "Critico",
    "filterAll": "Todos",
    "filterLow": "Stock Bajo",
    "filterCritical": "Critico",
    "statusOk": "OK",
    "statusLow": "Bajo",
    "statusCritical": "Critico",
    "minLevel": "min: {{value}} {{unit}}",
    "categoryMeats": "Carnes",
    "categoryGrains": "Cereales",
    "categoryVegetables": "Verduras",
    "categoryDairy": "Lacteos",
    "categoryBeverages": "Bebidas",
    "categorySpirits": "Licores",
    "categoryCondiments": "Condimentos",
    "categoryPackaging": "Embalajes",
    "categoryCleaning": "Limpieza",
    "categoryOther": "Otros",
    "emptyTitle": "No hay elementos en el inventario",
    "emptySubtitle": "Agrega elementos para comenzar el control de inventario",
    "emptyFilterTitle": "No hay elementos en esta categoria",
    "emptyFilterSubtitle": "Prueba otro filtro"
  }
}
```

#### Cenarios de teste

| ID     | Cenario                                              | Resultado esperado                                                        |
|--------|------------------------------------------------------|---------------------------------------------------------------------------|
| T5.1.1 | Abrir tela com itens em todos os status              | Stats corretos; criticos aparecem primeiro na lista                       |
| T5.1.2 | Item com `levelPct` = 15 (critico)                   | Fundo vermelho claro; barra vermelha; icone vermelho; valor em destructive |
| T5.1.3 | Item com `levelPct` = 35 (low)                       | Fundo laranja claro; barra laranja; icone laranja; valor em warning        |
| T5.1.4 | Item com `levelPct` = 80 (ok)                        | Fundo neutro; barra verde; icone verde; valor em texto padrao              |
| T5.1.5 | Pull-to-refresh executado                            | Dados recarregados; stats atualizados                                     |
| T5.1.6 | Nenhum item cadastrado                               | Empty state com titulo e subtitulo i18n                                   |
| T5.1.7 | Abrir tela como CHEF                                 | Lista exibe itens (sem restricao de exibicao, mas sem botoes de config)   |
| T5.1.8 | Stats: 3 OK, 2 Low, 1 Critical                       | Contador exibe exatamente esses valores na header                         |

---

### US-5.1.2 — Filtrar por status (baixo/critico)

**Como** gerente/chef/barman, **quero** filtrar a lista de estoque por status, **para** focar nos itens que precisam de atencao imediata sem ter que rolar por toda a lista.

#### Criterios de aceite

- [ ] Tres botoes de filtro: "Todos", "Baixo Estoque", "Critico"
- [ ] Botao ativo tem estilo primario (`bg-primary text-primary-foreground`)
- [ ] Botao inativo tem estilo secundario (`bg-muted text-muted-foreground`)
- [ ] Filtro "Baixo Estoque" exibe itens com status `low` E `critical`
- [ ] Filtro "Critico" exibe apenas itens com status `critical`
- [ ] Ao ativar um filtro que resulta em lista vazia, exibir empty state especifico ("Nenhum item nesta categoria")
- [ ] Filtro e state local (sem chamada adicional de API); a filtragem ocorre sobre os dados ja carregados
- [ ] Counter nos stats do topo permanece mostrando totais globais independente do filtro ativo

#### Specs tecnicos

**Implementacao do filtro (state local):**
```typescript
// Sem nova chamada de API — filtra sobre items ja em memoria
const [filter, setFilter] = useState<'all' | 'low' | 'critical'>('all');

const filteredItems = useMemo(() => {
  const sorted = sortByStatus(items);  // criticos primeiro
  switch (filter) {
    case 'critical':
      return sorted.filter(i => i.status === 'critical');
    case 'low':
      // "Baixo Estoque" mostra low + critical
      return sorted.filter(i => i.status !== 'ok');
    default:
      return sorted;
  }
}, [items, filter]);
```

**Componente FilterBar:**
```tsx
// Pode ser extraido como componente reutilizavel
interface FilterBarProps {
  value: 'all' | 'low' | 'critical';
  onChange: (filter: 'all' | 'low' | 'critical') => void;
  counts: { all: number; low: number; critical: number };
}

// Os counts permitem exibir badge numerica em cada botao (opcional, melhoria UX)
```

#### Chaves i18n

As chaves de filtro ja estao cobertas em US-5.1.1:
- `stock.filterAll`, `stock.filterLow`, `stock.filterCritical`
- `stock.emptyFilterTitle`, `stock.emptyFilterSubtitle`

#### Cenarios de teste

| ID     | Cenario                                              | Resultado esperado                                                        |
|--------|------------------------------------------------------|---------------------------------------------------------------------------|
| T5.2.1 | Toque em filtro "Critico" com 2 criticos e 3 low     | Lista exibe apenas os 2 criticos; botao "Critico" ativo                   |
| T5.2.2 | Toque em filtro "Baixo Estoque"                      | Lista exibe low + criticos (5 itens no exemplo acima)                     |
| T5.2.3 | Toque em "Todos" apos filtro ativo                   | Lista completa restaurada; botao "Todos" ativo                            |
| T5.2.4 | Filtro "Critico" sem itens criticos                  | Empty state "Nenhum item nesta categoria"                                 |
| T5.2.5 | Stats no topo com filtro "Critico" ativo             | Stats continuam mostrando totais globais (nao filtrados)                  |

---

### US-5.1.3 — Atualizar nivel de item

**Como** gerente/chef/barman, **quero** atualizar o nivel atual de um item de estoque diretamente pelo app, **para** registrar recebimento de mercadorias ou ajuste apos inventario fisico sem precisar de um sistema separado.

#### Criterios de aceite

- [ ] Ao tocar em um item da lista, abrir um bottom sheet ou modal com detalhes do item e campo de edicao do nivel
- [ ] Campo de nivel: input numerico com teclado numerico, pre-preenchido com valor atual
- [ ] Campo de nota opcional: descricao do motivo (ex: "Entrega recebida", "Ajuste de inventario")
- [ ] Botao "Salvar" ativo apenas quando nivel >= 0 e diferente do valor atual
- [ ] Apos salvar com sucesso: fechar modal, atualizar item na lista (estado otimista), exibir toast de sucesso
- [ ] Se API retornar erro: toast de erro, nao atualizar a lista
- [ ] Exibir nivel minimo como referencia no modal ("Minimo: {{value}} {{unit}}")
- [ ] Se novo nivel < minimo: mostrar aviso amarelo "Nivel abaixo do minimo" (nao bloquear o save)
- [ ] Roles que NAO podem editar (sem o CRUD, mas com o PATCH level): nenhum — todos os 4 roles autorizados tem acesso ao PATCH level
- [ ] Roles que nao estao na lista de autorizados nao verao o item como tocavel (read-only)

#### Specs tecnicos

**API chamada:**
```
PATCH /inventory/:id/level
Authorization: Bearer {jwt}
Content-Type: application/json

Body:
{
  "current_level": 15.5,
  "notes": "Entrega recebida — NF 12345"
}

Response 200:
{
  "id": "uuid",
  "name": "File Mignon",
  "current_level": 15.5,
  "status": "ok",
  "level_pct": 155,
  "updated_at": "2026-03-23T15:00:00Z"
}
```

**Componente UpdateLevelModal:**
```typescript
// mobile/apps/restaurant/src/screens/stock/UpdateLevelModal.tsx

interface UpdateLevelModalProps {
  item: InventoryItem;
  visible: boolean;
  onClose: () => void;
  onSuccess: (updatedItem: InventoryItem) => void;
}
```

**Fluxo no StockScreen:**
```typescript
const handleUpdateLevel = async (itemId: string, level: number, notes?: string) => {
  try {
    const updated = await ApiService.updateInventoryLevel(itemId, { current_level: level, notes });
    // Atualizar item na lista local
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, ...updated } : i));
    // Atualizar stats localmente
    refreshStats();
    showToast({ type: 'success', message: t('stock.updateSuccess') });
    setSelectedItem(null);  // fechar modal
  } catch (error) {
    showToast({ type: 'error', message: t('stock.updateError') });
  }
};
```

**Aviso de nivel abaixo do minimo:**
```tsx
{newLevel < item.minLevel && newLevel >= 0 && (
  <View style={styles.warningBanner}>
    <Text style={{ color: colors.warning }}>
      {t('stock.belowMinWarning', { min: item.minLevel, unit: item.unit })}
    </Text>
  </View>
)}
```

#### Chaves i18n adicionais

```json
// PT-BR
{
  "stock": {
    "updateLevelTitle": "Atualizar Estoque",
    "currentLevelLabel": "Nivel Atual",
    "newLevelLabel": "Novo Nivel",
    "notesLabel": "Motivo (opcional)",
    "notesPlaceholder": "Ex: Entrega recebida, Ajuste de inventario...",
    "minLevelRef": "Minimo: {{value}} {{unit}}",
    "belowMinWarning": "Nivel abaixo do minimo configurado ({{min}} {{unit}})",
    "saveButton": "Salvar",
    "cancelButton": "Cancelar",
    "updateSuccess": "Nivel atualizado com sucesso",
    "updateError": "Erro ao atualizar nivel. Tente novamente.",
    "addItemButton": "Adicionar Item"
  }
}
```

```json
// EN
{
  "stock": {
    "updateLevelTitle": "Update Stock Level",
    "currentLevelLabel": "Current Level",
    "newLevelLabel": "New Level",
    "notesLabel": "Reason (optional)",
    "notesPlaceholder": "E.g. Delivery received, Manual adjustment...",
    "minLevelRef": "Minimum: {{value}} {{unit}}",
    "belowMinWarning": "Level below configured minimum ({{min}} {{unit}})",
    "saveButton": "Save",
    "cancelButton": "Cancel",
    "updateSuccess": "Level updated successfully",
    "updateError": "Error updating level. Please try again.",
    "addItemButton": "Add Item"
  }
}
```

```json
// ES
{
  "stock": {
    "updateLevelTitle": "Actualizar Nivel de Stock",
    "currentLevelLabel": "Nivel Actual",
    "newLevelLabel": "Nuevo Nivel",
    "notesLabel": "Motivo (opcional)",
    "notesPlaceholder": "Ej: Entrega recibida, Ajuste de inventario...",
    "minLevelRef": "Minimo: {{value}} {{unit}}",
    "belowMinWarning": "Nivel por debajo del minimo configurado ({{min}} {{unit}})",
    "saveButton": "Guardar",
    "cancelButton": "Cancelar",
    "updateSuccess": "Nivel actualizado con exito",
    "updateError": "Error al actualizar el nivel. Intentalo de nuevo.",
    "addItemButton": "Agregar Elemento"
  }
}
```

#### Cenarios de teste

| ID     | Cenario                                              | Resultado esperado                                                        |
|--------|------------------------------------------------------|---------------------------------------------------------------------------|
| T5.3.1 | Tocar em item como MANAGER                           | Modal/bottom sheet abre com nivel atual pre-preenchido                    |
| T5.3.2 | Digitar nivel = 0 (zerado)                           | Sem aviso de abaixo do minimo; botao Salvar ativo; status vira critical   |
| T5.3.3 | Digitar nivel abaixo do minimo                       | Banner de aviso amarelo exibido; Salvar nao bloqueado                     |
| T5.3.4 | Salvar nivel acima do minimo para item critico        | Item atualiza para status ok; barra de progresso verde                    |
| T5.3.5 | Salvar com erro de rede                              | Toast de erro; lista NAO atualizada; modal permanece aberto               |
| T5.3.6 | Salvar com nota preenchida                           | Nota enviada no body; confirmado no backend (campo `notes`)               |
| T5.3.7 | Nivel igual ao valor atual                            | Botao "Salvar" permanece desabilitado                                     |
| T5.3.8 | Tocar em item sem ser role autorizado                | Nenhuma acao (item nao e tocavel ou modal em read-only)                   |

---

## Integracao em outros epicos

O modulo de estoque (`inventory`) e referenciado por outras features do sistema. Aqui estao os pontos de integracao:

### Manager Ops Panel (Epico 4 — Feature 4.1)

O Manager Ops Panel deve exibir um **preview de alertas de estoque** (itens criticos) como um componente adicional:

```typescript
// Adicionar a ManagerOpsScreen.tsx apos o Live Orders Feed:

// API: GET /inventory/alerts?restaurantId={id}
// Exibir primeiros 3 itens criticos com nome, nivel atual e badge vermelho
// Botao "Ver estoque completo" navega para StockScreen
```

**Nova secao no Manager Ops Panel:**
- Titulo: "Alertas de Estoque"
- Exibir ate 3 itens criticos (badge `CRITICO` em vermelho)
- Se nenhum item critico: secao oculta (nao mostrar "tudo ok" para economizar espaco)
- Botao "Ver estoque" navega para `StockScreen`

### Barman Station (Epico existente / futuro)

O `BarmanStationScreen` pode incluir um widget de estoque filtrado para categoria `beverages` e `spirits`:

```typescript
// GET /inventory/alerts?restaurantId={id}&category=beverages
// GET /inventory/alerts?restaurantId={id}&category=spirits
// Combinar e exibir os top 5 alertas no widget lateral da estacao
```

### Config Kitchen / Chef Station

O `KDSScreen` ou uma tela de configuracao da cozinha pode incluir widget de estoque para categorias:
- `meats`, `grains`, `vegetables`, `dairy`, `condiments`

```typescript
// GET /inventory?restaurantId={id}&category=meats&status=critical
// Exibir como banner de alerta na KDS se houver itens criticos
```

### Navegacao

```
// Arquivos de navegacao a criar/modificar:
mobile/apps/restaurant/src/navigation/ManagerNavigator.tsx
  → Adicionar stack: StockScreen acessivel via tab ou botao no ManagerOpsPanel

mobile/apps/restaurant/src/navigation/ChefNavigator.tsx (se existir)
  → Adicionar tab/botao para StockScreen (filtrado por categorias de cozinha)

mobile/apps/restaurant/src/navigation/BarmanNavigator.tsx (se existir)
  → Adicionar tab/botao para StockScreen (filtrado por bebidas e destilados)
```

---

## Sequencia de Implementacao

A ordem abaixo respeita as dependencias entre backend e frontend e minimiza trabalho re-feito:

1. **Backend — Migration:** criar tabela `inventory_items` com enum types
2. **Backend — Entity:** implementar `InventoryItem` entity com `InventoryCategory` e `InventoryUnit` enums
3. **Backend — DTOs:** criar `CreateInventoryItemDto`, `UpdateInventoryItemDto`, `UpdateItemLevelDto`
4. **Backend — Service:** implementar `InventoryService` com `findAll` (com logica de status), `findAlerts`, `getStats`, `create`, `update`, `updateLevel`, `remove`
5. **Backend — Controller:** implementar `InventoryController` com todos os endpoints documentados
6. **Backend — Module:** registrar em `InventoryModule` e importar em `AppModule`
7. **Backend — Seed (opcional):** criar seed com ~15 itens de estoque para facilitar testes e demos
8. **Frontend — Types:** criar `mobile/apps/restaurant/src/types/inventory.ts`
9. **Frontend — API Service:** adicionar metodos `getInventory`, `getInventoryAlerts`, `getInventoryStats`, `updateInventoryLevel`, `createInventoryItem` em `ApiService`
10. **Frontend — US-5.1.1:** implementar `StockScreen` com lista e stats
11. **Frontend — US-5.1.2:** adicionar logica de filtro na `StockScreen` (nao requer nova tela)
12. **Frontend — US-5.1.3:** implementar `UpdateLevelModal` e integrar na `StockScreen`
13. **Frontend — Integracao Manager Ops:** adicionar widget de alertas de estoque no `ManagerOpsScreen`
14. **Frontend — Navegacao:** registrar `StockScreen` nos navigators de cada role

---

## Definition of Done

- [ ] Tabela `inventory_items` criada via migration sem erros em ambiente local e staging
- [ ] Todos os endpoints do modulo `inventory` retornam respostas corretas com campo `status` calculado dinamicamente
- [ ] Endpoint `GET /inventory/alerts` retorna apenas itens com status `low` ou `critical`, ordenados por urgencia (critical primeiro)
- [ ] Guards de role corretos em todos os endpoints: `PATCH :id` restrito a MANAGER/OWNER; `PATCH :id/level` aberto para todos os 4 roles
- [ ] `StockScreen` exibe dados reais da API com skeleton loading e pull-to-refresh funcionais
- [ ] Filtros operam sobre dados em memoria (sem nova chamada de API)
- [ ] `UpdateLevelModal` valida: nivel >= 0, nivel diferente do atual, campo obrigatorio preenchido
- [ ] Aviso de nivel abaixo do minimo exibido corretamente (nao bloqueia o save)
- [ ] Widget de alertas de estoque integrado no `ManagerOpsScreen` (Epico 4)
- [ ] Todas as telas testadas em PT-BR, EN e ES sem quebras de layout ou textos cortados
- [ ] Nenhuma chamada de API sem autorizacao: guards ativos em todos os endpoints
- [ ] Testes E2E basicos cobrindo cenarios criticos: T5.1.1, T5.1.2, T5.3.3, T5.3.5
- [ ] Code review aprovado; campos calculados (`status`, `level_pct`) documentados no Swagger via `@ApiProperty`
