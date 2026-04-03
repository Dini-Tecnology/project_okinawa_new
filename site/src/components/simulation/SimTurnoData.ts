/**
 * SimTurnoData — All data for the 5-act "Real Shift" simulation.
 * Fine Dining pilot; extensible to all 11 models.
 * Fully translated PT/EN/ES.
 */
import type { SimProfile, SimTranslation } from './SimulationData';

export type ActId = 'act1' | 'act2' | 'act3' | 'act4' | 'act5';

export interface TurnoEvent {
  id: string;
  time: string; // e.g. "19:32"
  icon: string;
  urgency: 'info' | 'warning' | 'critical';
  clientView: SimTranslation;
  restaurantView: SimTranslation;
  resolution: SimTranslation;
}

export interface MetricComparison {
  id: string;
  icon: string;
  label: SimTranslation;
  without: SimTranslation;
  withNoowe: SimTranslation;
  /** Optional monetary value for impact panel animation */
  moneyImpact?: number;
}

export interface ActNarration {
  owner: SimTranslation;
  manager: SimTranslation;
  team: SimTranslation;
}

export interface TurnoAct {
  id: ActId;
  timeRange: string;
  title: SimTranslation;
  subtitle: SimTranslation;
  emotion: SimTranslation;
  woowEffect: SimTranslation;
  events: TurnoEvent[];
  metrics: MetricComparison[];
  narration: ActNarration;
  /** Client-side screens to show */
  clientScreens: ClientScreen[];
  /** Restaurant-side screens to show */
  restaurantScreens: RestaurantScreen[];
}

export interface ClientScreen {
  id: string;
  icon: string;
  label: SimTranslation;
  description: SimTranslation;
}

export interface RestaurantScreen {
  id: string;
  icon: string;
  label: SimTranslation;
  description: SimTranslation;
}

// ─── IMPACT PANEL ───

export interface ImpactSummary {
  icon: string;
  label: SimTranslation;
  value: SimTranslation;
  delta: SimTranslation;
  color: 'primary' | 'secondary' | 'accent' | 'success';
}

export const FINAL_IMPACT: Record<SimProfile, ImpactSummary[]> = {
  owner: [
    { icon: 'coins', label: { pt: 'Receita salva', en: 'Revenue saved', es: 'Ingresos salvados' }, value: { pt: 'R$ 1.840', en: '$370', es: '$370' }, delta: { pt: 'por turno', en: 'per shift', es: 'por turno' }, color: 'primary' },
    { icon: 'timer', label: { pt: 'Tempo salvo', en: 'Time saved', es: 'Tiempo ahorrado' }, value: { pt: '3h', en: '3h', es: '3h' }, delta: { pt: 'de retrabalho', en: 'of rework', es: 'de retrabajo' }, color: 'secondary' },
    { icon: 'utensils', label: { pt: 'Giros extras', en: 'Extra turns', es: 'Giros extras' }, value: { pt: '+2', en: '+2', es: '+2' }, delta: { pt: 'mesas por noite', en: 'tables per night', es: 'mesas por noche' }, color: 'accent' },
    { icon: 'users', label: { pt: 'Retenção', en: 'Retention', es: 'Retención' }, value: { pt: '92%', en: '92%', es: '92%' }, delta: { pt: 'voltariam (era 60%)', en: 'would return (was 60%)', es: 'volverían (era 60%)' }, color: 'success' },
  ],
  manager: [
    { icon: 'alert-octagon', label: { pt: 'Incidentes', en: 'Incidents', es: 'Incidentes' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'eram 12 por turno', en: 'were 12 per shift', es: 'eran 12 por turno' }, color: 'success' },
    { icon: 'timer', label: { pt: 'Fechamento', en: 'Bill close', es: 'Cierre' }, value: { pt: '45s', en: '45s', es: '45s' }, delta: { pt: 'era 12 min', en: 'was 12 min', es: 'era 12 min' }, color: 'primary' },
    { icon: 'star', label: { pt: 'NPS do turno', en: 'Shift NPS', es: 'NPS del turno' }, value: { pt: '9.1', en: '9.1', es: '9.1' }, delta: { pt: '+1.9 pontos', en: '+1.9 points', es: '+1.9 puntos' }, color: 'accent' },
    { icon: 'bar-chart-3', label: { pt: 'Visibilidade', en: 'Visibility', es: 'Visibilidad' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'em tempo real', en: 'real-time', es: 'en tiempo real' }, color: 'secondary' },
  ],
  team: [
    { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: 'R$ 127', en: '$25', es: '$25' }, delta: { pt: '+34% vs sem NOOWE', en: '+34% vs without NOOWE', es: '+34% vs sin NOOWE' }, color: 'primary' },
    { icon: 'star', label: { pt: 'Menções', en: 'Mentions', es: 'Menciones' }, value: { pt: '3', en: '3', es: '3' }, delta: { pt: 'clientes citaram seu nome', en: 'customers mentioned your name', es: 'clientes mencionaron tu nombre' }, color: 'accent' },
    { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-60%', en: '-60%', es: '-60%' }, delta: { pt: 'menos correria', en: 'less rushing', es: 'menos carreras' }, color: 'success' },
    { icon: 'target', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'no turno', en: 'in the shift', es: 'en el turno' }, color: 'secondary' },
  ],
};

// ─── 5 ACTS — FINE DINING ───

export const FINE_DINING_ACTS: TurnoAct[] = [
  // ── ACT 1: ABERTURA ──
  {
    id: 'act1',
    timeRange: '18:00 – 19:00',
    title: { pt: 'O turno começa', en: 'The shift begins', es: 'El turno comienza' },
    subtitle: { pt: 'Abertura', en: 'Opening', es: 'Apertura' },
    emotion: { pt: 'Esperança + Preparação', en: 'Hope + Preparation', es: 'Esperanza + Preparación' },
    woowEffect: { pt: 'Tudo pronto antes de abrir', en: 'Everything ready before opening', es: 'Todo listo antes de abrir' },
    clientScreens: [
      { id: 'c1-confirm', icon: 'mail', label: { pt: 'Confirmação de reserva', en: 'Reservation confirmation', es: 'Confirmación de reserva' }, description: { pt: 'Cliente recebe confirmação com preview do menu', en: 'Customer receives confirmation with menu preview', es: 'Cliente recibe confirmación con preview del menú' } },
      { id: 'c1-menu', icon: 'clipboard-list', label: { pt: 'Cardápio antecipado', en: 'Early menu access', es: 'Menú anticipado' }, description: { pt: 'Acesso ao cardápio antes de chegar', en: 'Menu access before arriving', es: 'Acceso al menú antes de llegar' } },
      { id: 'c1-pairing', icon: 'wine', label: { pt: 'Harmonização IA', en: 'AI wine pairing', es: 'Maridaje IA' }, description: { pt: 'Sugestões personalizadas de vinho', en: 'Personalized wine suggestions', es: 'Sugerencias personalizadas de vino' } },
    ],
    restaurantScreens: [
      { id: 'r1-dashboard', icon: 'bar-chart-3', label: { pt: 'Dashboard do turno', en: 'Shift dashboard', es: 'Dashboard del turno' }, description: { pt: 'Visão completa: reservas, equipe, mise en place', en: 'Full view: bookings, team, mise en place', es: 'Visión completa: reservas, equipo, mise en place' } },
      { id: 'r1-prefs', icon: 'user', label: { pt: 'Preferências do dia', en: 'Today\'s preferences', es: 'Preferencias del día' }, description: { pt: 'Garçom recebe dados dos clientes', en: 'Waiter receives customer data', es: 'Mesero recibe datos de clientes' } },
      { id: 'r1-prep', icon: 'chef-hat', label: { pt: 'Planejamento da cozinha', en: 'Kitchen planning', es: 'Planificación de cocina' }, description: { pt: 'Chef vê pedidos antecipados', en: 'Chef sees early orders', es: 'Chef ve pedidos anticipados' } },
    ],
    events: [
      { id: 'e1-1', time: '18:15', icon: 'mail', urgency: 'info', clientView: { pt: 'Recebeu confirmação da reserva', en: 'Received booking confirmation', es: 'Recibió confirmación de reserva' }, restaurantView: { pt: 'Reserva confirmada com preferências', en: 'Booking confirmed with preferences', es: 'Reserva confirmada con preferencias' }, resolution: { pt: 'Sistema sincronizou automaticamente', en: 'System synced automatically', es: 'Sistema sincronizó automáticamente' } },
      { id: 'e1-2', time: '18:30', icon: 'wine', urgency: 'info', clientView: { pt: 'Escolheu harmonização sugerida', en: 'Chose suggested pairing', es: 'Eligió maridaje sugerido' }, restaurantView: { pt: 'Sommelier notificado da escolha', en: 'Sommelier notified of choice', es: 'Sommelier notificado de la elección' }, resolution: { pt: 'Vinho separado antes da chegada', en: 'Wine set aside before arrival', es: 'Vino separado antes de la llegada' } },
    ],
    metrics: [
      { id: 'm1-1', icon: 'timer', label: { pt: 'Preparo pré-turno', en: 'Pre-shift prep', es: 'Preparación pre-turno' }, without: { pt: '45 min', en: '45 min', es: '45 min' }, withNoowe: { pt: '15 min', en: '15 min', es: '15 min' } },
      { id: 'm1-2', icon: 'user', label: { pt: 'Info sobre o cliente', en: 'Customer info', es: 'Info del cliente' }, without: { pt: '0%', en: '0%', es: '0%' }, withNoowe: { pt: '100%', en: '100%', es: '100%' } },
      { id: 'm1-3', icon: 'utensils', label: { pt: 'Mise en place otimizada', en: 'Optimized mise en place', es: 'Mise en place optimizada' }, without: { pt: '✗', en: '✗', es: '✗' }, withNoowe: { pt: '✓', en: '✓', es: '✓' } },
    ],
    narration: {
      owner: { pt: 'Seu restaurante já está faturando antes de abrir as portas.', en: 'Your restaurant is already earning before opening the doors.', es: 'Tu restaurante ya está facturando antes de abrir las puertas.' },
      manager: { pt: 'Sua equipe sabe exatamente o que esperar hoje.', en: 'Your team knows exactly what to expect today.', es: 'Tu equipo sabe exactamente qué esperar hoy.' },
      team: { pt: 'Você já sabe quem é alérgico, quem é aniversariante, quem é VIP.', en: 'You already know who\'s allergic, who\'s celebrating, who\'s VIP.', es: 'Ya sabes quién es alérgico, quién cumple años, quién es VIP.' },
    },
  },

  // ── ACT 2: PICO INICIAL ──
  {
    id: 'act2',
    timeRange: '19:00 – 20:00',
    title: { pt: 'A casa encheu', en: 'The house is full', es: 'La casa se llenó' },
    subtitle: { pt: 'Pico Inicial', en: 'Initial Peak', es: 'Pico Inicial' },
    emotion: { pt: 'Energia + Fluidez', en: 'Energy + Flow', es: 'Energía + Fluidez' },
    woowEffect: { pt: 'Volume alto sem atropelo', en: 'High volume without chaos', es: 'Alto volumen sin atropello' },
    clientScreens: [
      { id: 'c2-order', icon: 'smartphone', label: { pt: 'Pedido pelo app', en: 'App ordering', es: 'Pedido por app' }, description: { pt: 'Faz pedido direto da mesa', en: 'Orders directly from the table', es: 'Hace pedido directo desde la mesa' } },
      { id: 'c2-suggest', icon: 'sparkles', label: { pt: 'Sugestão personalizada', en: 'Personalized suggestion', es: 'Sugerencia personalizada' }, description: { pt: 'IA sugere pratos baseado no perfil', en: 'AI suggests dishes based on profile', es: 'IA sugiere platos basado en perfil' } },
      { id: 'c2-queue', icon: 'person-standing', label: { pt: 'Fila virtual', en: 'Virtual queue', es: 'Fila virtual' }, description: { pt: 'Walk-in entra na fila digital', en: 'Walk-in joins digital queue', es: 'Walk-in entra en fila digital' } },
    ],
    restaurantScreens: [
      { id: 'r2-kds', icon: 'monitor', label: { pt: 'KDS recebe instantâneo', en: 'KDS receives instantly', es: 'KDS recibe instantáneo' }, description: { pt: 'Pedido chega à cozinha em tempo real', en: 'Order reaches kitchen in real-time', es: 'Pedido llega a cocina en tiempo real' } },
      { id: 'r2-timeline', icon: 'clipboard-list', label: { pt: 'Timeline de mesas', en: 'Table timeline', es: 'Timeline de mesas' }, description: { pt: 'Garçom vê todas as mesas em tempo real', en: 'Waiter sees all tables in real-time', es: 'Mesero ve todas las mesas en tiempo real' } },
      { id: 'r2-maitre', icon: 'user-check', label: { pt: 'Painel do Maître', en: 'Maître panel', es: 'Panel del Maître' }, description: { pt: 'Fila + reservas no mesmo painel', en: 'Queue + bookings in one panel', es: 'Fila + reservas en un panel' } },
    ],
    events: [
      { id: 'e2-1', time: '19:12', icon: 'smartphone', urgency: 'info', clientView: { pt: 'Fez pedido pelo app na mesa', en: 'Ordered via app at table', es: 'Hizo pedido por app en la mesa' }, restaurantView: { pt: 'KDS recebeu instantaneamente', en: 'KDS received instantly', es: 'KDS recibió instantáneamente' }, resolution: { pt: 'Zero tempo de anotação', en: 'Zero annotation time', es: 'Cero tiempo de anotación' } },
      { id: 'e2-2', time: '19:32', icon: 'alert-triangle', urgency: 'warning', clientView: { pt: 'Alerta: prato incompatível com restrição', en: 'Alert: dish incompatible with restriction', es: 'Alerta: plato incompatible con restricción' }, restaurantView: { pt: 'Garçom recebeu opções de substituição', en: 'Waiter received substitution options', es: 'Mesero recibió opciones de sustitución' }, resolution: { pt: 'Erro evitado antes de chegar à cozinha', en: 'Error prevented before reaching kitchen', es: 'Error evitado antes de llegar a cocina' } },
      { id: 'e2-3', time: '19:45', icon: 'person-standing', urgency: 'info', clientView: { pt: 'Walk-in entrou na fila virtual', en: 'Walk-in joined virtual queue', es: 'Walk-in entró en fila virtual' }, restaurantView: { pt: 'Maître vê estimativa de espera', en: 'Maître sees wait estimate', es: 'Maître ve estimación de espera' }, resolution: { pt: 'Cliente monitorado sem ocupar espaço', en: 'Customer monitored without taking space', es: 'Cliente monitoreado sin ocupar espacio' } },
    ],
    metrics: [
      { id: 'm2-1', icon: 'timer', label: { pt: 'Pedido → Cozinha', en: 'Order → Kitchen', es: 'Pedido → Cocina' }, without: { pt: '8 min', en: '8 min', es: '8 min' }, withNoowe: { pt: 'Instantâneo', en: 'Instant', es: 'Instantáneo' } },
      { id: 'm2-2', icon: 'x-circle', label: { pt: 'Erros de anotação', en: 'Annotation errors', es: 'Errores de anotación' }, without: { pt: '12%', en: '12%', es: '12%' }, withNoowe: { pt: '0%', en: '0%', es: '0%' } },
      { id: 'm2-3', icon: 'person-standing', label: { pt: 'Walk-ins perdidos', en: 'Lost walk-ins', es: 'Walk-ins perdidos' }, without: { pt: '40%', en: '40%', es: '40%' }, withNoowe: { pt: '5%', en: '5%', es: '5%' } },
    ],
    narration: {
      owner: { pt: 'Cada cliente que entra é uma oportunidade que não se perde mais.', en: 'Every customer who walks in is an opportunity no longer lost.', es: 'Cada cliente que entra es una oportunidad que ya no se pierde.' },
      manager: { pt: 'Você vê tudo acontecendo em tempo real. Sem surpresas.', en: 'You see everything happening in real-time. No surprises.', es: 'Ves todo sucediendo en tiempo real. Sin sorpresas.' },
      team: { pt: 'Você não precisa decorar nada. O sistema lembra por você.', en: 'You don\'t need to memorize anything. The system remembers for you.', es: 'No necesitas memorizar nada. El sistema recuerda por ti.' },
    },
  },

  // ── ACT 3: CAOS CONTROLADO ──
  {
    id: 'act3',
    timeRange: '20:00 – 21:00',
    title: { pt: 'Tudo acontece ao mesmo tempo', en: 'Everything happens at once', es: 'Todo pasa al mismo tiempo' },
    subtitle: { pt: 'Caos Controlado', en: 'Controlled Chaos', es: 'Caos Controlado' },
    emotion: { pt: 'Tensão → Alívio', en: 'Tension → Relief', es: 'Tensión → Alivio' },
    woowEffect: { pt: 'O caos existe, mas você tem controle', en: 'Chaos exists, but you have control', es: 'El caos existe, pero tienes control' },
    clientScreens: [
      { id: 'c3-notify', icon: 'bell', label: { pt: 'Notificação proativa', en: 'Proactive notification', es: 'Notificación proactiva' }, description: { pt: '"Seu prato está sendo finalizado"', en: '"Your dish is being finalized"', es: '"Su plato está siendo finalizado"' } },
      { id: 'c3-vip', icon: 'crown', label: { pt: 'Menu VIP exclusivo', en: 'Exclusive VIP menu', es: 'Menú VIP exclusivo' }, description: { pt: 'Cliente VIP recebe menu especial', en: 'VIP customer receives special menu', es: 'Cliente VIP recibe menú especial' } },
      { id: 'c3-pay', icon: 'credit-card', label: { pt: 'Conta pelo app', en: 'Bill via app', es: 'Cuenta por app' }, description: { pt: 'Pode pedir conta a qualquer momento', en: 'Can request bill anytime', es: 'Puede pedir cuenta en cualquier momento' } },
    ],
    restaurantScreens: [
      { id: 'r3-priority', icon: 'flame', label: { pt: 'Prioridade automática', en: 'Auto priority', es: 'Prioridad automática' }, description: { pt: 'Chef vê prioridade reordenada', en: 'Chef sees reordered priorities', es: 'Chef ve prioridad reordenada' } },
      { id: 'r3-vip', icon: 'user-check', label: { pt: 'Alocação VIP', en: 'VIP allocation', es: 'Asignación VIP' }, description: { pt: 'Maître aloca mesa com 1 toque', en: 'Maître allocates table with 1 tap', es: 'Maître asigna mesa con 1 toque' } },
      { id: 'r3-multi', icon: 'credit-card', label: { pt: 'Multi-checkout', en: 'Multi-checkout', es: 'Multi-checkout' }, description: { pt: '3 contas fecham simultaneamente', en: '3 bills close simultaneously', es: '3 cuentas cierran simultáneamente' } },
    ],
    events: [
      { id: 'e3-1', time: '20:05', icon: 'alert-circle', urgency: 'critical', clientView: { pt: 'Recebeu: "Seu prato está sendo finalizado"', en: 'Received: "Your dish is being finalized"', es: 'Recibió: "Su plato está siendo finalizado"' }, restaurantView: { pt: 'Timer vermelho no KDS — prato da mesa 4', en: 'Red timer on KDS — table 4 dish', es: 'Timer rojo en KDS — plato de mesa 4' }, resolution: { pt: 'Chef reprioriza automaticamente', en: 'Chef auto-reprioritizes', es: 'Chef reprioriza automáticamente' } },
      { id: 'e3-2', time: '20:15', icon: 'crown', urgency: 'warning', clientView: { pt: 'VIP recebeu menu exclusivo no app', en: 'VIP received exclusive menu on app', es: 'VIP recibió menú exclusivo en app' }, restaurantView: { pt: 'Maître alocou mesa com 1 toque', en: 'Maître allocated table with 1 tap', es: 'Maître asignó mesa con 1 toque' }, resolution: { pt: 'VIP sentado em 2 min sem reserva', en: 'VIP seated in 2 min without booking', es: 'VIP sentado en 2 min sin reserva' } },
      { id: 'e3-3', time: '20:30', icon: 'credit-card', urgency: 'info', clientView: { pt: '3 mesas pediram conta pelo app', en: '3 tables requested bill via app', es: '3 mesas pidieron cuenta por app' }, restaurantView: { pt: '3 contas fecharam simultaneamente', en: '3 bills closed simultaneously', es: '3 cuentas cerraron simultáneamente' }, resolution: { pt: 'Garçom não precisou correr', en: 'Waiter didn\'t need to rush', es: 'Mesero no necesitó correr' } },
      { id: 'e3-4', time: '20:45', icon: 'circle-check', urgency: 'info', clientView: { pt: '—', en: '—', es: '—' }, restaurantView: { pt: 'Gerente aprovou desconto com swipe', en: 'Manager approved discount with swipe', es: 'Gerente aprobó descuento con swipe' }, resolution: { pt: 'Aprovação em 3 segundos', en: 'Approval in 3 seconds', es: 'Aprobación en 3 segundos' } },
    ],
    metrics: [
      { id: 'm3-1', icon: 'alert-octagon', label: { pt: 'Incidentes no turno', en: 'Shift incidents', es: 'Incidentes en el turno' }, without: { pt: '12', en: '12', es: '12' }, withNoowe: { pt: '0', en: '0', es: '0' } },
      { id: 'm3-2', icon: 'frown', label: { pt: 'Reclamações por atraso', en: 'Delay complaints', es: 'Quejas por retraso' }, without: { pt: '4', en: '4', es: '4' }, withNoowe: { pt: '0', en: '0', es: '0' } },
      { id: 'm3-3', icon: 'timer', label: { pt: 'Fechamento de conta', en: 'Bill closing', es: 'Cierre de cuenta' }, without: { pt: '12 min', en: '12 min', es: '12 min' }, withNoowe: { pt: '45 seg', en: '45 sec', es: '45 seg' } },
      { id: 'm3-4', icon: 'banknote', label: { pt: 'R$ perdidos com problemas', en: '$ lost to problems', es: '$ perdidos por problemas' }, without: { pt: 'R$ 1.840', en: '$370', es: '$370' }, withNoowe: { pt: 'R$ 0', en: '$0', es: '$0' }, moneyImpact: 1840 },
    ],
    narration: {
      owner: { pt: 'Enquanto você jantava tranquilo, 4 problemas se resolveram sozinhos.', en: 'While you were dining peacefully, 4 problems resolved themselves.', es: 'Mientras cenabas tranquilo, 4 problemas se resolvieron solos.' },
      manager: { pt: 'Um turno que antes gerava 12 incidentes agora gera zero.', en: 'A shift that used to generate 12 incidents now generates zero.', es: 'Un turno que antes generaba 12 incidentes ahora genera cero.' },
      team: { pt: 'Você não precisa escolher quem atender primeiro. O sistema organiza por você.', en: 'You don\'t need to choose who to serve first. The system organizes for you.', es: 'No necesitas elegir a quién atender primero. El sistema organiza por ti.' },
    },
  },

  // ── ACT 4: RECUPERAÇÃO ──
  {
    id: 'act4',
    timeRange: '21:00 – 22:00',
    title: { pt: 'A magia dos detalhes', en: 'The magic of details', es: 'La magia de los detalles' },
    subtitle: { pt: 'Recuperação', en: 'Recovery', es: 'Recuperación' },
    emotion: { pt: 'Satisfação + Reconhecimento', en: 'Satisfaction + Recognition', es: 'Satisfacción + Reconocimiento' },
    woowEffect: { pt: 'O cliente sai encantado E a equipe é reconhecida', en: 'Customer leaves delighted AND team is recognized', es: 'El cliente sale encantado Y el equipo es reconocido' },
    clientScreens: [
      { id: 'c4-rate', icon: 'star', label: { pt: 'Avaliação rápida', en: 'Quick rating', es: 'Evaluación rápida' }, description: { pt: 'Avalia a experiência com 1 toque', en: 'Rate experience with 1 tap', es: 'Evalúa la experiencia con 1 toque' } },
      { id: 'c4-loyalty', icon: 'sparkles', label: { pt: 'Pontos de fidelidade', en: 'Loyalty points', es: 'Puntos de fidelidad' }, description: { pt: 'Recebe pontos automaticamente', en: 'Receives points automatically', es: 'Recibe puntos automáticamente' } },
      { id: 'c4-share', icon: 'camera', label: { pt: 'Compartilhar', en: 'Share', es: 'Compartir' }, description: { pt: 'Compartilha foto do prato', en: 'Shares dish photo', es: 'Comparte foto del plato' } },
    ],
    restaurantScreens: [
      { id: 'r4-nps', icon: 'bar-chart-3', label: { pt: 'NPS em tempo real', en: 'Real-time NPS', es: 'NPS en tiempo real' }, description: { pt: 'Dashboard atualiza com cada avaliação', en: 'Dashboard updates with each rating', es: 'Dashboard actualiza con cada evaluación' } },
      { id: 'r4-tips', icon: 'dollar-sign', label: { pt: 'Gorjetas acumuladas', en: 'Accumulated tips', es: 'Propinas acumuladas' }, description: { pt: 'Garçom vê suas gorjetas do turno', en: 'Waiter sees shift tips', es: 'Mesero ve sus propinas del turno' } },
      { id: 'r4-report', icon: 'clipboard-list', label: { pt: 'Relatório formando', en: 'Report forming', es: 'Informe formándose' }, description: { pt: 'Gerente vê relatório se construindo', en: 'Manager sees report building', es: 'Gerente ve informe construyéndose' } },
    ],
    events: [
      { id: 'e4-1', time: '21:10', icon: 'star', urgency: 'info', clientView: { pt: 'Avaliou 5 estrelas com 1 toque', en: 'Rated 5 stars with 1 tap', es: 'Evaluó 5 estrellas con 1 toque' }, restaurantView: { pt: 'NPS atualizou em tempo real', en: 'NPS updated in real-time', es: 'NPS actualizó en tiempo real' }, resolution: { pt: 'Feedback instantâneo para melhoria', en: 'Instant feedback for improvement', es: 'Feedback instantáneo para mejora' } },
      { id: 'e4-2', time: '21:25', icon: 'dollar-sign', urgency: 'info', clientView: { pt: 'Deixou gorjeta generosa pelo app', en: 'Left generous tip via app', es: 'Dejó propina generosa por app' }, restaurantView: { pt: 'Gorjeta: R$ 127 (+34% vs média)', en: 'Tips: $25 (+34% vs average)', es: 'Propina: $25 (+34% vs promedio)' }, resolution: { pt: 'Equipe motivada = serviço melhor', en: 'Motivated team = better service', es: 'Equipo motivado = mejor servicio' } },
      { id: 'e4-3', time: '21:40', icon: 'mail', urgency: 'info', clientView: { pt: 'Recebeu sugestão para próxima visita', en: 'Received suggestion for next visit', es: 'Recibió sugerencia para próxima visita' }, restaurantView: { pt: 'Sistema já sugere melhorias para amanhã', en: 'System already suggests improvements for tomorrow', es: 'Sistema ya sugiere mejoras para mañana' }, resolution: { pt: 'Ciclo de melhoria contínua', en: 'Continuous improvement cycle', es: 'Ciclo de mejora continua' } },
    ],
    metrics: [
      { id: 'm4-1', icon: 'star', label: { pt: 'NPS do turno', en: 'Shift NPS', es: 'NPS del turno' }, without: { pt: '7.2', en: '7.2', es: '7.2' }, withNoowe: { pt: '9.1', en: '9.1', es: '9.1' } },
      { id: 'm4-2', icon: 'dollar-sign', label: { pt: 'Gorjeta média/garçom', en: 'Avg tip/waiter', es: 'Propina media/mesero' }, without: { pt: 'R$ 95', en: '$19', es: '$19' }, withNoowe: { pt: 'R$ 127', en: '$25', es: '$25' } },
      { id: 'm4-3', icon: 'refresh-cw', label: { pt: 'Clientes que voltariam', en: 'Customers who\'d return', es: 'Clientes que volverían' }, without: { pt: '60%', en: '60%', es: '60%' }, withNoowe: { pt: '92%', en: '92%', es: '92%' } },
    ],
    narration: {
      owner: { pt: 'Seus clientes não estão só satisfeitos. Estão encantados.', en: 'Your customers aren\'t just satisfied. They\'re delighted.', es: 'Tus clientes no están solo satisfechos. Están encantados.' },
      manager: { pt: 'O relatório do dia está pronto antes de você pedir.', en: 'The day\'s report is ready before you ask.', es: 'El informe del día está listo antes de que lo pidas.' },
      team: { pt: '3 clientes mencionaram seu nome na avaliação. Isso vale mais que qualquer bônus.', en: '3 customers mentioned your name in their review. That\'s worth more than any bonus.', es: '3 clientes mencionaron tu nombre en la evaluación. Eso vale más que cualquier bono.' },
    },
  },

  // ── ACT 5: FECHAMENTO ──
  {
    id: 'act5',
    timeRange: '22:00+',
    title: { pt: 'O dia que valeu a pena', en: 'A day worth it', es: 'El día que valió la pena' },
    subtitle: { pt: 'Fechamento', en: 'Closing', es: 'Cierre' },
    emotion: { pt: 'Orgulho + Visão de futuro', en: 'Pride + Future vision', es: 'Orgullo + Visión de futuro' },
    woowEffect: { pt: 'Não é só uma ferramenta, é um parceiro', en: 'It\'s not just a tool, it\'s a partner', es: 'No es solo una herramienta, es un socio' },
    clientScreens: [
      { id: 'c5-thanks', icon: '💌', label: { pt: 'Agradecimento automático', en: 'Auto thank-you', es: 'Agradecimiento automático' }, description: { pt: '"Obrigado por jantar conosco"', en: '"Thank you for dining with us"', es: '"Gracias por cenar con nosotros"' } },
    ],
    restaurantScreens: [
      { id: 'r5-report', icon: 'bar-chart-3', label: { pt: 'Relatório completo', en: 'Full report', es: 'Informe completo' }, description: { pt: 'Resumo completo do dia', en: 'Complete daily summary', es: 'Resumen completo del día' } },
      { id: 'r5-compare', icon: 'bar-chart-3', label: { pt: 'Comparativo', en: 'Comparison', es: 'Comparativo' }, description: { pt: 'vs semana anterior', en: 'vs previous week', es: 'vs semana anterior' } },
      { id: 'r5-ai', icon: 'zap', label: { pt: 'Sugestões IA', en: 'AI Suggestions', es: 'Sugerencias IA' }, description: { pt: 'Otimizações para amanhã', en: 'Optimizations for tomorrow', es: 'Optimizaciones para mañana' } },
    ],
    events: [
      { id: 'e5-1', time: '22:00', icon: 'bar-chart-3', urgency: 'info', clientView: { pt: 'Recebeu: "Obrigado por jantar conosco"', en: 'Received: "Thank you for dining with us"', es: 'Recibió: "Gracias por cenar con nosotros"' }, restaurantView: { pt: 'Relatório completo gerado automaticamente', en: 'Complete report auto-generated', es: 'Informe completo generado automáticamente' }, resolution: { pt: 'Dia encerrado com dados, não com suposições', en: 'Day closed with data, not assumptions', es: 'Día cerrado con datos, no con suposiciones' } },
    ],
    metrics: [
      { id: 'm5-1', icon: 'coins', label: { pt: 'Receita salva no turno', en: 'Revenue saved in shift', es: 'Ingresos salvados en turno' }, without: { pt: 'R$ 0', en: '$0', es: '$0' }, withNoowe: { pt: '+R$ 1.840', en: '+$370', es: '+$370' }, moneyImpact: 1840 },
      { id: 'm5-2', icon: 'timer', label: { pt: 'Horas salvas', en: 'Hours saved', es: 'Horas ahorradas' }, without: { pt: '0', en: '0', es: '0' }, withNoowe: { pt: '3h', en: '3h', es: '3h' } },
      { id: 'm5-3', icon: 'star', label: { pt: 'NPS final', en: 'Final NPS', es: 'NPS final' }, without: { pt: '7.2', en: '7.2', es: '7.2' }, withNoowe: { pt: '9.1', en: '9.1', es: '9.1' } },
    ],
    narration: {
      owner: { pt: 'Seu restaurante pode ganhar R$ 55.200 a mais por mês. Esse foi só um turno.', en: 'Your restaurant can earn $11,000 more per month. That was just one shift.', es: 'Tu restaurante puede ganar $11.000 más por mes. Ese fue solo un turno.' },
      manager: { pt: 'Amanhã será ainda melhor. Porque hoje você tem dados, não suposições.', en: 'Tomorrow will be even better. Because today you have data, not assumptions.', es: 'Mañana será aún mejor. Porque hoy tienes datos, no suposiciones.' },
      team: { pt: 'Mais gorjetas. Menos estresse. Mais reconhecimento. A NOOWE trabalha com você, não no lugar de você.', en: 'More tips. Less stress. More recognition. NOOWE works with you, not instead of you.', es: 'Más propinas. Menos estrés. Más reconocimiento. NOOWE trabaja contigo, no en tu lugar.' },
    },
  },
];

// ─── SIMULATION UI TEXTS ───

export const SIM_TEXTS: Record<string, SimTranslation> = {
  clientSide: { pt: 'Visão Cliente', en: 'Customer View', es: 'Visión Cliente' },
  restaurantSide: { pt: 'Visão Restaurante', en: 'Restaurant View', es: 'Visión Restaurante' },
  impactPanel: { pt: 'Painel de Impacto', en: 'Impact Panel', es: 'Panel de Impacto' },
  without: { pt: 'Sem NOOWE', en: 'Without NOOWE', es: 'Sin NOOWE' },
  with: { pt: 'Com NOOWE', en: 'With NOOWE', es: 'Con NOOWE' },
  nextAct: { pt: 'Próximo Ato', en: 'Next Act', es: 'Siguiente Acto' },
  prevAct: { pt: 'Ato Anterior', en: 'Previous Act', es: 'Acto Anterior' },
  liveEvents: { pt: 'Eventos ao Vivo', en: 'Live Events', es: 'Eventos en Vivo' },
  yourShift: { pt: 'Seu turno com NOOWE', en: 'Your shift with NOOWE', es: 'Tu turno con NOOWE' },
  seeFullDemo: { pt: 'Explorar demo completo', en: 'Explore full demo', es: 'Explorar demo completo' },
  talkToSpecialist: { pt: 'Falar com especialista', en: 'Talk to a specialist', es: 'Hablar con un especialista' },
  startOver: { pt: 'Recomeçar', en: 'Start over', es: 'Empezar de nuevo' },
  actOf: { pt: 'Ato {n} de {total}', en: 'Act {n} of {total}', es: 'Acto {n} de {total}' },
  // CTA final per profile
  ctaOwnerTitle: { pt: 'Seu restaurante pode ganhar R$ 55.200/mês a mais.', en: 'Your restaurant can earn $11,000+ more per month.', es: 'Tu restaurante puede ganar $11.000+ más por mes.' },
  ctaManagerTitle: { pt: '12 incidentes a menos por turno. Sua equipe mais tranquila.', en: '12 fewer incidents per shift. Your team at ease.', es: '12 incidentes menos por turno. Tu equipo más tranquilo.' },
  ctaTeamTitle: { pt: 'Mais gorjetas. Menos estresse. Mais reconhecimento.', en: 'More tips. Less stress. More recognition.', es: 'Más propinas. Menos estrés. Más reconocimiento.' },
  ctaTeamSubtitle: { pt: 'A NOOWE trabalha com você, não no lugar de você.', en: 'NOOWE works with you, not instead of you.', es: 'NOOWE trabaja contigo, no en tu lugar.' },
  indicateManager: { pt: 'Indicar para meu gerente', en: 'Recommend to my manager', es: 'Recomendar a mi gerente' },
  // Email capture — personalized per profile
  emailCaptureTitle_owner: { pt: 'Descubra quanto seu restaurante pode ganhar a mais', en: 'Discover how much more your restaurant can earn', es: 'Descubre cuánto más puede ganar tu restaurante' },
  emailCaptureTitle_manager: { pt: 'Receba um plano de melhoria operacional', en: 'Get an operational improvement plan', es: 'Recibe un plan de mejora operacional' },
  emailCaptureTitle_team: { pt: 'Veja como suas gorjetas podem crescer', en: 'See how your tips can grow', es: 'Mira cómo tus propinas pueden crecer' },
  emailCaptureSubtitle_owner: { pt: 'Diagnóstico com projeção de receita, economia e ROI baseados no seu modelo.', en: 'Diagnosis with revenue projection, savings and ROI based on your model.', es: 'Diagnóstico con proyección de ingresos, ahorro y ROI basados en tu modelo.' },
  emailCaptureSubtitle_manager: { pt: 'Relatório com redução de incidentes, tempo economizado e NPS projetado.', en: 'Report with incident reduction, time saved and projected NPS.', es: 'Informe con reducción de incidentes, tiempo ahorrado y NPS proyectado.' },
  emailCaptureSubtitle_team: { pt: 'Dados sobre gorjetas, reconhecimento e redução de estresse com NOOWE.', en: 'Data on tips, recognition and stress reduction with NOOWE.', es: 'Datos sobre propinas, reconocimiento y reducción de estrés con NOOWE.' },
  // Legacy generic (fallback)
  emailCaptureTitle: { pt: 'Receba um diagnóstico personalizado', en: 'Get a personalized diagnosis', es: 'Recibe un diagnóstico personalizado' },
  emailCaptureSubtitle: { pt: 'Enviamos um relatório com os dados de impacto para o seu negócio.', en: 'We\'ll send a report with impact data for your business.', es: 'Enviamos un informe con datos de impacto para tu negocio.' },
  emailPlaceholder: { pt: 'Seu melhor e-mail', en: 'Your best email', es: 'Tu mejor email' },
  emailSend: { pt: 'Quero meu diagnóstico', en: 'Get my diagnosis', es: 'Quiero mi diagnóstico' },
  emailSent: { pt: 'Pronto! Verifique seu e-mail em breve.', en: 'Done! Check your email soon.', es: '¡Listo! Revisa tu email pronto.' },
  emailSkip: { pt: 'Pular', en: 'Skip', es: 'Saltar' },
  swipeHint: { pt: 'deslize para navegar', en: 'swipe to navigate', es: 'desliza para navegar' },
  finishShift: { pt: 'Ver resultado do turno', en: 'See shift results', es: 'Ver resultado del turno' },
  previousEvents: { pt: 'Eventos anteriores', en: 'Previous events', es: 'Eventos anteriores' },
  incidentsResolved: { pt: '{n} problemas resolvidos', en: '{n} issues resolved', es: '{n} problemas resueltos' },
};
