/**
 * Restaurant app — Liquid Glass bottom navigation
 */

import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Users,
  Settings,
} from 'lucide-react-native';
import LiquidGlassBottomNav, { type LiquidGlassNavItem } from './LiquidGlassBottomNav';

const navItems: LiquidGlassNavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos' },
  { id: 'kitchen-kds', icon: ChefHat, label: 'Cozinha' },
  { id: 'tables', icon: Users, label: 'Mesas' },
  { id: 'settings', icon: Settings, label: 'Config' },
];

interface RestaurantLiquidGlassNavProps {
  variant?: string;
  activeTab: string;
  onNavigate: (screen: string) => void;
}

const RestaurantLiquidGlassNav: React.FC<RestaurantLiquidGlassNavProps> = ({
  activeTab,
  onNavigate,
}) => (
  <LiquidGlassBottomNav items={navItems} activeTab={activeTab} onNavigate={onNavigate} />
);

export default RestaurantLiquidGlassNav;
