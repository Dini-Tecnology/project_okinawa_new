# Epic 15 — Restaurant Quick Wins (4 Missing Screens)
> Epico de Mobile Restaurant: 4 telas faltantes onde o backend ja esta completo
> Status: In Progress
> Versao: 1.0 | Data: 2026-03-23

---

## Objetivo

Entregar 4 telas criticas que completam a experiencia de gestao do restaurante no app mobile. Todas as 4 telas consomem endpoints de backend ja existentes (analytics, reviews, loyalty) — nao e necessario nenhum trabalho de backend. O objetivo e maximizar o valor entregue com esforco minimo, fechando gaps de funcionalidade que proprietarios e gerentes ja esperam.

## Escopo

### Inclui
- RoleDashboardScreen: Dashboard com KPIs dinamicos por role (Owner, Manager, Waiter, Chef, Barman)
- ReportsScreen: Tela de relatorios analiticos com graficos, filtros de data e exportacao
- RestaurantReviewsScreen: Gestao de avaliacoes do restaurante com resposta a clientes
- LoyaltyManagementScreen: Gestao do programa de fidelidade e cartoes-carimbo

### Nao Inclui (fora do escopo)
- Novos endpoints de backend — todos ja existem
- Modificacoes no backend — apenas consumo de APIs existentes
- Telas do app client — escopo restrito ao app restaurant
- Notificacoes push para novas reviews — sera tratado em epic futuro

---

## User Stories

### US-15.1 — Role Dashboard (Owner)
**Como** proprietario (Owner), **quero** ver um dashboard com KPIs relevantes ao meu papel (receita do dia, total de pedidos, ticket medio, equipe ativa, item mais vendido, media de avaliacoes), **para** ter visao executiva rapida do negocio.

**Criterios de Aceitacao:**
- [ ] CA1: Dashboard exibe 6 KPI cards em grid 2x3 para role OWNER
- [ ] CA2: Dados carregados via GET /analytics/dashboard com restaurant_id
- [ ] CA3: Tap em qualquer KPI card navega para a tela relevante
- [ ] CA4: Pull-to-refresh atualiza todos os dados
- [ ] CA5: Skeleton loading exibido durante carregamento
- [ ] CA6: Todas as strings internacionalizadas (PT-BR, EN, ES)

**Notas Tecnicas:**
- Endpoint: GET /analytics/dashboard?restaurant_id=:id
- Endpoint: GET /analytics/realtime?restaurant_id=:id
- Role lido de useAuth() → user.roles
- 15s auto-refresh via useEffect + setInterval para dados em tempo real
- Cada role possui color accent diferenciado

---

### US-15.2 — Role Dashboard (Manager)
**Como** gerente (Manager), **quero** ver KPIs de operacao (aprovacoes pendentes, pedidos ativos, alertas de estoque, ocupacao, equipe em servico), **para** tomar decisoes operacionais rapidas.

**Criterios de Aceitacao:**
- [ ] CA1: Dashboard exibe KPIs operacionais para role MANAGER
- [ ] CA2: Contagens atualizadas em tempo real via pull-to-refresh
- [ ] CA3: Layout diferenciado do Owner com foco operacional

**Notas Tecnicas:**
- Reutiliza GET /analytics/dashboard + GET /analytics/realtime

---

### US-15.3 — Role Dashboard (Waiter/Chef/Barman)
**Como** garcom/chef/barman, **quero** ver um dashboard focado nas minhas atividades (mesas, gorjetas, pedidos na fila, tempo de preparo), **para** focar no que e relevante para meu trabalho.

**Criterios de Aceitacao:**
- [ ] CA1: Waiter ve: minhas mesas, gorjetas hoje, chamados abertos, minha media de avaliacao
- [ ] CA2: Chef ve: pedidos no KDS, tempo medio de preparo, itens atrasados, status da estacao
- [ ] CA3: Barman ve: pedidos do bar pendentes, receitas servidas hoje, alertas de estoque (bebidas)
- [ ] CA4: Cards focados e compactos para uso rapido em pe

**Notas Tecnicas:**
- GET /analytics/realtime para dados em tempo real
- GET /analytics/dashboard para dados agregados

---

### US-15.4 — Reports Screen
**Como** proprietario ou gerente, **quero** acessar relatorios analiticos com filtro de data (hoje, semana, mes, customizado), **para** analisar performance do restaurante em diferentes periodos.

**Criterios de Aceitacao:**
- [ ] CA1: Date range picker com opcoes: hoje, esta semana, este mes, customizado
- [ ] CA2: Secao Revenue: grafico de barras diario, total, comparacao WoW
- [ ] CA3: Secao Orders: total, por status, por tipo de servico (chips de distribuicao)
- [ ] CA4: Secao Menu: top 10 itens por quantidade e receita
- [ ] CA5: Secao Staff: tabela de performance (garcom, pedidos atendidos, gorjetas, rating)
- [ ] CA6: Botao de exportar (toast "Enviando por email" / "Sending by email")
- [ ] CA7: Payment methods breakdown (credit/debit/pix/cash como barras de porcentagem)
- [ ] CA8: Pull-to-refresh e skeleton loading
- [ ] CA9: Todas as strings internacionalizadas

**Notas Tecnicas:**
- GET /analytics/sales?restaurant_id=:id&start_date=:d&end_date=:d
- GET /analytics/performance?restaurant_id=:id
- GET /analytics/dashboard?restaurant_id=:id
- Usa react-native-chart-kit (mesmo padrao do DashboardScreen.tsx)

---

### US-15.5 — Restaurant Reviews Screen
**Como** proprietario ou gerente, **quero** visualizar e responder avaliacoes dos clientes, **para** melhorar a reputacao do restaurante e engajar com feedback.

**Criterios de Aceitacao:**
- [ ] CA1: Header de stats: media de avaliacao (estrela grande), total de reviews, % 5 estrelas, % 1 estrela
- [ ] CA2: Grafico de distribuicao de rating (5 barras horizontais)
- [ ] CA3: Filter chips: Todos | 5* | 4* | 3* | 2* | 1* | Sem resposta
- [ ] CA4: Review cards com: avatar, estrelas, data, texto, botao "Responder"
- [ ] CA5: Formulario de resposta: textarea + botao "Enviar resposta"
- [ ] CA6: Flagging option (long press em review para denunciar conteudo inapropriado)
- [ ] CA7: Pull-to-refresh e skeleton loading
- [ ] CA8: Todas as strings internacionalizadas

**Notas Tecnicas:**
- GET /reviews/restaurant/:restaurantId (com filtros min_rating, max_rating)
- GET /reviews/restaurant/:restaurantId/stats
- POST /reviews/:id/owner-response (body: OwnerResponseDto)

---

### US-15.6 — Loyalty Management Screen
**Como** proprietario ou gerente, **quero** gerenciar o programa de fidelidade (ver stats, cartoes-carimbo, dar carimbos manualmente), **para** controlar e incentivar a fidelizacao de clientes.

**Criterios de Aceitacao:**
- [ ] CA1: Stats do programa: total membros, ativos no mes, pontos emitidos hoje, resgates hoje
- [ ] CA2: Secao stamp cards: lista de configs ativas por tipo de servico
- [ ] CA3: Cada card mostra: tipo de servico, carimbos necessarios, recompensa, ativos, completados hoje
- [ ] CA4: Botao "Dar Carimbo" → selecionar cliente (phone/nome) → POST /loyalty/stamp-card/stamp
- [ ] CA5: Secao de config collapsible: carimbos necessarios por recompensa, descricao da recompensa
- [ ] CA6: Members list com search (nome, tier Bronze/Silver/Gold, stamps count, ultima visita)
- [ ] CA7: Member detail tap abre modal com historico completo
- [ ] CA8: Skeleton loading
- [ ] CA9: Todas as strings internacionalizadas

**Notas Tecnicas:**
- GET /loyalty/statistics?restaurant_id=:id
- GET /loyalty/stamp-cards/:restaurantId
- POST /loyalty/stamp-card/stamp (body: AddStampDto)

---

## Arquitetura Tecnica

### Endpoints Utilizados (todos existentes)

| Metodo | Rota | Roles | Descricao |
|--------|------|-------|-----------|
| GET | /analytics/dashboard?restaurant_id | OWNER, MANAGER | Dashboard metrics |
| GET | /analytics/realtime?restaurant_id | OWNER, MANAGER | Real-time metrics |
| GET | /analytics/sales?restaurant_id&start_date&end_date | OWNER, MANAGER | Sales analytics |
| GET | /analytics/performance?restaurant_id | OWNER, MANAGER | Performance metrics |
| GET | /analytics/customers?restaurant_id&start_date&end_date | OWNER, MANAGER | Customer analytics |
| GET | /analytics/forecast?restaurant_id&days | OWNER, MANAGER | Revenue forecast |
| GET | /reviews/restaurant/:restaurantId | ALL AUTH | List reviews with filters |
| GET | /reviews/restaurant/:restaurantId/stats | ALL AUTH | Review statistics |
| POST | /reviews/:id/owner-response | OWNER, MANAGER | Add owner response |
| GET | /loyalty/statistics?restaurant_id | OWNER, MANAGER | Loyalty program stats |
| GET | /loyalty/stamp-cards/:restaurantId | ALL AUTH | Get stamp cards |
| POST | /loyalty/stamp-card/stamp | OWNER, MANAGER, WAITER, BARMAN | Add stamp |

### Novos Modulos / Alteracoes
- `mobile/apps/restaurant/src/screens/dashboard/RoleDashboardScreen.tsx` — nova tela
- `mobile/apps/restaurant/src/screens/reports/ReportsScreen.tsx` — nova tela
- `mobile/apps/restaurant/src/screens/reviews/RestaurantReviewsScreen.tsx` — nova tela
- `mobile/apps/restaurant/src/screens/loyalty/LoyaltyManagementScreen.tsx` — nova tela
- `mobile/apps/restaurant/src/navigation/index.tsx` — adicionar 4 telas ao drawer/stack

### Novas Chaves i18n (obrigatorio listar)
```
roleDashboard.title
roleDashboard.myTables
roleDashboard.myTips
roleDashboard.pendingApprovals
roleDashboard.stockAlerts
roleDashboard.revenueToday
roleDashboard.totalOrders
roleDashboard.avgTicket
roleDashboard.staffActive
roleDashboard.bestSelling
roleDashboard.reviewsAvg
roleDashboard.activeOrders
roleDashboard.occupancy
roleDashboard.staffOnDuty
roleDashboard.openCalls
roleDashboard.myAvgRating
roleDashboard.ordersInKds
roleDashboard.avgPrepTime
roleDashboard.overdueItems
roleDashboard.stationStatus
roleDashboard.barOrdersPending
roleDashboard.recipesServed
roleDashboard.stockAlertsBeverages
reports.title
reports.revenue
reports.orders
reports.menu
reports.staff
reports.export
reports.exporting
reports.dateRange.today
reports.dateRange.week
reports.dateRange.month
reports.dateRange.custom
reports.totalRevenue
reports.wowComparison
reports.byStatus
reports.byServiceType
reports.topItems
reports.byQuantity
reports.byRevenue
reports.ordersHandled
reports.tips
reports.rating
reviews.title
reviews.avgRating
reviews.total
reviews.respond
reviews.response
reviews.responsePlaceholder
reviews.sendResponse
reviews.filter.all
reviews.filter.unresponded
reviews.filter.stars
reviews.noReviews
reviews.fiveStarPercent
reviews.oneStarPercent
reviews.distributionTitle
loyaltyMgmt.title
loyaltyMgmt.members
loyaltyMgmt.activeThisMonth
loyaltyMgmt.pointsIssuedToday
loyaltyMgmt.redemptionsToday
loyaltyMgmt.stampCards
loyaltyMgmt.giveStamp
loyaltyMgmt.search
loyaltyMgmt.searchPlaceholder
loyaltyMgmt.pointsConfig
loyaltyMgmt.pointsPerReal
loyaltyMgmt.serviceType
loyaltyMgmt.stampsRequired
loyaltyMgmt.reward
loyaltyMgmt.activeCount
loyaltyMgmt.completedToday
loyaltyMgmt.selectCustomer
loyaltyMgmt.stampAdded
```

### Migrations Necessarias
- Nenhuma — todas as tabelas ja existem

## Dependencias
- Backend modulos analytics, reviews, loyalty — ja completos
- react-native-chart-kit — ja instalado no projeto
- react-native-paper — ja instalado no projeto
- Shared hooks: useAuth, useI18n, useColors

## Definition of Done

### Codigo
- [ ] Codigo implementado e funcionando no ambiente de dev
- [ ] Seguindo as convencoes de nomenclatura do DEVELOPMENT_STANDARDS.md
- [ ] Sem codigo comentado ou console.log de debug esquecidos
- [ ] Sem warnings de TypeScript (tsc --noEmit passa limpo)
- [ ] Sem any desnecessario — tipos explicitos onde possivel
- [ ] Sem strings hardcode — toda UI string usa i18n com 3 idiomas

### i18n
- [ ] Todas as strings visiveis ao usuario tem chave i18n
- [ ] Chave adicionada em pt-BR.ts, en-US.ts e es-ES.ts
- [ ] Chaves seguem o padrao secao.subsecao.elemento
- [ ] Interpolacoes usam {{paramName}} e sao passadas corretamente

### Design / UX
- [ ] Loading state implementado com skeleton loading
- [ ] Error state implementado com mensagem + retry action
- [ ] Pull-to-refresh implementado em telas com dados dinamicos
- [ ] Cores usam tokens do design system (useColors)
- [ ] Tipografia usa variantes do design system

### Testes
- [ ] Happy path testado manualmente
- [ ] Error path verificado (sem crash em dados vazios)
- [ ] Pull-to-refresh funcional

### Git
- [ ] Branch segue naming convention (feat/epic-15-restaurant-quick-wins)
- [ ] Commits seguem Conventional Commits
- [ ] PR criado com descricao clara
