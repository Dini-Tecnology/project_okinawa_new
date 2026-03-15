/**
 * Demo Restaurant Page — Next Level
 * Full operational dashboard with setup, team, menu management + existing tabs
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DemoProvider, useDemoContext, type OrderStatus, type TableStatus } from '@/contexts/DemoContext';
import { ItemIcon } from '@/components/demo/DemoShared';
import {
  ArrowLeft, ArrowRight, Bell, BarChart3, UtensilsCrossed, LayoutGrid, CalendarDays,
  ChefHat, TrendingUp, Users, DollarSign, Clock, Check, Play, Pause,
  AlertCircle, Star, Wine, Settings, UserPlus, BookOpen,
  MapPin, Phone, Mail, Camera, Globe, Wifi, ParkingSquare,
  Accessibility, Dog, Sun, Edit3, Plus, Trash2, Save,
  Shield, Award, Briefcase, Calendar, MoreHorizontal,
  Eye, X, Hash, Image as ImageIcon, Timer,
} from 'lucide-react';

// ============ DASHBOARD TABS ============

type DashboardTab = 'overview' | 'tables' | 'orders' | 'kds' | 'reservations' | 'analytics' | 'setup' | 'team' | 'menu-editor';

const TAB_CONFIG: { id: DashboardTab; label: string; icon: React.FC<{ className?: string }>; group: 'operations' | 'management' }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3, group: 'operations' },
  { id: 'tables', label: 'Mesas', icon: LayoutGrid, group: 'operations' },
  { id: 'orders', label: 'Pedidos', icon: UtensilsCrossed, group: 'operations' },
  { id: 'kds', label: 'KDS', icon: ChefHat, group: 'operations' },
  { id: 'reservations', label: 'Reservas', icon: CalendarDays, group: 'operations' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, group: 'operations' },
  { id: 'setup', label: 'Configuração', icon: Settings, group: 'management' },
  { id: 'team', label: 'Equipe', icon: Users, group: 'management' },
  { id: 'menu-editor', label: 'Cardápio', icon: BookOpen, group: 'management' },
];

// ============ OVERVIEW TAB ============

const OverviewTab = () => {
  const { analytics, orders, tables, notifications, unreadNotifications } = useDemoContext();
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'billing').length;
  const activeOrders = orders.filter(o => !['paid', 'delivered'].includes(o.status)).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita Hoje', value: `R$ ${analytics.todayRevenue.toLocaleString()}`, icon: DollarSign, change: '+12%', color: 'text-success' },
          { label: 'Pedidos Hoje', value: analytics.todayOrders.toString(), icon: UtensilsCrossed, change: '+8', color: 'text-primary' },
          { label: 'Ticket Médio', value: `R$ ${analytics.avgTicket}`, icon: TrendingUp, change: '+5%', color: 'text-info' },
          { label: 'Ocupação', value: `${analytics.occupancyRate}%`, icon: Users, change: `${occupiedTables}/12`, color: 'text-warning' },
        ].map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className={`text-xs font-semibold ${kpi.color}`}>{kpi.change}</span>
            </div>
            <p className="font-display text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Pedidos Ativos</h3>
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{activeOrders}</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {orders.filter(o => !['paid', 'delivered'].includes(o.status)).slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {order.tableNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.items.length} itens · R$ {order.total}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Notificações</h3>
            {unreadNotifications > 0 && (
              <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">{unreadNotifications} novas</span>
            )}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.slice(0, 6).map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${n.read ? 'bg-muted/20' : 'bg-primary/5 border border-primary/10'}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                <div>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(n.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Top Vendidos Hoje</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {analytics.topItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <span className="font-display text-xl font-bold text-muted-foreground/30">#{i + 1}</span>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.quantity} vendidos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ SETUP TAB ============

const SetupTab = () => {
  const { restaurant } = useDemoContext();
  const [serviceType, setServiceType] = useState('full-service');

  return (
    <div className="space-y-6">
      {/* Restaurant Profile */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">Perfil do Restaurante</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
            <Edit3 className="w-3.5 h-3.5" />
            Editar
          </button>
        </div>

        <div className="flex gap-6 mb-6">
          <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center text-4xl shrink-0 relative group">
            🌅
            <div className="absolute inset-0 bg-foreground/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-display text-xl font-bold">{restaurant.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{restaurant.description}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-accent fill-accent" />{restaurant.rating}</div>
              <span>·</span>
              <span>{restaurant.cuisine}</span>
              <span>·</span>
              <span>{restaurant.priceRange}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: MapPin, label: 'Endereço', value: restaurant.address },
            { icon: Phone, label: 'Telefone', value: restaurant.phone },
            { icon: Clock, label: 'Horário', value: restaurant.hours },
            { icon: Globe, label: 'Website', value: 'www.bistroaurora.com.br' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Type */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-2">Tipo de Serviço</h3>
        <p className="text-sm text-muted-foreground mb-4">Define as funcionalidades disponíveis na plataforma</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { id: 'full-service', label: 'Full Service', desc: 'Mesa com garçom', iconCat: 'chef' },
            { id: 'casual-dining', label: 'Casual Dining', desc: 'Ambiente descontraído', iconCat: 'pizza' },
            { id: 'fast-casual', label: 'Fast Casual', desc: 'Pedido no balcão', iconCat: 'salad' },
            { id: 'cafe', label: 'Café / Padaria', desc: 'Ambiente café', iconCat: 'coffee' },
            { id: 'bar', label: 'Bar / Pub', desc: 'Foco em bebidas', iconCat: 'beer' },
            { id: 'chefs-table', label: "Chef's Table", desc: 'Experiência premium', iconCat: 'chef' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setServiceType(type.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                serviceType === type.id ? 'border-primary bg-primary/5 shadow-glow' : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <ItemIcon cat={type.iconCat} size="sm" />
              <p className="font-semibold text-sm mt-2">{type.label}</p>
              <p className="text-[10px] text-muted-foreground">{type.desc}</p>
              {serviceType === type.id && <Check className="w-4 h-4 text-primary mt-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Características do Estabelecimento</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Wifi, label: 'Wi-Fi', active: true },
            { icon: ParkingSquare, label: 'Estacionamento', active: true },
            { icon: Accessibility, label: 'Acessível', active: true },
            { icon: Dog, label: 'Pet Friendly', active: true },
            { icon: Sun, label: 'Terraço', active: true },
            { icon: Wine, label: 'Carta de Vinhos', active: true },
            { icon: Star, label: 'Reservas', active: true },
            { icon: UtensilsCrossed, label: 'Delivery', active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button key={label} className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${active ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-border text-muted-foreground'}`}>
              <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
              <span className="text-xs font-medium">{label}</span>
              {active && <Check className="w-3 h-3 text-primary ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Configurações de Pagamento</h3>
        <div className="space-y-3">
          {[
            { label: 'Taxa de serviço', value: '10%', desc: 'Cobrado automaticamente' },
            { label: 'Gorjeta', value: 'Opcional', desc: 'Cliente escolhe 5%, 10%, 15%' },
            { label: 'Split de pagamento', value: 'Ativo', desc: 'Divisão igualitária e por item' },
            { label: 'Métodos aceitos', value: 'Cartão, PIX, Apple Pay, Google Pay', desc: 'Configurar gateway' },
          ].map(({ label, value, desc }) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
              </div>
              <span className="text-sm font-medium text-primary">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ TEAM TAB ============

const TeamTab = () => {
  const TEAM_MEMBERS = [
    { name: 'Ricardo Alves', role: 'Dono', avatar: '👨‍💼', status: 'online', shift: 'Integral', since: 'Jan 2023' },
    { name: 'Marina Costa', role: 'Gerente', avatar: '👩‍💼', status: 'online', shift: '14h–23h', since: 'Mar 2023' },
    { name: 'Felipe Santos', role: 'Chef', avatar: '👨‍🍳', status: 'online', shift: '15h–23h', since: 'Jun 2023' },
    { name: 'Ana Rodrigues', role: 'Sommelier', avatar: '🍷', status: 'online', shift: '18h–00h', since: 'Set 2023' },
    { name: 'Bruno Oliveira', role: 'Garçom', avatar: '🤵', status: 'online', shift: '18h–00h', since: 'Nov 2023' },
    { name: 'Carla Lima', role: 'Garçom', avatar: '🤵‍♀️', status: 'online', shift: '12h–18h', since: 'Jan 2024' },
    { name: 'Diego Martins', role: 'Barman', avatar: '🍸', status: 'offline', shift: 'Folga', since: 'Feb 2024' },
    { name: 'Juliana Ferraz', role: 'Hostess', avatar: '💁‍♀️', status: 'online', shift: '18h–00h', since: 'Apr 2024' },
  ];

  const roleColors: Record<string, string> = {
    'Dono': 'bg-accent/10 text-accent-foreground',
    'Gerente': 'bg-primary/10 text-primary',
    'Chef': 'bg-warning/10 text-warning',
    'Sommelier': 'bg-secondary/10 text-secondary',
    'Garçom': 'bg-info/10 text-info',
    'Barman': 'bg-secondary/10 text-secondary',
    'Hostess': 'bg-primary/10 text-primary',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg">Equipe</h3>
          <p className="text-sm text-muted-foreground">{TEAM_MEMBERS.length} membros · {TEAM_MEMBERS.filter(m => m.status === 'online').length} em serviço</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <UserPlus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Today's schedule */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-display font-bold mb-3">Escala de Hoje</h4>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-display text-2xl font-bold text-success">6</p>
            <p className="text-xs text-muted-foreground">Em serviço</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-display text-2xl font-bold text-warning">1</p>
            <p className="text-xs text-muted-foreground">Folga</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-display text-2xl font-bold text-info">R$ 847</p>
            <p className="text-xs text-muted-foreground">Gorjetas hoje</p>
          </div>
        </div>
      </div>

      {/* Team list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-border text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>Membro</span>
          <span>Função</span>
          <span>Turno</span>
          <span>Status</span>
          <span></span>
        </div>
        {TEAM_MEMBERS.map((member, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-border last:border-0 items-center hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg relative">
                {member.avatar}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${member.status === 'online' ? 'bg-success' : 'bg-muted-foreground/30'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold">{member.name}</p>
                <p className="text-[10px] text-muted-foreground">Desde {member.since}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${roleColors[member.role] || 'bg-muted text-muted-foreground'}`}>
              {member.role}
            </span>
            <span className="text-xs text-muted-foreground">{member.shift}</span>
            <span className={`text-xs font-medium ${member.status === 'online' ? 'text-success' : 'text-muted-foreground'}`}>
              {member.status === 'online' ? '● Ativo' : '○ Folga'}
            </span>
            <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>

      {/* Roles & Permissions */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-display font-bold mb-3">Funções & Permissões</h4>
        <div className="space-y-2">
          {[
            { role: 'Dono', perms: 'Acesso total ao sistema', icon: Shield },
            { role: 'Gerente', perms: 'Gestão operacional, equipe, relatórios', icon: Briefcase },
            { role: 'Chef', perms: 'KDS, gestão de cardápio, estoque', icon: ChefHat },
            { role: 'Garçom', perms: 'Pedidos, mesas, atendimento', icon: UtensilsCrossed },
            { role: 'Barman', perms: 'KDS bar, pedidos de bebidas', icon: Wine },
            { role: 'Hostess/Maitre', perms: 'Reservas, fila, mapa de mesas', icon: CalendarDays },
          ].map(({ role, perms, icon: Icon }) => (
            <div key={role} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{role}</p>
                <p className="text-[10px] text-muted-foreground">{perms}</p>
              </div>
              <button className="text-xs text-primary font-medium">Editar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ MENU EDITOR TAB ============

const MenuEditorTab = () => {
  const { menu } = useDemoContext();
  const categories = [...new Set(menu.map(m => m.category))];
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg">Editor de Cardápio</h3>
          <p className="text-sm text-muted-foreground">{menu.length} itens · {categories.length} categorias</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            <Hash className="w-4 h-4" />
            Categorias
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            <Plus className="w-4 h-4" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {cat} ({menu.filter(m => m.category === cat).length})
          </button>
        ))}
      </div>

      {/* Menu items */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {menu.filter(m => m.category === activeCategory).map((item, i) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-semibold text-sm">{item.name}</h4>
                {item.popular && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">POPULAR</span>}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
              <div className="flex items-center gap-3 mt-1">
                {item.tags?.map(tag => (
                  <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                ))}
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />{item.prepTime}min
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-sm">R$ {item.price}</p>
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"
                >
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>

            {editingItem === item.id && (
              <div className="absolute" />
            )}
          </div>
        ))}
      </div>

      {/* Quick edit panel */}
      {editingItem && (
        <div className="bg-card rounded-xl border-2 border-primary/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-bold">Editando: {menu.find(m => m.id === editingItem)?.name}</h4>
            <button onClick={() => setEditingItem(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Nome', value: menu.find(m => m.id === editingItem)?.name },
              { label: 'Preço (R$)', value: menu.find(m => m.id === editingItem)?.price },
              { label: 'Tempo de preparo (min)', value: menu.find(m => m.id === editingItem)?.prepTime },
              { label: 'Categoria', value: menu.find(m => m.id === editingItem)?.category },
            ].map(field => (
              <div key={field.label}>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</label>
                <div className="mt-1 p-2.5 rounded-lg border border-border bg-muted/30 text-sm">{field.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</label>
            <div className="mt-1 p-2.5 rounded-lg border border-border bg-muted/30 text-sm">
              {menu.find(m => m.id === editingItem)?.description}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
            <button onClick={() => setEditingItem(null)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="font-display text-3xl font-bold text-primary">{menu.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Itens no cardápio</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="font-display text-3xl font-bold text-secondary">{categories.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Categorias</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="font-display text-3xl font-bold text-accent-foreground">R$ {Math.round(menu.reduce((s, m) => s + m.price, 0) / menu.length)}</p>
          <p className="text-xs text-muted-foreground mt-1">Preço médio</p>
        </div>
      </div>
    </div>
  );
};

// ============ EXISTING TABS (preserved) ============

const TablesTab = () => {
  const { tables, updateTableStatus } = useDemoContext();
  const statusColors: Record<TableStatus, string> = {
    available: 'bg-success/10 border-success/30 text-success',
    occupied: 'bg-primary/10 border-primary/30 text-primary',
    reserved: 'bg-warning/10 border-warning/30 text-warning',
    billing: 'bg-info/10 border-info/30 text-info',
  };
  const statusLabels: Record<TableStatus, string> = {
    available: 'Disponível', occupied: 'Ocupada', reserved: 'Reservada', billing: 'Pagamento',
  };

  return (
    <div>
      <div className="flex gap-4 mb-6 flex-wrap">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColors[status as TableStatus].split(' ')[0]}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => {
              const next: Record<TableStatus, TableStatus> = { available: 'occupied', occupied: 'billing', billing: 'available', reserved: 'occupied' };
              updateTableStatus(table.id, next[table.status]);
            }}
            className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${statusColors[table.status]}`}
          >
            <div className="text-center">
              <p className="font-display text-2xl font-bold">{table.number}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1">{statusLabels[table.status]}</p>
              <p className="text-xs mt-1 opacity-60">{table.seats} lugares</p>
            </div>
            {table.customerName && <p className="text-xs font-semibold mt-2 text-center truncate">{table.customerName}</p>}
            {table.orderTotal && table.orderTotal > 0 && <p className="text-xs font-display font-bold text-center mt-0.5">R$ {table.orderTotal}</p>}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-6">Clique em uma mesa para alterar o status</p>
    </div>
  );
};

const OrdersTab = () => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Todos' }, { key: 'pending', label: 'Pendentes' },
          { key: 'confirmed', label: 'Confirmados' }, { key: 'preparing', label: 'Preparando' },
          { key: 'ready', label: 'Prontos' }, { key: 'delivered', label: 'Entregues' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as any)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary">{order.tableNumber}</div>
                <div>
                  <p className="font-semibold text-sm">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(order.createdAt)}</p>
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="space-y-1 mb-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity}x {item.menuItem.name}</span>
                  <span>R$ {item.menuItem.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="font-display font-bold">R$ {order.total}</span>
              <div className="flex gap-2">
                {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Confirmar</button>}
                {order.status === 'confirmed' && <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="px-3 py-1.5 rounded-lg bg-warning text-warning-foreground text-xs font-semibold">Preparar</button>}
                {order.status === 'preparing' && <button onClick={() => updateOrderStatus(order.id, 'ready')} className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-semibold">Pronto</button>}
                {order.status === 'ready' && <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="px-3 py-1.5 rounded-lg bg-info text-info-foreground text-xs font-semibold">Entregar</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const KDSTab = () => {
  const { orders, updateOrderStatus } = useDemoContext();
  const [view, setView] = useState<'kitchen' | 'bar'>('kitchen');
  const kdsOrders = orders.filter(o => ['confirmed', 'preparing'].includes(o.status) && (view === 'kitchen' ? o.isKitchen : o.isBar));

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setView('kitchen')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === 'kitchen' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <ChefHat className="w-4 h-4" />Cozinha
        </button>
        <button onClick={() => setView('bar')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === 'bar' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Wine className="w-4 h-4" />Bar
        </button>
      </div>
      {kdsOrders.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum pedido na fila da {view === 'kitchen' ? 'cozinha' : 'bar'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kdsOrders.map(order => {
            const elapsed = Math.round((Date.now() - order.createdAt.getTime()) / 60000);
            const isLate = elapsed > 15;
            return (
              <div key={order.id} className={`rounded-xl border-2 p-4 ${isLate ? 'border-destructive bg-destructive/5' : order.status === 'preparing' ? 'border-warning bg-warning/5' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold">Mesa {order.tableNumber}</span>
                    {isLate && <AlertCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className={isLate ? 'text-destructive font-semibold' : ''}>{elapsed}min</span>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items.filter(item => view === 'kitchen' ? item.menuItem.category !== 'Bebidas' : item.menuItem.category === 'Bebidas').map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                      <span className="text-sm font-medium">{item.menuItem.name}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => updateOrderStatus(order.id, order.status === 'confirmed' ? 'preparing' : 'ready')}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${order.status === 'confirmed' ? 'bg-warning text-warning-foreground' : 'bg-success text-success-foreground'}`}
                >
                  {order.status === 'confirmed' ? 'Iniciar Preparo' : 'Marcar como Pronto'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ReservationsTab = () => {
  const { reservations } = useDemoContext();
  const statusStyles: Record<string, string> = { confirmed: 'bg-success/10 text-success', seated: 'bg-primary/10 text-primary', waiting: 'bg-warning/10 text-warning', cancelled: 'bg-destructive/10 text-destructive' };
  const statusLabels: Record<string, string> = { confirmed: 'Confirmada', seated: 'Acomodada', waiting: 'Aguardando', cancelled: 'Cancelada' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold">Reservas de Hoje</h3>
          <p className="text-sm text-muted-foreground">{reservations.length} reservas</p>
        </div>
      </div>
      <div className="space-y-3">
        {reservations.map(res => (
          <div key={res.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><CalendarDays className="w-5 h-5 text-muted-foreground" /></div>
                <div>
                  <p className="font-semibold text-sm">{res.customerName}</p>
                  <p className="text-xs text-muted-foreground">{res.phone}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[res.status]}`}>{statusLabels[res.status]}</span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{res.time}</div>
              <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{res.partySize} pessoas</div>
            </div>
            {res.notes && <p className="text-xs text-muted-foreground mt-2 italic">📝 {res.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsTab = () => {
  const { analytics } = useDemoContext();
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Receita por Hora (Hoje)</h3>
        <div className="flex items-end gap-2 h-40">
          {analytics.hourlyRevenue.map((h, i) => {
            const max = Math.max(...analytics.hourlyRevenue.map(x => x.revenue));
            const height = (h.revenue / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">R${(h.revenue / 1000).toFixed(1)}k</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-light" style={{ height: `${height}%`, minHeight: 4 }} />
                <span className="text-[10px] text-muted-foreground">{h.hour}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-bold mb-4">Receita Semanal</h3>
        <div className="flex items-end gap-2 h-40">
          {analytics.weeklyRevenue.map((d, i) => {
            const max = Math.max(...analytics.weeklyRevenue.map(x => x.revenue));
            const height = max > 0 ? (d.revenue / max) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{d.revenue > 0 ? `R$${(d.revenue / 1000).toFixed(0)}k` : '-'}</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-secondary to-secondary-light" style={{ height: `${height}%`, minHeight: d.revenue > 0 ? 4 : 2 }} />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold mb-4">Satisfação</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-primary">{analytics.customerSatisfaction}</p>
              <div className="flex gap-0.5 mt-1 justify-center">
                {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(analytics.customerSatisfaction) ? 'text-accent fill-accent' : 'text-muted-foreground/20'}`} />)}
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map(stars => {
                const pct = stars === 5 ? 72 : stars === 4 ? 18 : stars === 3 ? 7 : stars === 2 ? 2 : 1;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-3">{stars}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} /></div>
                    <span className="text-[10px] text-muted-foreground w-6 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold mb-4">Clientes Recorrentes</h3>
          <div className="text-center py-4">
            <p className="font-display text-5xl font-bold text-secondary">{analytics.returningCustomers}%</p>
            <p className="text-sm text-muted-foreground mt-2">já visitaram antes</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary to-secondary-light rounded-full" style={{ width: `${analytics.returningCustomers}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ HELPERS ============

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles: Record<OrderStatus, string> = {
    pending: 'bg-muted text-muted-foreground', confirmed: 'bg-info/10 text-info',
    preparing: 'bg-warning/10 text-warning', ready: 'bg-success/10 text-success',
    delivered: 'bg-primary/10 text-primary', paid: 'bg-muted text-muted-foreground',
  };
  const labels: Record<OrderStatus, string> = {
    pending: 'Pendente', confirmed: 'Confirmado', preparing: 'Preparando',
    ready: 'Pronto', delivered: 'Entregue', paid: 'Pago',
  };
  return <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${styles[status]}`}>{labels[status]}</span>;
};

function formatTimeAgo(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  return `${Math.floor(mins / 60)}h atrás`;
}

// ============ MAIN COMPONENT ============

const DemoRestaurantInner = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const { isSimulationRunning, toggleSimulation, unreadNotifications, restaurant } = useDemoContext();

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'tables': return <TablesTab />;
      case 'orders': return <OrdersTab />;
      case 'kds': return <KDSTab />;
      case 'reservations': return <ReservationsTab />;
      case 'analytics': return <AnalyticsTab />;
      case 'setup': return <SetupTab />;
      case 'team': return <TeamTab />;
      case 'menu-editor': return <MenuEditorTab />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Demo Restaurante | NOOWE — Painel Operacional</title>
        <meta name="description" content="Opere o painel NOOWE como dono ou gerente. Dashboard, KDS, mesas, reservas, equipe e configurações." />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        {/* Top bar */}
        <header className="bg-card border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/demo" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs font-display">N</span>
                </div>
                <div>
                  <p className="font-display font-bold text-sm leading-tight">{restaurant.name}</p>
                  <p className="text-[10px] text-muted-foreground">Painel de Gestão</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/demo/client" className="hidden md:flex px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors">
                Ver Demo Cliente →
              </Link>
              <button
                onClick={toggleSimulation}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isSimulationRunning ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                }`}
              >
                {isSimulationRunning ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {isSimulationRunning ? 'Simulação ativa' : 'Pausada'}
              </button>
              <button className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Demo</span>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Tab groups */}
          <div className="mb-6">
            <div className="flex items-center gap-6 mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Operação</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              {TAB_CONFIG.filter(t => t.group === 'operations').map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6 mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Gestão</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {TAB_CONFIG.filter(t => t.group === 'management').map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id ? 'bg-secondary text-secondary-foreground shadow-glow-secondary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {renderTab()}
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-border bg-card mt-12 py-8">
          <div className="max-w-2xl mx-auto text-center px-6">
            <h3 className="font-display text-xl font-bold mb-2">Quer ver isso no seu restaurante?</h3>
            <p className="text-sm text-muted-foreground mb-6">Converse com nossa equipe e descubra como a NOOWE transforma seu negócio.</p>
            <a
              href="https://wa.me/5511999999999?text=Olá! Vi a demo do painel da NOOWE e gostaria de saber mais."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-glow"
            >
              Falar pelo WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

const DemoRestaurant = () => (
  <DemoProvider>
    <DemoRestaurantInner />
  </DemoProvider>
);

export default DemoRestaurant;
