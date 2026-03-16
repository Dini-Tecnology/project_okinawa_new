/**
 * Demo Pages — i18n System
 * Provides translations for PT/EN/ES with a compact language selector
 */
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Globe } from 'lucide-react';

// ============ TYPES ============

export type DemoLang = 'pt' | 'en' | 'es';

const LANG_META: Record<DemoLang, { flag: string; label: string }> = {
  pt: { flag: '🇧🇷', label: 'PT' },
  en: { flag: '🇺🇸', label: 'EN' },
  es: { flag: '🇪🇸', label: 'ES' },
};

// ============ TRANSLATION DICTIONARIES ============

export const DEMO_TRANSLATIONS = {
  // ---- Shared / Chrome ----
  shared: {
    backToDemo: { pt: 'Voltar à demo', en: 'Back to demo', es: 'Volver a la demo' },
    viewClientDemo: { pt: 'Ver Demo Cliente →', en: 'View Client Demo →', es: 'Ver Demo Cliente →' },
    viewRestaurantDemo: { pt: 'Ver Demo Restaurante →', en: 'View Restaurant Demo →', es: 'Ver Demo Restaurante →' },
    demoClient: { pt: 'Demo Cliente', en: 'Client Demo', es: 'Demo Cliente' },
    demoRestaurant: { pt: 'Demo Restaurante', en: 'Restaurant Demo', es: 'Demo Restaurante' },
    followSteps: { pt: 'Siga os passos ou explore livremente', en: 'Follow the steps or explore freely', es: 'Sigue los pasos o explora libremente' },
    stepsInJourney: { pt: 'etapas na jornada', en: 'steps in the journey', es: 'etapas en el recorrido' },
    wantThis: { pt: 'Quer isso no seu restaurante?', en: 'Want this for your restaurant?', es: '¿Quieres esto en tu restaurante?' },
    ctaDesc: { pt: 'Leve a experiência NOOWE para sua operação.', en: 'Bring the NOOWE experience to your operation.', es: 'Lleva la experiencia NOOWE a tu operación.' },
    ctaDescClient: { pt: 'Leve a experiência NOOWE para seus clientes.', en: 'Bring the NOOWE experience to your customers.', es: 'Lleva la experiencia NOOWE a tus clientes.' },
    talkToTeam: { pt: 'Falar com a equipe', en: 'Talk to our team', es: 'Hablar con el equipo' },
    otherProfiles: { pt: 'Outros perfis', en: 'Other profiles', es: 'Otros perfiles' },
  },

  // ---- Client Demo ----
  client: {
    title: { pt: 'Demo Cliente | NOOWE — Experiência Interativa', en: 'Client Demo | NOOWE — Interactive Experience', es: 'Demo Cliente | NOOWE — Experiencia Interactiva' },
    metaDesc: { pt: 'Experimente o app NOOWE como um cliente real. 11 tipos de serviço, jornadas completas e interativas.', en: 'Experience the NOOWE app as a real customer. 11 service types, full interactive journeys.', es: 'Experimenta la app NOOWE como un cliente real. 11 tipos de servicio, recorridos completos e interactivos.' },
    chooseExperience: { pt: 'Escolha a experiência', en: 'Choose the experience', es: 'Elige la experiencia' },
    clientJourney: { pt: 'Jornada do Cliente', en: 'Client Journey', es: 'Recorrido del Cliente' },
  },

  // ---- Restaurant Demo ----
  restaurant: {
    title: { pt: 'Demo Restaurante | NOOWE — Experiência Interativa', en: 'Restaurant Demo | NOOWE — Interactive Experience', es: 'Demo Restaurante | NOOWE — Experiencia Interactiva' },
    metaDesc: { pt: 'Experimente o app restaurante da NOOWE com 7 perfis operacionais, 22 telas especializadas e jornadas guiadas interativas.', en: 'Experience the NOOWE restaurant app with 7 operational profiles, 22 specialized screens, and interactive guided journeys.', es: 'Experimenta la app de restaurante NOOWE con 7 perfiles operativos, 22 pantallas especializadas y recorridos guiados interactivos.' },
    chooseProfile: { pt: 'Escolha o perfil', en: 'Choose the profile', es: 'Elige el perfil' },
    journeyOf: { pt: 'Jornada do', en: 'Journey of the', es: 'Recorrido del' },
  },

  // ---- Role labels (Restaurant) ----
  roles: {
    owner: { pt: 'Dono', en: 'Owner', es: 'Dueño' },
    manager: { pt: 'Gerente', en: 'Manager', es: 'Gerente' },
    maitre: { pt: 'Maitre', en: 'Maître', es: 'Maître' },
    chef: { pt: 'Chef', en: 'Chef', es: 'Chef' },
    barman: { pt: 'Barman', en: 'Bartender', es: 'Barman' },
    cook: { pt: 'Cozinheiro', en: 'Cook', es: 'Cocinero' },
    waiter: { pt: 'Garçom', en: 'Waiter', es: 'Mesero' },
  },

  // ---- Role descriptions ----
  roleDescs: {
    owner: { pt: 'Visão executiva completa', en: 'Full executive overview', es: 'Visión ejecutiva completa' },
    manager: { pt: 'Operação e aprovações', en: 'Operations & approvals', es: 'Operaciones y aprobaciones' },
    maitre: { pt: 'Reservas e fluxo do salão', en: 'Reservations & floor flow', es: 'Reservas y flujo del salón' },
    chef: { pt: 'KDS e gestão de cardápio', en: 'KDS & menu management', es: 'KDS y gestión del menú' },
    barman: { pt: 'Bar, drinks e estoque', en: 'Bar, drinks & stock', es: 'Bar, bebidas e inventario' },
    cook: { pt: 'Estação de preparo', en: 'Prep station', es: 'Estación de preparación' },
    waiter: { pt: 'Mesas, pedidos e gorjetas', en: 'Tables, orders & tips', es: 'Mesas, pedidos y propinas' },
  },

  // ---- Journey step labels (Restaurant) ----
  journeySteps: {
    // Owner
    dashboard: { pt: 'Dashboard', en: 'Dashboard', es: 'Dashboard' },
    'table-map': { pt: 'Mapa de Mesas', en: 'Table Map', es: 'Mapa de Mesas' },
    orders: { pt: 'Pedidos', en: 'Orders', es: 'Pedidos' },
    'kds-kitchen': { pt: 'KDS Cozinha', en: 'Kitchen KDS', es: 'KDS Cocina' },
    'kds-bar': { pt: 'KDS Bar', en: 'Bar KDS', es: 'KDS Bar' },
    analytics: { pt: 'Analytics', en: 'Analytics', es: 'Analytics' },
    team: { pt: 'Equipe', en: 'Team', es: 'Equipo' },
    'menu-editor': { pt: 'Cardápio', en: 'Menu', es: 'Menú' },
    setup: { pt: 'Configuração', en: 'Settings', es: 'Configuración' },
    // Manager
    'manager-ops': { pt: 'Painel Operacional', en: 'Operations Panel', es: 'Panel Operativo' },
    approvals: { pt: 'Aprovações', en: 'Approvals', es: 'Aprobaciones' },
    'daily-report': { pt: 'Relatório do Dia', en: 'Daily Report', es: 'Informe del Día' },
    stock: { pt: 'Estoque', en: 'Stock', es: 'Inventario' },
    // Maitre
    maitre: { pt: 'Reservas', en: 'Reservations', es: 'Reservas' },
    'floor-flow': { pt: 'Fluxo do Salão', en: 'Floor Flow', es: 'Flujo del Salón' },
    // Barman
    'barman-station': { pt: 'Minha Estação', en: 'My Station', es: 'Mi Estación' },
    'drink-recipes': { pt: 'Receitas', en: 'Recipes', es: 'Recetas' },
    // Cook
    'cook-station': { pt: 'Minha Estação', en: 'My Station', es: 'Mi Estación' },
    // Waiter
    waiter: { pt: 'Minhas Mesas', en: 'My Tables', es: 'Mis Mesas' },
    'waiter-calls': { pt: 'Chamados', en: 'Calls', es: 'Llamados' },
    'waiter-tips': { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' },
  },

  // ---- Screen info titles (Restaurant) ----
  screenTitles: {
    welcome: { pt: 'Bem-vindo ao NOOWE', en: 'Welcome to NOOWE', es: 'Bienvenido a NOOWE' },
    setup: { pt: 'Configuração', en: 'Settings', es: 'Configuración' },
    dashboard: { pt: 'Dashboard Executivo', en: 'Executive Dashboard', es: 'Dashboard Ejecutivo' },
    'table-map': { pt: 'Mapa de Mesas', en: 'Table Map', es: 'Mapa de Mesas' },
    orders: { pt: 'Gestão de Pedidos', en: 'Order Management', es: 'Gestión de Pedidos' },
    'kds-kitchen': { pt: 'KDS — Cozinha', en: 'KDS — Kitchen', es: 'KDS — Cocina' },
    'kds-bar': { pt: 'KDS — Bar', en: 'KDS — Bar', es: 'KDS — Bar' },
    maitre: { pt: 'Painel do Maitre', en: 'Maître Panel', es: 'Panel del Maître' },
    waiter: { pt: 'Visão do Garçom', en: 'Waiter View', es: 'Vista del Mesero' },
    'menu-editor': { pt: 'Editor de Cardápio', en: 'Menu Editor', es: 'Editor de Menú' },
    team: { pt: 'Gestão de Equipe', en: 'Team Management', es: 'Gestión de Equipo' },
    analytics: { pt: 'Analytics & Relatórios', en: 'Analytics & Reports', es: 'Analytics e Informes' },
    'manager-ops': { pt: 'Painel Operacional', en: 'Operations Panel', es: 'Panel Operativo' },
    approvals: { pt: 'Aprovações Pendentes', en: 'Pending Approvals', es: 'Aprobaciones Pendientes' },
    'barman-station': { pt: 'Estação do Barman', en: 'Bartender Station', es: 'Estación del Barman' },
    'drink-recipes': { pt: 'Receitas de Drinks', en: 'Drink Recipes', es: 'Recetas de Tragos' },
    'cook-station': { pt: 'Estação de Preparo', en: 'Prep Station', es: 'Estación de Preparación' },
    stock: { pt: 'Controle de Estoque', en: 'Stock Control', es: 'Control de Inventario' },
    'waiter-calls': { pt: 'Chamados de Clientes', en: 'Customer Calls', es: 'Llamados de Clientes' },
    'waiter-tips': { pt: 'Minhas Gorjetas', en: 'My Tips', es: 'Mis Propinas' },
    'floor-flow': { pt: 'Fluxo do Salão', en: 'Floor Flow', es: 'Flujo del Salón' },
    'daily-report': { pt: 'Relatório do Dia', en: 'Daily Report', es: 'Informe del Día' },
  },

  // ---- Screen info descriptions (Restaurant) ----
  screenDescs: {
    welcome: { pt: 'Escolha um perfil para explorar o painel', en: 'Choose a profile to explore the panel', es: 'Elige un perfil para explorar el panel' },
    setup: { pt: 'Perfil, tipo de serviço e funcionalidades', en: 'Profile, service type and features', es: 'Perfil, tipo de servicio y funcionalidades' },
    dashboard: { pt: 'Visão completa com KPIs, receita e operação em tempo real', en: 'Complete view with KPIs, revenue and real-time operations', es: 'Vista completa con KPIs, ingresos y operaciones en tiempo real' },
    'table-map': { pt: 'Planta interativa com status de cada mesa', en: 'Interactive floor plan with table status', es: 'Plano interactivo con estado de cada mesa' },
    orders: { pt: 'Pedidos ativos, confirmações e acompanhamento', en: 'Active orders, confirmations and tracking', es: 'Pedidos activos, confirmaciones y seguimiento' },
    'kds-kitchen': { pt: 'Display de tickets com timers e prioridades', en: 'Ticket display with timers and priorities', es: 'Display de tickets con temporizadores y prioridades' },
    'kds-bar': { pt: 'Fila de bebidas e cocktails', en: 'Beverage and cocktail queue', es: 'Cola de bebidas y cócteles' },
    maitre: { pt: 'Reservas, fila virtual e check-in', en: 'Reservations, virtual queue and check-in', es: 'Reservas, cola virtual y check-in' },
    waiter: { pt: 'Mesas, pedidos, chamados e gorjetas', en: 'Tables, orders, calls and tips', es: 'Mesas, pedidos, llamados y propinas' },
    'menu-editor': { pt: 'Categorias, itens, preços e fichas técnicas', en: 'Categories, items, prices and tech sheets', es: 'Categorías, items, precios y fichas técnicas' },
    team: { pt: 'Colaboradores, escalas e desempenho', en: 'Staff, schedules and performance', es: 'Colaboradores, horarios y rendimiento' },
    analytics: { pt: 'Receita, tendências e insights operacionais', en: 'Revenue, trends and operational insights', es: 'Ingresos, tendencias e insights operativos' },
    'manager-ops': { pt: 'Visão gerencial com alertas e status em tempo real', en: 'Management view with alerts and real-time status', es: 'Vista gerencial con alertas y estado en tiempo real' },
    approvals: { pt: 'Cancelamentos, cortesias, estornos e ajustes', en: 'Cancellations, courtesies, refunds and adjustments', es: 'Cancelaciones, cortesías, reembolsos y ajustes' },
    'barman-station': { pt: 'Drinks na fila, preparo e expedição', en: 'Queued drinks, prep and dispatch', es: 'Tragos en cola, preparación y despacho' },
    'drink-recipes': { pt: 'Fichas técnicas, ingredientes e porções', en: 'Tech sheets, ingredients and portions', es: 'Fichas técnicas, ingredientes y porciones' },
    'cook-station': { pt: 'Tickets da sua estação com timers', en: 'Station tickets with timers', es: 'Tickets de tu estación con temporizadores' },
    stock: { pt: 'Insumos, alertas de nível baixo e reposição', en: 'Supplies, low-level alerts and restocking', es: 'Insumos, alertas de nivel bajo y reposición' },
    'waiter-calls': { pt: 'Chamados pendentes das suas mesas', en: 'Pending calls from your tables', es: 'Llamados pendientes de tus mesas' },
    'waiter-tips': { pt: 'Gorjetas recebidas hoje e histórico', en: 'Tips received today and history', es: 'Propinas recibidas hoy e historial' },
    'floor-flow': { pt: 'Fila virtual, tempos de espera e rotação', en: 'Virtual queue, wait times and rotation', es: 'Cola virtual, tiempos de espera y rotación' },
    'daily-report': { pt: 'Fechamento, métricas e comparativos', en: 'Closing, metrics and comparisons', es: 'Cierre, métricas y comparativos' },
  },
} as const;

// ============ CONTEXT ============

interface DemoI18nContextType {
  lang: DemoLang;
  setLang: (lang: DemoLang) => void;
  t: (section: keyof typeof DEMO_TRANSLATIONS, key: string) => string;
}

const DemoI18nContext = createContext<DemoI18nContextType>({
  lang: 'pt',
  setLang: () => {},
  t: () => '',
});

export function DemoI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<DemoLang>('pt');

  const t = useCallback(
    (section: keyof typeof DEMO_TRANSLATIONS, key: string): string => {
      const dict = DEMO_TRANSLATIONS[section] as Record<string, Record<DemoLang, string>>;
      return dict?.[key]?.[lang] ?? dict?.[key]?.['pt'] ?? key;
    },
    [lang],
  );

  return (
    <DemoI18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </DemoI18nContext.Provider>
  );
}

export function useDemoI18n() {
  return useContext(DemoI18nContext);
}

// ============ LANGUAGE SELECTOR COMPONENT ============

export function DemoLangSelector() {
  const { lang, setLang } = useDemoI18n();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-0.5">
      {(Object.keys(LANG_META) as DemoLang[]).map((l) => {
        const isActive = lang === l;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            title={LANG_META[l].label}
          >
            <span className="text-sm leading-none">{LANG_META[l].flag}</span>
            <span>{LANG_META[l].label}</span>
          </button>
        );
      })}
    </div>
  );
}
