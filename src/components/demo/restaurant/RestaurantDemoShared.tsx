/**
 * Restaurant Demo — Shared Types, Journey Config, Role System
 */
import React from 'react';
import {
  Sparkles, Settings, BarChart3, LayoutGrid, UtensilsCrossed,
  ChefHat, Wine, CalendarDays, Smartphone, BookOpen, Users, TrendingUp,
  Crown, HandPlatter,
} from 'lucide-react';

// ============ TYPES ============

export type RestaurantScreen =
  | 'welcome' | 'setup' | 'dashboard' | 'table-map'
  | 'orders' | 'kds-kitchen' | 'kds-bar'
  | 'maitre' | 'waiter' | 'menu-editor' | 'team' | 'analytics';

export type StaffRole = 'owner' | 'chef' | 'waiter' | 'maitre';

// ============ JOURNEY STAGES ============

export interface RestaurantJourneyStage {
  step: number;
  label: string;
  screen: RestaurantScreen;
  icon: React.FC<{ className?: string }>;
  group: 'onboarding' | 'operations' | 'service' | 'management';
  roleHighlight: StaffRole[];
}

export const JOURNEY_STAGES: RestaurantJourneyStage[] = [
  { step: 1, label: 'Bem-vindo', screen: 'welcome', icon: Sparkles, group: 'onboarding', roleHighlight: ['owner', 'chef', 'waiter', 'maitre'] },
  { step: 2, label: 'Configuração', screen: 'setup', icon: Settings, group: 'onboarding', roleHighlight: ['owner'] },
  { step: 3, label: 'Dashboard', screen: 'dashboard', icon: BarChart3, group: 'operations', roleHighlight: ['owner'] },
  { step: 4, label: 'Mapa de Mesas', screen: 'table-map', icon: LayoutGrid, group: 'operations', roleHighlight: ['owner', 'maitre'] },
  { step: 5, label: 'Pedidos', screen: 'orders', icon: UtensilsCrossed, group: 'operations', roleHighlight: ['owner', 'waiter'] },
  { step: 6, label: 'KDS Cozinha', screen: 'kds-kitchen', icon: ChefHat, group: 'operations', roleHighlight: ['chef'] },
  { step: 7, label: 'KDS Bar', screen: 'kds-bar', icon: Wine, group: 'operations', roleHighlight: ['chef'] },
  { step: 8, label: 'Maitre', screen: 'maitre', icon: CalendarDays, group: 'service', roleHighlight: ['maitre'] },
  { step: 9, label: 'Garçom', screen: 'waiter', icon: Smartphone, group: 'service', roleHighlight: ['waiter'] },
  { step: 10, label: 'Cardápio', screen: 'menu-editor', icon: BookOpen, group: 'management', roleHighlight: ['owner', 'chef'] },
  { step: 11, label: 'Equipe', screen: 'team', icon: Users, group: 'management', roleHighlight: ['owner'] },
  { step: 12, label: 'Analytics', screen: 'analytics', icon: TrendingUp, group: 'management', roleHighlight: ['owner'] },
];

export const SCREEN_INFO: Record<RestaurantScreen, { title: string; desc: string }> = {
  welcome: { title: 'Bem-vindo ao NOOWE', desc: 'Conheça o painel que transforma a operação do seu restaurante' },
  setup: { title: 'Configuração', desc: 'Configure o perfil, tipo de serviço e funcionalidades do seu estabelecimento' },
  dashboard: { title: 'Dashboard Operacional', desc: 'Visão em tempo real de toda a operação — KPIs, pedidos e ocupação' },
  'table-map': { title: 'Mapa de Mesas', desc: 'Planta interativa do salão com status de cada mesa em tempo real' },
  orders: { title: 'Gestão de Pedidos', desc: 'Acompanhe e gerencie todos os pedidos ativos do restaurante' },
  'kds-kitchen': { title: 'KDS — Cozinha', desc: 'Display profissional para a equipe de cozinha com tickets e timers' },
  'kds-bar': { title: 'KDS — Bar', desc: 'Display dedicado para o barman com fila de bebidas e cocktails' },
  maitre: { title: 'Painel do Maitre', desc: 'Gestão de reservas, fila virtual e controle de fluxo do salão' },
  waiter: { title: 'App do Garçom', desc: 'Visão mobile do garçom: mesas, pedidos, chamados e gorjetas' },
  'menu-editor': { title: 'Editor de Cardápio', desc: 'Gerencie categorias, itens, preços, fotos e disponibilidade' },
  team: { title: 'Gestão de Equipe', desc: 'Equipe, escalas, funções, permissões e desempenho individual' },
  analytics: { title: 'Analytics & Relatórios', desc: 'Receita, tendências, itens mais vendidos e insights operacionais' },
};

// ============ ROLE CONFIG ============

export interface RoleConfig {
  id: StaffRole;
  label: string;
  desc: string;
  emoji: string;
  icon: React.FC<{ className?: string }>;
  colorClass: string;
  bgClass: string;
}

export const ROLE_CONFIG: RoleConfig[] = [
  { id: 'owner', label: 'Dono / Gerente', desc: 'Acesso total ao sistema', emoji: '👑', icon: Crown, colorClass: 'text-primary', bgClass: 'bg-primary/10' },
  { id: 'chef', label: 'Chef / Cozinha', desc: 'KDS e gestão de cardápio', emoji: '👨‍🍳', icon: ChefHat, colorClass: 'text-warning', bgClass: 'bg-warning/10' },
  { id: 'waiter', label: 'Garçom', desc: 'Pedidos e atendimento', emoji: '🤵', icon: HandPlatter, colorClass: 'text-info', bgClass: 'bg-info/10' },
  { id: 'maitre', label: 'Maitre / Hostess', desc: 'Reservas e recepção', emoji: '💁‍♀️', icon: CalendarDays, colorClass: 'text-secondary', bgClass: 'bg-secondary/10' },
];

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
