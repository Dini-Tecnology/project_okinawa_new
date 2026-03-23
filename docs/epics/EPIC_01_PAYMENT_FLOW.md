# EPICO 1 — Fluxo de Pagamento Completo

**Prioridade:** CRITICA | **Sprint:** 1 | **Apps:** Mobile Client (React Native)
**Status:** Em andamento — PaymentScreen.tsx parcial (820 linhas), SplitPaymentScreen.tsx parcial, CheckoutScreen ausente
**Ultima atualizacao:** 2026-03-23

---

## Visao Geral

O fluxo de pagamento e o coração da plataforma NOOWE. Sem ele, nenhuma transacao pode ser concluida — delivery, mesa, retirada, drive-thru ou qualquer outro dos 11 service types suportados.

O epic cobre cinco telas principais que formam um funil linear com um ramo de split:

```
CartScreen
    └─> CheckoutScreen (revisao do pedido)
            └─> UnifiedPaymentScreen (6 metodos + gorjeta + loyalty)
                    ├─> PaymentSuccessScreen (confirmacao + pontos + badge)
                    └─> SplitPaymentScreen (4 modos) ─> [per-person payment] ─> Success
```

**Business value:**
- Toda receita da plataforma passa por aqui; qualquer bug bloqueia 100% das conversoes
- UX de pagamento diferencia NOOWE de concorrentes: TAP to Pay, loyalty redemption e split fluido sao diferenciais competitivos diretos
- O split bill aumenta ticket medio por incentivar pedidos em grupo e reduzir friccao no fechamento de conta

---

## Pre-requisitos

- [ ] `CartScreen` funcional com itens no contexto/store
- [ ] `ServiceTypeContext` disponivel (tipo de servico: mesa, delivery, etc.)
- [ ] Backend `POST /payments/process` operacional com idempotency key
- [ ] Backend `GET /payments/wallet` operacional
- [ ] Backend `GET /payments/payment-methods` operacional
- [ ] Backend `POST /orders/:id/payment-splits` operacional (para split)
- [ ] `useI18n` hook configurado com 3 linguas (PT-BR, EN, ES)
- [ ] Design tokens configurados: `--primary`, `--accent`, `--success`, `--warning`, `--destructive`
- [ ] `useColors()` hook do ThemeContext disponivel

---

## Stack & Arquitetura Relevante

### Mobile Client
```
React Native 0.74 + Expo 51
React Navigation 6 (Stack + BottomTab)
TanStack Query 5 (cache de dados, mutations)
React Hook Form 7 + Zod 4 (validacao de formularios de cartao)
react-native-paper (componentes base — Button, Card, TextInput, RadioButton)
Socket.IO client (updates em tempo real do split)
```

### Backend Endpoints (payments.controller.ts)
```
POST   /payments/process           — Processar pagamento (rate limit: 10/min, idempotent)
GET    /payments/wallet            — Saldo da carteira
POST   /payments/wallet/recharge   — Recarregar carteira
GET    /payments/transactions      — Historico de transacoes
GET    /payments/payment-methods   — Listar metodos salvos
POST   /payments/payment-methods   — Adicionar metodo
PATCH  /payments/methods/:id       — Atualizar metodo
DELETE /payments/payment-methods/:id — Remover metodo
```

### Arquivos existentes (estado atual)
```
mobile/apps/client/src/screens/payment/
  PaymentScreen.tsx          — 820 linhas, parcial, SEM i18n, SEM skeleton, SEM haptics
  SplitPaymentScreen.tsx     — Parcial, TEM i18n basico, TEM WebSocket, FALTA design v2
  DigitalReceiptScreen.tsx   — Estado desconhecido

mobile/apps/client/src/navigation/index.tsx
  — TEM rota 'Payment' registrada
  — FALTA rota 'Checkout', 'SplitPayment', 'PaymentSuccess', 'DigitalReceipt'
```

### Referencias de design
```
src/components/demo/
  DemoPayment.tsx          — Grid 3x2 de metodos, loyalty toggle, tip selector, resumo
  DemoPaymentSuccess.tsx   — Icone animado, loyalty reward, badge, stats, acoes
  DemoSplitBill.tsx        — People avatars, 4 modos, yourAmount highlight

src/components/mobile-preview-v2/screens/
  CheckoutScreenV2.tsx         — Header, split mode tabs, metodos lista, tip, resumo
  UnifiedPaymentScreenV2.tsx   — Tabs Pagar/Dividir/Gorjeta, 6 metodos grid, split modes
  SplitPaymentScreenV2.tsx     — Status mesa, 4 modos split, item selection, fixed amount
  DigitalReceiptScreenV2.tsx   — Success banner, info restaurante, itens, pontos fidelidade
```

---

## FEATURE 1.1 — CheckoutScreen (Revisao antes de pagar)

### Descricao

Tela intermediaria entre o carrinho e o pagamento. Exibe um resumo completo do pedido — itens, quantidades, localizacao/mesa, service type e valores — para o cliente confirmar antes de prosseguir. Esta tela e essencial para reduzir erros de pedido e chargebacks.

**Estado atual:** A tela NAO EXISTE. O fluxo atual pula direto de Cart para PaymentScreen sem revisao.

---

### User Stories

#### US-1.1.1 — Revisar pedido antes de pagar

**Como** cliente
**Quero** ver um resumo completo do meu pedido antes de confirmar o pagamento
**Para** verificar itens, quantidades e valor total com clareza antes de comprometer o pagamento

**Criterios de Aceite:**
- [ ] Exibe lista de itens com nome, quantidade, preco unitario e subtotal por item
- [ ] Exibe o service type badge visivel (ex.: "Mesa 12", "Delivery", "Retirada")
- [ ] Exibe subtotal, taxa de servico (10%) e total em secao de resumo
- [ ] Botao primario "Confirmar e Pagar" navega para `UnifiedPaymentScreen`
- [ ] Botao secundario "Voltar ao Carrinho" volta para `CartScreen` sem perder itens
- [ ] Estado de loading skeleton enquanto dados do pedido carregam
- [ ] Estado de erro com mensagem + botao de retry se API falhar
- [ ] Suporta modo escuro via `useColors()`
- [ ] Todas as strings passam por `t()` — i18n completo PT-BR, EN, ES
- [ ] Haptic feedback leve no botao "Confirmar e Pagar" (impactAsync light)

**Design Reference:** `/src/components/mobile-preview-v2/screens/CheckoutScreenV2.tsx`

**Specs Tecnicos:**
```typescript
// Arquivo a CRIAR:
mobile/apps/client/src/screens/payment/CheckoutScreen.tsx

// Arquivos a MODIFICAR:
mobile/apps/client/src/navigation/index.tsx
  // Adicionar rota:
  <Stack.Screen
    name="Checkout"
    component={CheckoutScreen}
    options={{ title: t('checkout.title'), ...modalScreenOptions }}
  />

mobile/apps/client/src/screens/cart/CartScreen.tsx
  // Substituir navigate('Payment', { orderId }) por navigate('Checkout', { orderId })

// Dependencias de estado:
// - cartItems do store/context (ja existente)
// - serviceType do ServiceTypeContext
// - tableNumber do contexto de sessao (se in-venue)
// - orderId se pedido ja foi criado no backend

// APIs a consumir:
// GET /orders/:id — se orderId disponivel
// Dados de carrinho ja em cache via TanStack Query
```

**i18n Keys — PT-BR / EN / ES:**
```json
{
  "pt-BR": {
    "checkout.title": "Confirmar Pedido",
    "checkout.subtitle": "Revise seus itens antes de pagar",
    "checkout.section.items": "Seus itens",
    "checkout.section.location": "Local",
    "checkout.section.summary": "Resumo do pedido",
    "checkout.subtotal": "Subtotal",
    "checkout.service_fee": "Taxa de servico (10%)",
    "checkout.total": "Total",
    "checkout.badge.table": "Mesa {{number}}",
    "checkout.badge.delivery": "Delivery",
    "checkout.badge.pickup": "Retirada",
    "checkout.button.confirm": "Confirmar e Pagar",
    "checkout.button.back": "Voltar ao Carrinho",
    "checkout.loading": "Carregando pedido...",
    "checkout.error.load": "Nao foi possivel carregar o pedido",
    "checkout.error.retry": "Tentar novamente",
    "checkout.empty": "Carrinho vazio"
  },
  "en": {
    "checkout.title": "Confirm Order",
    "checkout.subtitle": "Review your items before paying",
    "checkout.section.items": "Your items",
    "checkout.section.location": "Location",
    "checkout.section.summary": "Order summary",
    "checkout.subtotal": "Subtotal",
    "checkout.service_fee": "Service fee (10%)",
    "checkout.total": "Total",
    "checkout.badge.table": "Table {{number}}",
    "checkout.badge.delivery": "Delivery",
    "checkout.badge.pickup": "Pickup",
    "checkout.button.confirm": "Confirm & Pay",
    "checkout.button.back": "Back to Cart",
    "checkout.loading": "Loading order...",
    "checkout.error.load": "Could not load order",
    "checkout.error.retry": "Try again",
    "checkout.empty": "Cart is empty"
  },
  "es": {
    "checkout.title": "Confirmar Pedido",
    "checkout.subtitle": "Revisa tus articulos antes de pagar",
    "checkout.section.items": "Tus articulos",
    "checkout.section.location": "Ubicacion",
    "checkout.section.summary": "Resumen del pedido",
    "checkout.subtotal": "Subtotal",
    "checkout.service_fee": "Cargo por servicio (10%)",
    "checkout.total": "Total",
    "checkout.badge.table": "Mesa {{number}}",
    "checkout.badge.delivery": "Domicilio",
    "checkout.badge.pickup": "Para llevar",
    "checkout.button.confirm": "Confirmar y Pagar",
    "checkout.button.back": "Volver al Carrito",
    "checkout.loading": "Cargando pedido...",
    "checkout.error.load": "No se pudo cargar el pedido",
    "checkout.error.retry": "Reintentar",
    "checkout.empty": "Carrito vacio"
  }
}
```

**Cenarios de Teste:**
- [ ] Happy path: cart com 3 itens → checkout exibe lista correta → totais corretos → navega para UnifiedPayment
- [ ] Edge case: cart vazio → guard na navegacao redireciona para CartScreen com toast
- [ ] Error path: falha de rede ao carregar order → skeleton desaparece → mensagem de erro + botao retry
- [ ] Service type: delivery → exibe badge "Delivery" + endereco; mesa → badge "Mesa X"
- [ ] Dark mode: todos os tokens de cor corretos em modo escuro
- [ ] i18n: trocar lingua para EN → todos os textos mudam sem reload

---

## FEATURE 1.2 — UnifiedPaymentScreen (6 metodos de pagamento)

### Descricao

Tela principal de pagamento. Unifica selecao de metodo (6 opcoes), selecao de gorjeta (0/10/15/20%), resgate de pontos de fidelidade e confirmacao do valor final. Contem tambem aba de "Dividir" que leva ao SplitPaymentScreen e aba "Gorjeta" para gorjeta direcionada a membro especifico da equipe.

**Estado atual:** `PaymentScreen.tsx` (820 linhas) tem funcionalidade basica de payment methods (saved_card, new_card, pix, wallet, cash) mas FALTA: grid visual dos 6 metodos, selector de gorjeta, loyalty points toggle, tabs, design v2, haptic feedback, skeleton loading.

---

### User Stories

#### US-1.2.1 — Selecionar metodo de pagamento em grid visual

**Como** cliente
**Quero** ver todos os metodos de pagamento disponiveis em um grid visual claro
**Para** escolher rapidamente o metodo de minha preferencia

**Criterios de Aceite:**
- [ ] Grid 3x2 exibe: PIX, Credito, Apple Pay, Google Pay, TAP to Pay, Carteira
- [ ] Metodo selecionado tem borda `--primary` + fundo `--primary/10`
- [ ] Metodo nao selecionado tem borda `--border` + fundo `--card`
- [ ] Apple Pay visivel apenas em iOS (`Platform.OS === 'ios'`)
- [ ] Google Pay visivel apenas em Android (`Platform.OS === 'android'`)
- [ ] Carteira mostra saldo disponivel abaixo do nome (ex.: "R$ 150,00")
- [ ] Carteira desabilitada (opacidade 0.4) se saldo < valor do pedido
- [ ] TAP to Pay mostra badge "Novo" com cor `--accent`
- [ ] Selecionar metodo dispara haptic feedback leve

#### US-1.2.2 — Selecionar gorjeta

**Como** cliente
**Quero** escolher uma porcentagem de gorjeta antes de confirmar o pagamento
**Para** reconhecer o trabalho da equipe de forma pratica

**Criterios de Aceite:**
- [ ] Seletor com 4 opcoes: Sem, 10%, 15%, 20%
- [ ] Opcao selecionada em destaque com cor `--primary`
- [ ] Valor em reais exibido abaixo de cada porcentagem (ex.: "R$ 15,09")
- [ ] Default: 10% pre-selecionado
- [ ] Total no rodape atualiza em tempo real ao mudar gorjeta
- [ ] Aba "Gorjeta" permite direcionar para membro especifico da equipe ou "Toda a Equipe"

#### US-1.2.3 — Resgatar pontos de fidelidade

**Como** cliente com pontos acumulados
**Quero** usar meus pontos para obter desconto no pagamento
**Para** aproveitar o beneficio do programa de fidelidade

**Criterios de Aceite:**
- [ ] Card de loyalty exibido se usuario tiver pontos disponeis (> 0)
- [ ] Toggle "Usar pontos" aplica desconto no total
- [ ] Mostra: "340 pontos disponiveis" e "Use 200 pts = R$ 10 de desconto"
- [ ] Ao ativar toggle: linha de desconto aparece no resumo com cor `--success`
- [ ] Ao ativar: botao muda para "Usado (checkmark)" em verde
- [ ] Total atualiza subtraindo o desconto de pontos

#### US-1.2.4 — Confirmar pagamento com Idempotency Key

**Como** cliente
**Quero** confirmar o pagamento com seguranca
**Para** garantir que meu cartao nao seja cobrado duas vezes em caso de falha de rede

**Criterios de Aceite:**
- [ ] Ao pressionar "Pagar R$ X.XX": botao entra em estado `loading`
- [ ] Header `X-Idempotency-Key` gerado com UUID v4 antes de cada request
- [ ] Haptic feedback `notificationAsync(SUCCESS)` ao confirmar pagamento
- [ ] Em caso de sucesso: navega para `PaymentSuccessScreen`
- [ ] Em caso de erro de rede: toast "Pagamento falhou. Verifique sua conexao."
- [ ] Em caso de erro do gateway: toast com mensagem da API
- [ ] Botao volta ao estado normal apos erro (nao fica travado em loading)
- [ ] Nao permite double-tap (disabled=true durante loading)

**Design Reference:**
```
src/components/demo/DemoPayment.tsx          — Estrutura geral, loyalty, tip
src/components/mobile-preview-v2/screens/UnifiedPaymentScreenV2.tsx — Grid 3x2, tabs, split modes
```

**Specs Tecnicos:**
```typescript
// Arquivo a MODIFICAR (refatorar completamente o design):
mobile/apps/client/src/screens/payment/PaymentScreen.tsx
// OU renomear para UnifiedPaymentScreen.tsx e registrar nova rota

// Logica de idempotencia (ja referenciada no backend):
import { v4 as uuidv4 } from 'uuid';
const idempotencyKey = uuidv4();
// Adicionar no header: 'X-Idempotency-Key': idempotencyKey

// APIs:
POST /payments/process     — { order_id, amount, payment_method, payment_method_id?, tokenized_card?, pix_key? }
GET  /payments/wallet      — saldo para exibicao
GET  /payments/payment-methods — metodos salvos

// Integracao de metodos nativos:
// Apple Pay: @stripe/stripe-react-native presentApplePay()
// Google Pay: @stripe/stripe-react-native presentGooglePay()
// TAP to Pay: @stripe/stripe-react-native collectPaymentMethod()

// Estado da tela:
type PaymentMethod = 'pix' | 'credit' | 'apple' | 'google' | 'tap' | 'wallet';
const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
const [tipPercent, setTipPercent] = useState(10);
const [usePoints, setUsePoints] = useState(false);
const [processing, setProcessing] = useState(false);

// Calculo do total:
const tipAmount = subtotal * (tipPercent / 100);
const pointsDiscount = usePoints ? pointsValue : 0;
const finalTotal = subtotal + tipAmount - pointsDiscount;
```

**i18n Keys — PT-BR / EN / ES:**
```json
{
  "pt-BR": {
    "payment.title": "Pagamento",
    "payment.subtitle.table": "Mesa {{number}} · {{restaurant}}",
    "payment.subtitle.delivery": "Delivery · {{restaurant}}",
    "payment.tab.pay": "Pagar",
    "payment.tab.split": "Dividir",
    "payment.tab.tip": "Gorjeta",
    "payment.methods.title": "Forma de pagamento",
    "payment.methods.pix": "PIX",
    "payment.methods.credit": "Credito",
    "payment.methods.apple": "Apple Pay",
    "payment.methods.google": "Google Pay",
    "payment.methods.tap": "TAP to Pay",
    "payment.methods.tap.badge": "Novo",
    "payment.methods.wallet": "Carteira",
    "payment.methods.wallet.balance": "R$ {{amount}}",
    "payment.methods.wallet.insufficient": "Saldo insuficiente",
    "payment.tip.title": "Gorjeta para a equipe",
    "payment.tip.none": "Sem",
    "payment.tip.value": "R$ {{amount}}",
    "payment.tip.adding": "Voce esta adicionando R$ {{amount}} de gorjeta",
    "payment.tip.recipient.team": "Toda a Equipe",
    "payment.tip.recipient.team.desc": "Dividido entre todos",
    "payment.loyalty.title": "{{points}} pontos disponiveis",
    "payment.loyalty.subtitle": "Use {{pts}} pts = R$ {{discount}} de desconto",
    "payment.loyalty.button.use": "Usar",
    "payment.loyalty.button.used": "Usado",
    "payment.summary.title": "Resumo",
    "payment.summary.subtotal": "Subtotal",
    "payment.summary.tip": "Gorjeta ({{percent}}%)",
    "payment.summary.discount_points": "Desconto (pontos)",
    "payment.summary.total": "Total",
    "payment.cta.pay": "Pagar R$ {{amount}}",
    "payment.cta.send_tip": "Enviar Gorjeta",
    "payment.processing": "Processando pagamento...",
    "payment.secure": "Pagamento seguro · Criptografia de ponta a ponta",
    "payment.error.generic": "Pagamento falhou. Tente novamente.",
    "payment.error.network": "Erro de conexao. Verifique sua internet.",
    "payment.error.insufficient_wallet": "Saldo insuficiente na carteira.",
    "payment.error.invalid_card": "Dados do cartao invalidos.",
    "payment.card.number": "Numero do cartao",
    "payment.card.name": "Nome no cartao",
    "payment.card.expiry": "Validade (MM/AA)",
    "payment.card.cvv": "CVV",
    "payment.card.save": "Salvar cartao",
    "payment.card.add": "Adicionar Cartao",
    "payment.card.saved": "Cartoes salvos",
    "payment.pix.label": "Chave PIX",
    "payment.pix.hint": "Voce recebera um QR Code para finalizar"
  },
  "en": {
    "payment.title": "Payment",
    "payment.subtitle.table": "Table {{number}} · {{restaurant}}",
    "payment.subtitle.delivery": "Delivery · {{restaurant}}",
    "payment.tab.pay": "Pay",
    "payment.tab.split": "Split",
    "payment.tab.tip": "Tip",
    "payment.methods.title": "Payment method",
    "payment.methods.pix": "PIX",
    "payment.methods.credit": "Credit",
    "payment.methods.apple": "Apple Pay",
    "payment.methods.google": "Google Pay",
    "payment.methods.tap": "TAP to Pay",
    "payment.methods.tap.badge": "New",
    "payment.methods.wallet": "Wallet",
    "payment.methods.wallet.balance": "R$ {{amount}}",
    "payment.methods.wallet.insufficient": "Insufficient balance",
    "payment.tip.title": "Tip for the team",
    "payment.tip.none": "None",
    "payment.tip.value": "R$ {{amount}}",
    "payment.tip.adding": "You are adding R$ {{amount}} tip",
    "payment.tip.recipient.team": "Whole Team",
    "payment.tip.recipient.team.desc": "Split among everyone",
    "payment.loyalty.title": "{{points}} points available",
    "payment.loyalty.subtitle": "Use {{pts}} pts = R$ {{discount}} discount",
    "payment.loyalty.button.use": "Use",
    "payment.loyalty.button.used": "Used",
    "payment.summary.title": "Summary",
    "payment.summary.subtotal": "Subtotal",
    "payment.summary.tip": "Tip ({{percent}}%)",
    "payment.summary.discount_points": "Discount (points)",
    "payment.summary.total": "Total",
    "payment.cta.pay": "Pay R$ {{amount}}",
    "payment.cta.send_tip": "Send Tip",
    "payment.processing": "Processing payment...",
    "payment.secure": "Secure payment · End-to-end encryption",
    "payment.error.generic": "Payment failed. Please try again.",
    "payment.error.network": "Connection error. Check your internet.",
    "payment.error.insufficient_wallet": "Insufficient wallet balance.",
    "payment.error.invalid_card": "Invalid card details.",
    "payment.card.number": "Card number",
    "payment.card.name": "Cardholder name",
    "payment.card.expiry": "Expiry (MM/YY)",
    "payment.card.cvv": "CVV",
    "payment.card.save": "Save card",
    "payment.card.add": "Add Card",
    "payment.card.saved": "Saved cards",
    "payment.pix.label": "PIX key",
    "payment.pix.hint": "You will receive a QR Code to complete"
  },
  "es": {
    "payment.title": "Pago",
    "payment.subtitle.table": "Mesa {{number}} · {{restaurant}}",
    "payment.subtitle.delivery": "A domicilio · {{restaurant}}",
    "payment.tab.pay": "Pagar",
    "payment.tab.split": "Dividir",
    "payment.tab.tip": "Propina",
    "payment.methods.title": "Metodo de pago",
    "payment.methods.pix": "PIX",
    "payment.methods.credit": "Credito",
    "payment.methods.apple": "Apple Pay",
    "payment.methods.google": "Google Pay",
    "payment.methods.tap": "TAP to Pay",
    "payment.methods.tap.badge": "Nuevo",
    "payment.methods.wallet": "Monedero",
    "payment.methods.wallet.balance": "R$ {{amount}}",
    "payment.methods.wallet.insufficient": "Saldo insuficiente",
    "payment.tip.title": "Propina para el equipo",
    "payment.tip.none": "Sin",
    "payment.tip.value": "R$ {{amount}}",
    "payment.tip.adding": "Estas agregando R$ {{amount}} de propina",
    "payment.tip.recipient.team": "Todo el Equipo",
    "payment.tip.recipient.team.desc": "Dividido entre todos",
    "payment.loyalty.title": "{{points}} puntos disponibles",
    "payment.loyalty.subtitle": "Usa {{pts}} pts = R$ {{discount}} de descuento",
    "payment.loyalty.button.use": "Usar",
    "payment.loyalty.button.used": "Usado",
    "payment.summary.title": "Resumen",
    "payment.summary.subtotal": "Subtotal",
    "payment.summary.tip": "Propina ({{percent}}%)",
    "payment.summary.discount_points": "Descuento (puntos)",
    "payment.summary.total": "Total",
    "payment.cta.pay": "Pagar R$ {{amount}}",
    "payment.cta.send_tip": "Enviar Propina",
    "payment.processing": "Procesando pago...",
    "payment.secure": "Pago seguro · Cifrado de extremo a extremo",
    "payment.error.generic": "Pago fallido. Intenta de nuevo.",
    "payment.error.network": "Error de conexion. Verifica tu internet.",
    "payment.error.insufficient_wallet": "Saldo insuficiente en el monedero.",
    "payment.error.invalid_card": "Datos de tarjeta invalidos.",
    "payment.card.number": "Numero de tarjeta",
    "payment.card.name": "Nombre en la tarjeta",
    "payment.card.expiry": "Vencimiento (MM/AA)",
    "payment.card.cvv": "CVV",
    "payment.card.save": "Guardar tarjeta",
    "payment.card.add": "Agregar Tarjeta",
    "payment.card.saved": "Tarjetas guardadas",
    "payment.pix.label": "Clave PIX",
    "payment.pix.hint": "Recibiras un codigo QR para completar"
  }
}
```

**Cenarios de Teste:**
- [ ] Happy path PIX: seleciona PIX → preenche chave → paga → sucesso
- [ ] Happy path Credito: seleciona credito → preenche cartao → Luhn valida → paga → sucesso
- [ ] Happy path Apple Pay: iOS → tap Apple Pay → biometria Apple → sucesso
- [ ] Happy path Carteira: saldo >= total → paga com carteira → saldo decrementado
- [ ] Gorjeta: muda de 10% para 20% → total atualiza corretamente em tempo real
- [ ] Loyalty: toggle "Usar pontos" → desconto aparece → total cai
- [ ] Carteira insuficiente: saldo R$ 50, total R$ 120 → opcao desabilitada com mensagem
- [ ] Erro de rede: request falha → toast de erro → botao volta ao normal (nao trava)
- [ ] Double tap: pressionar "Pagar" rapidamente duas vezes → apenas um request (disabled durante loading)
- [ ] Dark mode: testar todos os estados de selecao com tema escuro

---

## FEATURE 1.3 — PaymentSuccessScreen (Confirmacao de pagamento)

### Descricao

Tela de confirmacao exibida apos pagamento bem-sucedido. Deve comunicar clareza (pagamento aprovado), recompensa (pontos ganhos, badge de conquista) e proximas acoes (avaliar, novo pedido, compartilhar comprovante).

**Estado atual:** Existe apenas um estado inline em `PaymentScreen.tsx` (linhas 500-510) — um `IconButton` e dois `Text`. Nao e uma tela separada, nao tem animacao, nao tem pontos de fidelidade, nao tem acoes.

---

### User Stories

#### US-1.3.1 — Confirmar pagamento aprovado com feedback visual

**Como** cliente
**Quero** ver uma confirmacao clara e motivadora apos o pagamento
**Para** ter certeza de que a transacao foi concluida com sucesso

**Criterios de Aceite:**
- [ ] Icone de check em circulo com gradiente `--success` → `--success/80`
- [ ] Animacao de entrada: escala de 0 para 1 com bounce (Animated.spring)
- [ ] Titulo "Pagamento Confirmado!" em destaque
- [ ] Subtitulo com valor pago: "Seu pagamento de R$ X,XX foi processado"
- [ ] Card de resumo: metodo de pagamento, valor, data/hora
- [ ] Haptic feedback `notificationAsync(SUCCESS)` ao entrar na tela

#### US-1.3.2 — Exibir pontos de fidelidade ganhos

**Como** cliente com programa de fidelidade
**Quero** ver quantos pontos ganhei com esta compra
**Para** acompanhar meu progresso no programa de recompensas

**Criterios de Aceite:**
- [ ] Card de loyalty com icone, "+" + numero de pontos ganhos
- [ ] Descricao: "Programa de Fidelidade NOOWE"
- [ ] Pontos calculados como: `Math.floor(valorPago)` (1 ponto por real)
- [ ] Nao exibir card se usuario nao fizer parte do programa

#### US-1.3.3 — Exibir badge de conquista (se aplicavel)

**Como** cliente
**Quero** ser notificado quando ganhar um badge especial
**Para** sentir motivacao em continuar usando a plataforma

**Criterios de Aceite:**
- [ ] Badge exibido se milestone atingida (ex.: "Primeira compra", "10 visitas")
- [ ] Icone de Award em `--accent`
- [ ] Texto descritivo do badge
- [ ] Animacao de entrada com delay de 300ms apos o icone principal

#### US-1.3.4 — Proximas acoes pos-pagamento

**Como** cliente
**Quero** poder ir para as proximas acoes facilmente
**Para** nao ficar preso na tela de confirmacao sem saber o que fazer

**Criterios de Aceite:**
- [ ] Botao primario: "Ver Comprovante" → navega para `DigitalReceiptScreen`
- [ ] Botao secundario: "Inicio" → reseta stack para `Home`
- [ ] Botao terciario (outline): "Compartilhar" → Share nativo do SO
- [ ] Nao exibe botao "Voltar" no header (pagamento e irreversivel)

**Design Reference:** `/src/components/demo/DemoPaymentSuccess.tsx`

**Specs Tecnicos:**
```typescript
// Arquivo a CRIAR:
mobile/apps/client/src/screens/payment/PaymentSuccessScreen.tsx

// Arquivo a MODIFICAR:
mobile/apps/client/src/navigation/index.tsx
  <Stack.Screen
    name="PaymentSuccess"
    component={PaymentSuccessScreen}
    options={{ headerShown: false, gestureEnabled: false }}
  />

// Props esperadas via route.params:
interface PaymentSuccessParams {
  orderId: string;
  amountPaid: number;
  paymentMethod: string;
  pointsEarned: number;
  badge?: { text: string; icon?: string };
  receiptId?: string;
}

// Calculo de pontos (no cliente, confirmado pelo backend):
const pointsEarned = Math.floor(amountPaid);

// Animacao de entrada (Animated):
const scaleAnim = useRef(new Animated.Value(0)).current;
useEffect(() => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    damping: 10,
    stiffness: 100,
    useNativeDriver: true,
  }).start();
}, []);
```

**i18n Keys — PT-BR / EN / ES:**
```json
{
  "pt-BR": {
    "success.title": "Pagamento Confirmado!",
    "success.subtitle": "Seu pagamento de R$ {{amount}} foi processado",
    "success.summary.method": "Metodo",
    "success.summary.amount": "Valor pago",
    "success.summary.datetime": "Data/Hora",
    "success.loyalty.title": "+{{points}} pontos ganhos",
    "success.loyalty.desc": "Programa de Fidelidade NOOWE",
    "success.badge.prefix": "Conquista desbloqueada:",
    "success.action.receipt": "Ver Comprovante",
    "success.action.home": "Inicio",
    "success.action.share": "Compartilhar"
  },
  "en": {
    "success.title": "Payment Confirmed!",
    "success.subtitle": "Your payment of R$ {{amount}} was processed",
    "success.summary.method": "Method",
    "success.summary.amount": "Amount paid",
    "success.summary.datetime": "Date/Time",
    "success.loyalty.title": "+{{points}} points earned",
    "success.loyalty.desc": "NOOWE Loyalty Program",
    "success.badge.prefix": "Achievement unlocked:",
    "success.action.receipt": "View Receipt",
    "success.action.home": "Home",
    "success.action.share": "Share"
  },
  "es": {
    "success.title": "Pago Confirmado!",
    "success.subtitle": "Tu pago de R$ {{amount}} fue procesado",
    "success.summary.method": "Metodo",
    "success.summary.amount": "Monto pagado",
    "success.summary.datetime": "Fecha/Hora",
    "success.loyalty.title": "+{{points}} puntos ganados",
    "success.loyalty.desc": "Programa de Fidelidad NOOWE",
    "success.badge.prefix": "Logro desbloqueado:",
    "success.action.receipt": "Ver Comprobante",
    "success.action.home": "Inicio",
    "success.action.share": "Compartir"
  }
}
```

**Cenarios de Teste:**
- [ ] Happy path: navega para tela → animacao de check toca → pontos exibidos → botao "Inicio" funciona
- [ ] Sem pontos: usuario sem fidelidade → card de pontos nao aparece
- [ ] Com badge: milestone atingida → badge aparece com animacao de delay
- [ ] Botao compartilhar: abre Share nativo do SO com texto de comprovante
- [ ] Sem botao voltar: botao de voltar do header nao existe (gestureEnabled: false)

---

## FEATURE 1.4 — SplitPaymentScreen (4 modos de divisao)

### Descricao

Tela de divisao de conta entre multiplos usuarios da mesa. Quatro modos distintos de divisao: Individual (quem pediu paga o seu), Partes Iguais (divide igualmente), Por Item (selecao manual de itens) e Valor Fixo (cada um define quanto paga). Atualizacoes em tempo real via Socket.IO quando outros usuarios da mesa pagam.

**Estado atual:** `SplitPaymentScreen.tsx` existe com funcionalidade solida (WebSocket, calculos de split, modal de pagamento) mas FALTA: design v2 (grid de modos, pessoas como cards horizontais com avatar), i18n completo e UX polida.

---

### User Stories

#### US-1.4.1 — Visualizar status de pagamento de cada pessoa na mesa

**Como** cliente em uma mesa compartilhada
**Quero** ver quem ja pagou e quem ainda deve
**Para** acompanhar o progresso do fechamento da conta em tempo real

**Criterios de Aceite:**
- [ ] Cards horizontais scrollaveis com avatar de cada pessoa na mesa
- [ ] Card de quem pagou: borda `--success`, fundo `--success/5`, icone de check no avatar
- [ ] Card de quem nao pagou: borda `--border`, status "Pendente"
- [ ] Card do usuario atual: borda `--primary`, fundo `--primary/5`
- [ ] Nome exibido (truncado para 8 caracteres) + valor pago ou "Pendente"
- [ ] Atualizacao em tempo real via Socket.IO (`payment:split_updated`)
- [ ] "Pago" aparece automaticamente sem refresh quando outro paga

#### US-1.4.2 — Selecionar modo de divisao

**Como** cliente
**Quero** escolher como vou dividir minha parte da conta
**Para** pagar exatamente o que e justo para mim

**Criterios de Aceite:**
- [ ] Grid 2x2 com 4 modos: Meus Itens, Partes Iguais, Por Item, Valor Fixo
- [ ] Cada card tem: icone, nome, descricao curta
- [ ] Modo selecionado: borda `--primary`, fundo `--primary/10`, texto `--primary`
- [ ] Modo nao selecionado: borda `--border`, fundo `--card`
- [ ] Mudar modo recalcula o valor "Voce paga" em tempo real

**Modos detalhados:**
```
individual  — "Meus Itens":   cada um paga os itens que pediu + proporcional de taxa/gorjeta
equal       — "Partes Iguais": total / numero de pessoas pendentes
selective   — "Por Item":      usuario seleciona manualmente os itens que vai pagar
fixed       — "Valor Fixo":    usuario define um valor fixo (stepper +/- ou input)
```

#### US-1.4.3 — Selecionar itens no modo "Por Item"

**Como** cliente no modo "Por Item"
**Quero** selecionar exatamente os itens pelos quais vou pagar
**Para** ter controle granular sobre minha parte da conta

**Criterios de Aceite:**
- [ ] Lista de todos os itens do pedido com checkbox
- [ ] Item pago por outro (status=paid): exibe "Pago" com tick verde, desabilitado
- [ ] Item selecionado: borda `--primary`, checkbox preenchido
- [ ] Item nao selecionado: borda `--border`, checkbox vazio
- [ ] Total "Voce paga" atualiza a cada item selecionado/desselecionado
- [ ] Cada item exibe: nome, quem pediu, preco

#### US-1.4.4 — Definir valor no modo "Valor Fixo"

**Como** cliente no modo "Valor Fixo"
**Quero** definir um valor especifico para pagar
**Para** dividir de forma flexivel sem seguir os modos automaticos

**Criterios de Aceite:**
- [ ] Stepper com botoes +/- que incrementam em R$ 10
- [ ] Valor maximo = total restante da mesa (nao pode pagar a mais)
- [ ] Valor minimo = R$ 0,00
- [ ] Exibe "Maximo: R$ X,XX" acima do stepper
- [ ] Valor em fonte grande no centro do card

**Design Reference:**
```
src/components/demo/DemoSplitBill.tsx
src/components/mobile-preview-v2/screens/SplitPaymentScreenV2.tsx
src/components/mobile-preview-v2/screens/SplitByItemScreenV2.tsx (se existir)
```

**Specs Tecnicos:**
```typescript
// Arquivo a MODIFICAR (refatorar visual):
mobile/apps/client/src/screens/payment/SplitPaymentScreen.tsx

// APIs (ja mapeadas no codigo existente):
GET  /orders/:id                           — dados do pedido
GET  /orders/:id/guests                    — pessoas na mesa (ApiService.getOrderGuests)
GET  /orders/:id/payment-splits            — splits existentes
POST /orders/:id/payment-splits            — criar splits (ApiService.createAllPaymentSplits)
POST /payments/process                     — processar pagamento de split individual

// WebSocket (ja implementado):
joinRoom('payment:${orderId}')
on('payment:split_updated', handler)       — atualiza splits em tempo real
on('payment:completed', handler)           — todos pagaram

// Calculo de gorjeta no split (adicionar ao codigo existente):
const myTip = mySubtotal * (tipPercent / 100);
const myTotal = mySubtotal + myTip;
```

**i18n Keys — PT-BR / EN / ES:**
```json
{
  "pt-BR": {
    "split.title": "Dividir Conta",
    "split.subtitle": "Total da mesa: R$ {{total}}",
    "split.table.status": "Status da Mesa",
    "split.person.paid": "Pago",
    "split.person.pending": "Pendente",
    "split.modes.title": "Modo de Divisao",
    "split.mode.individual": "Meus Itens",
    "split.mode.individual.desc": "Pago o que pedi",
    "split.mode.equal": "Partes Iguais",
    "split.mode.equal.desc": "Dividido igualmente",
    "split.mode.selective": "Por Item",
    "split.mode.selective.desc": "Escolho os itens",
    "split.mode.fixed": "Valor Fixo",
    "split.mode.fixed.desc": "Defino quanto pago",
    "split.items.title": "Selecione os itens",
    "split.items.paid_by": "Pago por {{name}}",
    "split.fixed.max": "Maximo: R$ {{max}}",
    "split.tip.title": "Adicionar Gorjeta",
    "split.you_pay": "Voce paga",
    "split.total": "Total",
    "split.remaining": "Resta: R$ {{amount}}",
    "split.cta": "Pagar R$ {{amount}}",
    "split.all_paid": "Conta quitada!",
    "split.total_paid": "Total pago",
    "split.create_splits": "Criar divisao",
    "split.pay_now": "Pagar agora",
    "split.error.create": "Nao foi possivel criar a divisao",
    "split.error.pay": "Pagamento falhou"
  },
  "en": {
    "split.title": "Split Bill",
    "split.subtitle": "Table total: R$ {{total}}",
    "split.table.status": "Table Status",
    "split.person.paid": "Paid",
    "split.person.pending": "Pending",
    "split.modes.title": "Split Mode",
    "split.mode.individual": "My Items",
    "split.mode.individual.desc": "I pay what I ordered",
    "split.mode.equal": "Equal Split",
    "split.mode.equal.desc": "Divided equally",
    "split.mode.selective": "By Item",
    "split.mode.selective.desc": "I choose the items",
    "split.mode.fixed": "Fixed Amount",
    "split.mode.fixed.desc": "I set how much I pay",
    "split.items.title": "Select items",
    "split.items.paid_by": "Paid by {{name}}",
    "split.fixed.max": "Maximum: R$ {{max}}",
    "split.tip.title": "Add Tip",
    "split.you_pay": "You pay",
    "split.total": "Total",
    "split.remaining": "Remaining: R$ {{amount}}",
    "split.cta": "Pay R$ {{amount}}",
    "split.all_paid": "Bill settled!",
    "split.total_paid": "Total paid",
    "split.create_splits": "Create split",
    "split.pay_now": "Pay now",
    "split.error.create": "Could not create split",
    "split.error.pay": "Payment failed"
  },
  "es": {
    "split.title": "Dividir Cuenta",
    "split.subtitle": "Total de la mesa: R$ {{total}}",
    "split.table.status": "Estado de la Mesa",
    "split.person.paid": "Pagado",
    "split.person.pending": "Pendiente",
    "split.modes.title": "Modo de Division",
    "split.mode.individual": "Mis Articulos",
    "split.mode.individual.desc": "Pago lo que pedi",
    "split.mode.equal": "Partes Iguales",
    "split.mode.equal.desc": "Dividido igualmente",
    "split.mode.selective": "Por Articulo",
    "split.mode.selective.desc": "Elijo los articulos",
    "split.mode.fixed": "Monto Fijo",
    "split.mode.fixed.desc": "Defino cuanto pago",
    "split.items.title": "Selecciona los articulos",
    "split.items.paid_by": "Pagado por {{name}}",
    "split.fixed.max": "Maximo: R$ {{max}}",
    "split.tip.title": "Agregar Propina",
    "split.you_pay": "Tu pagas",
    "split.total": "Total",
    "split.remaining": "Resta: R$ {{amount}}",
    "split.cta": "Pagar R$ {{amount}}",
    "split.all_paid": "Cuenta saldada!",
    "split.total_paid": "Total pagado",
    "split.create_splits": "Crear division",
    "split.pay_now": "Pagar ahora",
    "split.error.create": "No se pudo crear la division",
    "split.error.pay": "Pago fallido"
  }
}
```

**Cenarios de Teste:**
- [ ] Happy path individual: 3 pessoas → modo "Meus Itens" → valor calculado corretamente → paga → card fica verde
- [ ] Happy path igual: 3 pessoas, total R$ 300 → modo "Partes Iguais" → cada um R$ 100
- [ ] Happy path por item: seleciona 2 itens → total = soma dos itens → paga
- [ ] Happy path fixo: define R$ 80 de R$ 200 total → paga R$ 80 → restante R$ 120 fica para outros
- [ ] WebSocket: outra pessoa paga → card atualiza para verde automaticamente sem refresh
- [ ] Todos pagaram: `payment:completed` → estado "Conta quitada!" → botao de ir para inicio
- [ ] Error: API falha ao criar split → toast de erro → estado nao muda
- [ ] Item ja pago: item de Joao com status=paid → exibe como pago e desabilitado na selecao

---

## FEATURE 1.5 — DigitalReceiptScreen (Comprovante Digital)

### Descricao

Comprovante digital pos-pagamento. Exibe todos os detalhes da transacao: dados do restaurante (CNPJ, endereco), itens consumidos, valores, metodo de pagamento, pontos ganhos e acao de avaliacao. Suporta compartilhamento nativo e download como PDF.

**Estado atual:** `DigitalReceiptScreen.tsx` existe mas o conteudo e desconhecido — precisa de audit para verificar alinhamento com o design v2 (`DigitalReceiptScreenV2.tsx`).

---

### User Stories

#### US-1.5.1 — Ver comprovante completo pos-pagamento

**Como** cliente
**Quero** ver um comprovante digital detalhado apos o pagamento
**Para** ter registro da transacao e poder resolver disputas se necessario

**Criterios de Aceite:**
- [ ] Banner "Pagamento Aprovado!" com icone de check em `--success`
- [ ] Card de info do restaurante: nome, endereco, CNPJ
- [ ] Grid de metadados: data, hora, numero de mesa (ou "Delivery")
- [ ] Lista de itens consumidos: quantidade, nome, notas especiais, preco
- [ ] Secao de valores: subtotal, descontos (cupom/pontos), gorjeta, total pago
- [ ] Secao de metodo de pagamento: icone do metodo, nome, ultimos 4 digitos (se cartao)
- [ ] Card de pontos ganhos: "+X pontos" com icone de estrela em `--primary`
- [ ] Botoes de compartilhamento e download no header

#### US-1.5.2 — Compartilhar e baixar comprovante

**Como** cliente
**Quero** poder compartilhar ou salvar o comprovante
**Para** ter uma copia fisica ou digital para meus registros

**Criterios de Aceite:**
- [ ] Botao compartilhar (Share2 icon) no header → abre Share nativo do SO
- [ ] Botao download (Download icon) no header → salva PDF no dispositivo
- [ ] Conteudo do share: texto formatado com detalhes principais
- [ ] Share inclui: nome restaurante, valor total, data

#### US-1.5.3 — Avaliar experiencia a partir do comprovante

**Como** cliente
**Quero** poder avaliar minha experiencia diretamente do comprovante
**Para** dar feedback enquanto a experiencia ainda esta fresca

**Criterios de Aceite:**
- [ ] Card "Avalie sua experiencia" no rodape do comprovante
- [ ] Botao "Avaliar Restaurante" → navega para `RatingScreen`
- [ ] Card aparece apenas se usuario ainda nao avaliou este pedido

**Design Reference:** `/src/components/mobile-preview-v2/screens/DigitalReceiptScreenV2.tsx`

**Specs Tecnicos:**
```typescript
// Arquivo a AUDITAR e MODIFICAR:
mobile/apps/client/src/screens/payment/DigitalReceiptScreen.tsx

// APIs:
GET /orders/:id             — dados completos do pedido e itens
GET /payments/transactions  — transacao especifica com metodo de pagamento

// Navegacao:
// Adicionar rota 'DigitalReceipt' se nao existir na navigation/index.tsx
// Params: { orderId: string; transactionId?: string }

// Compartilhamento:
import { Share } from 'react-native';
Share.share({
  message: `Comprovante NOOWE - ${restaurantName}\nTotal: R$ ${total}\nData: ${date}`,
  title: `Comprovante #${orderNumber}`,
});
```

**i18n Keys — PT-BR / EN / ES:**
```json
{
  "pt-BR": {
    "receipt.title": "Comprovante Digital",
    "receipt.order_number": "Pedido {{number}}",
    "receipt.success.title": "Pagamento Aprovado!",
    "receipt.success.subtitle": "Obrigado por sua visita",
    "receipt.restaurant.section": "Restaurante",
    "receipt.meta.date": "Data",
    "receipt.meta.time": "Hora",
    "receipt.meta.table": "Mesa",
    "receipt.meta.delivery": "Delivery",
    "receipt.items.title": "Itens Consumidos",
    "receipt.summary.subtotal": "Subtotal",
    "receipt.summary.discount": "Desconto ({{code}})",
    "receipt.summary.tip": "Gorjeta",
    "receipt.summary.total": "Total Pago",
    "receipt.payment.title": "Forma de Pagamento",
    "receipt.loyalty.title": "Pontos Acumulados",
    "receipt.loyalty.program": "Programa de Fidelidade",
    "receipt.loyalty.points_label": "pontos",
    "receipt.rating.title": "Avalie sua experiencia",
    "receipt.rating.subtitle": "Sua opiniao nos ajuda a melhorar!",
    "receipt.rating.button": "Avaliar Restaurante",
    "receipt.action.share": "Compartilhar",
    "receipt.action.download": "Baixar"
  },
  "en": {
    "receipt.title": "Digital Receipt",
    "receipt.order_number": "Order {{number}}",
    "receipt.success.title": "Payment Approved!",
    "receipt.success.subtitle": "Thank you for your visit",
    "receipt.restaurant.section": "Restaurant",
    "receipt.meta.date": "Date",
    "receipt.meta.time": "Time",
    "receipt.meta.table": "Table",
    "receipt.meta.delivery": "Delivery",
    "receipt.items.title": "Items Consumed",
    "receipt.summary.subtotal": "Subtotal",
    "receipt.summary.discount": "Discount ({{code}})",
    "receipt.summary.tip": "Tip",
    "receipt.summary.total": "Total Paid",
    "receipt.payment.title": "Payment Method",
    "receipt.loyalty.title": "Points Earned",
    "receipt.loyalty.program": "Loyalty Program",
    "receipt.loyalty.points_label": "points",
    "receipt.rating.title": "Rate your experience",
    "receipt.rating.subtitle": "Your feedback helps us improve!",
    "receipt.rating.button": "Rate Restaurant",
    "receipt.action.share": "Share",
    "receipt.action.download": "Download"
  },
  "es": {
    "receipt.title": "Comprobante Digital",
    "receipt.order_number": "Pedido {{number}}",
    "receipt.success.title": "Pago Aprobado!",
    "receipt.success.subtitle": "Gracias por su visita",
    "receipt.restaurant.section": "Restaurante",
    "receipt.meta.date": "Fecha",
    "receipt.meta.time": "Hora",
    "receipt.meta.table": "Mesa",
    "receipt.meta.delivery": "Domicilio",
    "receipt.items.title": "Articulos Consumidos",
    "receipt.summary.subtotal": "Subtotal",
    "receipt.summary.discount": "Descuento ({{code}})",
    "receipt.summary.tip": "Propina",
    "receipt.summary.total": "Total Pagado",
    "receipt.payment.title": "Metodo de Pago",
    "receipt.loyalty.title": "Puntos Acumulados",
    "receipt.loyalty.program": "Programa de Fidelidad",
    "receipt.loyalty.points_label": "puntos",
    "receipt.rating.title": "Califica tu experiencia",
    "receipt.rating.subtitle": "Tu opinion nos ayuda a mejorar!",
    "receipt.rating.button": "Calificar Restaurante",
    "receipt.action.share": "Compartir",
    "receipt.action.download": "Descargar"
  }
}
```

**Cenarios de Teste:**
- [ ] Happy path: navega com orderId → carrega dados → exibe todos os campos corretamente
- [ ] Compartilhar: botao share → Share nativo abre com conteudo correto
- [ ] Pontos: usuario com fidelidade → card de pontos exibido; sem fidelidade → card oculto
- [ ] Avaliacao: usuario nao avaliou → card aparece; ja avaliou → card oculto
- [ ] Desconto: pedido com cupom → linha de desconto em `--success` no resumo

---

## Sequencia de Implementacao

A ordem abaixo respeita dependencias: cada feature se apoia nas anteriores.

```
Sprint 1 — Semana 1:
  1. Registrar rotas faltantes na navigation/index.tsx
     (Checkout, SplitPayment, PaymentSuccess, DigitalReceipt)

  2. Feature 1.1 — CheckoutScreen
     Tela simples, sem dependencias complexas. Desbloqueia o fluxo correto.

  3. Feature 1.2 — Refatorar PaymentScreen → UnifiedPaymentScreen
     Maior esforco do epic. Toda a logica de pagamento centralizada aqui.

Sprint 1 — Semana 2:
  4. Feature 1.3 — PaymentSuccessScreen
     Depende de ter o fluxo de pagamento funcionando (Feature 1.2).

  5. Feature 1.5 — Auditar e atualizar DigitalReceiptScreen
     Audit do arquivo existente + alinhamento com design v2.

  6. Feature 1.4 — Refatorar SplitPaymentScreen
     Depende de: UnifiedPaymentScreen (metodos de pagamento), WebSocket (ja funcional).

Sprint 1 — Semana 2 (final):
  7. Testes integracao do fluxo completo (Cart → Checkout → Payment → Success → Receipt)
  8. Testes do fluxo de split (Checkout → Split → per-person payment → Success)
```

---

## Fluxo Completo (Diagrama ASCII)

### Fluxo Principal (Pagamento Individual)
```
[CartScreen]
     |
     | botao "Finalizar Pedido"
     v
[CheckoutScreen]                     ← CRIAR
  - Lista itens
  - Service type badge
  - Subtotal / taxa / total
     |
     | botao "Confirmar e Pagar"
     v
[UnifiedPaymentScreen]               ← REFATORAR (PaymentScreen.tsx)
  Tab "Pagar":
    - 6 metodos (grid 3x2)
    - Gorjeta (0/10/15/20%)
    - Loyalty points toggle
    - Resumo final
  Tab "Dividir" → [SplitPaymentScreen]
  Tab "Gorjeta" → gorjeta direcionada
     |
     | botao "Pagar R$ X,XX"
     | [POST /payments/process + X-Idempotency-Key]
     v
[PaymentSuccessScreen]               ← CRIAR
  - Animacao check
  - Pontos ganhos
  - Badge (se aplicavel)
  - Botoes: Comprovante | Inicio | Compartilhar
     |
     | botao "Ver Comprovante"
     v
[DigitalReceiptScreen]               ← AUDITAR/ATUALIZAR
  - Info restaurante
  - Itens + valores
  - Metodo de pagamento
  - Pontos + rating
```

### Fluxo de Split Bill
```
[UnifiedPaymentScreen]
  Tab "Dividir"
     |
     | botao "Ver opcoes avancadas" ou seletor de modo
     v
[SplitPaymentScreen]                 ← REFATORAR
  - Cards de pessoas (scroll horizontal)
  - Modos: Meus Itens / Partes Iguais / Por Item / Valor Fixo
  - Gorjeta individual
  - Resumo "Voce paga: R$ X"
     |
     | botao "Pagar R$ X"
     | [POST /payments/process com split_id]
     v
[PaymentSuccessScreen]               ← (reaproveitada)
  - Exibe restante da mesa
  - Progress bar de quem pagou
     |
     v
[DigitalReceiptScreen]               ← (reaproveitada)
```

---

## Definition of Done

### Por User Story
- [ ] Codigo implementado sem erros de TypeScript (`tsc --noEmit` limpo)
- [ ] Todas as strings visivas usam `t()` — zero strings hardcoded
- [ ] Chaves i18n adicionadas em PT-BR, EN e ES
- [ ] Estados de loading: skeleton ou `ActivityIndicator` enquanto dados carregam
- [ ] Estado de erro com mensagem descritiva + retry action
- [ ] Estado vazio (se aplicavel) com mensagem e acao
- [ ] Haptic feedback nos CTAs principais (`impactAsync` ou `notificationAsync`)
- [ ] Suporta modo escuro via `useColors()` — todos os tokens de cor corretos
- [ ] Nao ha valores hardcoded de cores (ex.: `#000000`, `'white'`) — apenas tokens
- [ ] Testes: happy path, error path e edge cases documentados e verificados manualmente

### Por Feature
- [ ] Rota registrada corretamente no `navigation/index.tsx`
- [ ] Tipos corretos no `RootStackParamList` (se aplicavel)
- [ ] Analytics events logados nos momentos corretos (`useAnalytics`)
- [ ] Screen tracking ativo (`useScreenTracking('NomeDaTela')`)
- [ ] Sem memory leaks: useEffect com cleanup function onde aplicavel
- [ ] Acessibilidade basica: `accessibilityLabel` nos botoes de acao

### Epic completo
- [ ] Fluxo Cart → Checkout → Payment → Success funciona end-to-end em device fisico
- [ ] Fluxo de split funciona com 2+ usuarios em devices diferentes (WebSocket validado)
- [ ] Todos os 6 metodos de pagamento testados (PIX, Credito, Apple Pay*, Google Pay*, TAP*, Carteira)
- [ ] i18n testado em PT-BR, EN e ES sem textos faltando
- [ ] Dark mode testado em todas as 5 telas
- [ ] Taxa de sucesso de pagamento >= 99% em ambiente de staging (sem retry loop)
- [ ] `X-Idempotency-Key` validado: reenvio do mesmo request nao cria cobranca dupla
- [ ] Rate limit respeitado: maximo 10 requests de pagamento por minuto por usuario

*Apple Pay testado em device iOS fisico; Google Pay testado em device Android fisico. TAP to Pay requer hardware compativel.

---

## Padroes de Codigo Obrigatorios

### Estrutura de arquivo de tela
```typescript
// 1. Imports de bibliotecas
// 2. Imports do projeto (services, hooks, types)
// 3. Types/interfaces locais
// 4. Constantes locais
// 5. Componente default export
//    a. Hooks (useScreenTracking, useAnalytics, useColors, useI18n, useState, useEffect)
//    b. Handlers (funcoes de logica)
//    c. Styles (useMemo com StyleSheet.create)
//    d. Estados de loading/error/empty
//    e. JSX principal
```

### Design tokens obrigatorios
```typescript
const colors = useColors();
// Usar SEMPRE:
colors.background         // fundo principal
colors.backgroundSecondary // fundo secundario
colors.card               // fundo de cards
colors.foreground         // texto principal
colors.foregroundSecondary // texto secundario
colors.foregroundMuted    // texto desabilitado/placeholder
colors.primary            // cor de acao principal
colors.accent             // cor de destaque
colors.success            // confirmacoes, pagamentos aprovados
colors.warning            // alertas, saldo baixo
colors.error              // erros, validacoes
colors.border             // bordas de cards e inputs
```

### Haptic feedback
```typescript
import * as Haptics from 'expo-haptics';

// Para CTAs de pagamento (confirmacao):
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Para selecao de metodo/opcao:
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Para erros:
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

### Skeleton loading
```typescript
// Usar MotiView ou react-native-skeleton-placeholder para skeleton
// Dimensoes dos skeletons devem aproximar o conteudo real
// Mostrar skeleton por NO MAXIMO 3 segundos; apos, mostrar erro
```
