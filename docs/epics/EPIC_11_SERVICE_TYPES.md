# EPICO 11 — Service Types Especificos

**Prioridade:** MEDIA/BAIXA (por tipo)
**Sprint:** 5
**Status:** Planejamento
**Nota:** Epico 10 cobre Casual Dining completo. Este epico cobre todos os demais service types.

---

## Visao Geral

Cada service type no NOOWE opera de forma radicalmente diferente. As features descritas neste epico
nao sao funcionalidades genericas — sao diferenciais de produto que justificam a adocao por cada
segmento. Todas as features sao ativadas ou desativadas via Config Hub (Epico 8), permitindo que
um restaurante habilite somente o que usa.

A arquitetura segue o principio: **core compartilhado + modulos de service type plugaveis**.
O backend NestJS ja possui os modulos `tabs`, `club`, `reservations` e `loyalty` como base;
este epico expande e adapta cada um.

## Pre-requisitos

- **Epico 1** concluido: Auth, perfil de usuario, onboarding
- **Epico 2** concluido: Core do restaurante, cardapio, pedidos basicos
- **Epico 8** concluido: Config Hub — toggles de feature por restaurante

---

## SERVICE TYPE 2 — Quick Service

### Descricao

Lanchonetes, hamburguerias fast food, sorveterias de balcao. O diferencial e velocidade: o cliente
pede antes de chegar e retira sem interacao com o caixa.

### Features Unicas

| Feature | Descricao |
|---|---|
| Skip the Line | Pre-pedido no app antes de chegar ao estabelecimento |
| Combo System | Itens agrupados com preco original vs. desconto exibidos lado a lado |
| Stamp Card Visual | 9 selos — a cada 9 pedidos o 10o e grtis |
| Pickup Code | Codigo de 3 digitos alfanumerico exibido na tela de confirmacao |
| Speed Record | Comparacao do tempo de retirada vs. media historica do usuario |

### User Stories

#### US-QS-01: Skip the Line — Pre-pedido no Caminho

**Como** usuario em deslocamento,
**Quero** montar e pagar meu pedido pelo app antes de chegar,
**Para que** meu pedido esteja pronto quando eu chegar ao balcao.

**Criterios de Aceite:**
- [ ] Usuario consegue montar pedido e pagar sem estar no local
- [ ] Status do pedido muda para `preparing` assim que o pagamento e confirmado
- [ ] Tela de confirmacao exibe pickup code de 3 digitos (ex: `A47`)
- [ ] App exibe estimativa de tempo de preparo em minutos
- [ ] Push notification enviado quando pedido estiver pronto (`order.ready`)
- [ ] Historico de pedidos exibe badge "Skip the Line" para esses pedidos

**Specs Tecnicos:**
- Endpoint: `POST /orders` com campo `skip_the_line: true`
- Campo `estimated_ready_at` calculado no backend com base no queue length
- Push via `notifications` module com template `ORDER_READY`
- Pickup code: 3 chars uppercase alfanumerico, unico por turno do restaurante

**i18n Keys:**
```json
// PT-BR
"quick_service.skip_line.title": "Pedir no Caminho",
"quick_service.skip_line.subtitle": "Retire sem esperar no caixa",
"quick_service.skip_line.pickup_code_label": "Codigo de Retirada",
"quick_service.skip_line.ready_notification": "Seu pedido esta pronto!"

// EN
"quick_service.skip_line.title": "Order Ahead",
"quick_service.skip_line.subtitle": "Pick up without waiting",
"quick_service.skip_line.pickup_code_label": "Pickup Code",
"quick_service.skip_line.ready_notification": "Your order is ready!"

// ES
"quick_service.skip_line.title": "Pedir por Anticipado",
"quick_service.skip_line.subtitle": "Recoge sin esperar en caja",
"quick_service.skip_line.pickup_code_label": "Codigo de Retiro",
"quick_service.skip_line.ready_notification": "Tu pedido esta listo!"
```

**Testes:**
- [ ] Pedido criado com `skip_the_line: true` gera `pickup_code` de 3 chars
- [ ] Dois pedidos no mesmo turno nao geram o mesmo `pickup_code`
- [ ] Push notification disparado em menos de 2s apos `status = ready`
- [ ] Estimativa de tempo e exibida em tela e atualizada se queue aumentar

---

#### US-QS-02: Combo System com Pricing Visual

**Como** usuario no cardapio,
**Quero** ver o preco original riscado ao lado do preco do combo,
**Para** entender claramente o desconto que estou obtendo.

**Criterios de Aceite:**
- [ ] Card de combo exibe `preco_original` riscado em cinza e `preco_combo` em destaque
- [ ] Badge de economia ("Economize R$ 8,50") visivel no card
- [ ] Personalizar ingredientes dentro do combo e possivel (ex: sem cebola)
- [ ] Combo aparece separado de itens individuais no cardapio

**Specs Tecnicos:**
- Entidade `MenuItemCombo` com campos `original_price`, `combo_price`, `items[]`
- Componente `ComboCard` com strikethrough no preco original (via `text-decoration: line-through`)
- Calculo de economia calculado no frontend: `savings = original_price - combo_price`

**i18n Keys:**
```json
"combo.savings_badge": "Economize {{value}}",
"combo.original_price_label": "De {{value}}",
"combo.combo_price_label": "Por {{value}}"

// EN
"combo.savings_badge": "Save {{value}}",
"combo.original_price_label": "From {{value}}",
"combo.combo_price_label": "Only {{value}}"

// ES
"combo.savings_badge": "Ahorra {{value}}",
"combo.original_price_label": "De {{value}}",
"combo.combo_price_label": "Por solo {{value}}"
```

---

#### US-QS-03: Stamp Card Visual (9 selos)

**Como** cliente frequente,
**Quero** ver meus selos de fidelidade num cartao visual com 9 espacos,
**Para** saber quantas visitas faltam para ganhar o premio.

**Criterios de Aceite:**
- [ ] Cartao com 9 espacos circulares exibido apos pagamento e no perfil
- [ ] Selos preenchidos aparecem com icone do produto (ex: hamburguer) colorido
- [ ] Selos vazios aparecem como circulos com borda tracejada
- [ ] Ao completar 9 selos, animacao de celebracao e exibida
- [ ] Proximo pedido apos completar: primeiro item elegivel e gratuito automaticamente
- [ ] Selos nao expiram (ou expiram conforme config do restaurante — via Config Hub)

**Specs Tecnicos:**
- Modelo: `LoyaltyCard { type: 'stamp', total_slots: 9, current_stamps: number, restaurant_id }`
- Integrar com modulo `loyalty` existente
- Componente `StampCardGrid` — grid 3x3 com animacao SVG no preenchimento

**i18n Keys:**
```json
"stamp_card.progress": "{{current}} de {{total}} selos",
"stamp_card.next_free": "Proximo {{item}} gratis!",
"stamp_card.completed": "Cartao completo! Resgate seu brinde."

// EN
"stamp_card.progress": "{{current}} of {{total}} stamps",
"stamp_card.next_free": "Next {{item}} is free!",
"stamp_card.completed": "Card complete! Redeem your reward."

// ES
"stamp_card.progress": "{{current}} de {{total}} sellos",
"stamp_card.next_free": "Proximo {{item}} gratis!",
"stamp_card.completed": "Tarjeta completa! Canjea tu premio."
```

---

## SERVICE TYPE 3 — Fast Casual

### Descricao

Conceito de montagem personalizada em linha (bowls, pokeS, burritos). O cliente monta o prato
passo a passo e acompanha o valor nutricional em tempo real.

### Features Unicas

| Feature | Descricao |
|---|---|
| Dish Builder 4-step | Base > Proteina > Toppings > Molho — cada etapa com selecao visual |
| Nutrition Tracking | Calorias e proteinas somadas em tempo real a cada ingrediente |
| Saved Bowls | Salvar configuracao de bowl para re-pedir com 1 tap |
| Allergen Aggregation | Alergenos de todos ingredientes escolhidos exibidos juntos |
| Allergen Verification Screen | Tela dedicada para confirmar alergenos antes de confirmar pedido |

### User Stories

#### US-FC-01: Dish Builder 4-Step

**Como** usuario montando meu bowl,
**Quero** passar por 4 etapas visuais (Base, Proteina, Toppings, Molho),
**Para** construir meu prato de forma intuitiva sem precisar ler texto longo.

**Criterios de Aceite:**
- [ ] Barra de progresso com 4 etapas numeradas visivel durante todo o flow
- [ ] Cada etapa exibe grade de opcoes com foto, nome e info nutricional
- [ ] Selecao de item na etapa e visualmente destacada (borda colorida)
- [ ] Botao "Proximo" desabilitado se etapa obrigatoria nao tiver selecao
- [ ] Usuario pode voltar a etapa anterior para alterar escolha
- [ ] Resumo visual do bowl montado exibido na etapa final antes de adicionar ao carrinho

**Specs Tecnicos:**
- Estado local: `builderState: { base: string|null, protein: string|null, toppings: string[], sauce: string|null }`
- Componente: `DishBuilderStepper` com 4 steps
- Backend: pedido enviado como array de `ingredient_ids` com categoria
- Validacao: base e proteina obrigatorias; min 1 topping; molho opcional

**i18n Keys:**
```json
"dish_builder.step_base": "Escolha a Base",
"dish_builder.step_protein": "Escolha a Proteina",
"dish_builder.step_toppings": "Escolha os Toppings",
"dish_builder.step_sauce": "Escolha o Molho",
"dish_builder.next": "Proximo",
"dish_builder.back": "Voltar",
"dish_builder.add_to_cart": "Adicionar ao Carrinho"

// EN
"dish_builder.step_base": "Choose Your Base",
"dish_builder.step_protein": "Choose Your Protein",
"dish_builder.step_toppings": "Choose Your Toppings",
"dish_builder.step_sauce": "Choose Your Sauce"

// ES
"dish_builder.step_base": "Elige tu Base",
"dish_builder.step_protein": "Elige tu Proteina",
"dish_builder.step_toppings": "Elige tus Toppings",
"dish_builder.step_sauce": "Elige tu Salsa"
```

---

#### US-FC-02: Real-Time Nutrition Tracking

**Como** usuario preocupado com dieta,
**Quero** ver as calorias e gramas de proteina acumularem em tempo real enquanto monto meu bowl,
**Para** tomar decisoes informadas sem sair do flow de montagem.

**Criterios de Aceite:**
- [ ] Barra de calorias e proteinas atualiza imediatamente apos cada selecao
- [ ] Valores exibidos: kcal total, proteina (g), carboidratos (g), gordura (g) — opcionais
- [ ] Cor da barra de calorias muda: verde (<500 kcal), amarelo (500-800), vermelho (>800)
- [ ] Tooltip ou expandable para ver detalhes por ingrediente

**Specs Tecnicos:**
- Cada `ingredient` no backend possui campo `nutrition: { calories, protein, carbs, fat }`
- Calculo totalmente no cliente: `total = sum(selectedIngredients.map(i => i.nutrition))`
- Sem chamada ao backend durante o builder — dados de nutricao baixados com o menu

**i18n Keys:**
```json
"nutrition.calories": "{{value}} kcal",
"nutrition.protein": "{{value}}g proteina",
"nutrition.tracking_label": "Info Nutricional"

// EN
"nutrition.calories": "{{value}} kcal",
"nutrition.protein": "{{value}}g protein",
"nutrition.tracking_label": "Nutritional Info"

// ES
"nutrition.calories": "{{value}} kcal",
"nutrition.protein": "{{value}}g proteina",
"nutrition.tracking_label": "Info Nutricional"
```

---

#### US-FC-03: Saved Bowls

**Como** cliente recorrente,
**Quero** salvar a configuracao do meu bowl favorito com um nome personalizado,
**Para** repetir meu pedido habitual com um unico toque.

**Criterios de Aceite:**
- [ ] Botao "Salvar esse Bowl" disponivel apos montagem completa
- [ ] Modal para inserir nome do bowl (ex: "Meu bowl de sempre")
- [ ] Secao "Meus Bowls" exibida no topo do cardapio fast casual
- [ ] Tap em bowl salvo preenche o builder instantaneamente
- [ ] Maximo de 5 bowls salvos por restaurante (configuravel via Config Hub)
- [ ] Opcao de editar ou excluir bowl salvo

**Specs Tecnicos:**
- Endpoint: `POST /user-preferences/saved-bowls`
- Payload: `{ restaurant_id, name, ingredients: string[] }`
- GET: `GET /user-preferences/saved-bowls?restaurant_id=`
- Armazenamento: tabela `saved_bowls` com FK para `users` e `restaurants`

---

#### US-FC-04: Allergen Aggregation + Verification Screen

**Como** cliente com restricoes alimentares,
**Quero** ver todos os alergenos do meu bowl montado antes de confirmar,
**Para** garantir que minha selecao e segura para mim.

**Criterios de Aceite:**
- [ ] Icones de alergenos (gluten, lactose, nozes, etc.) exibidos abaixo do builder ao longo da montagem
- [ ] Tela de verificacao obrigatoria se algum alergeno estiver presente E o usuario tiver restricao cadastrada
- [ ] Tela exibe: quais alergenos, qual ingrediente contem cada um
- [ ] Usuario confirma com checkbox "Estou ciente" antes de adicionar ao carrinho
- [ ] Se usuario nao tem restricoes cadastradas, verificacao e opcional (banner informativo)

**Specs Tecnicos:**
- Cada `ingredient` tem campo `allergens: string[]` (ex: `['gluten', 'lactose']`)
- Agregacao no cliente: `Set` de todos alergenos dos ingredientes selecionados
- Perfil do usuario tem campo `dietary_restrictions: string[]`
- Interseccao de alergenos do bowl com restricoes do usuario dispara tela de confirmacao

---

## SERVICE TYPE 4 — Cafe & Bakery

### Descricao

Cafeterias, padarias e espacos work-friendly. O diferencial e o ambiente: o NOOWE sabe que o
cliente vai ficar por horas e oferece features pensadas para isso.

### Features Unicas

| Feature | Descricao |
|---|---|
| Work Mode Dashboard | Wi-Fi (senha copiavel), velocidade, nivel de ruido em tempo real, tomadas, timer de sessao |
| Beverage Customization | Leite (5 opcoes), tamanho (P/M/G), temperatura, flavor extra (+R$3), shot extra (+R$4) |
| Refil System | Bebidas elegíveis ganham botao "Refil R$5" na comanda |
| Stamp Card 10 cafes | A cada 10 cafes, o proximo e grtis |
| Amenities Filters | Filtro por: Wi-Fi Rapido, Tomadas, Silencioso, Pet Friendly, Ao Ar Livre |

### User Stories

#### US-CB-01: Work Mode Dashboard

**Como** profissional remoto,
**Quero** ativar o Modo Trabalho ao escanear o QR da mesa,
**Para** ter todas as informacoes que preciso (Wi-Fi, tomadas, nivel de ruido) em um unico lugar.

**Criterios de Aceite:**
- [ ] QR scan da mesa ativa o Modo Trabalho automaticamente se restaurante suportar
- [ ] Dashboard exibe: SSID da rede Wi-Fi, senha copiavel, velocidade down/up em Mbps, ping
- [ ] Nivel de ruido em tempo real: Silencioso / Moderado / Barulhento (atualizado a cada 5min)
- [ ] Status de tomadas na mesa: numero de tomadas disponíveis
- [ ] Timer de sessao iniciado automaticamente no check-in e exibido no header
- [ ] Botao "Pedir pelo App" presente no dashboard para ir ao cardapio sem sair do modo trabalho

**Specs Tecnicos:**
- Tabela `table_amenities` no backend: `{ table_id, wifi_ssid, wifi_password, outlet_count }`
- Endpoint: `GET /restaurants/:id/tables/:tableId/amenities`
- Nivel de ruido: campo atualizavel pelo staff via Restaurant App (`PATCH /tables/:id/noise_level`)
- Session timer: iniciado no frontend ao fazer check-in, armazenado em `AsyncStorage`
- Wi-Fi password: retornado apenas para usuarios autenticados com check-in ativo na mesa

**i18n Keys:**
```json
"work_mode.title": "Modo Trabalho",
"work_mode.session_timer": "Sessao: {{time}}",
"work_mode.wifi_label": "Wi-Fi",
"work_mode.wifi_copy": "Copiar Senha",
"work_mode.outlets": "{{count}} tomadas nesta mesa",
"work_mode.noise_silent": "Silencioso",
"work_mode.noise_moderate": "Moderado",
"work_mode.noise_loud": "Barulhento"

// EN
"work_mode.title": "Work Mode",
"work_mode.session_timer": "Session: {{time}}",
"work_mode.wifi_copy": "Copy Password",
"work_mode.outlets": "{{count}} outlets at this table",
"work_mode.noise_silent": "Silent",
"work_mode.noise_moderate": "Moderate",
"work_mode.noise_loud": "Noisy"

// ES
"work_mode.title": "Modo Trabajo",
"work_mode.session_timer": "Sesion: {{time}}",
"work_mode.wifi_copy": "Copiar Contrasena",
"work_mode.outlets": "{{count}} enchufes en esta mesa",
"work_mode.noise_silent": "Silencioso",
"work_mode.noise_moderate": "Moderado",
"work_mode.noise_loud": "Ruidoso"
```

---

#### US-CB-02: Beverage Customization

**Como** cliente pedindo uma bebida,
**Quero** personalizar leite, tamanho, temperatura, flavor e intensidade,
**Para** receber exatamente a bebida que gosto.

**Criterios de Aceite (conforme demo CafeBakeryDemo.tsx):**
- [ ] Opcoes de leite: Integral, Desnatado, Aveia, Amendoas, Coco
- [ ] Tamanho: P (200ml, sem acrescimo), M (350ml, +R$4), G (500ml, +R$8)
- [ ] Temperatura: Quente, Morno, Gelado
- [ ] Flavor extra: Baunilha, Caramelo, Avela, Canela (+R$3 cada)
- [ ] Shot extra de espresso (+R$4) com checkbox
- [ ] Preco final atualizado em tempo real na tela de personalizacao
- [ ] Customizacoes exibidas como tags coloridas na comanda (`Leite Aveia · Medio · + Caramelo`)

**Specs Tecnicos:**
- `MILK_OPTIONS`, `SIZE_OPTIONS`, `FLAVOR_OPTIONS`, `TEMP_OPTIONS` como constantes no frontend
- `CustomizationSchema` validado no backend antes de criar o `OrderItem`
- Acrescimos de preco calculados no backend (nao confiar no frontend para preco final)

---

#### US-CB-03: Refil System

**Como** cliente que pediu cafe filtrado ou cha,
**Quero** pedir um refil pelo app por R$5,
**Para** continuar trabalhando sem interromper meu fluxo ou chamar garcom.

**Criterios de Aceite:**
- [ ] Itens elegiveis para refil sao marcados no cardapio com badge "Refil" verde
- [ ] Na comanda, itens elegiveis exibem botao "Refil [nome do item] · R$5"
- [ ] Tap no botao adiciona item `Refil` a comanda automaticamente (sem tela de confirmacao adicional)
- [ ] Itens de refil exibidos na comanda com badge distinto "Refil" para diferenciacao
- [ ] Limite de refis configuravel pelo restaurante via Config Hub (padrao: ilimitado)

**Specs Tecnicos:**
- Campo `refillable: boolean` e `refill_price: number` na entidade `MenuItem`
- Endpoint para adicionar refil: `POST /tabs/:id/refill` com `{ original_item_id }`
- Backend valida se item original existe na comanda e se item e elegivel para refil

---

#### US-CB-04: Amenities Filters na Discovery

**Como** usuario procurando um cafe para trabalhar,
**Quero** filtrar cafes por Wi-Fi, tomadas, nivel de ruido e pet policy,
**Para** encontrar o espaco certo sem ter que entrar em cada um.

**Criterios de Aceite:**
- [ ] Filtros horizontais: Wi-Fi Rapido, Tomadas, Silencioso, Pet Friendly, Ao Ar Livre
- [ ] Filtros sao multi-selecao (AND logic: mostra cafes com TODOS os filtros selecionados)
- [ ] Cada amenidade exibida como chips no card do restaurante na lista
- [ ] Velocidade do Wi-Fi exibida se disponivel (ex: "150Mbps")

**Specs Tecnicos:**
- Tabela `restaurant_amenities`: `{ restaurant_id, wifi: boolean, wifi_speed_mbps, outlets: boolean, noise_level, pet_friendly, outdoor_seating }`
- Query: `GET /restaurants?amenities=wifi,outlets&noise_level=silent&service_type=cafe_bakery`

---

## SERVICE TYPE 5 — Buffet

### Descricao

Restaurantes self-service por quilo. A integracao com balanca e o diferencial central: a comanda
digital e atualizada automaticamente via NFC ao pesar o prato.

### Features Unicas

| Feature | Descricao |
|---|---|
| Smart Scale NFC | Balanca conectada via NFC associa pesagem automaticamente a comanda do usuario |
| Live Stations | 6 estacoes com status: Fresh / Replenishing — atualizadas em tempo real pelo staff |
| Weight-based Billing | Preco calculado: peso_total (g) × preco_por_kg |
| Per-item Drinks | Bebidas pedidas separadamente por item no cardapio |
| Hybrid Billing | Total = comida (peso) + bebidas (itens) + taxa de servico (10%) |

### User Stories

#### US-BF-01: Smart Scale NFC — Pesagem Automatica

**Como** cliente num buffet,
**Quero** colocar meu prato na balanca e ter o peso registrado automaticamente na minha comanda,
**Para** nao precisar memorizar o peso ou interagir com o caixa.

**Criterios de Aceite (conforme BuffetDemo.tsx):**
- [ ] Check-in digital gera codigo de comanda unico (ex: `SN-012`)
- [ ] Tela de pesagem exibe animacao de progresso enquanto balanca estabiliza
- [ ] Apos estabilizacao, peso exibido em destaque com valor parcial em Reais
- [ ] Mensagem "Pode voltar e pesar mais vezes!" para encorajar retorno
- [ ] Historico de pesagens acumulado e exibido na comanda (Pesagem 1, Pesagem 2...)
- [ ] Total de comida calculado: `sum(pesagens) × preco_por_kg`

**Specs Tecnicos — Simulacao/Mock para MVP (sem hardware real):**

O hardware de balanca NFC nao estara disponivel no MVP. A abordagem de simulacao e:

1. **Modo Demo/Mock:** Botao "Simular Pesagem" no app que gera peso aleatorio entre 350g-650g
2. **Endpoint de registro:** `POST /scale-readings` — aceita `{ comanda_id, weight_grams, station_id? }`
3. **Para producao futura:** Balanca com NFC le o `comanda_id` do cartao/pulseira NFC do cliente e faz POST automatico ao endpoint acima
4. **QR alternativo:** Totem na balanca exibe QR; cliente escaneia para associar pesagem pendente

```
POST /scale-readings
{
  "comanda_id": "SN-012",
  "weight_grams": 485,
  "station_id": "grelhados",    // opcional
  "price_per_kg": 79.90
}

Response:
{
  "reading_id": "uuid",
  "comanda_id": "SN-012",
  "weight_grams": 485,
  "partial_amount": 38.75,
  "total_weight_so_far": 970,
  "total_food_amount": 77.50
}
```

**Testes:**
- [ ] Multiplas pesagens acumulam corretamente no total
- [ ] Preco parcial calculado com 2 casas decimais (`floor(weight * price_per_kg / 1000 * 100) / 100`)
- [ ] Comanda atualizada em tempo real via WebSocket apos cada pesagem

---

#### US-BF-02: Live Stations

**Como** cliente no buffet,
**Quero** ver no app quais estacoes estao com comida fresca e quais estao sendo reabastecidas,
**Para** planejar minha visita as estacoes e evitar espera desnecessaria.

**Criterios de Aceite:**
- [ ] Tela "Estacoes ao Vivo" exibe todas as estacoes com status colorido
- [ ] Status: "Fresco" (verde, icone check) ou "Reabastecendo" (amarelo, icone refresh + tempo estimado)
- [ ] Notificacoes push opcionais: "Fraldinha acabou de sair da churrasqueira!"
- [ ] Staff atualiza status via Restaurant App (botao simples: Fresh / Replenishing)

**Specs Tecnicos:**
- Tabela `buffet_stations`: `{ id, restaurant_id, name, status: 'fresh'|'replenishing', estimated_ready_at? }`
- Endpoint staff: `PATCH /buffet-stations/:id` com `{ status, estimated_ready_at }`
- Endpoint cliente: `GET /buffet-stations?restaurant_id=`
- Push notification: template `STATION_FRESH` disparado pelo staff ao marcar Fresh

---

#### US-BF-03: Hybrid Billing

**Como** cliente finalizando o buffet,
**Quero** ver minha conta dividida claramente entre comida (peso), bebidas (itens) e servico,
**Para** entender exatamente o que estou pagando.

**Criterios de Aceite (conforme BuffetDemo.tsx comanda screen):**
- [ ] Secao "Comida (por peso)" lista cada pesagem com peso e valor parcial
- [ ] Secao "Bebidas" lista cada bebida com quantidade e preco unitario
- [ ] Linha de "Servico (10%)" calculada sobre subtotal (comida + bebidas)
- [ ] Total geral exibido em destaque
- [ ] Botao "Pagar" leva ao flow de pagamento padrao

**Formula:**
```
food_total = sum(weighings) × price_per_kg
drinks_total = sum(drinks × unit_price)
service_charge = (food_total + drinks_total) × 0.10
grand_total = food_total + drinks_total + service_charge
```

---

## SERVICE TYPE 6 — Drive-Thru

### Descricao

Drive-thrus inteligentes onde o GPS do usuario dispara o preparo do pedido no momento certo,
garantindo que o pedido esteja pronto exatamente quando o carro chega na janela.

### Features Unicas

| Feature | Descricao |
|---|---|
| GPS Geofencing | Trigger automatico na cozinha quando usuario esta a 500m do restaurante |
| Lane Assignment | App indica a pista correta apos geofence (ex: "Siga para a Pista 2") |
| Pre-payment Flow | Pagamento obrigatorio antes do deslocamento — sem transacao na janela |
| Distance Tracking | Contador de distancia em tempo real durante o deslocamento |
| Pickup Code | Codigo alfanumerico para retirada (ex: `ND-056`) |

### User Stories

#### US-DT-01: GPS Geofencing — Trigger de Cozinha

**Como** cliente que pagou antecipado e esta dirigindo ao drive-thru,
**Quero** que a cozinha comece a finalizar meu pedido quando estou a 500m,
**Para** que meu pedido esteja fresquinho quando chegar na janela.

**Criterios de Aceite (conforme DriveThruDemo.tsx):**
- [ ] Tela "GPS Ativo" exibe contador de distancia decrescente em tempo real
- [ ] Marcos de progresso visuais: Pedido confirmado (5km), Cozinha alertada (3km), Preparo iniciado (1km), Geofencing ativado (500m)
- [ ] Ao atingir 500m: tela de "Geofencing Ativado!" com animacao de radio wave
- [ ] Notificacao push para equipe da cozinha: "Cliente a 500m — finalize o pedido #ND-056"
- [ ] Apos 3s na tela de geofence: avanca automaticamente para "Pista Designada"
- [ ] ETA calculado: `Math.round(distance_km * 2)` minutos

**Specs Tecnicos — Novo Endpoint de Geofence Trigger:**

```
POST /orders/:id/geofence-trigger
Headers: Authorization: Bearer <token>
Body: {
  "latitude": -23.5505,
  "longitude": -46.6333,
  "distance_meters": 487,
  "order_id": "uuid"
}

Response:
{
  "triggered": true,
  "kitchen_notified_at": "2026-03-23T14:32:00Z",
  "estimated_ready_in_seconds": 90,
  "lane_assignment": "2",
  "pickup_code": "ND-056"
}
```

**Implementacao no frontend:**
- Background location tracking via `expo-location` (permissao `BACKGROUND` necessaria)
- `watchPositionAsync` com `accuracy: Location.Accuracy.High`
- Calculo de distancia: formula de Haversine entre posicao atual e coordenadas do restaurante
- Trigger enviado uma unica vez por pedido (flag `geofence_triggered` no estado local)

**Testes:**
- [ ] Trigger disparado exatamente uma vez por pedido (idempotente)
- [ ] Kitchen recebe push notification com delay < 500ms apos trigger
- [ ] Lane assignment retornado e consistente durante a sessao do pedido
- [ ] Background location nao drena bateria: intervalo minimo de 5s entre updates

---

#### US-DT-02: Lane Assignment Visual

**Como** cliente recebendo a designacao de pista,
**Quero** ver claramente qual pista seguir num layout visual de grade de pistas,
**Para** nao precisar ler texto longo enquanto estou dirigindo.

**Criterios de Aceite:**
- [ ] Grade 3 colunas com pistas numeradas (1, 2, 3)
- [ ] Pista designada animada com `animate-pulse` e highlight colorido
- [ ] Status de cada pista: "Sua pista", "Ocupada", "Livre"
- [ ] Pickup code exibido em destaque tipografico grande (ex: fonte 36px bold)
- [ ] Botao "Confirmar Retirada" leva ao payment success

---

## SERVICE TYPE 7 — Food Truck

### Descricao

Food trucks itinerantes sem localizacao fixa. O desafio central e descoberta: o usuario precisa
saber onde o truck esta HOJE e entrar na fila virtual antes de chegar.

### Features Unicas

| Feature | Descricao |
|---|---|
| Interactive Map | Mapa com pins dos trucks ativos, localizacao do usuario e card de preview ao tocar |
| Weekly Schedule | Agenda com localizacao e horario para cada dia dos proximos 7 dias |
| Virtual Queue | Sistema de fila com numero de posicao e tempo estimado de espera |
| Queue Position Tracker | Posicao atualizada em tempo real via WebSocket (decrescente) |
| Location Notifications | Push para seguidores quando truck mudar de localizacao |

### User Stories

#### US-FT-01: Interactive Map com Truck Pins

**Como** usuario com fome,
**Quero** ver um mapa com todos os food trucks ativos por perto,
**Para** descobrir qual esta mais perto e tem fila menor.

**Criterios de Aceite (conforme FoodTruckDemo.tsx):**
- [ ] Mapa exibe pins coloridos para cada truck ativo (cor diferente de trucks inativos)
- [ ] Pin do usuario com circulo azul de localizacao (estilo Google Maps)
- [ ] Tap em pin do truck abre card de preview na base da tela: nome, distancia, fila, tempo estimado
- [ ] Tap no card de preview navega para detalhe do truck
- [ ] Trucks inativos/fechados exibidos como pins cinzas nao clicaveis
- [ ] Distancia calculada em linha reta (exibida em km ou metros)

**Specs Tecnicos:**
- Endpoint: `GET /food-trucks/nearby?lat=&lng=&radius_km=5`
- Response inclui: `{ id, name, lat, lng, queue_size, wait_time_min, is_active, cuisine_type }`
- Localizacao dos trucks atualizada pelo operador via Restaurant App (`PATCH /restaurants/:id/location`)
- Mapa: `react-native-maps` ou `expo-maps` (verificar compatibilidade Expo 51)

---

#### US-FT-02: Agenda Semanal do Truck

**Como** usuario que quer programar uma visita,
**Quero** ver a agenda completa dos proximos 7 dias do truck,
**Para** planejar quando e onde encontrar o truck.

**Criterios de Aceite (conforme FoodTruckDemo.tsx schedule screen):**
- [ ] Lista de 7 dias com data, endereco e horario de funcionamento
- [ ] Dia atual destacado com badge "Aqui agora" e cor primaria
- [ ] Endereco clicavel abre app de mapas nativo
- [ ] Toggle "Ativar notificacao de localizacao" para receber push quando truck mudar de local

**Specs Tecnicos:**
- Tabela `truck_schedule`: `{ restaurant_id, date, address, lat, lng, open_time, close_time }`
- Endpoint: `GET /restaurants/:id/schedule?from=today&days=7`
- Notificacao: Push via `notifications` module com template `TRUCK_LOCATION_UPDATE`

---

#### US-FT-03: Virtual Queue com Position Tracker

**Como** usuario que chegou ao food truck com fila,
**Quero** entrar na fila virtual e acompanhar minha posicao em tempo real,
**Para** esperar onde quiser sem ficar na fila fisica.

**Criterios de Aceite (conforme FoodTruckDemo.tsx queue screen):**
- [ ] Botao "Entrar na Fila Virtual" disponivel na tela do truck
- [ ] Tela de fila exibe: numero da posicao atual, tempo estimado de espera, visualizacao de bolhas com posicoes
- [ ] Posicao atualiza automaticamente via WebSocket (sem pull-to-refresh necessario)
- [ ] Enquanto aguarda: sugestoes de acao ("Faca o pedido antecipado", "Passeie — avisamos por push")
- [ ] Push notification quando posicao <= 2: "Voce e o proximo! Va ao truck."

**Specs Tecnicos:**
- Reutilizar `QueueGateway` existente em `/backend/src/modules/club/queue.gateway.ts`
- Namespace: `/queue` — ja implementado
- `subscribeToMyPosition` e `notifyPositionUpdate` ja existem — apenas adaptar para food truck
- Endpoint REST: `POST /virtual-queue/join` e `DELETE /virtual-queue/leave`

**Testes:**
- [ ] Posicao decrementa corretamente quando usuarios a frente sao atendidos
- [ ] Push enviado corretamente quando posicao <= 2
- [ ] Saida da fila (cancelamento) remove usuario e ajusta posicoes dos demais

---

## SERVICE TYPE 8 — Chef's Table

### Descricao

Experiencias gastronômicas de alto padrao com chef a mesa, menu degustacao e atendimento
personalizado. O foco e a jornada pre, durante e pos experiencia.

### Features Unicas

| Feature | Descricao |
|---|---|
| Multi-step Reservation | Formulario de reserva em etapas: data, restricoes alimentares, preferencias de vinho |
| Countdown Timer | Timer regressivo ate a experiencia na tela inicial do usuario |
| Course Progression | Cada prato do menu degustacao apresentado com descricao e notas do sommelier |
| Digital Certificate | Certificado digital personalizado ao final da experiencia |
| Photo Session | Solicitacao de foto com o chef ao final |

### User Stories

#### US-CT-01: Multi-step Reservation com Preferencias

**Como** usuario querendo reservar o Chef's Table,
**Quero** passar por um formulario de reserva em etapas que captura minhas preferencias,
**Para** garantir que a experiencia sera completamente personalizada para mim.

**Criterios de Aceite:**
- [ ] Step 1: Data, horario e numero de pessoas (max definido pelo restaurante)
- [ ] Step 2: Restricoes alimentares (multi-selecao: vegetariano, vegano, sem gluten, alergias especificas)
- [ ] Step 3: Preferencias de vinho (nenhuma, branco, tinto, harmonizacao do chef)
- [ ] Step 4: Resumo e confirmacao com valor total da experiencia
- [ ] Confirmacao de reserva enviada por email e push notification
- [ ] Campo de observacoes livres disponivel

**Specs Tecnicos:**
- Reutilizar modulo `reservations` existente com extensao para campos de preferencia
- Novo DTO: `CreateChefsTableReservationDto` extende `CreateReservationDto` com `dietary_restrictions[]` e `wine_preference`
- Endpoint: `POST /reservations/chefs-table`

**i18n Keys:**
```json
"chefs_table.reservation.title": "Reservar Chef's Table",
"chefs_table.reservation.step_date": "Data & Horario",
"chefs_table.reservation.step_dietary": "Restricoes Alimentares",
"chefs_table.reservation.step_wine": "Preferencias de Vinho",
"chefs_table.reservation.step_confirm": "Confirmar Reserva",
"chefs_table.countdown.title": "Sua experiencia começa em",
"chefs_table.course.sommelier_notes": "Notas do Sommelier"

// EN
"chefs_table.reservation.title": "Reserve Chef's Table",
"chefs_table.reservation.step_date": "Date & Time",
"chefs_table.reservation.step_dietary": "Dietary Restrictions",
"chefs_table.reservation.step_wine": "Wine Preferences",
"chefs_table.countdown.title": "Your experience starts in",
"chefs_table.course.sommelier_notes": "Sommelier's Notes"

// ES
"chefs_table.reservation.title": "Reservar Chef's Table",
"chefs_table.reservation.step_date": "Fecha y Hora",
"chefs_table.reservation.step_dietary": "Restricciones Alimentarias",
"chefs_table.reservation.step_wine": "Preferencias de Vino",
"chefs_table.countdown.title": "Tu experiencia comienza en"
```

---

#### US-CT-02: Course-by-Course Progression

**Como** cliente no Chef's Table,
**Quero** ver no app cada prato sendo "anunciado" com descricao e notas do sommelier,
**Para** apreciar a narrativa da experiencia gastronömica.

**Criterios de Aceite:**
- [ ] Tela de experiencia exibe o prato atual com foto, nome e descricao
- [ ] Progresso visual: "Prato 3 de 7" com marcadores
- [ ] Cada prato inclui: nome, descricao, ingredientes principais, notas do sommelier (se aplicavel)
- [ ] Chef/staff avanca o prato via Restaurant App
- [ ] Animacao de transicao entre pratos

**Specs Tecnicos:**
- Tabela `tasting_menu_courses`: `{ id, restaurant_id, order_position, name, description, sommelier_notes, is_amuse_bouche }`
- Endpoint: `GET /reservations/:id/current-course`
- WebSocket: staff emite `course_changed` — client recebe e atualiza tela
- Integracao com `ai` module (Epico 1): opcional — gerar descricao de prato automaticamente

---

## SERVICE TYPE 10 — Pub & Bar

### Descricao

Bares, pubs e cervejarias artesanais. O ciclo de consumo e longo (varias horas) e social
(grupos). O Tab Digital e a feature central: todas as consumacoes do grupo em uma unica conta.

### Features Unicas

| Feature | Descricao |
|---|---|
| Digital Tab | Pre-autorizacao de cartao, cover convertido em credito, limite de gasto configuravel |
| Happy Hour Engine | Precos duais baseados em timer, acumulo de economia exibido em tempo real |
| Round Builder | Cada membro do grupo escolhe seu drink e o grupo envia tudo de uma vez |
| Tab Live | Breakdown por pessoa em tempo real — quem pediu o que e quanto deve |
| Check-in + Invite Friends | QR scan abre o tab; link para amigos entrarem no tab compartilhado |
| Drink Detail Cards | ABV, IBU, estilo de cerveja em cards de detalhe |

### User Stories

#### US-PB-01: Digital Tab com Pre-autorizacao

**Como** usuario chegando ao bar,
**Quero** escanear o QR da mesa para abrir um tab automaticamente com meu cartao pre-autorizado,
**Para** consumir livremente sem precisar pagar a cada pedido.

**Criterios de Aceite (conforme PubBarDemo.tsx tab-opened screen):**
- [ ] QR scan da mesa abre tab automaticamente vinculado ao `table_id`
- [ ] Pre-autorizacao no cartao salvo do usuario (valor = limite configurado, padrao R$300)
- [ ] Cover charge e cobrado imediatamente e convertido em credito de consumacao
- [ ] Tela "Tab Aberto" exibe: numero do tab, cartao utilizado (ultimos 4 digitos), credito disponivel (do cover), limite de gasto
- [ ] Usuario pode ajustar limite de gasto antes de comecar a consumir (+/- R$50)
- [ ] Alerta push quando gasto atingir 80% do limite

**Specs Tecnicos — Modulo `tabs` existente, endpoints a adaptar:**

O controlador `/backend/src/modules/tabs/tabs.controller.ts` ja existe com:
- `POST /tabs` — criar tab (adaptar DTO para incluir `cover_amount`, `pre_auth_amount`)
- `GET /tabs/my` — tabs abertas do usuario
- `GET /tabs/:id` — detalhe do tab
- `POST /tabs/:id/join` — amigo entra no tab
- `POST /tabs/:id/items` — adicionar item ao tab
- `POST /tabs/:id/close` — fechar tab
- `POST /tabs/:id/payments` — processar pagamento

**Endpoints a criar (nao existem ainda):**
```
POST /tabs/:id/set-limit      — atualizar limite de gasto
GET  /tabs/:id/live-summary   — resumo em tempo real por pessoa (para Tab Live)
POST /tabs/:id/round          — adicionar rodada completa de uma vez (Round Builder)
```

**i18n Keys:**
```json
"pub_bar.tab.opened_title": "Tab Aberto",
"pub_bar.tab.cover_credit": "R$ {{amount}} em credito",
"pub_bar.tab.cover_credit_sub": "Cover convertido em consumacao",
"pub_bar.tab.pre_auth": "Pre-autorizado",
"pub_bar.tab.limit_label": "Limite de gasto (opcional)",
"pub_bar.tab.limit_alert": "Voce atingiu {{pct}}% do seu limite",
"pub_bar.invite.title": "Tab Compartilhado",
"pub_bar.invite.each_orders": "Cada um pede no seu celular — tudo registrado por pessoa"

// EN
"pub_bar.tab.opened_title": "Tab Open",
"pub_bar.tab.cover_credit": "R$ {{amount}} in credit",
"pub_bar.tab.cover_credit_sub": "Cover converted to drinks credit",
"pub_bar.tab.pre_auth": "Pre-authorized",
"pub_bar.tab.limit_label": "Spending limit (optional)",
"pub_bar.tab.limit_alert": "You've reached {{pct}}% of your limit"

// ES
"pub_bar.tab.opened_title": "Cuenta Abierta",
"pub_bar.tab.cover_credit": "R$ {{amount}} en credito",
"pub_bar.tab.cover_credit_sub": "Cover convertido en consumicion",
"pub_bar.tab.limit_label": "Limite de gasto (opcional)",
"pub_bar.tab.limit_alert": "Llegaste al {{pct}}% de tu limite"
```

**Testes:**
- [ ] Tab criado com pre-autorizacao gera `authorization_id` no modulo de pagamento
- [ ] Cover charge cobrado imediatamente e `cover_credit` adicionado ao tab
- [ ] Alerta de 80% dispara push com menos de 2s de latencia
- [ ] Multiplos usuarios no mesmo tab nao causam race condition ao adicionar itens

---

#### US-PB-02: Happy Hour Engine

**Como** cliente durante o happy hour,
**Quero** ver os precos com desconto automaticamente aplicados e ver quanto ja economizei,
**Para** aproveitar ao maximo o happy hour sem ter que calcular manualmente.

**Criterios de Aceite (conforme PubBarDemo.tsx venue screen com hhMinutes):**
- [ ] Timer regressivo do happy hour visivel na tela do bar e na discovery
- [ ] Barra de progresso visual mostrando quanto do HH resta
- [ ] Precos do cardapio automaticamente atualizados para precos de HH quando ativo
- [ ] Acumulo de economia exibido no Tab Live: "Economizei R$ 28,50 no Happy Hour"
- [ ] Quando HH encerra: precos voltam ao normal, banner "Happy Hour encerrado" exibido

**Specs Tecnicos — Modulo `happy-hour` existente:**

O controlador `/backend/src/modules/tabs/happy-hour.controller.ts` ja existe com:
- `POST /happy-hour` — criar schedule
- `GET /happy-hour/restaurant/:id` — listar schedules
- `GET /happy-hour/restaurant/:id/active` — promoções ativas agora

**Endpoint a adicionar:**
```
GET /happy-hour/restaurant/:id/current-pricing
Response: {
  "is_active": true,
  "ends_at": "2026-03-23T20:00:00Z",
  "minutes_remaining": 47,
  "discount_pct": 30,
  "eligible_categories": ["cerveja", "drinks"]
}
```

**Calculo de economia no Tab:**
- Campo `happy_hour_savings` adicionado a cada `TabItem` com valor de desconto aplicado
- `GET /tabs/:id/live-summary` retorna `total_hh_savings: number`

---

#### US-PB-03: Round Builder — Rodada do Grupo

**Como** usuario numa mesa com amigos,
**Quero** montar uma rodada onde cada um escolhe seu drink e enviar tudo de uma vez ao bar,
**Para** pedir eficientemente sem precisar fazer varias ordens individuais.

**Criterios de Aceite (conforme PubBarDemo.tsx round-builder screen):**
- [ ] Tela de Round Builder exibe lista de membros do tab
- [ ] Cada membro pode selecionar 1 drink para a rodada
- [ ] Preview da rodada completa antes de enviar
- [ ] Botao "Enviar Rodada" envia todos os itens ao bar de uma vez como um unico batch
- [ ] Confirmacao: "Rodada enviada! X drinks a caminho"
- [ ] Historico de rodadas no Tab Live com label "Rodada 1", "Rodada 2"...

**Specs Tecnicos:**
- `POST /tabs/:id/round` com payload:
```json
{
  "round_number": 2,
  "items": [
    { "user_id": "uuid-1", "menu_item_id": "uuid-ipa", "qty": 1 },
    { "user_id": "uuid-2", "menu_item_id": "uuid-lager", "qty": 1 },
    { "user_id": "uuid-3", "menu_item_id": "uuid-whisky", "qty": 1 }
  ]
}
```
- Backend cria N `TabItem` em uma unica transacao
- `TabsGateway.notifyItemAdded` emitido para cada item (ou evento `round_added` em batch)

---

#### US-PB-04: Tab Live — Breakdown por Pessoa

**Como** usuario vendo a conta,
**Quero** ver em tempo real quanto cada pessoa do grupo consumiu,
**Para** ter transparencia total antes de fechar a conta.

**Criterios de Aceite:**
- [ ] Lista de todos os membros do tab com subtotal individual
- [ ] Tap em membro expande lista detalhada de itens pedidos por aquela pessoa
- [ ] Total geral do tab visivel no topo
- [ ] Economia de Happy Hour exibida como linha negativa no total (em verde)
- [ ] Atualizacao em tempo real via WebSocket quando qualquer membro adiciona item

**Specs Tecnicos:**
- `GET /tabs/:id/live-summary` (a criar):
```json
{
  "tab_id": "TH-284",
  "members": [
    {
      "user_id": "uuid",
      "name": "Voce",
      "items": [...],
      "subtotal": 87.00,
      "hh_savings": 14.50
    }
  ],
  "total": 220.00,
  "total_hh_savings": 28.50,
  "cover_credit_used": 25.00,
  "amount_due": 195.00
}
```
- WebSocket: `TabsGateway` na namespace `/tabs` ja existe — usar `notifyItemAdded`

---

## SERVICE TYPE 11 — Club & Balada

### Descricao

Casas noturnas, baladas e eventos. O ecosistema mais complexo: ingressos, lista, camarotes,
bottle service, fila virtual, QR anti-fraude e controle de consumacao minima.

### Features Unicas

| Feature | Descricao |
|---|---|
| 3-tier Ticket System | Pista (R$60), VIP (R$120), Open Bar (R$200) com precos dinamicos e conversao em credito |
| Anti-Fraud QR | QR animado com rotacao de payload a cada 30s via WebSocket |
| Promoter Lists + Birthday Package | Lista do promoter com beneficio e solicitacao de aniversario |
| VIP Camarote Map | Selecao visual de camarote no mapa da casa |
| Bottle Service | Menu premium de garrafas com mixers inclusos |
| Minimum Spend Tracker | SVG circular progress mostrando consumacao minima do camarote |
| Floor Ordering | Pedido da pista com roteamento para o bar mais proximo |
| Multi-category Rating | Avaliacao em 5 dimensoes: Musica, Drinks, Ambiente, Atendimento, Seguranca |

### User Stories

#### US-CL-01: 3-Tier Ticket System com Dynamic Pricing

**Como** usuario comprando ingresso,
**Quero** ver os tres tipos de ingresso com precos dinamicos e entender os beneficios de cada um,
**Para** escolher o ingresso que oferece melhor custo-beneficio para minha noite.

**Criterios de Aceite (conforme ClubDemo.tsx tickets screen):**
- [ ] Tres tiers exibidos: Pista, VIP, Open Bar
- [ ] Cada tier exibe: preco original riscado, preco dinamico atual, perks, disponibilidade restante
- [ ] Badge de urgencia: "15 restantes" em amarelo quando disponibilidade < 20%
- [ ] Ingresso Pista: credito de R$60 em consumacao convertido automaticamente
- [ ] Ingresso VIP: acesso a area exclusiva + 1 drink de cortesia
- [ ] Ingresso Open Bar: open bar completo ate horario definido

**Specs Tecnicos — Modulo `club-entries` existente:**
- `POST /club-entries` — comprar ingresso (ja implementado)
- `GET /club-entries/my` — meus ingressos (ja implementado)
- `PUT /club-entries/:id/use` — usar ingresso na porta (ja implementado)

**Campos adicionais necessarios no DTO:**
```typescript
// PurchaseClubEntryDto — adaptar para incluir:
entry_type: 'pista' | 'vip' | 'open_bar'
credit_conversion_amount?: number   // valor do ingresso convertido em consumacao
```

**Dynamic Pricing:** campo `dynamic_price_multiplier` em `restaurant_events` — preco final = `base_price * multiplier`

**i18n Keys:**
```json
"club.tickets.pista": "Pista",
"club.tickets.vip": "VIP",
"club.tickets.open_bar": "Open Bar",
"club.tickets.remaining": "{{count}} restantes",
"club.tickets.buy_cta": "Comprar · R$ {{price}}",
"club.tickets.credit_note": "R$ {{amount}} vira consumacao",
"club.digital_ticket.title": "Seu Ingresso",
"club.digital_ticket.anti_fraud": "QR anti-fraude · Atualiza a cada 30s"

// EN
"club.tickets.pista": "Floor",
"club.tickets.remaining": "{{count}} remaining",
"club.tickets.buy_cta": "Buy · R$ {{price}}",
"club.tickets.credit_note": "R$ {{amount}} becomes consumption credit",
"club.digital_ticket.anti_fraud": "Anti-fraud QR · Refreshes every 30s"

// ES
"club.tickets.pista": "Pista",
"club.tickets.remaining": "{{count}} disponibles",
"club.tickets.buy_cta": "Comprar · R$ {{price}}",
"club.tickets.credit_note": "R$ {{amount}} se convierte en consumicion",
"club.digital_ticket.anti_fraud": "QR anti-fraude · Se renueva cada 30s"
```

---

#### US-CL-02: Anti-Fraud QR com Rotacao via WebSocket

**Como** usuario com ingresso digital,
**Quero** que meu QR code se regenere automaticamente a cada 30 segundos,
**Para** que capturas de tela nao possam ser usadas para entrada fraudulenta.

**Criterios de Aceite (conforme ClubDemo.tsx digital-ticket screen):**
- [ ] QR code exibido com animacao de atualizacao a cada 30s
- [ ] Contador regressivo visivel no ticket ("Atualiza em: 12s")
- [ ] QR contem payload assinado criptograficamente com `entry_id + timestamp + nonce`
- [ ] Staff scanner valida: assinatura valida + timestamp recente (<35s) + nao usado
- [ ] Ingresso revogado imediatamente apos uso na porta

**Specs Tecnicos — WebSocket Implementation:**

```typescript
// Club QR Gateway — CRIAR NOVO
@WebSocketGateway({ namespace: '/club-qr' })
export class ClubQrGateway {
  @WebSocketServer() server: Server;

  // Evento emitido pelo servidor a cada 30s para usuario com ingresso ativo
  emitQrRotation(userId: string, entryId: string) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const payload = {
      entry_id: entryId,
      user_id: userId,
      timestamp: Date.now(),
      nonce,
    };
    const signed = signPayload(payload, process.env.QR_SECRET);

    this.server.to(`user:${userId}`).emit('qrRotated', {
      payload: signed,
      expires_at: Date.now() + 35000,
      rotation_interval_ms: 30000,
    });
  }
}
```

**Backend — QR Validation (modulo qr-code existente):**
- `POST /qr-codes/validate` ja existe — adaptar para verificar `timestamp` recency
- Adicionar validacao: `timestamp` deve ser < 35000ms atras
- Adicionar validacao: `nonce` nao foi usado antes (cache Redis com TTL 35s)

**Testes:**
- [ ] QR gerado com timestamp T nao e valido apos T+35s
- [ ] Mesmo QR usado duas vezes retorna `already_used` na segunda tentativa
- [ ] Reconexao WebSocket regenera QR imediatamente (nao espera 30s)
- [ ] Ingresso cancelado: proximo QR emitido pelo servidor contem flag `revoked`

---

#### US-CL-03: Promoter List + Birthday Package

**Como** usuario chegando ao evento,
**Quero** entrar pela lista do promoter ou solicitar pacote de aniversario,
**Para** ter beneficios na entrada (isencao de cover, area especial, etc.).

**Criterios de Aceite (conforme ClubDemo.tsx promoter-list screen):**
- [ ] Tela "Lista & Aniversario" exibe listas de promoters disponíveis com beneficio de cada uma
- [ ] Campo de busca para encontrar lista pelo nome do promoter ou codigo
- [ ] Solicitar aniversario: formulario com nome do aniversariante, data, numero de convidados
- [ ] Confirmacao de entrada na lista enviada por push e email
- [ ] Na porta: staff vê lista consolidada no Restaurant App, marca como "entrada confirmada"

**Specs Tecnicos — Modulo `guest-list` e `birthday-entry` ja existem:**
- `guest-list.controller.ts` — adaptar para endpoint de inscricao publica na lista
- `birthday-entry.controller.ts` — adaptar para solicitacao do usuario
- Novo endpoint: `POST /guest-lists/:id/subscribe` com `{ user_id, party_size }`

---

#### US-CL-04: VIP Camarote Map — Selecao Visual

**Como** usuario reservando camarote,
**Quero** ver um mapa visual da casa noturna e escolher a posicao do meu camarote,
**Para** garantir o camarote com melhor vista ou localizacao preferida.

**Criterios de Aceite (conforme ClubDemo.tsx vip-map screen):**
- [ ] Mapa SVG simplificado da casa exibindo pista, stage e posicoes dos camarotes
- [ ] Camarotes disponíveis exibidos com borda verde e "clicavel"
- [ ] Camarotes ocupados exibidos em cinza e nao clicaveis
- [ ] Tap em camarote disponivel seleciona e exibe detalhes (capacidade, consumacao minima)
- [ ] Botao "Confirmar Camarote" avanca para bottle service

**Specs Tecnicos — Modulo `vip-table-reservations` existente:**
- `POST /table-reservations` — criar reserva (ja implementado)
- `GET /table-reservations/restaurant/:id/event/:date` — mapa para staff (ja implementado)
- Adaptar para retornar `is_available: boolean` por camarote na perspectiva do cliente

---

#### US-CL-05: Bottle Service — Menu Premium

**Como** cliente no camarote VIP,
**Quero** pedir garrafas diretamente pelo app com mixers inclusos,
**Para** ter servico premium sem precisar chamar o atendente para cada item.

**Criterios de Aceite (conforme ClubDemo.tsx bottle-service screen com BOTTLES array):**
- [ ] Menu de garrafas com foto, nome, descricao e preco
- [ ] Cada garrafa inclui lista de mixers inclusos (ex: "Red Bull, Energetico, Suco")
- [ ] Selecao de garrafa atualiza imediatamente o Minimum Spend Tracker
- [ ] Pedido de garrafa envia notificacao ao garcom responsavel pelo camarote
- [ ] Historico de garrafas pedidas visivel no Tab do camarote

**Specs Tecnicos:**
- Modulo `vip-table-tabs.controller.ts` ja existe — usar `POST /table-tabs/:id/items`
- `AddVipTabItemDto` — adicionar campo `item_type: 'bottle' | 'mixer' | 'food'`
- Notificacao para garcom: WebSocket evento `bottle_requested` na room do camarote

---

#### US-CL-06: Minimum Spend Tracker em Tempo Real

**Como** host do camarote VIP,
**Quero** ver em um indicador circular quanto ja consumi da consumacao minima,
**Para** saber se preciso pedir mais itens ou se ja atingi o minimo.

**Criterios de Aceite (conforme ClubDemo.tsx min-spend screen):**
- [ ] Indicador circular SVG com progresso em tempo real
- [ ] Centro do circulo exibe: valor consumido (ex: "R$ 850") e valor minimo (ex: "min R$ 1.200")
- [ ] Cor do progresso: azul-roxo (abaixo do minimo), verde (atingido/ultrapassado)
- [ ] Lista de itens consumidos abaixo do circulo (garrafas, mixers, pedidos)
- [ ] Badge "Consumacao atingida!" com celebracao ao superar o minimo
- [ ] Atualizacao em tempo real via WebSocket quando qualquer membro do camarote pede algo

**Specs Tecnicos:**
- `GET /table-tabs/:id/summary` ja existe (`vip-table-tabs.controller.ts`) e retorna `minimum_spend` e `consumed_amount`
- SVG circular progress: `circumference = 2 * Math.PI * r`; `offset = circumference * (1 - consumed/minimum)`
- WebSocket: `VipTableTabs` emite `tab_updated` com novo `consumed_amount` apos cada pedido

**i18n Keys:**
```json
"club.min_spend.title": "Consumacao Minima",
"club.min_spend.consumed": "R$ {{consumed}} consumido",
"club.min_spend.minimum": "Minimo: R$ {{minimum}}",
"club.min_spend.achieved": "Consumacao atingida!",
"club.min_spend.remaining": "Faltam R$ {{remaining}}"

// EN
"club.min_spend.title": "Minimum Spend",
"club.min_spend.consumed": "R$ {{consumed}} consumed",
"club.min_spend.minimum": "Minimum: R$ {{minimum}}",
"club.min_spend.achieved": "Minimum spend reached!",
"club.min_spend.remaining": "R$ {{remaining}} remaining"

// ES
"club.min_spend.title": "Consumicion Minima",
"club.min_spend.consumed": "R$ {{consumed}} consumido",
"club.min_spend.minimum": "Minimo: R$ {{minimum}}",
"club.min_spend.achieved": "Consumicion minima alcanzada!",
"club.min_spend.remaining": "Faltan R$ {{remaining}}"
```

---

#### US-CL-07: Multi-Category Rating

**Como** usuario apos a noite no clube,
**Quero** avaliar a experiencia em 5 dimensoes separadas,
**Para** dar feedback granular que ajuda o estabelecimento a melhorar o que importa.

**Criterios de Aceite:**
- [ ] Tela de avaliacao exibe 5 categorias: Musica, Drinks, Ambiente, Atendimento, Seguranca
- [ ] Cada categoria tem sua propria escala de estrelas (1-5) independente
- [ ] Score geral calculado como media ponderada (ou simples) das 5 categorias
- [ ] Campo de texto livre opcional para comentario
- [ ] Submit ganha pontos de fidelidade extras (200 pts conforme demo)
- [ ] Resultados agregados visiveis no perfil do clube no Restaurant App

**Specs Tecnicos:**
- Extender modulo `reviews` existente com campo `category_scores: { music, drinks, ambiance, service, security }`
- Endpoint: `POST /reviews` com `category_scores` adicionado ao DTO existente
- Media geral calculada no backend e armazenada em `overall_score`

---

## Modulo de Club — Estado Atual vs. O que Criar

### Ja Existe

| Controller | Funcionalidade |
|---|---|
| `club-entries.controller.ts` | Compra de ingresso, validacao na porta, check-in/check-out |
| `guest-list.controller.ts` | Gestao de lista de convidados (perspectiva do promoter/staff) |
| `birthday-entry.controller.ts` | Solicitacoes de aniversario |
| `lineup.controller.ts` | Lineup de artistas/DJs do evento |
| `occupancy.controller.ts` | Controle de lotacao da casa |
| `promoter.controller.ts` | Gestao de promoters |
| `qr-code.controller.ts` | Geracao e validacao de QR codes (incluindo wristband, batch) |
| `queue.controller.ts` + `queue.gateway.ts` | Fila virtual com WebSocket |
| `vip-table-reservations.controller.ts` | Reservas de camarote com convidados |
| `vip-table-tabs.controller.ts` + summary | Tab do camarote com minimum spend tracker |

### Criar do Zero

| Endpoint/Gateway | Para que |
|---|---|
| `ClubQrGateway` (namespace `/club-qr`) | Rotacao de QR a cada 30s via WebSocket |
| `POST /guest-lists/:id/subscribe` | Usuario se inscreve em lista publica do promoter |
| `GET /happy-hour/restaurant/:id/current-pricing` | Precos ativos durante o HH |
| `POST /tabs/:id/set-limit` | Usuario ajusta limite de gasto do tab |
| `GET /tabs/:id/live-summary` | Breakdown por pessoa em tempo real |
| `POST /tabs/:id/round` | Envio de rodada completa (Round Builder) |
| `POST /scale-readings` | Registro de pesagem de balanca (Buffet) |
| `GET /buffet-stations` | Estacoes ao vivo do buffet |
| `PATCH /buffet-stations/:id` | Staff atualiza status da estacao |
| `POST /orders/:id/geofence-trigger` | GPS trigger de cozinha (Drive-Thru) |
| `GET /food-trucks/nearby` | Food trucks por localizacao |
| `GET /restaurants/:id/schedule` | Agenda semanal do food truck |
| `POST /virtual-queue/join` + leave | Fila virtual para food truck |
| `POST /reservations/chefs-table` | Reserva de Chef's Table com preferencias |
| `GET /reservations/:id/current-course` | Curso atual do menu degustacao |

---

## Matriz de Service Types vs Features

| Feature | Quick Service | Fast Casual | Cafe/Bakery | Buffet | Drive-Thru | Food Truck | Chef's Table | Pub/Bar | Club |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Skip the Line | X | | | | X | | | | |
| Combo System | X | | | | X | | | | |
| Stamp Card | X | | X | | | X | | | |
| Pickup Code | X | | | | X | X | | | |
| Dish Builder 4-step | | X | | | | | | | |
| Nutrition Tracking | | X | | | | | | | |
| Saved Items | | X | | | | | | | |
| Allergen Aggregation | | X | X | | | | X | | |
| Work Mode Dashboard | | | X | | | | | | |
| Beverage Customization | | | X | | | | | X | X |
| Refil System | | | X | | | | | | |
| Amenities Filters | | | X | | | | | | |
| Smart Scale NFC | | | | X | | | | | |
| Live Stations | | | | X | | | | | |
| Hybrid Billing | | | | X | | | | | |
| GPS Geofencing | | | | | X | | | | |
| Lane Assignment | | | | | X | | | | |
| Pre-payment | | | | | X | X | | | |
| Interactive Map | | | | | | X | | | |
| Weekly Schedule | | | | | | X | | | |
| Virtual Queue | | | | | | X | X | | |
| Multi-step Reservation | | | | | | | X | | X |
| Countdown Timer | | | | | | | X | | |
| Course Progression | | | | | | | X | | |
| Digital Certificate | | | | | | | X | | |
| Digital Tab | | | | | | | | X | X |
| Happy Hour Engine | | | | | | | | X | |
| Round Builder | | | | | | | | X | |
| Tab Live | | | | | | | | X | X |
| Ticket Tiers | | | | | | | | | X |
| Anti-Fraud QR | | | | | | | | | X |
| Promoter Lists | | | | | | | | | X |
| VIP Map | | | | | | | | | X |
| Bottle Service | | | | | | | | | X |
| Min Spend Tracker | | | | | | | | | X |
| Floor Ordering | | | | | | | | | X |
| Multi-category Rating | | | | | | | | | X |

---

## Sequencia de Implementacao (por Impacto de Mercado)

### Fase 1 — Alto Volume (Sprint 5, primeiras 2 semanas)

1. **Quick Service — Skip the Line + Pickup Code**
   - Maior volume de transacoes por dia, ROI rapido
   - Dependencias: modulo `orders` existente

2. **Pub & Bar — Digital Tab + Happy Hour Engine**
   - Modulo `tabs` e `happy-hour` ja existem — adaptar endpoints
   - Alto ticket medio, alta retencao de usuarios

3. **Cafe & Bakery — Work Mode + Beverage Customization**
   - Mercado crescente de cafes work-friendly
   - Diferencial forte em diferenciacao no mercado

### Fase 2 — Complexidade Media (Sprint 5, semana 3)

4. **Drive-Thru — GPS Geofencing**
   - Requer background location no app — testar bem em iOS/Android
   - Criar endpoint `POST /orders/:id/geofence-trigger`

5. **Food Truck — Map + Queue**
   - Reutilizar `QueueGateway` existente
   - Criar endpoints de localizacao

6. **Buffet — Smart Scale Mock + Live Stations**
   - Hardware nao disponivel — implementar modo mock primeiro
   - Criar modulo `buffet-stations`

### Fase 3 — Alto Valor (Sprint 5, semana 4)

7. **Club & Balada — Tickets + Anti-Fraud QR**
   - Maior complexidade tecnica (WebSocket QR rotation)
   - Modulos `club-entries` e `qr-code` ja existem como base

8. **Club & Balada — VIP Map + Bottle Service + Min Spend**
   - Depende de Fase 3 step 7
   - Modulo `vip-table-tabs` ja existe

9. **Fast Casual — Dish Builder + Nutrition**
   - Requer dados nutricionais populados no cardapio

### Fase 4 — Nicho Premium (Sprint 6)

10. **Chef's Table — Reserva + Course Progression**
    - Volume menor mas ticket muito alto
    - Necessita WebSocket para course_changed

---

## Definition of Done

Para cada service type ser considerado concluido:

**Client App (React Native + Expo 51):**
- [ ] Todos os screens do demo equivalente implementados como telas reais (nao demo)
- [ ] i18n: todas as keys em PT-BR, EN e ES preenchidas
- [ ] Design tokens utilizados consistentemente (sem valores hardcoded de cor/espacamento)
- [ ] Tela funcional em iOS e Android (testar em ambas plataformas)
- [ ] Estados de loading, erro e vazio implementados em todas as telas
- [ ] Acessibilidade: labels descritivos em todos os elementos interativos
- [ ] Animacoes fluidas: nao usar `setTimeout` para animacoes — usar `Animated` ou `Reanimated`

**Restaurant App (React Native + Expo 51):**
- [ ] Painel do staff para features que requerem intervencao (ex: atualizar estacao buffet, avancar curso Chef's Table)
- [ ] Notificacoes de pedidos especificas de cada service type

**Backend (NestJS 10.4 + PostgreSQL):**
- [ ] Todos os endpoints documentados com Swagger (`@ApiOperation`, `@ApiResponse`)
- [ ] DTOs com validacao via `class-validator`
- [ ] Testes unitarios para logica de negocio (calculos de preco, validacoes)
- [ ] Testes de integracao para endpoints criticos (geofence trigger, QR validation)
- [ ] Migrations de banco para novas tabelas

**Qualidade Geral:**
- [ ] Nenhuma regressao nos service types ja implementados (Casual Dining — Epico 10)
- [ ] Performance: cada tela carrega em < 300ms em conexao 4G
- [ ] Code review aprovado por pelo menos 1 outro desenvolvedor
- [ ] Feature flag no Config Hub (Epico 8) habilitando/desabilitando cada feature por restaurante
