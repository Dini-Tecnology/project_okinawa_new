/**
 * Simulation Onboarding Data
 * All profiles, pillars, models, and pain points for the guided simulation.
 * Fully translated PT/EN/ES.
 */

export type SimProfile = 'owner' | 'manager' | 'team';
export type SimPillar = 'full-experiences' | 'high-volume' | 'continuous' | 'mobility';
export type SimModel =
  | 'fine-dining' | 'chefs-table' | 'casual-dining'
  | 'quick-service' | 'fast-casual' | 'drive-thru'
  | 'cafe-bakery' | 'pub-bar' | 'club'
  | 'food-truck' | 'buffet';

export type SimScale = 'small' | 'medium' | 'large' | 'xlarge';

export interface SimTranslation {
  pt: string;
  en: string;
  es: string;
}

// ─── PROFILES ───

export interface ProfileOption {
  id: SimProfile;
  icon: string;
  label: SimTranslation;
  description: SimTranslation;
  color: 'primary' | 'secondary' | 'accent';
}

export const PROFILES: ProfileOption[] = [
  {
    id: 'owner',
    icon: 'building-2',
    label: { pt: 'Dono / Sócio', en: 'Owner / Partner', es: 'Dueño / Socio' },
    description: {
      pt: 'Quero ver o impacto no meu negócio',
      en: 'I want to see the impact on my business',
      es: 'Quiero ver el impacto en mi negocio',
    },
    color: 'primary',
  },
  {
    id: 'manager',
    icon: 'clipboard-list',
    label: { pt: 'Gerente / Gestor', en: 'Manager', es: 'Gerente / Gestor' },
    description: {
      pt: 'Quero ver o controle da operação',
      en: 'I want to see operations under control',
      es: 'Quiero ver el control de la operación',
    },
    color: 'accent',
  },
  {
    id: 'team',
    icon: 'users',
    label: { pt: 'Equipe', en: 'Team', es: 'Equipo' },
    description: {
      pt: 'Quero ver como facilita meu dia',
      en: 'I want to see how it makes my day easier',
      es: 'Quiero ver cómo facilita mi día',
    },
    color: 'secondary',
  },
];

// ─── PILLARS ───

export interface PillarOption {
  id: SimPillar;
  icon: string;
  label: SimTranslation;
  models: SimModel[];
  /** Tagline changes based on profile */
  taglines: Record<SimProfile, SimTranslation>;
}

export const PILLARS: PillarOption[] = [
  {
    id: 'full-experiences',
    icon: 'wine',
    label: { pt: 'Experiências Completas', en: 'Full Experiences', es: 'Experiencias Completas' },
    models: ['fine-dining', 'chefs-table', 'casual-dining'],
    taglines: {
      owner: {
        pt: 'Seus clientes pagam caro. Eles merecem perfeição.',
        en: 'Your customers pay a premium. They deserve perfection.',
        es: 'Tus clientes pagan caro. Merecen perfección.',
      },
      manager: {
        pt: 'Orquestrar serviço premium sem falhas é possível.',
        en: 'Orchestrating flawless premium service is possible.',
        es: 'Orquestar servicio premium sin fallas es posible.',
      },
      team: {
        pt: 'Você cuida de cada detalhe. Nós cuidamos do resto.',
        en: 'You take care of every detail. We handle the rest.',
        es: 'Tú cuidas cada detalle. Nosotros nos encargamos del resto.',
      },
    },
  },
  {
    id: 'high-volume',
    icon: 'zap',
    label: { pt: 'Alto Volume', en: 'High Volume', es: 'Alto Volumen' },
    models: ['quick-service', 'fast-casual', 'drive-thru'],
    taglines: {
      owner: {
        pt: 'Cada segundo de espera é dinheiro perdido.',
        en: 'Every second of waiting is money lost.',
        es: 'Cada segundo de espera es dinero perdido.',
      },
      manager: {
        pt: 'Volume alto não precisa significar caos.',
        en: 'High volume doesn\'t have to mean chaos.',
        es: 'Alto volumen no tiene que significar caos.',
      },
      team: {
        pt: 'Atender rápido sem errar: isso muda tudo.',
        en: 'Fast service without mistakes: that changes everything.',
        es: 'Atender rápido sin errores: eso lo cambia todo.',
      },
    },
  },
  {
    id: 'continuous',
    icon: 'refresh-cw',
    label: { pt: 'Consumo Contínuo', en: 'Continuous Consumption', es: 'Consumo Continuo' },
    models: ['cafe-bakery', 'pub-bar', 'club'],
    taglines: {
      owner: {
        pt: 'Conta aberta é risco. Ou pode ser oportunidade.',
        en: 'Open tabs are risky. Or they can be an opportunity.',
        es: 'Cuenta abierta es riesgo. O puede ser oportunidad.',
      },
      manager: {
        pt: 'Controlar consumo contínuo sem perder o ritmo.',
        en: 'Control continuous consumption without losing the rhythm.',
        es: 'Controlar consumo continuo sin perder el ritmo.',
      },
      team: {
        pt: 'Nunca mais perder pedido no barulho.',
        en: 'Never lose an order in the noise again.',
        es: 'Nunca más perder un pedido en el ruido.',
      },
    },
  },
  {
    id: 'mobility',
    icon: 'rocket',
    label: { pt: 'Mobilidade & Flexibilidade', en: 'Mobility & Flexibility', es: 'Movilidad y Flexibilidad' },
    models: ['food-truck', 'buffet'],
    taglines: {
      owner: {
        pt: 'Sem estrutura fixa, mas com controle total.',
        en: 'No fixed structure, but total control.',
        es: 'Sin estructura fija, pero con control total.',
      },
      manager: {
        pt: 'Operar em qualquer lugar com a mesma precisão.',
        en: 'Operate anywhere with the same precision.',
        es: 'Operar en cualquier lugar con la misma precisión.',
      },
      team: {
        pt: 'Seu trabalho muda de lugar. Seu controle, não.',
        en: 'Your workplace changes. Your control doesn\'t.',
        es: 'Tu lugar de trabajo cambia. Tu control, no.',
      },
    },
  },
];

// ─── MODELS ───

export interface ModelOption {
  id: SimModel;
  icon: string;
  label: SimTranslation;
  feature: SimTranslation;
}

export const MODELS: Record<SimModel, ModelOption> = {
  'fine-dining': {
    id: 'fine-dining',
    icon: 'wine',
    label: { pt: 'Fine Dining', en: 'Fine Dining', es: 'Fine Dining' },
    feature: { pt: 'Harmonização IA de vinhos', en: 'AI wine pairing', es: 'Maridaje IA de vinos' },
  },
  'chefs-table': {
    id: 'chefs-table',
    icon: 'chef-hat',
    label: { pt: "Chef's Table", en: "Chef's Table", es: 'Mesa del Chef' },
    feature: { pt: 'Notas do sommelier integradas', en: 'Integrated sommelier notes', es: 'Notas del sommelier integradas' },
  },
  'casual-dining': {
    id: 'casual-dining',
    icon: 'utensils-crossed',
    label: { pt: 'Casual Dining', en: 'Casual Dining', es: 'Casual Dining' },
    feature: { pt: 'Waitlist inteligente', en: 'Smart waitlist', es: 'Lista de espera inteligente' },
  },
  'quick-service': {
    id: 'quick-service',
    icon: 'store',
    label: { pt: 'Quick Service', en: 'Quick Service', es: 'Servicio Rápido' },
    feature: { pt: 'Skip the Line', en: 'Skip the Line', es: 'Sin filas' },
  },
  'fast-casual': {
    id: 'fast-casual',
    icon: 'leaf',
    label: { pt: 'Fast Casual', en: 'Fast Casual', es: 'Fast Casual' },
    feature: { pt: 'Rastreamento nutricional', en: 'Nutritional tracking', es: 'Seguimiento nutricional' },
  },
  'drive-thru': {
    id: 'drive-thru',
    icon: 'car',
    label: { pt: 'Drive-Thru', en: 'Drive-Thru', es: 'Drive-Thru' },
    feature: { pt: 'Geofencing GPS', en: 'GPS geofencing', es: 'Geofencing GPS' },
  },
  'cafe-bakery': {
    id: 'cafe-bakery',
    icon: 'coffee',
    label: { pt: 'Café & Padaria', en: 'Café & Bakery', es: 'Café y Panadería' },
    feature: { pt: 'Modo Trabalho com Wi-Fi stats', en: 'Work Mode with Wi-Fi stats', es: 'Modo Trabajo con stats Wi-Fi' },
  },
  'pub-bar': {
    id: 'pub-bar',
    icon: 'beer',
    label: { pt: 'Pub & Bar', en: 'Pub & Bar', es: 'Pub y Bar' },
    feature: { pt: 'Tab digital pré-autorizado', en: 'Pre-authorized digital tab', es: 'Tab digital pre-autorizado' },
  },
  club: {
    id: 'club',
    icon: 'music',
    label: { pt: 'Club & Balada', en: 'Club & Nightlife', es: 'Club y Discoteca' },
    feature: { pt: 'QR anti-fraude rotativo', en: 'Anti-fraud rotating QR', es: 'QR antifraude rotativo' },
  },
  'food-truck': {
    id: 'food-truck',
    icon: 'truck',
    label: { pt: 'Food Truck', en: 'Food Truck', es: 'Food Truck' },
    feature: { pt: 'Mapa em tempo real', en: 'Real-time map', es: 'Mapa en tiempo real' },
  },
  buffet: {
    id: 'buffet',
    icon: 'soup',
    label: { pt: 'Buffet', en: 'Buffet', es: 'Buffet' },
    feature: { pt: 'Balança inteligente NFC', en: 'NFC smart scale', es: 'Balanza inteligente NFC' },
  },
};

// ─── PAIN POINTS ───

export interface PainPoint {
  id: string;
  icon: string;
  label: SimTranslation;
}

type PainPointKey = `${SimModel}:${SimProfile}`;

export const PAIN_POINTS: Record<PainPointKey, PainPoint[]> = {
  // ── Fine Dining ──
  'fine-dining:owner': [
    { id: 'fd-o1', icon: 'banknote', label: { pt: 'Giro de mesa baixo', en: 'Low table turnover', es: 'Baja rotación de mesas' } },
    { id: 'fd-o2', icon: 'trending-down', label: { pt: 'Sem dados sobre meu cliente', en: 'No customer data', es: 'Sin datos de mis clientes' } },
    { id: 'fd-o3', icon: 'refresh-cw', label: { pt: 'Dependência total da equipe', en: 'Total team dependency', es: 'Dependencia total del equipo' } },
    { id: 'fd-o4', icon: 'star', label: { pt: 'Experiência inconsistente', en: 'Inconsistent experience', es: 'Experiencia inconsistente' } },
  ],
  'fine-dining:manager': [
    { id: 'fd-m1', icon: 'flame', label: { pt: 'Cozinha estourando tempos', en: 'Kitchen exceeding times', es: 'Cocina excediendo tiempos' } },
    { id: 'fd-m2', icon: 'bar-chart-3', label: { pt: 'Sem visibilidade em tempo real', en: 'No real-time visibility', es: 'Sin visibilidad en tiempo real' } },
    { id: 'fd-m3', icon: 'layers', label: { pt: 'Muitas aprovações manuais', en: 'Too many manual approvals', es: 'Muchas aprobaciones manuales' } },
    { id: 'fd-m4', icon: 'alert-triangle', label: { pt: 'Reclamações sem rastreio', en: 'Untracked complaints', es: 'Quejas sin seguimiento' } },
  ],
  'fine-dining:team': [
    { id: 'fd-t1', icon: 'alert-triangle', label: { pt: 'Pressão para lembrar preferências', en: 'Pressure to remember preferences', es: 'Presión por recordar preferencias' } },
    { id: 'fd-t2', icon: 'file-text', label: { pt: 'Anotação manual gera erros', en: 'Manual notes cause errors', es: 'Anotación manual genera errores' } },
    { id: 'fd-t3', icon: 'timer', label: { pt: 'Demoro para fechar conta', en: 'Slow bill closing', es: 'Demoro para cerrar cuenta' } },
    { id: 'fd-t4', icon: 'help-circle', label: { pt: 'Levo a culpa pela espera', en: 'I get blamed for the wait', es: 'Me culpan por la espera' } },
  ],
  // ── Chef's Table ──
  'chefs-table:owner': [
    { id: 'ct-o1', icon: 'sparkles', label: { pt: 'Expectativa vs realidade', en: 'Expectation vs reality', es: 'Expectativa vs realidad' } },
    { id: 'ct-o2', icon: 'gem', label: { pt: 'Experiência premium difícil de escalar', en: 'Premium experience hard to scale', es: 'Experiencia premium difícil de escalar' } },
    { id: 'ct-o3', icon: 'trending-down', label: { pt: 'Sem dados de satisfação', en: 'No satisfaction data', es: 'Sin datos de satisfacción' } },
  ],
  'chefs-table:manager': [
    { id: 'ct-m1', icon: 'calendar', label: { pt: 'Gestão de reservas exclusivas', en: 'Exclusive booking management', es: 'Gestión de reservas exclusivas' } },
    { id: 'ct-m2', icon: 'wine', label: { pt: 'Preferências dietéticas complexas', en: 'Complex dietary preferences', es: 'Preferencias dietéticas complejas' } },
    { id: 'ct-m3', icon: 'clipboard-list', label: { pt: 'Comunicação chef-salão falha', en: 'Chef-floor communication failures', es: 'Comunicación chef-salón falla' } },
  ],
  'chefs-table:team': [
    { id: 'ct-t1', icon: 'brain', label: { pt: 'Personalização manual exaustiva', en: 'Exhausting manual personalization', es: 'Personalización manual agotadora' } },
    { id: 'ct-t2', icon: 'timer', label: { pt: 'Timing entre cursos é crítico', en: 'Timing between courses is critical', es: 'Timing entre cursos es crítico' } },
    { id: 'ct-t3', icon: 'camera', label: { pt: 'Capturar momento sem atrapalhar', en: 'Capture moments without disrupting', es: 'Capturar momento sin molestar' } },
  ],
  // ── Casual Dining ──
  'casual-dining:owner': [
    { id: 'cd-o1', icon: 'person-standing', label: { pt: 'Walk-ins perdidos na espera', en: 'Walk-ins lost to waiting', es: 'Walk-ins perdidos en la espera' } },
    { id: 'cd-o2', icon: 'banknote', label: { pt: 'Ticket médio estagnado', en: 'Stagnant average ticket', es: 'Ticket promedio estancado' } },
    { id: 'cd-o3', icon: 'bar-chart-3', label: { pt: 'Sem entender padrões de consumo', en: 'No consumption pattern insight', es: 'Sin entender patrones de consumo' } },
  ],
  'casual-dining:manager': [
    { id: 'cd-m1', icon: 'layers', label: { pt: 'Muitas mesas, pouco controle', en: 'Many tables, little control', es: 'Muchas mesas, poco control' } },
    { id: 'cd-m2', icon: 'users', label: { pt: 'Modo família gera complexidade', en: 'Family mode adds complexity', es: 'Modo familia genera complejidad' } },
    { id: 'cd-m3', icon: 'credit-card', label: { pt: 'Divisão de conta caótica', en: 'Chaotic bill splitting', es: 'División de cuenta caótica' } },
  ],
  'casual-dining:team': [
    { id: 'cd-t1', icon: 'activity', label: { pt: 'Correria entre mesas', en: 'Running between tables', es: 'Corriendo entre mesas' } },
    { id: 'cd-t2', icon: 'file-text', label: { pt: 'Cardápio muda e ninguém avisa', en: 'Menu changes without notice', es: 'Menú cambia y nadie avisa' } },
    { id: 'cd-t3', icon: 'credit-card', label: { pt: 'Fechar conta de grupo é pesadelo', en: 'Closing group bills is a nightmare', es: 'Cerrar cuenta grupal es pesadilla' } },
  ],
  // ── Quick Service ──
  'quick-service:owner': [
    { id: 'qs-o1', icon: 'person-standing', label: { pt: 'Fila longa espanta clientes', en: 'Long lines scare customers away', es: 'Filas largas espantan clientes' } },
    { id: 'qs-o2', icon: 'x-circle', label: { pt: 'Erros geram desperdício', en: 'Errors cause waste', es: 'Errores generan desperdicio' } },
    { id: 'qs-o3', icon: 'refresh-cw', label: { pt: 'Turnover alto da equipe', en: 'High staff turnover', es: 'Alta rotación de equipo' } },
  ],
  'quick-service:manager': [
    { id: 'qs-m1', icon: 'bar-chart-3', label: { pt: 'Sem medir performance da equipe', en: 'Can\'t measure team performance', es: 'Sin medir rendimiento del equipo' } },
    { id: 'qs-m2', icon: 'timer', label: { pt: 'Tempo de preparo imprevisível', en: 'Unpredictable prep time', es: 'Tiempo de preparación impredecible' } },
    { id: 'qs-m3', icon: 'package', label: { pt: 'Estoque sem controle', en: 'Uncontrolled stock', es: 'Inventario sin control' } },
  ],
  'quick-service:team': [
    { id: 'qs-t1', icon: 'alert-triangle', label: { pt: 'Pressão constante na fila', en: 'Constant line pressure', es: 'Presión constante en la fila' } },
    { id: 'qs-t2', icon: 'x-circle', label: { pt: 'Erro no pedido = bronca', en: 'Wrong order = scolding', es: 'Error en pedido = regaño' } },
    { id: 'qs-t3', icon: 'refresh-cw', label: { pt: 'Treinamento insuficiente', en: 'Insufficient training', es: 'Entrenamiento insuficiente' } },
  ],
  // ── Fast Casual ──
  'fast-casual:owner': [
    { id: 'fc-o1', icon: 'leaf', label: { pt: 'Builder lento reduz throughput', en: 'Slow builder reduces throughput', es: 'Builder lento reduce throughput' } },
    { id: 'fc-o2', icon: 'alert-triangle', label: { pt: 'Alergênicos sem controle', en: 'Uncontrolled allergens', es: 'Alérgenos sin control' } },
    { id: 'fc-o3', icon: 'trending-down', label: { pt: 'Tracking impreciso de preparo', en: 'Imprecise prep tracking', es: 'Seguimiento impreciso de preparación' } },
  ],
  'fast-casual:manager': [
    { id: 'fc-m1', icon: 'bar-chart-3', label: { pt: 'Nutritional data manual', en: 'Manual nutritional data', es: 'Datos nutricionales manuales' } },
    { id: 'fc-m2', icon: 'activity', label: { pt: 'Fluxo de montagem desorganizado', en: 'Disorganized assembly flow', es: 'Flujo de montaje desorganizado' } },
    { id: 'fc-m3', icon: 'package', label: { pt: 'Desperdício por preparo errado', en: 'Waste from wrong prep', es: 'Desperdicio por preparación incorrecta' } },
  ],
  'fast-casual:team': [
    { id: 'fc-t1', icon: 'brain', label: { pt: 'Decorar combinações complexas', en: 'Memorizing complex combos', es: 'Memorizar combinaciones complejas' } },
    { id: 'fc-t2', icon: 'timer', label: { pt: 'Pressão de tempo na montagem', en: 'Time pressure during assembly', es: 'Presión de tiempo en el montaje' } },
    { id: 'fc-t3', icon: 'alert-triangle', label: { pt: 'Medo de errar alergia', en: 'Fear of allergen mistakes', es: 'Miedo a errores con alérgenos' } },
  ],
  // ── Drive-Thru ──
  'drive-thru:owner': [
    { id: 'dt-o1', icon: 'car', label: { pt: 'Gargalo na pista', en: 'Lane bottleneck', es: 'Cuello de botella en el carril' } },
    { id: 'dt-o2', icon: 'x-circle', label: { pt: 'Pedido errado sem retorno', en: 'Wrong order, no return', es: 'Pedido incorrecto sin retorno' } },
    { id: 'dt-o3', icon: 'timer', label: { pt: 'Tempo de espera na pista', en: 'Lane waiting time', es: 'Tiempo de espera en el carril' } },
  ],
  'drive-thru:manager': [
    { id: 'dt-m1', icon: 'bar-chart-3', label: { pt: 'Sem dados por janela de horário', en: 'No data by time window', es: 'Sin datos por ventana horaria' } },
    { id: 'dt-m2', icon: 'refresh-cw', label: { pt: 'Rotação de equipe na pista', en: 'Lane crew rotation', es: 'Rotación de equipo en carril' } },
    { id: 'dt-m3', icon: 'package', label: { pt: 'Previsão de demanda falha', en: 'Failed demand forecasting', es: 'Previsión de demanda fallida' } },
  ],
  'drive-thru:team': [
    { id: 'dt-t1', icon: 'mic', label: { pt: 'Comunicação com headset falha', en: 'Headset communication failures', es: 'Comunicación con headset falla' } },
    { id: 'dt-t2', icon: 'activity', label: { pt: 'Ritmo frenético sem pausas', en: 'Frantic pace without breaks', es: 'Ritmo frenético sin pausas' } },
    { id: 'dt-t3', icon: 'x-circle', label: { pt: 'Confusão entre pedidos', en: 'Order mix-ups', es: 'Confusión entre pedidos' } },
  ],
  // ── Café & Bakery ──
  'cafe-bakery:owner': [
    { id: 'cb-o1', icon: 'banknote', label: { pt: 'Conta aberta descontrolada', en: 'Uncontrolled open tabs', es: 'Cuenta abierta descontrolada' } },
    { id: 'cb-o2', icon: 'wifi', label: { pt: 'Wi-Fi sem retorno mensurável', en: 'Wi-Fi with no measurable return', es: 'Wi-Fi sin retorno medible' } },
    { id: 'cb-o3', icon: 'refresh-cw', label: { pt: 'Baixa fidelização', en: 'Low customer loyalty', es: 'Baja fidelización' } },
  ],
  'cafe-bakery:manager': [
    { id: 'cb-m1', icon: 'timer', label: { pt: 'Sessões longas sem consumo', en: 'Long sessions without orders', es: 'Sesiones largas sin consumo' } },
    { id: 'cb-m2', icon: 'bar-chart-3', label: { pt: 'Sem dados de horários de pico', en: 'No peak hour data', es: 'Sin datos de horarios pico' } },
    { id: 'cb-m3', icon: 'cookie', label: { pt: 'Vitrine sem tracking de saída', en: 'Display case with no exit tracking', es: 'Vitrina sin seguimiento de salida' } },
  ],
  'cafe-bakery:team': [
    { id: 'cb-t1', icon: 'layers', label: { pt: 'Muitos pedidos simultâneos', en: 'Too many simultaneous orders', es: 'Muchos pedidos simultáneos' } },
    { id: 'cb-t2', icon: 'file-text', label: { pt: 'Personalização difícil de lembrar', en: 'Hard to remember customizations', es: 'Personalización difícil de recordar' } },
    { id: 'cb-t3', icon: 'coins', label: { pt: 'Gorjeta rara no balcão', en: 'Tips rare at the counter', es: 'Propina rara en el mostrador' } },
  ],
  // ── Pub & Bar ──
  'pub-bar:owner': [
    { id: 'pb-o1', icon: 'banknote', label: { pt: 'Tab aberta que cliente nega', en: 'Open tab the customer denies', es: 'Cuenta abierta que el cliente niega' } },
    { id: 'pb-o2', icon: 'trending-down', label: { pt: 'Fraude em comanda física', en: 'Physical tab fraud', es: 'Fraude en comanda física' } },
    { id: 'pb-o3', icon: 'volume-2', label: { pt: 'Pedidos perdidos no barulho', en: 'Orders lost in the noise', es: 'Pedidos perdidos en el ruido' } },
  ],
  'pub-bar:manager': [
    { id: 'pb-m1', icon: 'beer', label: { pt: 'Controle de dose inconsistente', en: 'Inconsistent pour control', es: 'Control de dosis inconsistente' } },
    { id: 'pb-m2', icon: 'bar-chart-3', label: { pt: 'Sem visão de consumo por mesa', en: 'No per-table consumption view', es: 'Sin visión de consumo por mesa' } },
    { id: 'pb-m3', icon: 'users', label: { pt: 'Lotação sem controle', en: 'Uncontrolled capacity', es: 'Aforo sin control' } },
  ],
  'pub-bar:team': [
    { id: 'pb-t1', icon: 'volume-2', label: { pt: '15 pessoas gritando ao mesmo tempo', en: '15 people shouting at once', es: '15 personas gritando al mismo tiempo' } },
    { id: 'pb-t2', icon: 'brain', label: { pt: 'Decorar receitas é impossível', en: 'Memorizing recipes is impossible', es: 'Memorizar recetas es imposible' } },
    { id: 'pb-t3', icon: 'coins', label: { pt: 'Gorjeta dividida injustamente', en: 'Unfairly split tips', es: 'Propina dividida injustamente' } },
  ],
  // ── Club ──
  'club:owner': [
    { id: 'cl-o1', icon: 'lock', label: { pt: 'Fraude de comanda recorrente', en: 'Recurring tab fraud', es: 'Fraude de comanda recurrente' } },
    { id: 'cl-o2', icon: 'person-standing', label: { pt: 'Filas VIP mal gerenciadas', en: 'Poorly managed VIP lines', es: 'Filas VIP mal gestionadas' } },
    { id: 'cl-o3', icon: 'bar-chart-3', label: { pt: 'Zero dados de comportamento', en: 'Zero behavioral data', es: 'Cero datos de comportamiento' } },
  ],
  'club:manager': [
    { id: 'cl-m1', icon: 'users', label: { pt: 'Controle de lotação impreciso', en: 'Imprecise capacity control', es: 'Control de aforo impreciso' } },
    { id: 'cl-m2', icon: 'glass-water', label: { pt: 'Consumo sem rastreio', en: 'Untracked consumption', es: 'Consumo sin seguimiento' } },
    { id: 'cl-m3', icon: 'alert-triangle', label: { pt: 'Segurança sem dados', en: 'Security without data', es: 'Seguridad sin datos' } },
  ],
  'club:team': [
    { id: 'cl-t1', icon: 'activity', label: { pt: 'Pista lotada, bares distantes', en: 'Packed floor, distant bars', es: 'Pista llena, bares lejanos' } },
    { id: 'cl-t2', icon: 'volume-2', label: { pt: 'Comunicação impossível', en: 'Communication impossible', es: 'Comunicación imposible' } },
    { id: 'cl-t3', icon: 'credit-card', label: { pt: 'Checkout caótico no fim da noite', en: 'Chaotic end-of-night checkout', es: 'Checkout caótico al final de la noche' } },
  ],
  // ── Food Truck ──
  'food-truck:owner': [
    { id: 'ft-o1', icon: 'map-pin', label: { pt: 'Sem visibilidade de localização', en: 'No location visibility', es: 'Sin visibilidad de ubicación' } },
    { id: 'ft-o2', icon: 'person-standing', label: { pt: 'Fila sem gestão', en: 'Unmanaged queue', es: 'Fila sin gestión' } },
    { id: 'ft-o3', icon: 'bar-chart-3', label: { pt: 'Zero dados de cliente', en: 'Zero customer data', es: 'Cero datos de clientes' } },
  ],
  'food-truck:manager': [
    { id: 'ft-m1', icon: 'package', label: { pt: 'Estoque limitado sem previsão', en: 'Limited stock without forecasting', es: 'Stock limitado sin previsión' } },
    { id: 'ft-m2', icon: 'calendar', label: { pt: 'Agenda de locais desorganizada', en: 'Disorganized location schedule', es: 'Agenda de ubicaciones desorganizada' } },
    { id: 'ft-m3', icon: 'coins', label: { pt: 'Pagamento lento atrasa a fila', en: 'Slow payment delays the line', es: 'Pago lento atrasa la fila' } },
  ],
  'food-truck:team': [
    { id: 'ft-t1', icon: 'activity', label: { pt: 'Cozinhar e atender ao mesmo tempo', en: 'Cooking and serving at the same time', es: 'Cocinar y atender al mismo tiempo' } },
    { id: 'ft-t2', icon: 'sparkles', label: { pt: 'Condições adversas sem apoio', en: 'Adverse conditions without support', es: 'Condiciones adversas sin apoyo' } },
    { id: 'ft-t3', icon: 'file-text', label: { pt: 'Anotação manual na correria', en: 'Manual notes in the rush', es: 'Anotación manual en la carrera' } },
  ],
  // ── Buffet ──
  'buffet:owner': [
    { id: 'bf-o1', icon: 'trash-2', label: { pt: 'Desperdício sem controle', en: 'Uncontrolled waste', es: 'Desperdicio sin control' } },
    { id: 'bf-o2', icon: 'scale', label: { pt: 'Cobrança imprecisa', en: 'Imprecise billing', es: 'Cobro impreciso' } },
    { id: 'bf-o3', icon: 'bar-chart-3', label: { pt: 'Sem dados por estação', en: 'No per-station data', es: 'Sin datos por estación' } },
  ],
  'buffet:manager': [
    { id: 'bf-m1', icon: 'utensils', label: { pt: 'Reposição de estações cega', en: 'Blind station restocking', es: 'Reposición de estaciones ciega' } },
    { id: 'bf-m2', icon: 'users', label: { pt: 'Fluxo de clientes imprevisível', en: 'Unpredictable customer flow', es: 'Flujo de clientes impredecible' } },
    { id: 'bf-m3', icon: 'coins', label: { pt: 'Bebidas sem rastreio na comanda', en: 'Drinks untracked on tab', es: 'Bebidas sin seguimiento en comanda' } },
  ],
  'buffet:team': [
    { id: 'bf-t1', icon: 'activity', label: { pt: 'Repor sem saber o que acabou', en: 'Restocking without knowing what\'s out', es: 'Reponer sin saber qué se acabó' } },
    { id: 'bf-t2', icon: 'scale', label: { pt: 'Balança manual gera conflito', en: 'Manual scale causes conflict', es: 'Balanza manual genera conflicto' } },
    { id: 'bf-t3', icon: 'alert-triangle', label: { pt: 'Cliente reclama do preço da pesagem', en: 'Customer complains about weight price', es: 'Cliente reclama del precio del pesaje' } },
  ],
};

// ─── EMPATHY SCREEN ───

export const EMPATHY_TEXTS: Record<string, SimTranslation> = {
  line1: { pt: 'Sabemos como é.', en: 'We know how it feels.', es: 'Sabemos cómo es.' },
  line2: { pt: 'O celular tocando.', en: 'The phone ringing.', es: 'El celular sonando.' },
  line3: { pt: 'A cozinha gritando.', en: 'The kitchen shouting.', es: 'La cocina gritando.' },
  line4: { pt: 'O cliente esperando.', en: 'The customer waiting.', es: 'El cliente esperando.' },
  line5: {
    pt: 'Você não precisa de mais tecnologia.',
    en: 'You don\'t need more technology.',
    es: 'No necesitas más tecnología.',
  },
  line6: {
    pt: 'Você precisa de menos preocupação.',
    en: 'You need less to worry about.',
    es: 'Necesitas menos preocupaciones.',
  },
  cta: {
    pt: 'Começar minha experiência',
    en: 'Start my experience',
    es: 'Comenzar mi experiencia',
  },
};

// ─── ONBOARDING UI TEXTS ───

export const ONBOARDING_TEXTS: Record<string, SimTranslation> = {
  step1Title: {
    pt: 'Quem é você nessa história?',
    en: 'Who are you in this story?',
    es: '¿Quién eres en esta historia?',
  },
  step2Title: {
    pt: 'Qual é o seu mundo?',
    en: 'What\'s your world?',
    es: '¿Cuál es tu mundo?',
  },
  step2Subtitle: {
    pt: 'Escolha o modelo do seu negócio',
    en: 'Choose your business model',
    es: 'Elige el modelo de tu negocio',
  },
  step3Title: {
    pt: 'O que mais te tira o sono?',
    en: 'What keeps you up at night?',
    es: '¿Qué es lo que más te quita el sueño?',
  },
  step3Subtitle: {
    pt: 'Selecione as dores que mais afetam sua operação',
    en: 'Select the pains that most affect your operation',
    es: 'Selecciona los dolores que más afectan tu operación',
  },
  next: { pt: 'Continuar', en: 'Continue', es: 'Continuar' },
  back: { pt: 'Voltar', en: 'Back', es: 'Volver' },
  selectAtLeast: {
    pt: 'Selecione pelo menos uma opção',
    en: 'Select at least one option',
    es: 'Selecciona al menos una opción',
  },
  readyTitle: {
    pt: 'Tudo pronto.',
    en: 'All set.',
    es: 'Todo listo.',
  },
  readySubtitle: {
    pt: 'Preparamos uma simulação personalizada para você.',
    en: 'We\'ve prepared a personalized simulation for you.',
    es: 'Hemos preparado una simulación personalizada para ti.',
  },
  startSimulation: {
    pt: 'Iniciar simulação',
    en: 'Start simulation',
    es: 'Iniciar simulación',
  },
  exitLabel: { pt: 'Sair', en: 'Exit', es: 'Salir' },
};

/** Helper to get pain points by model + profile */
export function getPainPoints(model: SimModel, profile: SimProfile): PainPoint[] {
  const key = `${model}:${profile}` as PainPointKey;
  return PAIN_POINTS[key] || [];
}

/** Get pillar for a model */
export function getPillarForModel(model: SimModel): PillarOption | undefined {
  return PILLARS.find(p => p.models.includes(model));
}
