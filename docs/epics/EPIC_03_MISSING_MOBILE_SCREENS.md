# ÉPICO 3 — Telas Mobile Faltando (Quick Wins)

**Prioridade:** CRÍTICA | **Sprint:** 1 | **Apps:** Client App + Restaurant App
**Estimativa total:** ~9 telas × ~3–5 dias cada = 4–6 semanas (1 dev mobile)
**Status:** Pendente — nenhuma tela implementada no código nativo

---

## Visão Geral

Este épico cobre as telas mobile que já têm **backend 100% operacional** e **design aprovado no mobile-v2** (componentes V2 existentes em `src/components/mobile-preview-v2/screens/`), mas que ainda não existem como telas reais em React Native.

São **quick wins de máximo impacto**: não há dependência de novo backend, não há decisões de produto abertas, não há bloqueadores de design. O trabalho é exclusivamente de implementação mobile — traduzir o HTML/CSS dos protótipos V2 para componentes React Native com navegação real, queries TanStack, i18n e UX patterns do projeto.

### Apps impactados

| App | Telas | Impacto |
|---|---|---|
| **Client App** | NotificationsScreen, AddressesScreen, LoyaltyDetailScreen, PhoneAuthScreen, BiometricEnrollmentScreen, CouponsScreen | Funcionalidades core do cliente final |
| **Restaurant App** | WaiterCallsScreen, FloorFlowScreen, DailyReportScreen | Operação em tempo real e gestão do salão |

---

## Pré-requisitos

Todos os backends estão prontos e documentados via Swagger. Nenhuma task de backend é necessária neste épico.

| Feature | Endpoint(s) prontos |
|---|---|
| Notificações | `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/mark-all-read`, `DELETE /notifications/read/all` |
| Endereços | Integrado ao perfil do usuário (`/users`) — endereços como uso de localização |
| Fidelidade | `GET /loyalty`, endpoints do módulo de loyalty |
| Phone Auth | `POST /auth/phone/send-otp`, `POST /auth/phone/verify-otp`, `POST /auth/phone/complete-registration` |
| Biometria | `POST /auth/biometric/enroll`, `POST /auth/biometric/authenticate` |
| Cupons | Módulo de cupons existente no backend |
| Chamados de Garçom | `GET /waiter-calls/restaurant/:id/pending`, `PUT /waiter-calls/:id/acknowledge`, `PUT /waiter-calls/:id/resolve` |
| FloorFlow | `GET /tables` (sessões ativas, fila virtual) |
| Relatório Diário | `GET /analytics/dashboard`, `GET /analytics/sales`, `GET /analytics/performance` |

---

## FEATURE 3.1 — NotificationsScreen (Client App)

**Arquivo de referência:** `src/components/mobile-preview-v2/screens/NotificationsScreenV2.tsx`
**Arquivo RN a criar:** `apps/client/src/screens/NotificationsScreen.tsx`
**Navegação:** Stack dentro de tab Home — acessada via ícone de sino no header

### User Stories

#### US-3.1.1 — Ver todas as notificações

**Como** cliente do app, **quero** ver todas as minhas notificações em ordem cronológica (mais recentes primeiro), **para** acompanhar reservas, promoções, pedidos e convites.

**Critérios de aceite:**
- A lista exibe todas as notificações do usuário autenticado
- Cada notificação mostra: ícone do tipo, título, mensagem (truncada em 2 linhas), timestamp relativo ("Agora", "5 min", "1h", "1 dia")
- Notificações não lidas têm fundo diferenciado (`bg-primary/5`, borda `border-primary/20`) e um indicador circular primário
- Notificações lidas têm fundo padrão de card
- O header exibe o contador de não lidas: "{N} não lidas"
- Skeleton loading (3 itens placeholder) é exibido durante o carregamento inicial
- Empty state: ícone de sino + mensagem "Nenhuma notificação por enquanto" quando a lista está vazia
- Suporte a infinite scroll / paginação (parâmetros `limit` e `offset` da API)

**Tipos de notificação e ícones:**

| type | Ícone | Cor do ícone |
|---|---|---|
| `promo` | Gift | gradient primary→accent |
| `reservation` | Clock | gradient success→success/80 |
| `invite` | UserPlus | gradient info→info/80 |
| `queue` | Users | gradient warning→warning/80 |
| `loyalty` | Star | gradient warning→warning/80 |
| `order` | Check | gradient success→success/80 |

**Specs técnicos:**
- `useQuery(['notifications'], () => notificationsApi.getAll({ limit: 20, offset: 0 }))` com TanStack Query
- Polling a cada 30s ou integração WebSocket (usar `useQueryClient().invalidateQueries` no evento WS)
- API: `GET /notifications?limit=20&offset=0`
- Modificar `apps/client/src/navigation/` para adicionar `NotificationsScreen` ao stack

**i18n keys:**

```json
// PT-BR
"notifications.title": "Notificações",
"notifications.unread_count": "{count} não lidas",
"notifications.mark_all_read": "Marcar todas lidas",
"notifications.clear_all": "Limpar todas",
"notifications.empty.title": "Nenhuma notificação",
"notifications.empty.message": "Você está em dia! Novas notificações aparecerão aqui.",
"notifications.loading": "Carregando notificações..."

// EN
"notifications.title": "Notifications",
"notifications.unread_count": "{count} unread",
"notifications.mark_all_read": "Mark all as read",
"notifications.clear_all": "Clear all",
"notifications.empty.title": "No notifications",
"notifications.empty.message": "You're all caught up! New notifications will appear here.",

// ES
"notifications.title": "Notificaciones",
"notifications.unread_count": "{count} sin leer",
"notifications.mark_all_read": "Marcar todo como leído",
"notifications.clear_all": "Limpiar todo",
"notifications.empty.title": "Sin notificaciones",
"notifications.empty.message": "¡Al día! Las nuevas notificaciones aparecerán aquí.",
```

**Cenários de teste:**
- Happy path: usuario com 6 notificações (3 lidas, 3 não lidas) — exibe lista correta com distinção visual
- Error: falha de rede — exibe toast "Erro ao carregar notificações" com botão de retry
- Edge case: lista vazia — exibe empty state
- Edge case: 0 não lidas — header exibe "0 não lidas" ou oculta o badge

---

#### US-3.1.2 — Aceitar/Recusar convite de comanda (type: invite)

**Como** cliente, **quero** aceitar ou recusar convites de comanda compartilhada diretamente da notificação, **para** entrar em um pedido coletivo sem precisar sair da tela.

**Critérios de aceite:**
- Notificações do tipo `invite` exibem dois botões inline: "Aceitar" (--success) e "Recusar" (--destructive/outline)
- Ao aceitar: chama `POST /tabs/:tabId/invite/accept`, exibe toast "Você entrou na comanda!", navega para SharedOrderScreen
- Ao recusar: chama `POST /tabs/:tabId/invite/decline`, exibe toast "Convite recusado", notificação some da lista
- Botões desabilitados com loading spinner durante a chamada API
- Notificação já respondida não exibe os botões (estado `acknowledged`)

**Cenários de teste:**
- Happy path aceitar: convite aceito → entrada na comanda confirmada
- Happy path recusar: convite recusado → item removido da lista
- Error: falha na aceitação → toast de erro, botões reabilitados

---

#### US-3.1.3 — Marcar notificações como lidas

**Como** cliente, **quero** marcar notificações como lidas individualmente ou em massa, **para** controlar o que já vi.

**Critérios de aceite:**
- Tap em qualquer notificação não lida → `PATCH /notifications/:id/read` → remove indicador e atualiza fundo
- Botão "Marcar todas lidas" no header → `POST /notifications/mark-all-read` → atualiza toda a lista
- Swipe-to-delete em item individual → `DELETE /notifications/:id`
- Botão "Limpar todas" no rodapé → `DELETE /notifications/read/all` com confirmação modal "Remover todas as notificações lidas?"
- Badge do ícone de sino na tab bar atualiza imediatamente após marcar como lidas

**Cenários de teste:**
- Happy path: tap na notificação não lida → visual atualiza imediatamente (optimistic update)
- Happy path: "marcar todas lidas" → badge zera, todas ficam com estilo lido
- Error: falha no PATCH → reverte o estado visual, exibe toast de erro

---

## FEATURE 3.2 — AddressesScreen (Client App)

**Arquivo de referência:** `src/components/mobile-preview-v2/screens/AddressesScreenV2.tsx`
**Arquivo RN a criar:** `apps/client/src/screens/profile/AddressesScreen.tsx`
**Navegação:** Profile tab → "Meus Endereços"

### User Stories

#### US-3.2.1 — Ver lista de endereços salvos

**Como** cliente, **quero** ver todos os endereços que salvei, **para** usá-los ao buscar restaurantes próximos.

**Critérios de aceite:**
- Header: ícone MapPin + título "Meus Endereços" + contador "{N} endereços salvos"
- Cada endereço exibe: label (Casa/Trabalho/Favorito), ícone correspondente, endereço completo, complemento (opcional), bairro + cidade + CEP
- Endereço padrão tem badge "Padrão" em verde (--success)
- Endereço selecionado tem borda destacada em --primary
- Skeleton loading (2 itens) durante carregamento

**Specs técnicos:**
- `useQuery(['addresses', userId], () => usersApi.getAddresses(userId))`
- Criar `apps/client/src/api/users.api.ts` se não existir

**i18n keys:**

```json
// PT-BR
"addresses.title": "Meus Endereços",
"addresses.count": "{count} endereços salvos",
"addresses.add_new": "Adicionar novo endereço",
"addresses.saved": "Endereços Salvos",
"addresses.default_badge": "Padrão",
"addresses.set_default": "Definir como padrão",
"addresses.delete_confirm": "Remover este endereço?",
"addresses.empty.title": "Nenhum endereço salvo",
"addresses.empty.message": "Adicione um endereço para encontrar restaurantes próximos.",
"addresses.tip": "Seus endereços são usados para localizar restaurantes próximos.",

// EN
"addresses.title": "My Addresses",
"addresses.count": "{count} saved addresses",
"addresses.add_new": "Add new address",
"addresses.default_badge": "Default",
"addresses.set_default": "Set as default",
"addresses.delete_confirm": "Remove this address?",
"addresses.empty.title": "No saved addresses",
"addresses.empty.message": "Add an address to find nearby restaurants.",

// ES
"addresses.title": "Mis Direcciones",
"addresses.count": "{count} direcciones guardadas",
"addresses.add_new": "Agregar nueva dirección",
"addresses.default_badge": "Predeterminada",
"addresses.set_default": "Establecer como predeterminada",
"addresses.delete_confirm": "¿Eliminar esta dirección?",
"addresses.empty.title": "Sin direcciones guardadas",
"addresses.empty.message": "Agrega una dirección para encontrar restaurantes cercanos.",
```

**Cenários de teste:**
- Happy path: usuário com 3 endereços — lista exibida com padrão marcado
- Edge case: lista vazia — empty state com CTA para adicionar
- Error: falha de rede — toast de erro com retry

---

#### US-3.2.2 — Adicionar novo endereço

**Critérios de aceite:**
- Botão "Adicionar novo endereço" (borda tracejada, ícone Plus) abre modal ou navega para AddressFormScreen
- Formulário: label (picker: Casa/Trabalho/Favorito/Outro), rua + número, complemento (opcional), bairro, cidade, estado, CEP
- Validação: rua e CEP obrigatórios
- CEP com busca automática via API ViaCEP (preenche bairro/cidade automaticamente)
- Ao salvar: `POST /users/addresses` → toast "Endereço adicionado" → volta para lista
- Botão "Salvar" desabilitado até campos obrigatórios preenchidos

**Cenários de teste:**
- Happy path: endereço válido adicionado → aparece no topo da lista
- Error: CEP inválido → campo fica com borda vermelha + mensagem "CEP não encontrado"
- Edge case: complemento vazio → campo exibido como vazio, sem erro

---

#### US-3.2.3 — Definir endereço padrão

**Critérios de aceite:**
- Botão "Definir como padrão" disponível em cada endereço não-padrão (via menu de contexto ou swipe action)
- Chama `PATCH /users/addresses/:id` com `{ is_default: true }`
- Atualização otimista: badge "Padrão" muda imediatamente para o novo endereço
- Apenas 1 endereço pode ser padrão por vez

**Cenários de teste:**
- Happy path: endereço B definido como padrão → A perde badge, B ganha badge
- Error: falha na API → reverte visual, exibe toast de erro

---

#### US-3.2.4 — Remover endereço

**Critérios de aceite:**
- Botão de lixeira (vermelho) em cada endereço abre modal de confirmação
- Endereço padrão não pode ser removido (botão desabilitado com tooltip "Defina outro endereço como padrão primeiro")
- Ao confirmar: `DELETE /users/addresses/:id` → toast "Endereço removido" → item some da lista com animação
- Swipe-to-delete também disponível como atalho

**Cenários de teste:**
- Happy path: endereço não-padrão removido com sucesso
- Edge case: tentar remover o endereço padrão → botão desabilitado, tooltip explicativo

---

## FEATURE 3.3 — LoyaltyDetailScreen (Client App)

**Arquivo de referência:** `src/components/mobile-preview-v2/screens/LoyaltyDetailScreenV2.tsx`
**Arquivo RN a criar:** `apps/client/src/screens/LoyaltyDetailScreen.tsx`
**Navegação:** Profile tab → "Fidelidade" → detalhe de um restaurante

### User Stories

#### US-3.3.1 — Ver tier atual e progresso

**Como** cliente fidelizado, **quero** ver meu tier atual, saldo de pontos e progresso para o próximo tier, **para** entender o quanto falta para subir de nível.

**Critérios de aceite:**
- Card hero com gradiente por tier (Silver: muted-foreground, Gold: --warning, Platinum: --secondary, Black/Diamond: --info)
- Exibe: logo do restaurante, nome, tier atual com ícone de coroa, total de pontos (formatado: "2.450")
- Barra de progresso linear: percentual = `(points % threshold) / threshold × 100`
- Texto abaixo da barra: "Faltam {N} pontos para {nextTier}"
- Grid 2 colunas com stats: "Visitas" (TrendingUp icon) e "Membro desde" (Clock icon)
- Hierarquia de tiers: Silver → Gold → Platinum → Black (documentar thresholds por restaurante)

**Specs técnicos:**
- `useQuery(['loyalty', restaurantId, userId], () => loyaltyApi.getDetail(restaurantId))`
- Parâmetro `restaurantId` recebido via route params de navegação

**i18n keys:**

```json
// PT-BR
"loyalty.tier_member": "Membro {tier}",
"loyalty.points_label": "Seus Pontos",
"loyalty.next_tier": "Próximo nível",
"loyalty.points_to_next": "Faltam {count} pontos para {tier}",
"loyalty.visits_label": "Visitas",
"loyalty.member_since": "Membro desde",
"loyalty.rewards_section": "Recompensas",
"loyalty.history_section": "Histórico",
"loyalty.redeem": "Resgatar",
"loyalty.not_enough_points": "Pontos insuficientes",

// EN
"loyalty.tier_member": "{tier} Member",
"loyalty.points_label": "Your Points",
"loyalty.next_tier": "Next level",
"loyalty.points_to_next": "{count} points to {tier}",
"loyalty.visits_label": "Visits",
"loyalty.member_since": "Member since",
"loyalty.rewards_section": "Rewards",
"loyalty.history_section": "History",
"loyalty.redeem": "Redeem",

// ES
"loyalty.tier_member": "Miembro {tier}",
"loyalty.points_label": "Tus Puntos",
"loyalty.next_tier": "Próximo nivel",
"loyalty.points_to_next": "Faltan {count} puntos para {tier}",
"loyalty.visits_label": "Visitas",
"loyalty.member_since": "Miembro desde",
"loyalty.rewards_section": "Recompensas",
"loyalty.history_section": "Historial",
"loyalty.redeem": "Canjear",
```

**Cenários de teste:**
- Happy path: usuário Gold com 2.450 pontos — card em gradiente dourado, barra em 81%
- Edge case: tier máximo (Black/Diamond) — barra cheia, texto "Nível máximo atingido"
- Error: falha na query — skeleton mantido com toast "Erro ao carregar fidelidade"

---

#### US-3.3.2 — Ver rewards disponíveis e resgatar

**Como** cliente, **quero** ver os rewards que posso resgatar com meus pontos e resgatá-los com um tap, **para** aproveitar os benefícios acumulados.

**Critérios de aceite:**
- Grid 2 colunas com cards de reward: ícone Sparkles, nome, custo em pontos (com ícone de estrela)
- Reward resgatável (pontos suficientes + `available: true`): exibe botão "Resgatar" (gradiente primary→accent)
- Reward indisponível (pontos insuficientes): card com opacidade 60%, sem botão de resgate
- Ao tap "Resgatar": modal de confirmação "Resgatar {reward.name} por {points} pontos?"
- Ao confirmar: `POST /loyalty/redeem` → toast "Recompensa resgatada com sucesso!" → pontos atualizados
- Historico de pontos: lista com tipo (earn=TrendingUp verde / redeem=Gift primário), ação, data, valor (+150 / -500)

**Cenários de teste:**
- Happy path: tap "Resgatar" → confirmação → pontos debitados → histórico atualizado
- Edge case: pontos exatamente iguais ao custo → reward resgatável
- Error: resgate falha na API → toast de erro, pontos não alterados

---

## FEATURE 3.4 — PhoneAuthScreen (Client App)

**Arquivo de referência:** `src/components/mobile-preview-v2/screens/PhoneAuthScreenV2.tsx`
**Arquivo RN a criar:** `apps/client/src/screens/auth/PhoneAuthScreen.tsx`
**Navegação:** Auth stack — acessada como alternativa ao login social ou por fluxo de verificação de telefone
**Backend:** `POST /auth/phone/send-otp`, `POST /auth/phone/verify-otp`, `POST /auth/phone/complete-registration`

### User Stories

#### US-3.4.1 — Inserir número de telefone

**Como** novo usuário, **quero** informar meu número de telefone para receber um código de verificação, **para** criar minha conta ou entrar no app sem precisar de senha.

**Critérios de aceite:**
- Tela em 2 etapas (step: `phone` | `otp`), gerenciadas localmente com `useState`
- Step `phone`: picker de país (BR +55, EUA +1, PT +351), campo de número formatado como `(XX) XXXXX-XXXX`
- Máscara aplicada em tempo real via `formatPhone()`
- Botão "Continuar" desabilitado até número ter no mínimo 10 dígitos
- Ao tap "Continuar": loading spinner → chama `POST /auth/phone/send-otp` com `{ phone_number, channel: 'sms', purpose: 'login' }`
- Rate limiting: backend retorna 429 → toast "Muitas tentativas. Aguarde {N} segundos."
- Navegação para step `otp` ao receber resposta 200

**Specs técnicos:**
- Usar `expo-phone-number-picker` ou picker customizado (como no V2)
- `useMutation` para send-otp, `onSuccess` → navegar para step otp
- Implementar throttle: botão bloqueado por 60s após envio

**i18n keys:**

```json
// PT-BR
"phone_auth.title_phone": "Qual é seu número?",
"phone_auth.subtitle_phone": "Enviaremos um código de verificação",
"phone_auth.country_label": "País",
"phone_auth.phone_placeholder": "(00) 00000-0000",
"phone_auth.continue": "Continuar",
"phone_auth.title_otp": "Código de verificação",
"phone_auth.subtitle_otp": "Enviado para {phone}",
"phone_auth.resend": "Reenviar código",
"phone_auth.resend_timer": "Reenviar em {seconds}s",
"phone_auth.verified": "Verificado",
"phone_auth.verifying": "Verificando...",
"phone_auth.error.invalid_phone": "Número de telefone inválido",
"phone_auth.error.too_many_attempts": "Muitas tentativas. Tente novamente mais tarde.",

// EN
"phone_auth.title_phone": "What's your number?",
"phone_auth.subtitle_phone": "We'll send you a verification code",
"phone_auth.continue": "Continue",
"phone_auth.title_otp": "Verification code",
"phone_auth.subtitle_otp": "Sent to {phone}",
"phone_auth.resend": "Resend code",
"phone_auth.resend_timer": "Resend in {seconds}s",
"phone_auth.verified": "Verified",
"phone_auth.error.too_many_attempts": "Too many attempts. Please try again later.",

// ES
"phone_auth.title_phone": "¿Cuál es tu número?",
"phone_auth.subtitle_phone": "Te enviaremos un código de verificación",
"phone_auth.continue": "Continuar",
"phone_auth.title_otp": "Código de verificación",
"phone_auth.subtitle_otp": "Enviado a {phone}",
"phone_auth.resend": "Reenviar código",
"phone_auth.resend_timer": "Reenviar en {seconds}s",
"phone_auth.verified": "Verificado",
```

**Cenários de teste:**
- Happy path: número válido BR → OTP enviado → step muda para OTP
- Error: número incompleto (8 dígitos) → botão desabilitado
- Error: rate limit 429 → toast com mensagem e timer countdown
- Edge case: usuário volta ao step phone (botão back) → OTP zerado

---

#### US-3.4.2 — Verificar código OTP

**Como** usuário, **quero** inserir o código de 6 dígitos recebido por SMS, **para** confirmar meu número e acessar o app.

**Critérios de aceite:**
- 6 campos individuais (cada um aceita 1 dígito), com auto-focus para o próximo campo ao preencher
- Backspace no campo vazio foca o campo anterior
- Auto-submit quando todos os 6 campos estão preenchidos
- Durante verificação: spinner central + campos desabilitados
- Sucesso: campos ficam com fundo --success, ícone de check, navega para BiometricEnrollmentScreen (se `biometric_enrollment_token` na resposta) ou HomeScreen
- Erro (OTP inválido): shake animation nos campos, texto "{N} tentativas restantes"
- Botão "Reenviar código" desabilitado com countdown de 60s, habilitado após timer
- Reenvio chama novamente `POST /auth/phone/send-otp`

**Fluxos pós-verificação (conforme backend):**
- `status: 'authenticated'` → salvar tokens, ir para Home
- `status: 'registration_required'` → ir para CompleteProfileScreen com `temp_token`
- `biometric_enrollment_token` presente → após Home, oferecer BiometricEnrollmentScreen

**Cenários de teste:**
- Happy path: código correto → autenticação → Home
- Happy path novo usuário: código correto → `registration_required` → CompleteProfileScreen
- Error: código errado 3 vezes → "0 tentativas restantes" → bloqueio temporário
- Error: código expirado → toast "Código expirado. Solicite um novo."
- Edge case: paste de 6 dígitos → preenche todos os campos automaticamente

---

## FEATURE 3.5 — BiometricEnrollmentScreen (Client App)

**Arquivo de referência:** `src/components/mobile-preview-v2/screens/BiometricEnrollmentScreenV2.tsx`
**Arquivo RN a criar:** `apps/client/src/screens/auth/BiometricEnrollmentScreen.tsx`
**Navegação:** Exibida após login bem-sucedido via PhoneAuth (ou Settings) quando `biometric_enrollment_token` está disponível
**Backend:** `POST /auth/biometric/enroll`

### User Stories

#### US-3.5.1 — Cadastrar biometria (Face ID / Touch ID)

**Como** usuário autenticado, **quero** cadastrar minha biometria no dispositivo, **para** acessar o app de forma rápida e segura nas próximas vezes.

**Critérios de aceite:**
- Tela em 3 steps: `prompt` → `enrolling` → `success`
- Step `prompt`: ícone Fingerprint com gradiente primary→accent, título "Acesso rápido", subtítulo "Use Face ID ou Touch ID para entrar de forma segura e instantânea"
- Dois botões: "Ativar biometria" (primário) e "Configurar depois" (link discreto)
- Step `enrolling`: ícone com pulse animation, texto "Escaneando... Mantenha seu dedo no sensor"
- Step `success`: ícone de check em --success, título "Tudo pronto!", botão "Começar" que navega para Home
- "Pular" / "Configurar depois": navega para Home sem registrar

**Fluxo técnico com backend:**
1. Usar `expo-local-authentication` para solicitar biometria nativa do dispositivo
2. Obter `enrollment_token` + `biometric_type` + `public_key` do dispositivo
3. Chamar `POST /auth/biometric/enroll` com `{ enrollment_token, biometric_type, device_info, public_key }` + JWT no header
4. Salvar `biometric_token` retornado em SecureStore (`expo-secure-store`)
5. `biometric_token` usado em logins futuros: `POST /auth/biometric/authenticate`

**Specs técnicos:**
- `expo-local-authentication` para `LocalAuthentication.authenticateAsync()`
- `expo-secure-store` para armazenamento seguro do token
- `expo-device` para `device_info`
- `useMutation` para chamar `POST /auth/biometric/enroll`
- Verificar suporte: `LocalAuthentication.hasHardwareAsync()` — se falso, pular direto

**i18n keys:**

```json
// PT-BR
"biometric.skip": "Pular",
"biometric.title": "Acesso rápido",
"biometric.subtitle": "Use Face ID ou Touch ID para entrar de forma segura e instantânea",
"biometric.activate": "Ativar biometria",
"biometric.later": "Configurar depois",
"biometric.enrolling.title": "Escaneando...",
"biometric.enrolling.subtitle": "Mantenha seu dedo no sensor",
"biometric.success.title": "Tudo pronto!",
"biometric.success.subtitle": "Agora você pode entrar rapidamente usando biometria",
"biometric.success.cta": "Começar",
"biometric.error.not_supported": "Biometria não disponível neste dispositivo",
"biometric.error.enrollment_failed": "Falha ao cadastrar biometria. Tente novamente.",

// EN
"biometric.title": "Quick access",
"biometric.subtitle": "Use Face ID or Touch ID to log in securely and instantly",
"biometric.activate": "Enable biometrics",
"biometric.later": "Set up later",
"biometric.enrolling.title": "Scanning...",
"biometric.enrolling.subtitle": "Keep your finger on the sensor",
"biometric.success.title": "All set!",
"biometric.success.subtitle": "You can now sign in quickly using biometrics",
"biometric.success.cta": "Get started",

// ES
"biometric.title": "Acceso rápido",
"biometric.subtitle": "Usa Face ID o Touch ID para entrar de forma segura e instantánea",
"biometric.activate": "Activar biometría",
"biometric.later": "Configurar después",
"biometric.success.title": "¡Todo listo!",
"biometric.success.cta": "Empezar",
```

**Cenários de teste:**
- Happy path: dispositivo com Face ID → enrollment bem-sucedido → token salvo → success screen
- Edge case: dispositivo sem hardware biométrico → `hasHardwareAsync()` retorna false → tela não é exibida / pular automático
- Error: usuário cancela autenticação nativa → volta ao step prompt com mensagem discreta
- Error: `POST /auth/biometric/enroll` falha (token inválido) → toast de erro, opção de tentar novamente

---

## FEATURE 3.6 — CouponsScreen (Client App)

**Arquivo de referência:** `src/components/mobile-preview-v2/screens/CouponsScreenV2.tsx`
**Arquivo RN a criar:** `apps/client/src/screens/CouponsScreen.tsx`
**Navegação:** Profile tab ou menu lateral → "Meus Cupons"

### User Stories

#### US-3.6.1 — Ver cupons disponíveis

**Como** cliente, **quero** ver todos os cupons que tenho disponíveis, **para** usá-los no meu próximo pedido ou reserva.

**Critérios de aceite:**
- Header: ícone Ticket com gradiente laranja, título "Meus Cupons", subtítulo "{N} cupons disponíveis"
- Seção "Disponíveis" com ícone Sparkles
- Cada cupom exibe: ícone por tipo (Percent/Tag/Ticket/Gift), valor do desconto em destaque, descrição curta, data de validade com ícone Clock, código do cupom
- Layout de cupom físico com decoração: semicírculos nas laterais, linha tracejada central
- Gradientes de cor distintos por tipo (percent=laranja, fixed=verde, delivery=azul, gift=rosa)
- Seções separadas: "Disponíveis" / "Usados" / "Expirados" (tabs ou seções colapsáveis)
- Skeleton loading durante carregamento
- Empty state: "Nenhum cupom disponível no momento. Fique de olho!"

**Specs técnicos:**
- `useQuery(['coupons', userId], () => couponsApi.getUserCoupons())`
- API: `GET /coupons` (filtros: `status=active|used|expired`)
- Campo input no topo para adicionar cupão por código

**i18n keys:**

```json
// PT-BR
"coupons.title": "Meus Cupons",
"coupons.count": "{count} cupons disponíveis",
"coupons.add_placeholder": "Adicionar código de cupom",
"coupons.apply": "Aplicar",
"coupons.section.available": "Disponíveis",
"coupons.section.used": "Usados",
"coupons.section.expired": "Expirados",
"coupons.copied": "Código copiado!",
"coupons.copy": "Copiar",
"coupons.empty": "Nenhum cupom disponível no momento.",
"coupons.empty.hint": "Fique de olho! Novos cupons são adicionados frequentemente.",
"coupons.expiry.no_expiry": "Sem data de validade",
"coupons.expiry.valid_until": "Válido até {date}",

// EN
"coupons.title": "My Coupons",
"coupons.count": "{count} coupons available",
"coupons.add_placeholder": "Add coupon code",
"coupons.apply": "Apply",
"coupons.section.available": "Available",
"coupons.section.used": "Used",
"coupons.section.expired": "Expired",
"coupons.copied": "Code copied!",
"coupons.copy": "Copy",
"coupons.empty": "No coupons available right now.",

// ES
"coupons.title": "Mis Cupones",
"coupons.count": "{count} cupones disponibles",
"coupons.add_placeholder": "Agregar código de cupón",
"coupons.apply": "Aplicar",
"coupons.section.available": "Disponibles",
"coupons.section.used": "Usados",
"coupons.section.expired": "Expirados",
"coupons.copied": "¡Código copiado!",
"coupons.empty": "No hay cupones disponibles por el momento.",
```

**Cenários de teste:**
- Happy path: 4 cupons disponíveis — lista exibida com cores e ícones corretos
- Empty state: lista vazia — mensagem com dica
- Error: falha na query — toast de erro com retry

---

#### US-3.6.2 — Copiar/usar cupom

**Como** cliente, **quero** copiar o código de um cupom com um tap, **para** colá-lo no checkout sem digitar manualmente.

**Critérios de aceite:**
- Botão de cópia (ícone Copy) em cada cupom → `Clipboard.setString(code)` → ícone muda para Check (verde) por 2 segundos
- Toast "Código copiado!" aparece brevemente
- Campo de input no topo: digitar código + botão "Aplicar" → `POST /coupons/validate` → toast de confirmação ou erro
- Cupom inválido: toast "Cupom inválido ou expirado"
- Cupom já usado: toast "Este cupom já foi utilizado"

**Cenários de teste:**
- Happy path: tap copy → ícone vira check por 2s → code no clipboard
- Happy path: digitar código válido → "Cupom OKINAWA20 aplicado! 20% OFF"
- Error: código inexistente → "Cupom inválido ou expirado"

---

## FEATURE 3.7 — WaiterCallsScreen (Restaurant App)

**Arquivo de referência:** `src/components/demo/restaurant/RoleScreens.tsx` (linhas 598–685)
**Arquivo RN a criar:** `apps/restaurant/src/screens/waiter/WaiterCallsScreen.tsx`
**Navegação:** Restaurant App — tab do Garçom ou acesso via notificação push
**Backend:** `GET /waiter-calls/restaurant/:id/pending`, `PUT /waiter-calls/:id/acknowledge`, `PUT /waiter-calls/:id/resolve`
**Entidade:** `waiter_calls` (DB) com status: `pending | acknowledged | completed | cancelled`

### User Stories

#### US-3.7.1 — Ver chamados pendentes em tempo real

**Como** garçom, **quero** ver em tempo real todos os chamados pendentes das mesas, **para** atender os clientes rapidamente sem que eles precisem se levantar.

**Critérios de aceite:**
- Banner de alerta vermelho pulsante quando há chamados urgentes: "{N} chamado(s) urgente(s)! — Prioridade máxima"
- Grid 4 colunas de métricas: Pendentes (--warning), Urgentes (--destructive), Atendidos (--success), Tempo Médio (~Nmin)
- Lista de chamados ordenada por urgência (urgentes primeiro)
- Cada card exibe: número da mesa (destaque), mensagem, badge de urgência (vermelho) quando aplicável, badge de categoria (muted), detalhes da razão, timestamp relativo
- Cards urgentes têm borda --destructive/30, fundo --destructive/5 e animação pulse
- Cards atendidos ficam com borda --success/30, opacidade 50%
- Polling a cada 15s via `useQuery` com `refetchInterval: 15000`

**Reasons da API (`WaiterCallReason`):**
- `order` → Pedido | `bill` → Conta | `question` → Dúvida | `refill` → Recarga | `assistance` → Assistência | `other` → Outro

**i18n keys:**

```json
// PT-BR
"waiter_calls.title": "Chamados",
"waiter_calls.urgent_banner": "{count} chamado(s) urgente(s)!",
"waiter_calls.urgent_banner_sub": "Prioridade máxima — atenda imediatamente",
"waiter_calls.metric.pending": "Pendentes",
"waiter_calls.metric.urgent": "Urgentes",
"waiter_calls.metric.attended": "Atendidos",
"waiter_calls.metric.avg_time": "Tempo Médio",
"waiter_calls.table_label": "Mesa {number}",
"waiter_calls.urgent_badge": "URGENTE",
"waiter_calls.attend": "Atender",
"waiter_calls.attended": "Atendido",
"waiter_calls.empty.title": "Sem chamados pendentes",
"waiter_calls.empty.message": "As mesas estão sendo bem atendidas!",
"waiter_calls.reason.order": "Pedido",
"waiter_calls.reason.bill": "Conta",
"waiter_calls.reason.question": "Dúvida",
"waiter_calls.reason.refill": "Recarga",
"waiter_calls.reason.assistance": "Assistência",
"waiter_calls.reason.other": "Outro",

// EN
"waiter_calls.title": "Calls",
"waiter_calls.urgent_banner": "{count} urgent call(s)!",
"waiter_calls.urgent_banner_sub": "Top priority — attend immediately",
"waiter_calls.attend": "Attend",
"waiter_calls.attended": "Attended",
"waiter_calls.empty.title": "No pending calls",
"waiter_calls.empty.message": "Tables are being well served!",

// ES
"waiter_calls.title": "Llamadas",
"waiter_calls.urgent_banner": "¡{count} llamada(s) urgente(s)!",
"waiter_calls.attend": "Atender",
"waiter_calls.attended": "Atendido",
"waiter_calls.empty.title": "Sin llamadas pendientes",
```

**Cenários de teste:**
- Happy path: 5 chamados (2 urgentes) → banner exibido, lista ordenada, urgentes primeiro
- Real-time: novo chamado chega via WebSocket → lista atualiza sem refresh manual
- Empty state: sem chamados → mensagem positiva
- Error: falha de rede → último estado em cache exibido + badge "Atualização pendente"

---

#### US-3.7.2 — Atender chamado

**Como** garçom, **quero** marcar um chamado como "atendido" com um tap, **para** registrar que estou indo até a mesa e manter o histórico atualizado.

**Critérios de aceite:**
- Botão "Atender" em cada chamado pendente (gradiente primary, sombra glow)
- Ao tap: loading brevíssimo → `PUT /waiter-calls/:id/acknowledge` → card muda visual para atendido (opacidade 50%, ícone CheckCircle2)
- Badge do contador de pendentes diminui imediatamente
- Chamado atendido pode ser marcado como "Resolver": `PUT /waiter-calls/:id/resolve` → some da lista
- Swipe para a esquerda: ação de resolver diretamente

**Cenários de teste:**
- Happy path: tap "Atender" → status `acknowledged` → card fica com estilo atendido
- Happy path: tap "Resolver" → status `completed` → card some da lista
- Error: falha na API → estado revertido, toast "Erro ao atualizar chamado"

---

## FEATURE 3.8 — FloorFlowScreen (Restaurant App)

**Arquivo de referência:** `src/components/demo/restaurant/RoleScreens.tsx` (linhas 1018–1097)
**Arquivo RN a criar:** `apps/restaurant/src/screens/maitre/FloorFlowScreen.tsx`
**Navegação:** Restaurant App — aba do Maitrê / Gerente
**Acesso de role:** MANAGER, OWNER, MAITRE

### User Stories

#### US-3.8.1 — Monitorar rotação de mesas

**Como** maitrê, **quero** monitorar o tempo de permanência de cada mesa ocupada, **para** identificar mesas que estão acima do tempo médio e planejar a rotação do salão.

**Critérios de aceite:**
- Grid 4 colunas: Mesas Ativas (--primary), Tempo Médio (--warning), Na Fila (--success), Espera Estimada (--info)
- Seção "Rotação de Mesas": lista de mesas ocupadas com número, nome do cliente, lugares, total do pedido, tempo decorrido, barra de progresso
- Mesas com >60 minutos: fundo --warning/5, borda --warning/20, tempo em --warning, texto "Acima da média"
- Barra de progresso: `Math.min(100, (elapsed / 90) * 100)%`, cor --success se normal, --warning se longo
- Atualização automática via polling `refetchInterval: 60000` (ou WebSocket do módulo de tables)

**Specs técnicos:**
- `useQuery(['tables', restaurantId], () => tablesApi.getActive(restaurantId), { refetchInterval: 60000 })`
- `elapsed = differenceInMinutes(now, table.occupiedSince)`
- `isLong = elapsed > 60` (threshold configurável por restaurante)

**i18n keys:**

```json
// PT-BR
"floor_flow.title": "Fluxo do Salão",
"floor_flow.metric.active_tables": "Mesas Ativas",
"floor_flow.metric.avg_time": "Tempo Médio",
"floor_flow.metric.queue": "Na Fila",
"floor_flow.metric.est_wait": "Espera Estimada",
"floor_flow.section.rotation": "Rotação de Mesas",
"floor_flow.section.queue": "Fila Virtual",
"floor_flow.above_avg": "Acima da média",
"floor_flow.normal": "Normal",
"floor_flow.seats": "{count} lugares",
"floor_flow.call_guest": "Chamar",
"floor_flow.queue.position": "#{pos}",
"floor_flow.queue.party": "{count} pessoas",
"floor_flow.queue.wait": "{time}",

// EN
"floor_flow.title": "Floor Flow",
"floor_flow.metric.active_tables": "Active Tables",
"floor_flow.metric.avg_time": "Avg Time",
"floor_flow.metric.queue": "In Queue",
"floor_flow.metric.est_wait": "Est. Wait",
"floor_flow.section.rotation": "Table Rotation",
"floor_flow.section.queue": "Virtual Queue",
"floor_flow.above_avg": "Above average",
"floor_flow.call_guest": "Call",

// ES
"floor_flow.title": "Flujo del Salón",
"floor_flow.metric.active_tables": "Mesas Activas",
"floor_flow.section.rotation": "Rotación de Mesas",
"floor_flow.section.queue": "Cola Virtual",
"floor_flow.above_avg": "Por encima del promedio",
"floor_flow.call_guest": "Llamar",
```

**Cenários de teste:**
- Happy path: 4 mesas ativas, 2 com >60min — essas exibidas em laranja
- Real-time: mesa desocupada → some da lista após polling
- Edge case: nenhuma mesa ocupada → seção vazia com mensagem "Salão livre"

---

#### US-3.8.2 — Gerenciar fila virtual

**Como** maitrê, **quero** ver e gerenciar a fila virtual de clientes aguardando mesa, **para** chamá-los assim que uma mesa for liberada.

**Critérios de aceite:**
- Seção "Fila Virtual": lista ordenada por posição (#1, #2, #3...)
- Cada item: posição (badge --warning), nome do cliente, número de pessoas no grupo, tempo estimado de espera
- Botão "Chamar" (--success) em cada item: chama `POST /tables/queue/:id/call` → toast "Cliente {nome} chamado!"
- Ao chamar: item some da fila e posição dos demais atualiza
- Integração com `VirtualQueueScreen` do Client App (cliente vê status em tempo real)

**Cenários de teste:**
- Happy path: 3 na fila → chamar #1 → lista passa para 2 itens, #2 vira #1
- Empty state: fila vazia → "Nenhum cliente aguardando"
- Error: falha ao chamar cliente → toast de erro, item permanece na fila

---

## FEATURE 3.9 — DailyReportScreen (Restaurant App)

**Arquivo de referência:** `src/components/demo/restaurant/RoleScreens.tsx` (linhas 1102–1188)
**Arquivo RN a criar:** `apps/restaurant/src/screens/reports/DailyReportScreen.tsx`
**Navegação:** Restaurant App — aba do Gerente/Owner
**Acesso de role:** MANAGER, OWNER
**Backend:** `GET /analytics/dashboard`, `GET /analytics/sales`, `GET /analytics/performance`

### User Stories

#### US-3.9.1 — Ver relatório de fechamento do dia

**Como** gerente/proprietário, **quero** visualizar o relatório completo do dia ao encerrar o expediente, **para** entender a performance do restaurante, identificar destaques e comparar com períodos anteriores.

**Critérios de aceite:**
- Card hero com gradiente primary/10→secondary/10: título "Fechamento do Dia", data formatada, badge "+X% vs semana passada" (--success) ou "-X%" (--destructive)
- Grid KPIs 2×2: Receita Total (--success), Pedidos (--primary), Ticket Médio (--info), Satisfação com estrelas (--warning)
- Seção "Mais Vendidos": top 5 itens com ranking (#1 em --primary, demais em muted), nome, quantidade
- Seção "Desempenho Equipe": avatar, nome, role, receita gerada, gorjetas em destaque (--success)
- Gráfico de barras "Receita por Hora": barras com gradiente primary, tooltip ao hover/tap com valor formatado "R$ X,Xk"
- Altura das barras: `(revenue / maxRevenue) * 100%` com mínimo de 4px
- Exportar relatório: botão "Exportar PDF" (opcional, v2)
- Skeleton loading para todos os componentes

**Specs técnicos:**
- Queries paralelas com TanStack Query:
  ```
  useQuery(['analytics/dashboard', restaurantId, date])   → GET /analytics/dashboard
  useQuery(['analytics/sales', restaurantId, date])       → GET /analytics/sales?date=today
  useQuery(['analytics/performance', restaurantId, date]) → GET /analytics/performance
  ```
- Usar `date-fns` para formatação de datas (ex: "Domingo, 23 de Março 2026")
- Gráfico: usar `react-native-svg` + barras customizadas (sem lib pesada de charts)

**i18n keys:**

```json
// PT-BR
"daily_report.title": "Fechamento do Dia",
"daily_report.comparison.up": "+{percent}% vs semana passada",
"daily_report.comparison.down": "-{percent}% vs semana passada",
"daily_report.kpi.revenue": "Receita Total",
"daily_report.kpi.orders": "Pedidos",
"daily_report.kpi.avg_ticket": "Ticket Médio",
"daily_report.kpi.satisfaction": "Satisfação",
"daily_report.section.top_sellers": "Mais Vendidos",
"daily_report.section.staff": "Desempenho Equipe",
"daily_report.section.hourly": "Receita por Hora",
"daily_report.staff.tips": "+R$ {amount} gorjetas",
"daily_report.export": "Exportar PDF",
"daily_report.loading": "Carregando relatório...",
"daily_report.error": "Erro ao carregar relatório",

// EN
"daily_report.title": "Daily Closing Report",
"daily_report.comparison.up": "+{percent}% vs last week",
"daily_report.comparison.down": "-{percent}% vs last week",
"daily_report.kpi.revenue": "Total Revenue",
"daily_report.kpi.orders": "Orders",
"daily_report.kpi.avg_ticket": "Avg Ticket",
"daily_report.kpi.satisfaction": "Satisfaction",
"daily_report.section.top_sellers": "Top Sellers",
"daily_report.section.staff": "Staff Performance",
"daily_report.section.hourly": "Hourly Revenue",
"daily_report.export": "Export PDF",

// ES
"daily_report.title": "Informe de Cierre del Día",
"daily_report.kpi.revenue": "Ingresos Totales",
"daily_report.kpi.orders": "Pedidos",
"daily_report.kpi.avg_ticket": "Ticket Promedio",
"daily_report.kpi.satisfaction": "Satisfacción",
"daily_report.section.top_sellers": "Más Vendidos",
"daily_report.section.staff": "Rendimiento del Equipo",
"daily_report.section.hourly": "Ingresos por Hora",
"daily_report.export": "Exportar PDF",
```

**Cenários de teste:**
- Happy path: dia com dados completos → todos os componentes renderizados corretamente
- Happy path: receita acima da semana passada → badge verde "+12%"
- Edge case: dia sem pedidos (restaurante fechado) → KPIs zerados, gráfico vazio, mensagem "Sem movimento registrado hoje"
- Error: falha em uma das queries → componente afetado exibe erro inline, demais carregam normalmente
- Edge case: staff sem vendas não aparece na seção de performance

---

## Sequência de Implementação Recomendada

A ordem considera dependências de fluxo (PhoneAuth → Biometric), impacto no usuário e independência técnica:

```
Sprint 1 — Semana 1-2 (Client App, auth flows):
  1. PhoneAuthScreen       ← unblocks BiometricEnrollmentScreen
  2. BiometricEnrollmentScreen

Sprint 1 — Semana 2-3 (Client App, features de perfil):
  3. NotificationsScreen   ← alto impacto, backend mais completo
  4. CouponsScreen         ← independente, simples
  5. AddressesScreen       ← independente

Sprint 1 — Semana 3-4 (Client App, fidelidade):
  6. LoyaltyDetailScreen   ← pode precisar ajuste no endpoint de loyalty

Sprint 1 — Semana 4-5 (Restaurant App):
  7. WaiterCallsScreen     ← alto impacto operacional
  8. FloorFlowScreen       ← depende de tables API

Sprint 1 — Semana 5-6 (Restaurant App, relatórios):
  9. DailyReportScreen     ← analytics API mais complexa
```

---

## Definition of Done

Uma tela é considerada **Done** quando atende a todos os critérios abaixo:

### Código
- [ ] Arquivo `.tsx` criado no path correto do app mobile (Client ou Restaurant)
- [ ] Componente usa React Native (não HTML/CSS) — sem uso de `<div>`, `<span>`, etc.
- [ ] Navegação configurada no stack/tab Navigator correspondente
- [ ] Nenhuma string hardcoded — toda string visível usa chave i18n (PT-BR, EN, ES)
- [ ] Design tokens usados corretamente (`--primary`, `--accent`, `--success`, `--warning`, `--destructive`)

### UX & Estado
- [ ] Skeleton loading implementado para carregamento inicial
- [ ] Empty state implementado com ícone, título e mensagem i18n
- [ ] Toast feedback implementado para todas as ações (sucesso e erro)
- [ ] Optimistic updates onde aplicável (ex: marcar lido, atender chamado)
- [ ] Loading states nos botões de ação (spinner inline)

### API & Dados
- [ ] Queries TanStack Query com `useQuery` ou `useMutation`
- [ ] Tratamento de erro com `onError` callback e exibição ao usuário
- [ ] Cache invalidation após mutações relacionadas
- [ ] Polling configurado onde aplicável (WaiterCalls: 15s, FloorFlow: 60s)

### Qualidade
- [ ] Testado em iOS (iPhone 14 sim) e Android (Pixel 6 sim)
- [ ] Testado em modo dark e light
- [ ] Testado nos 3 idiomas (PT-BR, EN, ES)
- [ ] Sem warnings de TypeScript
- [ ] Sem prop-types ausentes ou any não documentado
- [ ] Acessibilidade: `accessibilityLabel` nos botões de ação principais

### Review
- [ ] PR aprovado por 1 reviewer
- [ ] Screenshot/recording anexado ao PR mostrando happy path
- [ ] Linked ao ticket Jira/Linear do épico correspondente
