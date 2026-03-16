# NOOWE Demo Client — Documentação Completa

> **Rota:** `/demo/client`  
> **Objetivo:** Demonstrar interativamente a experiência do app NOOWE sob a perspectiva do cliente final, cobrindo 11 tipos de serviço com jornadas completas e interativas.

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Componentes Compartilhados](#2-componentes-compartilhados)
3. [Jornadas por Tipo de Serviço (11 Demos)](#3-jornadas-por-tipo-de-serviço)
   - [3.1 Fine Dining — Bistrô Noowe](#31-fine-dining--bistrô-noowe)
   - [3.2 Quick Service — NOOWE Express](#32-quick-service--noowe-express)
   - [3.3 Fast Casual — NOOWE Fresh](#33-fast-casual--noowe-fresh)
   - [3.4 Café & Bakery — Café Noowe](#34-café--bakery--café-noowe)
   - [3.5 Buffet — Sabores Noowe](#35-buffet--sabores-noowe)
   - [3.6 Drive-Thru — NOOWE Drive](#36-drive-thru--noowe-drive)
   - [3.7 Food Truck — Taco Noowe](#37-food-truck--taco-noowe)
   - [3.8 Chef's Table — Mesa do Chef Noowe](#38-chefs-table--mesa-do-chef-noowe)
   - [3.9 Casual Dining — Cantina Noowe](#39-casual-dining--cantina-noowe)
   - [3.10 Pub & Bar — Noowe Tap House](#310-pub--bar--noowe-tap-house)
   - [3.11 Club & Balada — NOOWE Club](#311-club--balada--noowe-club)
4. [Sistema Visual Unificado](#4-sistema-visual-unificado)
5. [Componentes de Pagamento Padronizados](#5-componentes-de-pagamento-padronizados)
6. [Mapa de Arquivos](#6-mapa-de-arquivos)

---

## 1. Visão Geral da Arquitetura

### Shell Orquestrador (`DemoClient.tsx`)

O sistema opera via um **shell orquestrador** que:

- **Seletor de Experiência:** Barra horizontal com 11 tipos de serviço clicáveis
- **PhoneShell:** Emulador de iPhone (375×812px) que renderiza a demo ativa
- **Barra lateral de Jornada:** (≥768px) Lista interativa dos estágios da jornada atual, com indicadores de progresso (ativo / completo / pendente)
- **Painel de Informação:** (≥1280px) Descrição contextual da tela atual + features do tipo de serviço
- **BottomNav:** Navegação inferior (apenas Fine Dining usa tabs de app completas)

### Registry de Demos

Cada tipo de serviço é registrado no `DEMO_REGISTRY` com:

```typescript
interface DemoConfig {
  component: React.FC<{ screen: string; onNavigate: (s: string) => void }>;
  steps: { step: number; label: string; screens: string[] }[];
  info: Record<string, { title: string; desc: string }>;
  defaultScreen: string;
  hasBottomNav: boolean;
}
```

### Fluxo de Dados

```
DemoClient (Shell)
  ├── serviceType (estado: string) → seleciona DEMO_REGISTRY[serviceType]
  ├── currentScreen (estado: string) → passado como prop `screen` para o componente ativo
  └── onNavigate (callback) → recebido pelo componente ativo para trocar de tela
```

Quando o usuário troca de tipo de serviço, o `currentScreen` reseta para `defaultScreen` (geralmente `'home'`).

---

## 2. Componentes Compartilhados

### 2.1 `DemoShared.tsx`
| Componente | Função |
|---|---|
| `PhoneShell` | Container visual de iPhone com notch, barra de status e home indicator |
| `BottomNav` | Barra de navegação inferior com 5 tabs (Explorar, Pedidos, QR, Fidelidade, Perfil) |
| `GuidedHint` | Banner pulsante com dica contextual para guiar o usuário na jornada |
| `ItemIcon` | Ícone Lucide em container com gradiente, mapeado por categoria (50+ categorias PT-BR/EN) |
| `SERVICE_TYPES` | Array com as 11 experiências: id, nome, ícone, restaurante, tagline e cor |

### 2.2 `FoodImages.tsx`
| Export | Função |
|---|---|
| `FoodImg` | Componente `<img>` com Unsplash CDN, lazy loading e 7 tamanhos (xs→detail) |
| `getFoodPhoto(id)` | Retorna URL da foto por chave. Fallback: `food-generic` |
| `FOOD_PHOTOS` | 90+ fotos reais categorizadas (burgers, sushi, coffee, wine, etc.) |

### 2.3 `DemoPayment.tsx` — Pagamento Unificado
Tela padronizada de pagamento com:
- **Gradient Header** (from-primary via-primary/90 to-accent) com título, subtítulo e total
- **Loyalty Badge** (opcional) — pontos disponíveis com botão "Usar"
- **Seletor de Gorjeta** (opcional) — 0%, 10%, 15%, 20% com cálculo automático
- **Grid de Métodos** — 6 métodos (PIX, Crédito, Apple Pay, Google Pay, TAP to Pay, Carteira) ou 2 simplificados
- **Info Banner** (opcional) — sucesso/warning/primary
- **Tempo Estimado** (opcional)
- **Resumo** — line items + total com destaque
- **CTA** — Botão gradiente "Pagar R$ X"

### 2.4 `DemoPaymentSuccess.tsx` — Sucesso Unificado
Tela padronizada de confirmação com:
- **Ícone circular** com gradiente customizável
- **Heading + subtitle**
- **Summary card** — line items com highlighting
- **Loyalty reward** — pontos ganhos e próxima recompensa
- **Badge** (opcional) — selo/conquista
- **Stats row** — grid de estatísticas (tempo, código, etc.)
- **Primary + Secondary actions** — botões de navegação

### 2.5 `DemoSplitBill.tsx` — Divisão de Conta Unificada
Tela padronizada de split com:
- **Gradient Header** idêntico ao DemoPayment
- **People at table** — avatares horizontais com status de pagamento
- **4 modos de divisão:** Meus Itens, Partes Iguais, Por Item, Valor Fixo
- **Summary lines** (opcional)
- **"Você paga"** — destaque do valor individual
- **CTA** — "Prosseguir para Pagamento"

### 2.6 `DemoOrderStatus.tsx` — Status do Pedido Unificado
Tela padronizada de acompanhamento com:
- **Gradient Header** com código do pedido
- **Progress Pipeline** — steps customizáveis por tipo de serviço (3-5 etapas)
- **ETA Card** — barra de progresso animada
- **Pickup Code** (opcional) — código grande para retirada
- **Items Status** — cards individuais com status (Pronto/Preparando/Na fila)
- **Table Info** (opcional) — info da mesa/local
- **Help Button** — chamar equipe discretamente

**Presets de Pipeline por Tipo:**

| Tipo | Etapas |
|---|---|
| Fine Dining | Recebido → Preparando → Pronto → Entregue |
| Quick Service | Recebido → Preparando → Conferência → Pronto |
| Fast Casual | Recebido → Base → Montagem → Qualidade → Pronto |
| Café & Bakery | Recebido → Preparando → Pronto |
| Buffet | Check-in → Pesando → Extras → Completo |
| Drive-Thru | Recebido → Preparando → Pronto → Janela |
| Food Truck | Recebido → Preparando → Pronto |
| Chef's Table | Recebido → Empratando → Sommelier → Servido |
| Casual Dining | Recebido → Preparando → Pronto → Entregue |
| Pub & Bar | Recebido → Preparando → Pronto |
| Club | Recebido → Preparando → Pronto |

---

## 3. Jornadas por Tipo de Serviço

---

### 3.1 Fine Dining — Bistrô Noowe

**Arquivo:** `FineDiningDemo.tsx` (1205 linhas)  
**Estágios:** 11 | **Telas:** 18 | **Bottom Nav:** ✅ Sim

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Descobrir restaurante | `home`, `restaurant` | Busca por proximidade, categoria e avaliação. Perfil com fotos, avaliações e features. |
| 2 | Escanear QR da mesa | `qr-scan` | QR Code da mesa para associação automática. |
| 3 | Explorar cardápio | `menu`, `item`, `ai-harmonization` | Cardápio digital com categorias, alérgenos, tempo de preparo. **IA sugere harmonizações** de pratos + bebidas. |
| 4 | Montar comanda | `comanda` | Revisão da comanda com ajuste de quantidades e convite de pessoas à mesa. |
| 5 | Acompanhar pedido | `order-status` | Pipeline: Recebido → Preparando → Pronto → Entregue. Status individual por item com nome do chef. |
| 6 | Fechar conta & pagar | `fechar-conta`, `payment-success` | **Split por item** (4 modos: Meus Itens, Partes Iguais, Por Item, Valor Fixo). Gorjeta configurável. Pagamento unificado (DemoPayment). |
| 7 | Programa de fidelidade | `loyalty` | Pontos com níveis (Silver→Black), recompensas resgatáveis e histórico. |
| 8 | Reservar mesa | `reservations` | Reserva com convite de amigos, link compartilhável e código de confirmação. |
| 9 | Fila virtual | `virtual-queue` | Fila virtual para restaurantes lotados com tracking em tempo real. |
| 10 | Chamar equipe | `call-waiter` | Chamada discreta: garçom, sommelier ou ajuda geral. |
| 11 | Notificações | `notifications` | Convites para comanda, fila pronta, pontos ganhos, promoções e status. |

**Âncora Funcional:** Harmonização por IA + Fechamento de conta com Split completo

**Telas extras:** `profile`, `my-orders`, `payment` (pagamento padronizado)

---

### 3.2 Quick Service — NOOWE Express

**Arquivo:** `QuickServiceDemo.tsx` (621 linhas)  
**Estágios:** 8 | **Telas:** 8

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Descobrir restaurante | `home`, `restaurant` | Quick Services com Skip the Line: peça antes de chegar. |
| 2 | Skip the Line & menu | `menu` | Combos em destaque, tempo de preparo por item, montagem de carrinho. |
| 3 | Personalizar item | `item` | Extras pagos (bacon, cheddar), remoção de ingredientes, tamanho e observações. |
| 4 | Revisar carrinho | `cart` | Quantidades, cupom de desconto, tempo estimado total, modo de retirada. |
| 5 | Pagamento rápido | `payment` | DemoPayment unificado com fullMethodGrid. |
| 6 | Acompanhar preparo | `preparing` | Tracking em 4 etapas: Recebido → Preparando → Conferência → Pronto. Push notification automática. |
| 7 | Retirar pedido | `ready` | Código de retirada, tempo total, balcão express designado. |
| 8 | Avaliar & fidelidade | `rating` | Avaliação por categorias (velocidade, sabor, atendimento), stamp card e pontos. |

**Âncora Funcional:** Skip the Line + Acompanhamento de preparo em 4 estágios

---

### 3.3 Fast Casual — NOOWE Fresh

**Arquivo:** `FastCasualDemo.tsx` (618 linhas)  
**Estágios:** 7 | **Telas:** 12

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Descobrir restaurante | `home`, `restaurant` | Opções saudáveis e customizáveis por perto. |
| 2 | Bowls salvos ou novo | `saved-bowls` | Refaça pedidos salvos ou crie do zero. |
| 3 | Montar prato (4 etapas) | `builder-base`, `builder-protein`, `builder-toppings`, `builder-sauce` | **Montador de Bowl:** Base (arroz/quinoa/salada/wrap) → Proteína (frango/carne/salmão/tofu) → Toppings (vegetais + premium) → Molho (até 2). Nutrição em tempo real. |
| 4 | Resumo & alergias | `builder-summary`, `allergies` | Resumo com macro nutrients (cal/carbs/prot/fibra). Verificação automática de alérgenos. |
| 5 | Pagamento | `payment` | DemoPayment unificado. |
| 6 | Preparo em tempo real | `prep-tracking` | Pipeline: Recebido → Base → Montagem → Qualidade → Pronto. |
| 7 | Retirada & avaliação | `ready`, `rating` | Código de retirada + avaliação com pontos extras. |

**Âncora Funcional:** Montador de Pratos/Bowls com acompanhamento nutricional e de alérgenos

---

### 3.4 Café & Bakery — Café Noowe

**Arquivo:** `CafeBakeryDemo.tsx` (573 linhas)  
**Estágios:** 6 | **Telas:** 8

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Descobrir café | `home`, `restaurant` | Busca por Wi-Fi, tomadas, nível de ruído e pet friendly. |
| 2 | Escanear QR da mesa | `qr-scan` | QR Code identifica mesa e tomadas disponíveis. |
| 3 | Modo trabalho | `work-mode` | **Work Mode:** Dashboard com Wi-Fi (senha copiável), velocidade, nível de ruído em tempo real, tomadas e timer de sessão. |
| 4 | Cardápio & personalização | `menu`, `customize` | Cafés especiais, chás, salgados e doces. **Personalização completa:** leite (integral/aveia/amêndoas), tamanho (P/M/G), temperatura, sabor extra, intensidade. Itens com refil marcados. |
| 5 | Comanda & refil | `comanda` | Comanda aberta: adicione itens, peça refils e acompanhe total sem sair da mesa. |
| 6 | Pagamento | `payment`, `payment-success` | Pague quando quiser. Stamp card: a cada 10 cafés, o próximo é grátis. |

**Âncora Funcional:** Work Mode (gestão de Wi-Fi/tomadas) e lógica de Refill

---

### 3.5 Buffet — Sabores Noowe

**Arquivo:** `BuffetDemo.tsx` (407 linhas)  
**Estágios:** 7 | **Telas:** 10

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Descobrir buffet | `home`, `restaurant` | Busca por tipo (peso/preço fixo). |
| 2 | Check-in digital | `checkin` | Check-in vincula comanda automaticamente. |
| 3 | Estações ao vivo | `stations` | **6 estações** (Grelhados, Massas, Saladas, Acompanhamentos, Sobremesas, Sushi Bar) com status em tempo real (fresh/replenishing). |
| 4 | Balança inteligente | `scale`, `scale-history` | **QR na balança** registra peso automaticamente. Animação de pesagem. Histórico de pesagens (volte quantas vezes quiser). Preço: R$ 79,90/kg. |
| 5 | Pedir bebidas | `drinks` | 7 opções de bebida com pedido pelo app — entregam na mesa. |
| 6 | Comanda em tempo real | `comanda` | Comanda ao vivo: comida por peso + bebidas + taxa de serviço (10%). |
| 7 | Pagamento sem fila | `payment`, `payment-success` | DemoPayment unificado com pontos e stamps. |

**Âncora Funcional:** Integração com Balança Inteligente via QR/NFC

---

### 3.6 Drive-Thru — NOOWE Drive

**Arquivo:** `DriveThruDemo.tsx` (405 linhas)  
**Estágios:** 7 | **Telas:** 11

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Pedir no caminho | `home`, `restaurant` | Peça antecipado sem sair do carro. |
| 2 | Montar pedido | `menu`, `customize`, `cart` | Combos otimizados para levar. Personalização de extras e observações. |
| 3 | Pagamento antecipado | `payment` | Pré-pagamento para retirada express. DemoPayment unificado. |
| 4 | GPS rastreia você | `gps-tracking` | **Rastreamento em tempo real** da aproximação do cliente. |
| 5 | Geofencing (500m) | `geofence` | **Gatilho automático a 500m**: cozinha recebe alerta para finalizar pedido. |
| 6 | Pista designada | `lane-assign` | App indica qual pista usar para retirada. |
| 7 | Retirada & avaliação | `pickup`, `done` | Pedido pronto e pago — retire na janela. Avaliação pós-experiência. |

**Âncora Funcional:** Gatilhos de Geofencing (GPS) a 500m do local

---

### 3.7 Food Truck — Taco Noowe

**Arquivo:** `FoodTruckDemo.tsx` (447 linhas)  
**Estágios:** 7 | **Telas:** 12

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Descobrir no mapa | `home`, `map` | **Mapa em tempo real** com GPS de cada food truck. |
| 2 | Ver food truck | `truck-detail`, `schedule` | Perfil do truck + agenda de localização nos próximos dias. |
| 3 | Fila virtual | `queue` | **Fila virtual**: entre pelo app e espere onde quiser. |
| 4 | Montar pedido | `menu`, `item-detail`, `cart` | Menu do dia com itens sazonais (tacos, burritos, quesadillas, nachos). Personalização com extras. |
| 5 | Pagamento | `payment` | DemoPayment unificado com pagamento antecipado. |
| 6 | Preparo ao vivo | `waiting` | Pipeline: Recebido → Preparando → Pronto. |
| 7 | Retirada & avaliação | `ready`, `rating` | Código de retirada + stamps extras. |

**Âncora Funcional:** Mapa em tempo real e Fila Virtual

---

### 3.8 Chef's Table — Mesa do Chef Noowe

**Arquivo:** `ChefsTableDemo.tsx` (506 linhas)  
**Estágios:** 9 | **Telas:** 13

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Descobrir experiência | `home`, `detail` | Experiências gastronômicas exclusivas. Jantar para 8 com Chef Ricardo Oliveira. |
| 2 | Reserva exclusiva | `reservation` | Escolha data, número de convidados e confirme vaga. |
| 3 | Preferências alimentares | `dietary` | Alergias, restrições e preferências alimentares do grupo. |
| 4 | Preferências de vinho | `wine-pref` | Perfil de preferências para harmonização personalizada. |
| 5 | Pagamento antecipado | `payment` | Pré-pagamento integral para confirmação. DemoPayment unificado. |
| 6 | Contagem regressiva | `countdown` | Timer visual — "Faltam X dias para sua experiência." |
| 7 | Dia da experiência | `welcome` | Recepção com champagne e apresentação pelo chef. |
| 8 | Degustação (3 cursos) | `course-1`, `course-2`, `course-3` | **Menu degustação passo a passo:** Amuse-Bouche → Wagyu A5 (com notas do Sommelier) → Soufflé Grand Finale. |
| 9 | Foto & encerramento | `photo`, `finale` | Registro fotográfico com o chef, menu assinado e certificado digital da experiência. |

**Âncora Funcional:** Menu degustação course-by-course com notas do Sommelier

---

### 3.9 Casual Dining — Cantina Noowe

**Arquivo:** `CasualDiningDemo.tsx` (776 linhas)  
**Estágios:** 9 | **Telas:** 14

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Descobrir restaurante | `home`, `restaurant` | Restaurantes casuais com filtros inteligentes e badges. |
| 2 | Walk-in ou reserva | `entry-choice` | Walk-in com fila inteligente ou reserva antecipada. |
| 3 | Lista de espera inteligente | `waitlist`, `waitlist-bar` | **Smart Waitlist:** Posição em tempo real com push notification. **Pedir na espera** — drinks enquanto aguarda (vai pra comanda). |
| 4 | Modo família | `family-mode`, `family-activities` | **Family Mode:** Cardápio kids, cadeirão e kit de atividades. **Atividades Kids** — jogos e colorir enquanto espera a comida. |
| 5 | Cardápio interativo | `menu`, `item-detail` | Menu com alérgenos, popularidade, fotos e personalização. |
| 6 | Comanda por pessoa | `comanda` | Pedidos organizados por pessoa da mesa. |
| 7 | Dividir conta | `split`, `split-by-item` | DemoSplitBill com 4 modos. Arraste itens para cada pessoa. |
| 8 | Gorjeta & pagamento | `tip`, `payment-success` | Gorjeta sugerida + DemoPayment + DemoPaymentSuccess unificados. |
| 9 | Avaliação & fidelidade | `review` | Avalie comida, serviço e ambiente. Pontos de fidelidade. |

**Âncora Funcional:** Smart Waitlist (pedidos na fila) e Modo Família (atividades/prioridade kids)

---

### 3.10 Pub & Bar — Noowe Tap House

**Arquivo:** `PubBarDemo.tsx` (800 linhas)  
**Estágios:** 9 | **Telas:** 15

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Descoberta | `discovery`, `venue` | Bares por perto com happy hour, ocupação em tempo real e amigos presentes. Detalhes: torneiras, ambiente. |
| 2 | Chegada & Check-in | `check-in`, `tab-opened` | QR da mesa → **Tab abre automaticamente** com cartão pré-autorizado. Cover vira crédito de consumo. |
| 3 | Convidar amigos | `invite-friends` | **Tab Compartilhado** — amigos entram via link. |
| 4 | Cardápio & Pedido | `menu`, `drink-detail`, `order-status` | Peça do celular sem garçom. **Ficha do chopp:** ABV, IBU, harmonização. Preços happy hour. |
| 5 | Chamar garçom | `call-waiter` | Notificação com motivo — sem levantar a mão. |
| 6 | Rodada do grupo | `round-builder`, `round-sent` | **Round Builder** — cada pessoa escolhe seu drink, enviados ao bar de uma vez. |
| 7 | Conta ao vivo | `tab-live` | Quem pediu o quê, quanto cada um deve, em **tempo real**. |
| 8 | Dividir & Pagar | `split`, `payment` | DemoSplitBill (por consumo, igual ou seletivo) + DemoPayment unificado. |
| 9 | Pós-experiência | `post` | Avalie, ganhe pontos, salve o bar nos favoritos. |

**Âncora Funcional:** Pré-autorização de comanda digital, Tab de Grupo e Round Builder

---

### 3.11 Club & Balada — NOOWE Club

**Arquivo:** `ClubDemo.tsx` (801 linhas)  
**Estágios:** 9 | **Telas:** 18

| # | Estágio | Telas | Descrição |
|---|---|---|---|
| 1 | Descoberta | `discovery`, `event-detail`, `lineup` | Eventos com lotação em tempo real e amigos indo. DJs, horários e gêneros. |
| 2 | Decisão / Ingresso | `tickets`, `digital-ticket`, `promoter-list` | **Lotes com preço dinâmico.** QR animado anti-fraude. Lista do promoter e aniversário. |
| 3 | Chegada & Check-in | `virtual-queue`, `check-in` | **Fila virtual** sem esperar fisicamente. QR validado na porta — tab abre automaticamente. |
| 4 | Cardápio & Pedido | `floor-menu`, `order-pickup` | **Peça da pista** — drinks sem sair da pista. Retirada no bar indicado. |
| 5 | Camarote VIP | `vip-table`, `vip-map` | Opções VIP com consumação mínima. **Mapa VIP** — escolha posição do camarote. |
| 6 | Bottle Service | `bottle-service` | Cardápio premium de garrafas (Absolut, Grey Goose, Moët, Johnnie Walker, Don Julio) com mixers inclusos. |
| 7 | Conta & Consumação | `min-spend` | **Tracker de consumação mínima** em tempo real — quanto falta para atingir o mínimo. |
| 8 | Dividir & Pagar | `split`, `payment` | DemoSplitBill (dividir camarote entre grupo) + DemoPayment unificado. |
| 9 | Pós-experiência | `post`, `rate` | Resumo da noite com pontos, Uber integrado. Avaliação por categoria. |

**Âncora Funcional:** Ingressos com QR animado, Mapa VIP e Tracker de consumo mínimo

---

## 4. Sistema Visual Unificado

### Princípios

| Aspecto | Regra |
|---|---|
| **Fotos de comida** | Obrigatório usar `FoodImg` / `getFoodPhoto()` com Unsplash CDN. Proibido emojis em itens de menu. |
| **Ícones de navegação** | `ItemIcon` com Lucide em containers gradiente. 50+ categorias mapeadas (PT-BR + EN). |
| **Gradient Headers** | `bg-gradient-to-br from-primary via-primary/90 to-accent` — usado em DemoPayment, DemoSplitBill, DemoOrderStatus. |
| **Cards** | `bg-card rounded-2xl p-4 shadow-md border border-border` |
| **CTAs** | `bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/25` |
| **Status badges** | Success (verde), Primary (azul), Warning (amarelo), Muted (cinza) |

### Consistência Cross-Demo

Todas as 11 demos compartilham exatamente o mesmo layout visual para:
- ✅ Tela de Pagamento (`DemoPayment`)
- ✅ Tela de Sucesso (`DemoPaymentSuccess`)
- ✅ Tela de Divisão de Conta (`DemoSplitBill`)
- ✅ Tela de Status do Pedido (`DemoOrderStatus`)

---

## 5. Componentes de Pagamento Padronizados

### Fluxo Típico

```
Comanda/Carrinho → [DemoSplitBill?] → DemoPayment → DemoPaymentSuccess
```

### Props Chave do DemoPayment

| Prop | Tipo | Descrição |
|---|---|---|
| `title` | string | Título no gradient header |
| `subtitle` | string | E.g. "Mesa 7 · Bistrô Noowe" |
| `total` | string | "R$ 189,00" |
| `items` | PaymentLineItem[] | Linhas do resumo |
| `loyalty` | PaymentLoyalty | Pontos disponíveis |
| `showTip` | boolean | Exibir seletor de gorjeta |
| `fullMethodGrid` | boolean | Grid 3×2 (true) ou lista 2 (false) |
| `infoBanner` | object | Banner informativo |
| `estimatedTime` | string | Tempo de preparo |

### 6 Métodos de Pagamento

1. **PIX** — QR Code
2. **Crédito** — Cartão de crédito
3. **Apple Pay** — Smartphone
4. **Google Pay** — Smartphone
5. **TAP to Pay** — NFC
6. **Carteira** — Carteira NOOWE

---

## 6. Mapa de Arquivos

```
src/
├── pages/
│   └── DemoClient.tsx           # Shell orquestrador com registry
├── components/demo/
│   ├── DemoShared.tsx            # PhoneShell, BottomNav, GuidedHint, ItemIcon, SERVICE_TYPES
│   ├── DemoPayment.tsx           # Pagamento unificado
│   ├── DemoPaymentSuccess.tsx    # Sucesso unificado
│   ├── DemoSplitBill.tsx         # Divisão de conta unificada
│   ├── DemoOrderStatus.tsx       # Status do pedido unificado (11 presets de pipeline)
│   ├── FoodImages.tsx            # 90+ fotos reais via Unsplash CDN
│   └── experiences/
│       ├── FineDiningDemo.tsx     # 1205 linhas · 11 estágios · 18 telas
│       ├── QuickServiceDemo.tsx   # 621 linhas  · 8 estágios  · 8 telas
│       ├── FastCasualDemo.tsx     # 618 linhas  · 7 estágios  · 12 telas
│       ├── CafeBakeryDemo.tsx     # 573 linhas  · 6 estágios  · 8 telas
│       ├── BuffetDemo.tsx         # 407 linhas  · 7 estágios  · 10 telas
│       ├── DriveThruDemo.tsx      # 405 linhas  · 7 estágios  · 11 telas
│       ├── FoodTruckDemo.tsx      # 447 linhas  · 7 estágios  · 12 telas
│       ├── ChefsTableDemo.tsx     # 506 linhas  · 9 estágios  · 13 telas
│       ├── CasualDiningDemo.tsx   # 776 linhas  · 9 estágios  · 14 telas
│       ├── PubBarDemo.tsx         # 800 linhas  · 9 estágios  · 15 telas
│       └── ClubDemo.tsx           # 801 linhas  · 9 estágios  · 18 telas
└── contexts/
    └── DemoContext.tsx            # Estado compartilhado: cart, restaurant, menu
```

### Totais

| Métrica | Valor |
|---|---|
| **Tipos de serviço** | 11 |
| **Total de estágios** | 87 |
| **Total de telas únicas** | 139 |
| **Linhas de código (experiences)** | ~7.159 |
| **Fotos reais (Unsplash)** | 90+ |
| **Componentes compartilhados** | 6 |
| **Métodos de pagamento** | 6 |
| **Presets de pipeline** | 11 |

---

*Documentação gerada em 16/03/2026. Reflete o estado atual do código em `src/components/demo/`.*
