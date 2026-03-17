/**
 * Restaurant Demo — Shared Types, Journey Config, 7-Role System
 */
import React from 'react';
import {
  Sparkles, Settings, BarChart3, LayoutGrid, UtensilsCrossed,
  ChefHat, Wine, CalendarDays, Smartphone, BookOpen, Users, TrendingUp,
  Crown, HandPlatter, Briefcase, Beer, CookingPot, Shield,
  Bell, Package, ClipboardList, Timer, DollarSign, Flame,
  CheckCircle2, AlertCircle, Star,
} from 'lucide-react';

// ============ TYPES ============

export type RestaurantScreen =
  | 'welcome' | 'setup' | 'dashboard' | 'table-map'
  | 'orders' | 'kds-kitchen' | 'kds-bar'
  | 'maitre' | 'waiter' | 'menu-editor' | 'team' | 'analytics'
  | 'manager-ops' | 'approvals' | 'barman-station' | 'drink-recipes'
  | 'cook-station' | 'stock' | 'waiter-calls' | 'waiter-tips'
  | 'floor-flow' | 'daily-report'
  | 'waiter-table-detail' | 'waiter-payment' | 'waiter-actions'
  // Configuration Hub screens
  | 'config-hub' | 'config-profile' | 'config-service-types' | 'config-experience'
  | 'config-floor' | 'config-menu' | 'config-team' | 'config-kitchen'
  | 'config-payments' | 'config-features';

export type StaffRole = 'owner' | 'manager' | 'maitre' | 'barman' | 'chef' | 'cook' | 'waiter';

// ============ ROLE CONFIG ============

export interface RoleConfig {
  id: StaffRole;
  label: string;
  desc: string;
  emoji: string;
  icon: React.FC<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  gradient: string;
  defaultScreen: RestaurantScreen;
}

export const ROLE_CONFIG: RoleConfig[] = [
  { id: 'owner', label: 'Dono', desc: 'Visão executiva completa', emoji: '👑', icon: Crown, colorClass: 'text-primary', bgClass: 'bg-primary/10', gradient: 'from-primary/20 to-primary/5', defaultScreen: 'dashboard' },
  { id: 'manager', label: 'Gerente', desc: 'Operação e aprovações', emoji: '📊', icon: Briefcase, colorClass: 'text-secondary', bgClass: 'bg-secondary/10', gradient: 'from-secondary/20 to-secondary/5', defaultScreen: 'manager-ops' },
  { id: 'maitre', label: 'Maitre', desc: 'Reservas e fluxo do salão', emoji: '💁‍♀️', icon: CalendarDays, colorClass: 'text-info', bgClass: 'bg-info/10', gradient: 'from-info/20 to-info/5', defaultScreen: 'maitre' },
  { id: 'chef', label: 'Chef', desc: 'KDS e gestão de cardápio', emoji: '👨‍🍳', icon: ChefHat, colorClass: 'text-warning', bgClass: 'bg-warning/10', gradient: 'from-warning/20 to-warning/5', defaultScreen: 'kds-kitchen' },
  { id: 'barman', label: 'Barman', desc: 'Bar, drinks e estoque', emoji: '🍸', icon: Beer, colorClass: 'text-accent-foreground', bgClass: 'bg-accent/10', gradient: 'from-accent/20 to-accent/5', defaultScreen: 'barman-station' },
  { id: 'cook', label: 'Cozinheiro', desc: 'Estação de preparo', emoji: '🧑‍🍳', icon: CookingPot, colorClass: 'text-destructive', bgClass: 'bg-destructive/10', gradient: 'from-destructive/20 to-destructive/5', defaultScreen: 'cook-station' },
  { id: 'waiter', label: 'Garçom', desc: 'Mesas, pedidos e gorjetas', emoji: '🤵', icon: HandPlatter, colorClass: 'text-success', bgClass: 'bg-success/10', gradient: 'from-success/20 to-success/5', defaultScreen: 'waiter' },
];

// ============ PER-ROLE JOURNEY STAGES ============

export interface RoleJourneyStage {
  screen: RestaurantScreen;
  label: string;
  icon: React.FC<{ className?: string }>;
  desc: string;
}

export const ROLE_JOURNEYS: Record<StaffRole, RoleJourneyStage[]> = {
  owner: [
    { screen: 'dashboard', label: 'Dashboard', icon: BarChart3, desc: 'Visão executiva com KPIs em tempo real' },
    { screen: 'table-map', label: 'Mapa de Mesas', icon: LayoutGrid, desc: 'Planta interativa do salão' },
    { screen: 'orders', label: 'Pedidos', icon: UtensilsCrossed, desc: 'Todos os pedidos ativos' },
    { screen: 'kds-kitchen', label: 'KDS Cozinha', icon: ChefHat, desc: 'Monitor da cozinha' },
    { screen: 'kds-bar', label: 'KDS Bar', icon: Wine, desc: 'Monitor do bar' },
    { screen: 'analytics', label: 'Analytics', icon: TrendingUp, desc: 'Relatórios e tendências' },
    { screen: 'team', label: 'Equipe', icon: Users, desc: 'Gestão de colaboradores' },
    { screen: 'menu-editor', label: 'Cardápio', icon: BookOpen, desc: 'Editor de cardápio' },
    { screen: 'config-hub', label: 'Central de Config', icon: Settings, desc: 'Hub de configuração completo' },
  ],
  manager: [
    { screen: 'manager-ops', label: 'Painel Operacional', icon: BarChart3, desc: 'Visão operacional em tempo real' },
    { screen: 'orders', label: 'Pedidos', icon: UtensilsCrossed, desc: 'Gestão de pedidos ativos' },
    { screen: 'approvals', label: 'Aprovações', icon: Shield, desc: 'Cancelamentos, cortesias e estornos' },
    { screen: 'table-map', label: 'Mapa de Mesas', icon: LayoutGrid, desc: 'Status do salão' },
    { screen: 'team', label: 'Equipe Hoje', icon: Users, desc: 'Quem está em serviço' },
    { screen: 'daily-report', label: 'Relatório do Dia', icon: ClipboardList, desc: 'Fechamento e métricas do dia' },
    { screen: 'stock', label: 'Estoque', icon: Package, desc: 'Alertas de estoque baixo' },
    { screen: 'config-hub', label: 'Central de Config', icon: Settings, desc: 'Hub de configuração completo' },
  ],
  maitre: [
    { screen: 'maitre', label: 'Reservas', icon: CalendarDays, desc: 'Reservas e check-in do dia' },
    { screen: 'floor-flow', label: 'Fluxo do Salão', icon: Users, desc: 'Fila virtual e tempos de espera' },
    { screen: 'table-map', label: 'Mapa de Mesas', icon: LayoutGrid, desc: 'Alocação e disponibilidade' },
  ],
  chef: [
    { screen: 'kds-kitchen', label: 'KDS Cozinha', icon: ChefHat, desc: 'Tickets e fila de preparo' },
    { screen: 'menu-editor', label: 'Cardápio', icon: BookOpen, desc: 'Itens, fichas técnicas e preparo' },
    { screen: 'stock', label: 'Estoque Cozinha', icon: Package, desc: 'Insumos e alertas' },
  ],
  barman: [
    { screen: 'barman-station', label: 'Minha Estação', icon: Beer, desc: 'Fila de drinks e pedidos do bar' },
    { screen: 'kds-bar', label: 'KDS Bar', icon: Wine, desc: 'Display completo de bebidas' },
    { screen: 'drink-recipes', label: 'Receitas', icon: BookOpen, desc: 'Fichas técnicas de drinks' },
    { screen: 'stock', label: 'Estoque Bar', icon: Package, desc: 'Bebidas e insumos' },
  ],
  cook: [
    { screen: 'cook-station', label: 'Minha Estação', icon: Flame, desc: 'Tickets da sua estação de preparo' },
    { screen: 'kds-kitchen', label: 'KDS Geral', icon: ChefHat, desc: 'Visão geral da cozinha' },
  ],
  waiter: [
    { screen: 'waiter', label: 'Minhas Mesas', icon: LayoutGrid, desc: 'Mesas atribuídas e pedidos' },
    { screen: 'waiter-calls', label: 'Chamados', icon: Bell, desc: 'Chamados em tempo real dos clientes' },
    { screen: 'waiter-payment', label: 'Cobrar / TAP', icon: Smartphone, desc: 'Processar pagamento na mesa' },
    { screen: 'waiter-actions', label: 'Ações na Mesa', icon: HandPlatter, desc: 'Executar ações pelo cliente' },
    { screen: 'orders', label: 'Pedidos Ativos', icon: UtensilsCrossed, desc: 'Pedidos das suas mesas' },
    { screen: 'waiter-tips', label: 'Gorjetas', icon: DollarSign, desc: 'Suas gorjetas do dia' },
  ],
};

// ============ SCREEN INFO (full superset) ============

export const SCREEN_INFO: Record<RestaurantScreen, { title: string; desc: string }> = {
  welcome: { title: 'Bem-vindo ao NOOWE', desc: 'Escolha um perfil para explorar o painel' },
  setup: { title: 'Configuração', desc: 'Perfil, tipo de serviço e funcionalidades' },
  dashboard: { title: 'Dashboard Executivo', desc: 'Visão completa com KPIs, receita e operação em tempo real' },
  'table-map': { title: 'Mapa de Mesas', desc: 'Planta interativa com status de cada mesa' },
  orders: { title: 'Gestão de Pedidos', desc: 'Pedidos ativos, confirmações e acompanhamento' },
  'kds-kitchen': { title: 'KDS — Cozinha', desc: 'Display de tickets com timers e prioridades' },
  'kds-bar': { title: 'KDS — Bar', desc: 'Fila de bebidas e cocktails' },
  maitre: { title: 'Painel do Maitre', desc: 'Reservas, fila virtual e check-in' },
  waiter: { title: 'Visão do Garçom', desc: 'Mesas, pedidos, chamados e gorjetas' },
  'menu-editor': { title: 'Editor de Cardápio', desc: 'Categorias, itens, preços e fichas técnicas' },
  team: { title: 'Gestão de Equipe', desc: 'Colaboradores, escalas e desempenho' },
  analytics: { title: 'Analytics & Relatórios', desc: 'Receita, tendências e insights operacionais' },
  'manager-ops': { title: 'Painel Operacional', desc: 'Visão gerencial com alertas e status em tempo real' },
  approvals: { title: 'Aprovações Pendentes', desc: 'Cancelamentos, cortesias, estornos e ajustes' },
  'barman-station': { title: 'Estação do Barman', desc: 'Drinks na fila, preparo e expedição' },
  'drink-recipes': { title: 'Receitas de Drinks', desc: 'Fichas técnicas, ingredientes e porções' },
  'cook-station': { title: 'Estação de Preparo', desc: 'Tickets da sua estação com timers' },
  stock: { title: 'Controle de Estoque', desc: 'Insumos, alertas de nível baixo e reposição' },
  'waiter-calls': { title: 'Chamados de Clientes', desc: 'Chamados pendentes das suas mesas' },
  'waiter-tips': { title: 'Minhas Gorjetas', desc: 'Gorjetas recebidas hoje e histórico' },
  'waiter-table-detail': { title: 'Detalhe da Mesa', desc: 'Detalhes completos da mesa, pedidos e status dos clientes' },
  'waiter-payment': { title: 'Cobrar na Mesa', desc: 'TAP to Pay, PIX QR e cartão — transforme o celular em maquininha' },
  'waiter-actions': { title: 'Ações na Mesa', desc: 'Executar ações pelo cliente: adicionar itens, solicitar conta, chamar gerente' },
  'floor-flow': { title: 'Fluxo do Salão', desc: 'Fila virtual, tempos de espera e rotação' },
  'daily-report': { title: 'Relatório do Dia', desc: 'Fechamento, métricas e comparativos' },
  'config-hub': { title: 'Central de Configuração', desc: 'Hub completo para configurar todos os aspectos do seu estabelecimento' },
  'config-profile': { title: 'Perfil do Restaurante', desc: 'Nome, logo, fotos, endereço e contato' },
  'config-service-types': { title: 'Tipos de Serviço', desc: 'Selecione os 11 modelos de operação' },
  'config-experience': { title: 'Experiência do Cliente', desc: 'Reservas, fila, QR Code, atendimento' },
  'config-floor': { title: 'Mapa do Salão', desc: 'Mesas, zonas, áreas VIP e planta visual' },
  'config-menu': { title: 'Gestão do Cardápio', desc: 'Categorias, itens, preços e disponibilidade' },
  'config-team': { title: 'Equipe & Permissões', desc: 'Cargos, escalas, acessos e membros' },
  'config-kitchen': { title: 'Cozinha & Bar', desc: 'Estações de preparo, KDS e receitas' },
  'config-payments': { title: 'Pagamentos', desc: 'Taxa de serviço, gorjeta, split e métodos' },
  'config-features': { title: 'Marketplace de Features', desc: 'Ative módulos avançados: fidelidade, IA, eventos' },
};

// ============ MOCK TEAM DATA ============

export const TEAM_MEMBERS = [
  { id: 'tm1', name: 'Ricardo Alves', role: 'Dono', status: 'online' as const, shift: 'Integral', since: 'Jan 2023', sales: 0, tips: 0, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { id: 'tm2', name: 'Marina Costa', role: 'Gerente', status: 'online' as const, shift: '14h–23h', since: 'Mar 2023', sales: 4200, tips: 320, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { id: 'tm3', name: 'Felipe Santos', role: 'Chef', status: 'online' as const, shift: '15h–23h', since: 'Jun 2023', sales: 0, tips: 0, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
  { id: 'tm4', name: 'Ana Rodrigues', role: 'Sommelier', status: 'online' as const, shift: '18h–00h', since: 'Set 2023', sales: 1800, tips: 240, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
  { id: 'tm5', name: 'Bruno Oliveira', role: 'Garçom', status: 'online' as const, shift: '18h–00h', since: 'Nov 2023', sales: 3200, tips: 410, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
  { id: 'tm6', name: 'Carla Lima', role: 'Garçom', status: 'online' as const, shift: '12h–18h', since: 'Jan 2024', sales: 2100, tips: 280, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
  { id: 'tm7', name: 'Diego Martins', role: 'Barman', status: 'offline' as const, shift: 'Folga', since: 'Feb 2024', sales: 0, tips: 0, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100' },
  { id: 'tm8', name: 'Juliana Ferraz', role: 'Hostess', status: 'online' as const, shift: '18h–00h', since: 'Apr 2024', sales: 0, tips: 0, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
  { id: 'tm9', name: 'Thiago Nunes', role: 'Cozinheiro', status: 'online' as const, shift: '15h–23h', since: 'May 2024', sales: 0, tips: 0, avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100' },
  { id: 'tm10', name: 'Priscila Gomes', role: 'Cozinheiro', status: 'online' as const, shift: '11h–19h', since: 'Jul 2024', sales: 0, tips: 0, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
];

// ============ TABLE FLOOR PLAN POSITIONS ============

export const TABLE_POSITIONS: { id: string; x: number; y: number; shape: 'round' | 'rect' | 'long'; rotation?: number }[] = [
  { id: 't1', x: 12, y: 15, shape: 'round' },
  { id: 't2', x: 32, y: 12, shape: 'round' },
  { id: 't3', x: 52, y: 15, shape: 'rect' },
  { id: 't4', x: 75, y: 12, shape: 'rect' },
  { id: 't5', x: 10, y: 42, shape: 'long' },
  { id: 't6', x: 35, y: 40, shape: 'round' },
  { id: 't7', x: 55, y: 42, shape: 'rect' },
  { id: 't8', x: 78, y: 38, shape: 'long' },
  { id: 't9', x: 15, y: 68, shape: 'round' },
  { id: 't10', x: 38, y: 70, shape: 'round' },
  { id: 't11', x: 58, y: 68, shape: 'long' },
  { id: 't12', x: 80, y: 70, shape: 'round' },
];

// ============ MOCK DATA ============

export const DRINK_RECIPES = [
  { id: 'dr1', name: 'Gin Tônica Aurora', ingredients: ['Gin Artesanal 60ml', 'Tônica Premium 120ml', 'Pepino 2 fatias', 'Cardamomo 3 sementes'], glass: 'Taça Balloon', garnish: 'Pepino + Cardamomo', prepTime: 3, price: 38, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=200' },
  { id: 'dr2', name: 'Negroni Clássico', ingredients: ['Gin 30ml', 'Campari 30ml', 'Vermute Rosso 30ml'], glass: 'Copo Old Fashioned', garnish: 'Twist de laranja', prepTime: 3, price: 42, image: 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=200' },
  { id: 'dr3', name: 'Espresso Martini', ingredients: ['Vodka 45ml', 'Licor de Café 30ml', 'Espresso 30ml'], glass: 'Taça Martini', garnish: '3 grãos de café', prepTime: 4, price: 40, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200' },
  { id: 'dr4', name: 'Caipirinha Premium', ingredients: ['Cachaça Envelhecida 60ml', 'Limão 1 unidade', 'Açúcar demerara 2 colheres'], glass: 'Copo Old Fashioned', garnish: 'Limão', prepTime: 2, price: 32, image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=200' },
  { id: 'dr5', name: 'Moscow Mule', ingredients: ['Vodka 45ml', 'Ginger Beer 120ml', 'Suco de limão 15ml'], glass: 'Caneca de cobre', garnish: 'Fatia de limão + Hortelã', prepTime: 2, price: 36, image: 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=200' },
];

export const STOCK_ITEMS = [
  { id: 's1', name: 'Gin Tanqueray', category: 'Destilados', current: 3, min: 5, unit: 'garrafas', status: 'low' as const },
  { id: 's2', name: 'Tônica Fever Tree', category: 'Mixers', current: 12, min: 10, unit: 'unidades', status: 'ok' as const },
  { id: 's3', name: 'Limão Tahiti', category: 'Frutas', current: 8, min: 20, unit: 'unidades', status: 'critical' as const },
  { id: 's4', name: 'Campari', category: 'Licores', current: 4, min: 3, unit: 'garrafas', status: 'ok' as const },
  { id: 's5', name: 'Filé Mignon', category: 'Carnes', current: 6, min: 10, unit: 'kg', status: 'low' as const },
  { id: 's6', name: 'Salmão Norueguês', category: 'Peixes', current: 4, min: 5, unit: 'kg', status: 'low' as const },
  { id: 's7', name: 'Arroz Arbóreo', category: 'Grãos', current: 15, min: 5, unit: 'kg', status: 'ok' as const },
  { id: 's8', name: 'Azeite Trufado', category: 'Condimentos', current: 2, min: 3, unit: 'garrafas', status: 'low' as const },
];

export const PENDING_APPROVALS = [
  { id: 'ap1', type: 'cancel' as const, table: 5, item: 'Filé ao Molho de Vinho', reason: 'Cliente mudou de ideia', requestedBy: 'Bruno Oliveira', time: '3min atrás', amount: 118 },
  { id: 'ap2', type: 'courtesy' as const, table: 8, item: 'Sobremesa (Petit Gâteau)', reason: 'Aniversariante na mesa', requestedBy: 'Carla Lima', time: '8min atrás', amount: 42 },
  { id: 'ap3', type: 'refund' as const, table: 1, item: 'Ceviche Peruano', reason: 'Prato devolvido — não atendeu expectativa', requestedBy: 'Bruno Oliveira', time: '15min atrás', amount: 48 },
  { id: 'ap4', type: 'discount' as const, table: 3, item: 'Conta Mesa 3', reason: '10% desconto fidelidade', requestedBy: 'Marina Costa', time: '20min atrás', amount: 31 },
];

// ============ HELPERS ============

export function formatTimeAgo(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  return `${Math.floor(mins / 60)}h atrás`;
}

export function getElapsedMinutes(date: Date): number {
  return Math.round((Date.now() - date.getTime()) / 60000);
}
