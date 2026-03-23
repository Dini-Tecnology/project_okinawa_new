# ÉPICO 6 — Drink Recipes + Barman Station

**Prioridade:** ALTA | **Sprint:** 4
**Módulos afetados:** `restaurant-app` (mobile) · `backend` (NestJS) · `demo` (web stub)
**Data de criação:** 2026-03-23

---

## Visão Geral

O Épico 6 entrega a estação de trabalho completa do barman, incluindo a fila de drinks
com sinalizador de urgência e acesso imediato às fichas técnicas padronizadas. O backend
recebe um novo módulo `recipes` que gerencia as entidades `DrinkRecipe` por restaurante,
expondo CRUD completo e seed de dados com 5 receitas prontas para uso.

A implementação estende o `BarmanKDSScreen` existente
(`mobile/apps/restaurant/src/screens/barman-kds/BarmanKDSScreen.tsx`) com cards de
acesso rápido, e cria uma nova tela `DrinkRecipesScreen` com layout 3-colunas
(lista lateral + detalhe expandido).

---

## Novo Módulo Backend: `recipes`

O módulo é criado em `backend/src/recipes/` seguindo a estrutura padrão NestJS do projeto.

### Entity `DrinkRecipe`

```typescript
// backend/src/recipes/entities/drink-recipe.entity.ts

@Entity('drink_recipes')
export class DrinkRecipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  // Ex.: "Taça Balloon", "Copo Old Fashioned", "Taça Martini", "Caneca de cobre"
  @Column({ length: 80 })
  glass: string;

  // Ex.: "Pepino + Cardamomo", "Twist de laranja", "3 grãos de café"
  @Column({ length: 200 })
  garnish: string;

  // Array de strings: ["Gin Artesanal 60ml", "Tônica Premium 120ml", ...]
  @Column('simple-array')
  ingredients: string[];

  // Array de strings descrevendo cada passo de preparo
  @Column('simple-array')
  preparationSteps: string[];

  @Column({ type: 'int' })
  prepTimeMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // URL de imagem (Unsplash ou CDN próprio)
  @Column({ nullable: true })
  imageUrl: string;

  // Isolamento multi-tenant: receita pertence a um restaurante
  @Column('uuid')
  restaurantId: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Índices recomendados:**
- `(restaurantId, isActive)` — listagem padrão por restaurante
- `(restaurantId, name)` — busca por nome (fulltext futuro)

---

### Controller Endpoints

```
GET    /recipes                    → lista receitas ativas do restaurante (paginado)
GET    /recipes/:id                → detalhe de uma receita
POST   /recipes                    → criar nova receita (role: MANAGER | OWNER)
PATCH  /recipes/:id                → atualizar receita (role: MANAGER | OWNER)
DELETE /recipes/:id                → soft-delete (isActive=false) (role: OWNER)
```

**Exemplo de resposta — GET /recipes:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Gin Tônica Aurora",
      "glass": "Taça Balloon",
      "garnish": "Pepino + Cardamomo",
      "ingredients": ["Gin Artesanal 60ml", "Tônica Premium 120ml", "Pepino 2 fatias", "Cardamomo 3 sementes"],
      "preparationSteps": [
        "Adicione gelo à taça balloon até a borda.",
        "Despeje o gin artesanal sobre o gelo.",
        "Complete com tônica premium gelada, vertendo devagar pela lateral.",
        "Adicione as fatias de pepino e as sementes de cardamomo.",
        "Mexa suavemente uma única vez e sirva imediatamente."
      ],
      "prepTimeMinutes": 3,
      "price": "38.00",
      "imageUrl": "https://cdn.noowe.app/recipes/gin-tonica-aurora.jpg",
      "restaurantId": "uuid",
      "isActive": true
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 20
}
```

---

### DTOs

```typescript
// create-drink-recipe.dto.ts
export class CreateDrinkRecipeDto {
  @IsString() @MaxLength(120)
  name: string;

  @IsString() @MaxLength(80)
  glass: string;

  @IsString() @MaxLength(200)
  garnish: string;

  @IsArray() @IsString({ each: true })
  ingredients: string[];

  @IsArray() @IsString({ each: true })
  preparationSteps: string[];

  @IsInt() @Min(1) @Max(60)
  prepTimeMinutes: number;

  @IsNumber() @Min(0)
  price: number;

  @IsOptional() @IsUrl()
  imageUrl?: string;
}

// update-drink-recipe.dto.ts
export class UpdateDrinkRecipeDto extends PartialType(CreateDrinkRecipeDto) {}
```

---

### Seed Data (5 receitas)

Baseado nos dados do stub de demo em
`src/components/demo/restaurant/RestaurantDemoShared.tsx` (linhas 189–194):

```typescript
// backend/src/database/seeds/drink-recipes.seed.ts

export const DRINK_RECIPES_SEED = [
  {
    name: 'Gin Tônica Aurora',
    glass: 'Taça Balloon',
    garnish: 'Pepino + Cardamomo',
    ingredients: [
      'Gin Artesanal 60ml',
      'Tônica Premium 120ml',
      'Pepino 2 fatias',
      'Cardamomo 3 sementes',
    ],
    preparationSteps: [
      'Encha a taça balloon com gelo até a borda.',
      'Despeje o gin artesanal sobre o gelo.',
      'Adicione as fatias de pepino e as sementes de cardamomo.',
      'Complete com tônica premium gelada, vertendo devagar pela lateral.',
      'Mexa suavemente uma única vez e sirva imediatamente.',
    ],
    prepTimeMinutes: 3,
    price: 38.00,
    imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
  },
  {
    name: 'Negroni Clássico',
    glass: 'Copo Old Fashioned',
    garnish: 'Twist de laranja',
    ingredients: [
      'Gin 30ml',
      'Campari 30ml',
      'Vermute Rosso 30ml',
    ],
    preparationSteps: [
      'Adicione gelo ao mixing glass.',
      'Despeje gin, Campari e vermute rosso em partes iguais.',
      'Mexa suavemente por 20 segundos até a bebida resfriar.',
      'Coe para o copo old fashioned com pedra de gelo grande.',
      'Decore com twist de laranja flamejado.',
    ],
    prepTimeMinutes: 3,
    price: 42.00,
    imageUrl: 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=400',
  },
  {
    name: 'Espresso Martini',
    glass: 'Taça Martini',
    garnish: '3 grãos de café',
    ingredients: [
      'Vodka 45ml',
      'Licor de Café 30ml',
      'Espresso 30ml (recém extraído)',
      'Xarope simples 5ml',
    ],
    preparationSteps: [
      'Prepare o espresso e deixe resfriar levemente.',
      'Adicione todos os ingredientes à coqueteleira com gelo.',
      'Shake vigoroso por 15 segundos para criar espuma.',
      'Coe duplo para a taça martini previamente gelada.',
      'Decore com 3 grãos de café sobre a espuma.',
    ],
    prepTimeMinutes: 4,
    price: 40.00,
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
  },
  {
    name: 'Caipirinha Premium',
    glass: 'Copo Old Fashioned',
    garnish: 'Limão',
    ingredients: [
      'Cachaça Envelhecida 60ml',
      'Limão taiti 1 unidade',
      'Açúcar demerara 2 colheres de chá',
    ],
    preparationSteps: [
      'Corte o limão em 4 partes e retire o miolo branco.',
      'Macere o limão com o açúcar demerara no fundo do copo.',
      'Adicione gelo picado até encher o copo.',
      'Despeje a cachaça envelhecida.',
      'Mexa bem e sirva imediatamente.',
    ],
    prepTimeMinutes: 2,
    price: 32.00,
    imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400',
  },
  {
    name: 'Moscow Mule',
    glass: 'Caneca de Cobre',
    garnish: 'Fatia de limão + Hortelã',
    ingredients: [
      'Vodka 45ml',
      'Ginger Beer 120ml',
      'Suco de limão fresco 15ml',
      'Hortelã 4 folhas',
    ],
    preparationSteps: [
      'Encha a caneca de cobre com gelo até a borda.',
      'Adicione o suco de limão fresco.',
      'Despeje a vodka sobre o gelo.',
      'Complete com ginger beer gelada.',
      'Decore com fatia de limão e folhas de hortelã.',
    ],
    prepTimeMinutes: 2,
    price: 36.00,
    imageUrl: 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=400',
  },
];
```

---

## FEATURE 6.1 — Barman Station Screen

**Arquivo mobile:** `mobile/apps/restaurant/src/screens/barman-kds/BarmanKDSScreen.tsx`
**Status atual:** Implementado (KDS básico com stats, filtros, cards de pedido)
**Objetivo:** Estender com Quick Access Cards e mapear stats ao modelo de dados real

---

### US-6.1.1 — Ver fila de drinks com urgência

**Como** barman,
**quero** ver os pedidos de bebidas na fila com indicador visual de urgência para pedidos
aguardando há mais de 5 minutos,
**para que** eu possa priorizar o atendimento e evitar atrasos perceptíveis ao cliente.

#### Critérios de Aceite

- [ ] Cards de pedido exibem: número da mesa, timer decorrido, nome do drink, quantidade, notas especiais
- [ ] Pedidos aguardando > 5 minutos recebem borda laranja/warning e ícone de chama
- [ ] Pedidos aguardando > 10 minutos recebem borda vermelha/error e badge "URGENTE" pulsante
- [ ] Timer atualiza automaticamente a cada 10 segundos (sem reload manual)
- [ ] Cards ordenados por tempo de espera (mais antigo primeiro)
- [ ] Estado vazio exibe mensagem "Nenhum drink na fila" com ícone de copo

#### Specs Técnicos

```typescript
// Lógica de urgência (equivalente ao demo RoleScreens.tsx linha 285)
const URGENCY_WARN_MINUTES = 5;
const URGENCY_CRITICAL_MINUTES = 10;

const getUrgencyLevel = (createdAt: string): 'normal' | 'warn' | 'critical' => {
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (elapsed >= URGENCY_CRITICAL_MINUTES) return 'critical';
  if (elapsed >= URGENCY_WARN_MINUTES) return 'warn';
  return 'normal';
};

// useEffect com polling de timer (não depende de prop de servidor)
useEffect(() => {
  const interval = setInterval(() => setNow(Date.now()), 10000);
  return () => clearInterval(interval);
}, []);
```

**Design tokens aplicados:**
- `colors.warning` → borda e ícone urgência moderada
- `colors.error` → borda, badge e fundo crítico
- `colors.card` → fundo de card normal
- Animação: `Animated.loop` com `Animated.sequence` para pulse no badge URGENTE

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `barman.queueTitle` | Fila de Drinks | Drink Queue | Cola de Bebidas |
| `barman.noQueue` | Nenhum drink na fila | No drinks in queue | Sin bebidas en cola |
| `barman.queueEmpty.sub` | Pedidos de bebidas aparecerão aqui | Drink orders will appear here | Los pedidos aparecerán aquí |
| `barman.urgent` | URGENTE | URGENT | URGENTE |
| `barman.waitTime` | {min}min esperando | Waiting {min}min | Esperando {min}min |
| `barman.stats.inQueue` | Drinks na Fila | Drinks in Queue | Bebidas en Cola |
| `barman.stats.ready` | Prontos | Ready | Listos |
| `barman.stats.today` | Drinks Hoje | Drinks Today | Bebidas Hoy |

#### Testes

```typescript
describe('BarmanKDSScreen — urgency logic', () => {
  it('marca urgência warn para pedido com 5+ minutos', () => {
    const createdAt = new Date(Date.now() - 6 * 60000).toISOString();
    expect(getUrgencyLevel(createdAt)).toBe('warn');
  });

  it('marca urgência critical para pedido com 10+ minutos', () => {
    const createdAt = new Date(Date.now() - 11 * 60000).toISOString();
    expect(getUrgencyLevel(createdAt)).toBe('critical');
  });

  it('pedido recente fica normal', () => {
    const createdAt = new Date(Date.now() - 3 * 60000).toISOString();
    expect(getUrgencyLevel(createdAt)).toBe('normal');
  });
});
```

---

### US-6.1.2 — Progredir drink (Preparar → Pronto)

**Como** barman,
**quero** alterar o status de um pedido de drink de "Pendente" para "Preparando" e depois
para "Pronto",
**para que** o garçom seja notificado em tempo real para fazer a retirada.

#### Critérios de Aceite

- [ ] Botão "Iniciar Preparo" muda o status de `pending` para `preparing` via API
- [ ] Botão "Marcar como Pronto" muda o status de `preparing` para `ready` via API
- [ ] Após marcar como pronto, o garçom recebe notificação push via WebSocket
- [ ] Card em status `ready` exibe fundo verde e mensagem "Pronto para Retirada"
- [ ] Cancelamento de item individual disponível enquanto status é `preparing`
- [ ] Ação de cancelamento exige confirmação antes de chamar a API

#### Specs Técnicos

Fluxo já parcialmente implementado em `BarmanKDSScreen.tsx`:
- `handleStartOrder(orderId)` → `ApiService.updateOrderStatus(orderId, { status: 'preparing' })`
- `handleCompleteOrder(orderId)` → `ApiService.updateOrderStatus(orderId, { status: 'ready' })`
- `handleCancelItem(orderId, itemId)` → `ApiService.cancelBarItem(orderId, itemId, reason)`

**Evento WebSocket emitido pelo backend ao marcar Pronto:**
```json
{
  "event": "drink:ready",
  "data": {
    "orderId": "uuid",
    "tableNumber": "5",
    "waiterId": "uuid",
    "items": ["Gin Tônica Aurora x2"]
  }
}
```

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `barman.action.start` | Iniciar Preparo | Start Preparing | Iniciar Preparación |
| `barman.action.complete` | Marcar como Pronto | Mark as Ready | Marcar como Listo |
| `barman.action.readyStatus` | Pronto para Retirada | Ready for Pickup | Listo para Retiro |
| `barman.action.cancelItem` | Cancelar Item | Cancel Item | Cancelar Ítem |
| `barman.confirm.cancelItem` | Deseja cancelar este item? O garçom será notificado. | Cancel this item? The waiter will be notified. | ¿Cancelar este ítem? El mozo será notificado. |

#### Testes

```typescript
describe('BarmanKDSScreen — status transitions', () => {
  it('chama API com status preparing ao clicar Iniciar Preparo', async () => {
    const mockApi = jest.spyOn(ApiService, 'updateOrderStatus').mockResolvedValue(undefined);
    // renderizar componente, encontrar botão, disparar press
    expect(mockApi).toHaveBeenCalledWith('order-id', { status: 'preparing' });
  });

  it('exibe alerta de confirmação antes de cancelar item', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    // disparar handleCancelItem
    expect(alertSpy).toHaveBeenCalled();
  });
});
```

---

### US-6.1.3 — Acessar receitas e estoque rapidamente

**Como** barman,
**quero** ter acesso imediato às fichas técnicas de drinks e ao estoque do bar diretamente
da tela de estação,
**para que** eu não precise sair do contexto de trabalho para consultar informações.

#### Critérios de Aceite

- [ ] Card "Receitas de Drinks" navega para `DrinkRecipesScreen`
- [ ] Card "Estoque do Bar" navega para `StockScreen`
- [ ] Card de Estoque exibe badge com contagem de itens com alerta (low + critical)
- [ ] Cards posicionados na parte inferior da tela, abaixo da fila de drinks
- [ ] Layout 2 colunas em telas com largura >= 600px

#### Specs Técnicos

```typescript
// Quick Access Cards — baseado no demo RoleScreens.tsx linhas 329-340
const quickAccess = [
  {
    icon: 'book-open-variant',
    title: t('barman.quickAccess.recipes'),
    subtitle: t('barman.quickAccess.recipesSub'),
    route: 'DrinkRecipes',
    accentColor: colors.primary,
  },
  {
    icon: 'package-variant',
    title: t('barman.quickAccess.stock'),
    subtitle: t('barman.quickAccess.stockSub', { count: alertCount }),
    route: 'Stock',
    accentColor: colors.warning,
    badge: alertCount > 0 ? alertCount : undefined,
  },
];
```

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `barman.quickAccess.recipes` | Receitas de Drinks | Drink Recipes | Recetas de Bebidas |
| `barman.quickAccess.recipesSub` | Fichas técnicas e medidas padronizadas | Technical sheets and standard measures | Fichas técnicas y medidas estándar |
| `barman.quickAccess.stock` | Estoque do Bar | Bar Stock | Stock del Bar |
| `barman.quickAccess.stockSub` | {count} itens com alerta | {count} items with alert | {count} ítems con alerta |

#### Testes

```typescript
describe('BarmanKDSScreen — quick access', () => {
  it('navega para DrinkRecipes ao pressionar card de receitas', () => {
    const navigate = jest.fn();
    // renderizar e pressionar card
    expect(navigate).toHaveBeenCalledWith('DrinkRecipes');
  });

  it('exibe badge no card de estoque quando há alertas', () => {
    // mock stockService retornando itens com status !== ok
    // verificar presença de Badge component
  });
});
```

---

## FEATURE 6.2 — Drink Recipes Screen

**Arquivo mobile (criar):** `mobile/apps/restaurant/src/screens/drink-recipes/DrinkRecipesScreen.tsx`
**Referência demo:** `src/components/demo/restaurant/RoleScreens.tsx` linhas 347–414

---

### US-6.2.1 — Browsear receitas disponíveis

**Como** barman,
**quero** ver a lista de todas as receitas de drinks disponíveis com thumbnail, nome,
tempo de preparo e preço,
**para que** eu possa encontrar rapidamente a receita que preciso consultar.

#### Critérios de Aceite

- [ ] Lista lateral exibe: thumbnail (48x48px), nome do drink, tempo de preparo e preço
- [ ] Item selecionado recebe destaque visual (borda primary + fundo primary/10)
- [ ] Busca por nome (campo de texto com debounce de 300ms)
- [ ] Scroll independente da lista e do painel de detalhe
- [ ] Pull-to-refresh para recarregar receitas da API
- [ ] Estado vazio para busca sem resultados exibe mensagem contextual
- [ ] Receitas carregadas de `GET /recipes` com cache local de 5 minutos

#### Specs Técnicos

```typescript
// Layout responsivo — referência demo lg:grid-cols-3
// Mobile: lista ocupa tela inteira, detalhe em modal/sheet
// Tablet (>= 768px): layout split 1/3 lista + 2/3 detalhe

interface DrinkRecipeListItem {
  id: string;
  name: string;
  prepTimeMinutes: number;
  price: number;
  imageUrl: string;
}

// Busca com debounce
const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 300);
const filteredRecipes = useMemo(
  () => recipes.filter(r => r.name.toLowerCase().includes(debouncedQuery.toLowerCase())),
  [recipes, debouncedQuery]
);
```

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `recipes.title` | Receitas de Drinks | Drink Recipes | Recetas de Bebidas |
| `recipes.search` | Buscar receita... | Search recipe... | Buscar receta... |
| `recipes.prepTime` | {min}min preparo | {min}min prep | {min}min prep. |
| `recipes.price` | R$ {price} | R$ {price} | R$ {price} |
| `recipes.empty` | Nenhuma receita encontrada | No recipes found | No se encontraron recetas |
| `recipes.emptySub` | Tente outro termo de busca | Try a different search term | Intente otro término |

#### Testes

```typescript
describe('DrinkRecipesScreen — list', () => {
  it('renderiza lista com receitas da API', async () => {
    jest.spyOn(ApiService, 'getRecipes').mockResolvedValue(mockRecipes);
    // verificar que 5 items são renderizados
  });

  it('filtra receitas por nome com debounce', async () => {
    // digitar "Negroni", aguardar 300ms, verificar filtro aplicado
  });

  it('exibe estado vazio quando busca não retorna resultados', () => {
    // buscar por termo inexistente, verificar mensagem vazia
  });
});
```

---

### US-6.2.2 — Ver receita detalhada com passos

**Como** barman,
**quero** ver a ficha técnica completa de um drink com ingredientes numerados,
tipo de taça, guarnição e passos de preparo padronizados,
**para que** eu possa preparar bebidas com consistência mesmo sem memorizar todas as receitas.

#### Critérios de Aceite

- [ ] Painel de detalhe exibe: imagem grande (128x128px), nome, tempo, preço, tipo de taça, guarnição
- [ ] Ingredientes listados com numeração (círculo com índice)
- [ ] Passos de preparo listados sequencialmente
- [ ] Taça e guarnição exibidos como pills/chips coloridos
- [ ] Imagem com fallback para placeholder em caso de erro de carregamento
- [ ] Em mobile, detalhe abre em Bottom Sheet (react-native-paper Modal ou @gorhom/bottom-sheet)

#### Specs Técnicos

Estrutura de detalhe baseada no demo `RoleScreens.tsx` linhas 376–409:

```typescript
interface DrinkRecipeDetail extends DrinkRecipeListItem {
  glass: string;
  garnish: string;
  ingredients: string[];
  preparationSteps: string[];
}

// Exemplo de passos de preparo da receita Negroni Clássico:
// 1. Adicione gelo ao mixing glass.
// 2. Despeje gin, Campari e vermute rosso em partes iguais.
// 3. Mexa suavemente por 20 segundos até a bebida resfriar.
// 4. Coe para o copo old fashioned com pedra de gelo grande.
// 5. Decore com twist de laranja flamejado.
```

**Design tokens:**
- `colors.primary` / `primaryBackground` → chips de destaque (taça, guarnição)
- `colors.card` → fundo do painel de detalhe
- `colors.border` → separadores de seção

#### i18n Keys

| Chave | PT-BR | EN | ES |
|---|---|---|---|
| `recipes.detail.ingredients` | Ingredientes | Ingredients | Ingredientes |
| `recipes.detail.steps` | Modo de Preparo | Preparation Steps | Modo de Preparación |
| `recipes.detail.glass` | Taça | Glass | Copa |
| `recipes.detail.garnish` | Guarnição | Garnish | Guarnición |
| `recipes.detail.prepTime` | Tempo de preparo | Prep time | Tiempo de prep. |
| `recipes.detail.price` | Preço de venda | Sale price | Precio de venta |

#### Testes

```typescript
describe('DrinkRecipesScreen — detail', () => {
  it('exibe ingredientes numerados corretamente', () => {
    // selecionar receita mockada com 4 ingredientes
    // verificar presença de elementos 1, 2, 3, 4
  });

  it('exibe passos de preparo em ordem', () => {
    // verificar que passos aparecem na ordem definida na receita
  });

  it('chips de taça e guarnição presentes', () => {
    // verificar chips com glass e garnish
  });

  it('exibe placeholder quando imageUrl falha ao carregar', () => {
    // mock Image onError, verificar fallback
  });
});
```

---

## Sequência de Implementação

```
Sprint 4 — Semana 1:
  1. [Backend] Criar módulo recipes (entity, repository, service, controller)
  2. [Backend] Migrations + seed data 5 receitas
  3. [Backend] Testes unitários do RecipesService

Sprint 4 — Semana 2:
  4. [Mobile] Estender BarmanKDSScreen com Quick Access Cards (US-6.1.3)
  5. [Mobile] Implementar lógica de urgência no timer (US-6.1.1)
  6. [Mobile] Testes E2E do fluxo Pendente → Preparando → Pronto (US-6.1.2)

Sprint 4 — Semana 3:
  7. [Mobile] Criar DrinkRecipesScreen — lista com busca (US-6.2.1)
  8. [Mobile] Criar painel de detalhe + Bottom Sheet mobile (US-6.2.2)
  9. [Mobile] Integrar com GET /recipes (cache + pull-to-refresh)
  10. [QA] Testes de regressão no BarmanKDSScreen existente
```

**Dependências:**
- US-6.1.3 depende de US-6.2.1 estar disponível para navegação
- US-6.2.1 depende do endpoint `GET /recipes` estar implementado
- Seed de dados deve rodar antes dos testes de integração mobile

---

## Definition of Done

- [ ] Todos os critérios de aceite das US listadas estão verificados
- [ ] Entity `DrinkRecipe` com migration aplicada em staging
- [ ] Seed data com 5 receitas carregado e verificado
- [ ] `BarmanKDSScreen` com Quick Access Cards e urgency timer funcionando
- [ ] `DrinkRecipesScreen` com lista, busca e detalhe completo
- [ ] Cobertura de testes unitários >= 80% nos novos componentes
- [ ] i18n keys cadastradas nos 3 idiomas (PT-BR, EN, ES)
- [ ] Revisão de design aprovada pelo time de produto
- [ ] Sem warnings de lint no código novo
- [ ] Pull Request revisado e aprovado por ao menos 1 engenheiro sênior
- [ ] Documentação do endpoint atualizada no Swagger/OpenAPI
- [ ] Demo web (RoleScreens.tsx) mantém paridade visual com o app mobile
