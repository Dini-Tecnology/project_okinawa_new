/**
 * Restaurant Configuration Hub — 9 modular config screens
 * Designed as a powerful yet user-friendly control center
 */
import React, { useState } from 'react';
import {
  Store, Clock, Globe, Camera, MapPin, Phone, Link2,
  Settings, Check, ChevronRight, ChevronLeft, ToggleRight, ToggleLeft,
  Utensils, Users, CreditCard, Sparkles, LayoutGrid, ChefHat, Wine,
  Star, Crown, Ticket, Coffee, Truck, Car, Flame, BookOpen,
  Plus, Minus, Calendar, Bell, Shield, DollarSign, Percent,
  Smartphone, QrCode, ClipboardList, Package, Timer, Heart,
  Zap, Gift, PartyPopper, Brain, TrendingUp, Award, Music, Palette,
  Eye, ArrowUpDown, GripVertical, X, Edit3, AlertTriangle
} from 'lucide-react';
import { useDemoI18n } from '@/components/demo/DemoI18n';

// ============ SHARED COMPONENTS ============

const ConfigHeader: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; onBack: () => void }> = ({ title, subtitle, icon, onBack }) => (
  <div className="flex items-center gap-3 mb-4">
    <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/80">
      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
    </button>
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
      {icon}
    </div>
    <div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <p className="text-[10px] text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const ToggleRow: React.FC<{ label: string; desc: string; value: boolean; onChange: () => void }> = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
    <div className="flex-1 mr-3">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{desc}</p>
    </div>
    <button onClick={onChange}>
      {value ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
    </button>
  </div>
);

const NumberRow: React.FC<{ label: string; value: number; suffix?: string; onChange: (v: number) => void }> = ({ label, value, suffix = '', onChange }) => (
  <div className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
    <p className="text-xs font-medium text-foreground">{label}</p>
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center">
        <Minus className="h-3 w-3" />
      </button>
      <span className="text-xs font-semibold min-w-[40px] text-center">{value}{suffix}</span>
      <button onClick={() => onChange(value + 1)} className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center">
        <Plus className="h-3 w-3" />
      </button>
    </div>
  </div>
);

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">{icon}</div>
      <h3 className="text-xs font-semibold text-foreground">{title}</h3>
    </div>
    <div className="rounded-2xl border border-border bg-card overflow-hidden">{children}</div>
  </div>
);

const SaveButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { translateText } = useDemoI18n();
  return (
    <button onClick={onClick} className="w-full rounded-2xl bg-primary px-3 py-3 text-xs font-semibold text-primary-foreground mt-4">
      {translateText('Salvar Configurações')}
    </button>
  );
};

// ============ CONFIG HUB (Main) ============

export const ConfigHub: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();

  const modules = [
    { id: 'config-profile', icon: <Store className="h-5 w-5 text-primary" />, label: translateText('Perfil do Restaurante'), desc: translateText('Nome, logo, fotos, contato'), progress: 85, gradient: 'from-primary/10 to-primary/5' },
    { id: 'config-service-types', icon: <Utensils className="h-5 w-5 text-secondary" />, label: translateText('Tipos de Serviço'), desc: translateText('11 modelos de operação'), progress: 100, gradient: 'from-secondary/10 to-secondary/5' },
    { id: 'config-experience', icon: <Sparkles className="h-5 w-5 text-info" />, label: translateText('Experiência do Cliente'), desc: translateText('Reservas, fila, QR, pedidos'), progress: 70, gradient: 'from-info/10 to-info/5' },
    { id: 'config-floor', icon: <LayoutGrid className="h-5 w-5 text-warning" />, label: translateText('Mapa do Salão'), desc: translateText('Mesas, zonas, áreas VIP'), progress: 60, gradient: 'from-warning/10 to-warning/5' },
    { id: 'config-menu', icon: <BookOpen className="h-5 w-5 text-success" />, label: translateText('Cardápio'), desc: translateText('Categorias, itens, preços'), progress: 90, gradient: 'from-success/10 to-success/5' },
    { id: 'config-team', icon: <Users className="h-5 w-5 text-accent-foreground" />, label: translateText('Equipe & Permissões'), desc: translateText('Cargos, escalas, acesso'), progress: 75, gradient: 'from-accent/10 to-accent/5' },
    { id: 'config-kitchen', icon: <ChefHat className="h-5 w-5 text-destructive" />, label: translateText('Cozinha & Bar'), desc: translateText('Estações, KDS, receitas'), progress: 50, gradient: 'from-destructive/10 to-destructive/5' },
    { id: 'config-payments', icon: <CreditCard className="h-5 w-5 text-primary" />, label: translateText('Pagamentos'), desc: translateText('Taxa, gorjeta, split, métodos'), progress: 80, gradient: 'from-primary/10 to-accent/5' },
    { id: 'config-features', icon: <Zap className="h-5 w-5 text-warning" />, label: translateText('Marketplace de Features'), desc: translateText('Fidelidade, IA, eventos, VIP'), progress: 40, gradient: 'from-warning/10 to-accent/5' },
  ];

  const overallProgress = Math.round(modules.reduce((a, m) => a + m.progress, 0) / modules.length);

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-foreground">{translateText('Central de Configuração')}</h2>
            <p className="text-[10px] text-muted-foreground">{translateText('Configure cada detalhe do seu estabelecimento')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
          <span className="text-xs font-bold text-primary">{overallProgress}%</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{translateText('Progresso geral da configuração')}</p>
      </div>

      {/* Module cards */}
      <div className="space-y-2">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => onNavigate(mod.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl border border-border bg-gradient-to-r ${mod.gradient} text-left transition-all active:scale-[0.98]`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shrink-0">
              {mod.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{mod.label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{mod.desc}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 relative">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${mod.progress * 0.88} 88`} className="text-primary" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground">{mod.progress}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============ 1. PROFILE ============

export const ConfigProfile: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();

  return (
    <div className="space-y-4">
      <ConfigHeader
        title={translateText('Perfil do Restaurante')}
        subtitle={translateText('Identidade do seu estabelecimento')}
        icon={<Store className="h-5 w-5 text-primary" />}
        onBack={() => onNavigate('config-hub')}
      />

      {/* Logo & Banner preview */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-accent/20 relative flex items-center justify-center">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm text-[10px] font-medium">
            <Camera className="h-3 w-3" /> {translateText('Banner')}
          </button>
        </div>
        <div className="-mt-6 ml-4 flex items-end gap-3 pb-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border-2 border-card flex items-center justify-center">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Omakase Sushi</p>
            <p className="text-[10px] text-muted-foreground">Fine Dining · Japonesa</p>
          </div>
        </div>
      </div>

      <SectionCard title={translateText('Informações Básicas')} icon={<Edit3 className="h-3.5 w-3.5 text-primary" />}>
        {[
          { label: translateText('Nome'), value: 'Omakase Sushi' },
          { label: translateText('Descrição'), value: translateText('Experiência autêntica japonesa...') },
          { label: 'CNPJ', value: '12.345.678/0001-90' },
          { label: translateText('Tipo de Cozinha'), value: translateText('Japonesa, Contemporânea') },
        ].map((f, i) => (
          <div key={i} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
            <p className="text-[10px] text-muted-foreground">{f.label}</p>
            <p className="text-xs font-medium text-foreground text-right max-w-[55%] truncate">{f.value}</p>
          </div>
        ))}
      </SectionCard>

      <SectionCard title={translateText('Endereço e Localização')} icon={<MapPin className="h-3.5 w-3.5 text-primary" />}>
        <div className="p-3">
          <div className="h-20 rounded-xl bg-muted flex items-center justify-center mb-2">
            <MapPin className="h-6 w-6 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground ml-2">{translateText('Mapa interativo')}</span>
          </div>
          <p className="text-xs text-foreground">Rua Augusta, 1234 - São Paulo, SP</p>
          <p className="text-[10px] text-muted-foreground">CEP 01304-001</p>
        </div>
      </SectionCard>

      <SectionCard title={translateText('Contato e Redes Sociais')} icon={<Globe className="h-3.5 w-3.5 text-primary" />}>
        {[
          { icon: <Phone className="h-3 w-3" />, label: translateText('Telefone'), value: '(11) 3456-7890' },
          { icon: <Globe className="h-3 w-3" />, label: 'Website', value: 'omakase.com.br' },
          { icon: <Link2 className="h-3 w-3" />, label: 'Instagram', value: '@omakasesushi' },
        ].map((c, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">{c.icon}</div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
              <p className="text-xs font-medium text-foreground">{c.value}</p>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title={translateText('Horários de Funcionamento')} icon={<Clock className="h-3.5 w-3.5 text-primary" />}>
        {[
          { day: translateText('Seg-Qui'), hours: '18:00 - 23:00' },
          { day: translateText('Sex-Sáb'), hours: '18:00 - 00:00' },
          { day: translateText('Domingo'), hours: '12:00 - 16:00' },
        ].map((h, i) => (
          <div key={i} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
            <p className="text-xs font-medium text-foreground">{h.day}</p>
            <span className="text-xs text-primary font-semibold">{h.hours}</span>
          </div>
        ))}
      </SectionCard>

      <SaveButton />
    </div>
  );
};

// ============ 2. SERVICE TYPES ============

export const ConfigServiceTypes: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [selected, setSelected] = useState<string[]>(['fine_dining']);

  const types = [
    { id: 'fine_dining', icon: <Crown className="h-5 w-5" />, name: 'Fine Dining', desc: translateText('Reservas, sommelier, harmonização'), features: ['Reservas', 'Wine Pairing', 'Sommelier', 'Split por item'] },
    { id: 'casual_dining', icon: <Utensils className="h-5 w-5" />, name: 'Casual Dining', desc: translateText('Waitlist, família, grupos'), features: ['Smart Waitlist', 'Modo Família', 'Grupos'] },
    { id: 'fast_casual', icon: <Flame className="h-5 w-5" />, name: 'Fast Casual', desc: translateText('Montador de pratos, alérgenos'), features: ['Dish Builder', 'Alérgenos', 'Nutricional'] },
    { id: 'cafe_bakery', icon: <Coffee className="h-5 w-5" />, name: translateText('Café & Padaria'), desc: translateText('Work mode, refill, Wi-Fi'), features: ['Work Mode', 'Refill', 'Wi-Fi Management'] },
    { id: 'buffet', icon: <ClipboardList className="h-5 w-5" />, name: 'Buffet', desc: translateText('Balança inteligente, NFC'), features: ['Smart Scale', 'NFC', 'Self-service'] },
    { id: 'pub_bar', icon: <Wine className="h-5 w-5" />, name: 'Pub & Bar', desc: translateText('Comanda digital, rounds'), features: ['Comanda Digital', 'Round Builder', 'Grupo'] },
    { id: 'drive_thru', icon: <Car className="h-5 w-5" />, name: 'Drive-Thru', desc: translateText('Geofencing, preparo antecipado'), features: ['GPS 500m', 'Preparo Automático'] },
    { id: 'food_truck', icon: <Truck className="h-5 w-5" />, name: 'Food Truck', desc: translateText('Mapa em tempo real, fila virtual'), features: ['Mapa GPS', 'Fila Virtual'] },
    { id: 'chefs_table', icon: <Star className="h-5 w-5" />, name: "Chef's Table", desc: translateText('Menu degustação, notas do chef'), features: ['Course-by-Course', 'Sommelier Notes'] },
    { id: 'quick_service', icon: <Zap className="h-5 w-5" />, name: 'Quick Service', desc: translateText('Skip the line, pickup rápido'), features: ['Skip the Line', '4-Stage Tracking'] },
    { id: 'club', icon: <Music className="h-5 w-5" />, name: 'Club & Balada', desc: translateText('Ingressos, VIP, consumo mínimo'), features: ['QR Tickets', 'Mapa VIP', 'Min. Spend'] },
  ];

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="space-y-4">
      <ConfigHeader
        title={translateText('Tipos de Serviço')}
        subtitle={translateText('Selecione os modelos que seu estabelecimento opera')}
        icon={<Utensils className="h-5 w-5 text-secondary" />}
        onBack={() => onNavigate('config-hub')}
      />

      <div className="rounded-2xl border border-info/20 bg-info/5 p-3">
        <p className="text-[10px] text-info font-medium">{translateText('Cada tipo ativa automaticamente as features relevantes para otimizar a experiência dos seus clientes.')}</p>
      </div>

      <div className="space-y-2">
        {types.map(type => {
          const isActive = selected.includes(type.id);
          return (
            <button
              key={type.id}
              onClick={() => toggle(type.id)}
              className={`w-full rounded-2xl border-2 p-3 text-left transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">{type.name}</p>
                    {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{type.desc}</p>
                </div>
              </div>
              {isActive && (
                <div className="flex flex-wrap gap-1 mt-2 ml-[52px]">
                  {type.features.map(f => (
                    <span key={f} className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">{f}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <SaveButton />
    </div>
  );
};

// ============ 3. EXPERIENCE ============

export const ConfigExperience: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [config, setConfig] = useState({
    reservations: true, waitlist: true, qr_ordering: true, table_service: true,
    counter_service: false, self_ordering: false, event_bookings: true,
    advance_days: 30, grace_period: 15, require_deposit: false,
    deposit_amount: 50, estimated_wait: true, drinks_in_queue: true,
  });

  const toggle = (key: string) => setConfig(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));

  return (
    <div className="space-y-4">
      <ConfigHeader
        title={translateText('Experiência do Cliente')}
        subtitle={translateText('Como seus clientes interagem com o estabelecimento')}
        icon={<Sparkles className="h-5 w-5 text-info" />}
        onBack={() => onNavigate('config-hub')}
      />

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-[10px] text-primary font-medium flex items-center gap-1.5">
          <Eye className="h-3 w-3" />
          {translateText('Cada opção impacta diretamente como o cliente vive a experiência no seu espaço.')}
        </p>
      </div>

      <SectionCard title={translateText('Canais de Entrada')} icon={<Calendar className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Reservas Online')} desc={translateText('Clientes podem reservar pelo app')} value={config.reservations} onChange={() => toggle('reservations')} />
        <ToggleRow label={translateText('Lista de Espera / Fila')} desc={translateText('Fila virtual inteligente')} value={config.waitlist} onChange={() => toggle('waitlist')} />
        <ToggleRow label={translateText('Reserva de Eventos')} desc={translateText('Grupos e eventos especiais')} value={config.event_bookings} onChange={() => toggle('event_bookings')} />
      </SectionCard>

      <SectionCard title={translateText('Modelo de Atendimento')} icon={<Utensils className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Atendimento na Mesa')} desc={translateText('Garçom dedicado por mesa')} value={config.table_service} onChange={() => toggle('table_service')} />
        <ToggleRow label={translateText('Pedido por QR Code')} desc={translateText('Cliente escaneia e pede pelo celular')} value={config.qr_ordering} onChange={() => toggle('qr_ordering')} />
        <ToggleRow label={translateText('Atendimento no Balcão')} desc={translateText('Retirada no balcão')} value={config.counter_service} onChange={() => toggle('counter_service')} />
        <ToggleRow label={translateText('Auto-serviço')} desc={translateText('Cliente se serve sozinho')} value={config.self_ordering} onChange={() => toggle('self_ordering')} />
      </SectionCard>

      {config.reservations && (
        <SectionCard title={translateText('Configurações de Reserva')} icon={<Settings className="h-3.5 w-3.5 text-primary" />}>
          <NumberRow label={translateText('Antecedência máxima (dias)')} value={config.advance_days} onChange={v => setConfig(p => ({ ...p, advance_days: v }))} />
          <NumberRow label={translateText('Tolerância de atraso (min)')} value={config.grace_period} suffix="min" onChange={v => setConfig(p => ({ ...p, grace_period: v }))} />
          <ToggleRow label={translateText('Exigir depósito')} desc={translateText('Caução na reserva')} value={config.require_deposit} onChange={() => toggle('require_deposit')} />
        </SectionCard>
      )}

      {config.waitlist && (
        <SectionCard title={translateText('Configurações da Fila')} icon={<Clock className="h-3.5 w-3.5 text-primary" />}>
          <ToggleRow label={translateText('Tempo estimado visível')} desc={translateText('Mostrar previsão de espera')} value={config.estimated_wait} onChange={() => toggle('estimated_wait')} />
          <ToggleRow label={translateText('Pedidos na fila')} desc={translateText('Pedir bebidas enquanto aguarda')} value={config.drinks_in_queue} onChange={() => toggle('drinks_in_queue')} />
        </SectionCard>
      )}

      <SaveButton />
    </div>
  );
};

// ============ 4. FLOOR MANAGEMENT ============

export const ConfigFloor: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();

  const zones = [
    { id: 'z1', name: translateText('Salão Principal'), tables: 8, color: 'bg-primary/10 text-primary' },
    { id: 'z2', name: translateText('Varanda'), tables: 4, color: 'bg-success/10 text-success' },
    { id: 'z3', name: translateText('Área VIP'), tables: 3, color: 'bg-warning/10 text-warning' },
    { id: 'z4', name: translateText('Privativo'), tables: 2, color: 'bg-info/10 text-info' },
  ];

  const tables = [
    { id: 't1', number: 1, seats: 2, zone: translateText('Salão Principal'), shape: 'round' },
    { id: 't2', number: 2, seats: 4, zone: translateText('Salão Principal'), shape: 'rect' },
    { id: 't3', number: 3, seats: 6, zone: translateText('Salão Principal'), shape: 'rect' },
    { id: 't4', number: 4, seats: 2, zone: translateText('Varanda'), shape: 'round' },
    { id: 't5', number: 5, seats: 8, zone: translateText('Área VIP'), shape: 'long' },
    { id: 't6', number: 6, seats: 10, zone: translateText('Privativo'), shape: 'long' },
  ];

  return (
    <div className="space-y-4">
      <ConfigHeader
        title={translateText('Mapa do Salão')}
        subtitle={translateText('Gerencie mesas, zonas e áreas')}
        icon={<LayoutGrid className="h-5 w-5 text-warning" />}
        onBack={() => onNavigate('config-hub')}
      />

      {/* Visual mini floor plan */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-foreground">{translateText('Planta Visual')}</p>
          <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold">
            <Edit3 className="h-3 w-3" /> {translateText('Editar')}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 p-2 bg-muted/50 rounded-xl min-h-[120px]">
          {tables.map(table => (
            <div
              key={table.id}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border border-border bg-card ${table.shape === 'long' ? 'col-span-2' : ''}`}
            >
              <span className="text-sm font-bold text-foreground">{table.number}</span>
              <span className="text-[9px] text-muted-foreground">{table.seats}p</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">{translateText('Arraste para reposicionar (full app)')}</p>
      </div>

      {/* Zones */}
      <SectionCard title={translateText('Zonas do Salão')} icon={<LayoutGrid className="h-3.5 w-3.5 text-primary" />}>
        {zones.map(zone => (
          <div key={zone.id} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
            <div className="flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${zone.color}`}>{zone.name}</div>
            </div>
            <span className="text-xs text-muted-foreground">{zone.tables} {translateText('mesas')}</span>
          </div>
        ))}
        <div className="p-3">
          <button className="flex items-center gap-2 text-xs font-medium text-primary">
            <Plus className="h-3.5 w-3.5" /> {translateText('Adicionar zona')}
          </button>
        </div>
      </SectionCard>

      {/* Table list */}
      <SectionCard title={translateText('Mesas')} icon={<GripVertical className="h-3.5 w-3.5 text-primary" />}>
        {tables.map(table => (
          <div key={table.id} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-bold text-sm text-primary">{table.number}</div>
              <div>
                <p className="text-xs font-medium text-foreground">{translateText('Mesa')} {table.number}</p>
                <p className="text-[10px] text-muted-foreground">{table.zone} · {table.seats} {translateText('lugares')}</p>
              </div>
            </div>
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
        <div className="p-3">
          <button className="flex items-center gap-2 text-xs font-medium text-primary">
            <Plus className="h-3.5 w-3.5" /> {translateText('Adicionar mesa')}
          </button>
        </div>
      </SectionCard>

      <SaveButton />
    </div>
  );
};

// ============ 5. MENU ============

export const ConfigMenu: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [expandedCat, setExpandedCat] = useState<string | null>('pratos');

  const categories = [
    { id: 'entradas', name: translateText('Entradas'), items: 8, active: true },
    { id: 'pratos', name: translateText('Pratos Principais'), items: 12, active: true },
    { id: 'sobremesas', name: translateText('Sobremesas'), items: 5, active: true },
    { id: 'bebidas', name: translateText('Bebidas'), items: 15, active: true },
    { id: 'vinhos', name: translateText('Carta de Vinhos'), items: 20, active: true },
  ];

  const sampleItems = [
    { name: 'Sashimi Premium Mix', price: 'R$ 89,00', time: '12 min', allergens: ['🐟', '🥜'], active: true },
    { name: 'Wagyu Tataki', price: 'R$ 128,00', time: '15 min', allergens: ['🥩'], active: true },
    { name: 'Temaki Especial', price: 'R$ 42,00', time: '8 min', allergens: ['🐟', '🌾'], active: false },
  ];

  return (
    <div className="space-y-4">
      <ConfigHeader
        title={translateText('Gestão do Cardápio')}
        subtitle={translateText('Categorias, itens, preços e disponibilidade')}
        icon={<BookOpen className="h-5 w-5 text-success" />}
        onBack={() => onNavigate('config-hub')}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-foreground">60</p>
          <p className="text-[9px] text-muted-foreground">{translateText('Itens')}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-foreground">5</p>
          <p className="text-[9px] text-muted-foreground">{translateText('Categorias')}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-success">98%</p>
          <p className="text-[9px] text-muted-foreground">{translateText('Disponíveis')}</p>
        </div>
      </div>

      {/* Categories */}
      <SectionCard title={translateText('Categorias')} icon={<ArrowUpDown className="h-3.5 w-3.5 text-primary" />}>
        {categories.map(cat => (
          <div key={cat.id}>
            <button
              onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              className="w-full flex items-center justify-between p-3 border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                <p className="text-xs font-medium text-foreground">{cat.name}</p>
                <span className="text-[10px] text-muted-foreground">({cat.items})</span>
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCat === cat.id ? 'rotate-90' : ''}`} />
            </button>
            {expandedCat === cat.id && (
              <div className="bg-muted/30">
                {sampleItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 ml-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-medium ${item.active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{item.name}</p>
                        {item.allergens.map(a => <span key={a} className="text-[10px]">{a}</span>)}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{item.price} · {item.time}</p>
                    </div>
                    <button>
                      {item.active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                    </button>
                  </div>
                ))}
                <div className="p-2 ml-6">
                  <button className="flex items-center gap-1 text-[10px] font-medium text-primary">
                    <Plus className="h-3 w-3" /> {translateText('Adicionar item')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </SectionCard>

      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-xs font-semibold text-foreground mb-2">{translateText('Configurações Avançadas')}</p>
        <div className="grid grid-cols-2 gap-2">
          {[translateText('Alérgenos'), translateText('Upsell'), translateText('Horários'), translateText('Ingredientes')].map(item => (
            <button key={item} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-[10px] font-medium text-foreground">
              <Settings className="h-3 w-3 text-muted-foreground" /> {item}
            </button>
          ))}
        </div>
      </div>

      <SaveButton />
    </div>
  );
};

// ============ 6. TEAM ============

export const ConfigTeam: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();

  const roles = [
    { role: translateText('Dono'), count: 1, permissions: translateText('Acesso total'), icon: <Crown className="h-4 w-4" />, color: 'text-primary' },
    { role: translateText('Gerente'), count: 1, permissions: translateText('Operação e aprovações'), icon: <Shield className="h-4 w-4" />, color: 'text-secondary' },
    { role: 'Maitre', count: 1, permissions: translateText('Reservas e salão'), icon: <Calendar className="h-4 w-4" />, color: 'text-info' },
    { role: 'Chef', count: 1, permissions: translateText('KDS e cardápio'), icon: <ChefHat className="h-4 w-4" />, color: 'text-warning' },
    { role: 'Barman', count: 1, permissions: translateText('Bar e drinks'), icon: <Wine className="h-4 w-4" />, color: 'text-accent-foreground' },
    { role: translateText('Cozinheiro'), count: 2, permissions: translateText('Estação de preparo'), icon: <Flame className="h-4 w-4" />, color: 'text-destructive' },
    { role: translateText('Garçom'), count: 3, permissions: translateText('Mesas e pedidos'), icon: <Utensils className="h-4 w-4" />, color: 'text-success' },
  ];

  const staff = [
    { name: 'Ricardo Alves', role: translateText('Dono'), status: 'online', shift: 'Integral' },
    { name: 'Marina Costa', role: translateText('Gerente'), status: 'online', shift: '14h-23h' },
    { name: 'Felipe Santos', role: 'Chef', status: 'online', shift: '15h-23h' },
    { name: 'Bruno Oliveira', role: translateText('Garçom'), status: 'online', shift: '18h-00h' },
    { name: 'Carla Lima', role: translateText('Garçom'), status: 'break', shift: '12h-18h' },
  ];

  return (
    <div className="space-y-4">
      <ConfigHeader
        title={translateText('Equipe & Permissões')}
        subtitle={translateText('Gerencie cargos, escalas e acessos')}
        icon={<Users className="h-5 w-5 text-accent-foreground" />}
        onBack={() => onNavigate('config-hub')}
      />

      {/* Roles overview */}
      <SectionCard title={translateText('Cargos e Permissões')} icon={<Shield className="h-3.5 w-3.5 text-primary" />}>
        {roles.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted ${r.color}`}>{r.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground">{r.role}</p>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{r.count}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{r.permissions}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </SectionCard>

      {/* Staff list */}
      <SectionCard title={translateText('Membros da Equipe')} icon={<Users className="h-3.5 w-3.5 text-primary" />}>
        {staff.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {s.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">{s.name}</p>
              <p className="text-[10px] text-muted-foreground">{s.role} · {s.shift}</p>
            </div>
            <span className={`h-2 w-2 rounded-full ${s.status === 'online' ? 'bg-success' : 'bg-warning'}`} />
          </div>
        ))}
        <div className="p-3">
          <button className="flex items-center gap-2 text-xs font-medium text-primary">
            <Plus className="h-3.5 w-3.5" /> {translateText('Adicionar membro')}
          </button>
        </div>
      </SectionCard>

      <SaveButton />
    </div>
  );
};

// ============ 7. KITCHEN & BAR ============

export const ConfigKitchen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [config, setConfig] = useState({
    kitchen_stations: 3, bar_stations: 1, kds_screens: 2,
    default_prep_time: 15, auto_routing: true, priority_alerts: true,
  });

  const stations = [
    { name: translateText('Grill / Chapa'), items: translateText('Carnes, grelhados'), kds: 'KDS 1', color: 'bg-destructive/10 text-destructive' },
    { name: translateText('Frios / Ceviche'), items: translateText('Sashimi, saladas'), kds: 'KDS 1', color: 'bg-info/10 text-info' },
    { name: translateText('Confeitaria'), items: translateText('Sobremesas'), kds: 'KDS 2', color: 'bg-warning/10 text-warning' },
    { name: translateText('Bar Principal'), items: translateText('Drinks e cocktails'), kds: 'KDS Bar', color: 'bg-primary/10 text-primary' },
  ];

  return (
    <div className="space-y-4">
      <ConfigHeader
        title={translateText('Cozinha & Bar')}
        subtitle={translateText('Estações, KDS e fluxo operacional')}
        icon={<ChefHat className="h-5 w-5 text-destructive" />}
        onBack={() => onNavigate('config-hub')}
      />

      <SectionCard title={translateText('Estações de Preparo')} icon={<Flame className="h-3.5 w-3.5 text-primary" />}>
        {stations.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
            <div className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${s.color}`}>{s.name}</div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">{s.items}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">{s.kds}</span>
          </div>
        ))}
        <div className="p-3">
          <button className="flex items-center gap-2 text-xs font-medium text-primary">
            <Plus className="h-3.5 w-3.5" /> {translateText('Adicionar estação')}
          </button>
        </div>
      </SectionCard>

      <SectionCard title={translateText('Configurações KDS')} icon={<Smartphone className="h-3.5 w-3.5 text-primary" />}>
        <NumberRow label={translateText('Telas KDS')} value={config.kds_screens} onChange={v => setConfig(p => ({ ...p, kds_screens: v }))} />
        <NumberRow label={translateText('Tempo padrão (min)')} value={config.default_prep_time} suffix="min" onChange={v => setConfig(p => ({ ...p, default_prep_time: v }))} />
        <ToggleRow label={translateText('Roteamento automático')} desc={translateText('Enviar itens para estação correta')} value={config.auto_routing} onChange={() => setConfig(p => ({ ...p, auto_routing: !p.auto_routing }))} />
        <ToggleRow label={translateText('Alertas de prioridade')} desc={translateText('Notificar itens atrasados')} value={config.priority_alerts} onChange={() => setConfig(p => ({ ...p, priority_alerts: !p.priority_alerts }))} />
      </SectionCard>

      <SaveButton />
    </div>
  );
};

// ============ 8. PAYMENTS ============

export const ConfigPayments: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [config, setConfig] = useState({
    service_charge: true, service_pct: 10, tips_enabled: true,
    tip_percentages: [10, 15, 20], custom_tip: true,
    split_individual: true, split_equal: true, split_by_item: true, split_fixed: true,
    pix: true, credit: true, debit: true, apple_pay: true, google_pay: true, tap_to_pay: true,
    min_spend: false, min_amount: 0, deposit_enabled: false, deposit_amount: 50,
  });

  const toggle = (key: string) => setConfig(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));

  return (
    <div className="space-y-4">
      <ConfigHeader
        title={translateText('Pagamentos')}
        subtitle={translateText('Taxa, gorjeta, split e métodos aceitos')}
        icon={<CreditCard className="h-5 w-5 text-primary" />}
        onBack={() => onNavigate('config-hub')}
      />

      <SectionCard title={translateText('Taxa de Serviço')} icon={<Percent className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Taxa de serviço')} desc={translateText('Incluir automaticamente na conta')} value={config.service_charge} onChange={() => toggle('service_charge')} />
        {config.service_charge && (
          <NumberRow label={translateText('Percentual')} value={config.service_pct} suffix="%" onChange={v => setConfig(p => ({ ...p, service_pct: v }))} />
        )}
      </SectionCard>

      <SectionCard title={translateText('Gorjetas')} icon={<Heart className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Sistema de gorjetas')} desc={translateText('Sugerir gorjeta no fechamento')} value={config.tips_enabled} onChange={() => toggle('tips_enabled')} />
        {config.tips_enabled && (
          <>
            <div className="p-3 border-b border-border">
              <p className="text-[10px] text-muted-foreground mb-2">{translateText('Percentuais sugeridos')}</p>
              <div className="flex gap-2">
                {config.tip_percentages.map(pct => (
                  <span key={pct} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{pct}%</span>
                ))}
              </div>
            </div>
            <ToggleRow label={translateText('Gorjeta personalizada')} desc={translateText('Permitir valor livre')} value={config.custom_tip} onChange={() => toggle('custom_tip')} />
          </>
        )}
      </SectionCard>

      <SectionCard title={translateText('Divisão de Conta')} icon={<Users className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Individual')} desc={translateText('Cada um paga o seu')} value={config.split_individual} onChange={() => toggle('split_individual')} />
        <ToggleRow label={translateText('Dividir igualmente')} desc={translateText('Total dividido por todos')} value={config.split_equal} onChange={() => toggle('split_equal')} />
        <ToggleRow label={translateText('Por item')} desc={translateText('Selecionar itens para pagar')} value={config.split_by_item} onChange={() => toggle('split_by_item')} />
        <ToggleRow label={translateText('Valor fixo')} desc={translateText('Escolher quanto pagar')} value={config.split_fixed} onChange={() => toggle('split_fixed')} />
      </SectionCard>

      <SectionCard title={translateText('Métodos Aceitos')} icon={<Smartphone className="h-3.5 w-3.5 text-primary" />}>
        {[
          { key: 'credit', label: translateText('Cartão de Crédito') },
          { key: 'debit', label: translateText('Cartão de Débito') },
          { key: 'pix', label: 'PIX' },
          { key: 'apple_pay', label: 'Apple Pay' },
          { key: 'google_pay', label: 'Google Pay' },
          { key: 'tap_to_pay', label: 'TAP to Pay / NFC' },
        ].map(m => (
          <ToggleRow key={m.key} label={m.label} desc="" value={config[m.key as keyof typeof config] as boolean} onChange={() => toggle(m.key)} />
        ))}
      </SectionCard>

      <SaveButton />
    </div>
  );
};

// ============ 9. FEATURE MARKETPLACE ============

export const ConfigFeatures: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [active, setActive] = useState<string[]>(['loyalty', 'ai_recs']);

  const features = [
    { id: 'loyalty', icon: <Award className="h-5 w-5" />, name: translateText('Programa de Fidelidade'), desc: translateText('Pontos, recompensas e leaderboard'), tier: 'Premium', color: 'from-primary to-accent' },
    { id: 'events', icon: <PartyPopper className="h-5 w-5" />, name: translateText('Gestão de Eventos'), desc: translateText('Eventos, ingressos e check-in'), tier: 'Pro', color: 'from-secondary to-secondary/80' },
    { id: 'happy_hour', icon: <Clock className="h-5 w-5" />, name: 'Happy Hour', desc: translateText('Preços automáticos por horário'), tier: translateText('Grátis'), color: 'from-success to-success/80' },
    { id: 'ai_recs', icon: <Brain className="h-5 w-5" />, name: translateText('IA de Recomendações'), desc: translateText('Sugestões inteligentes e harmonização'), tier: 'Premium', color: 'from-info to-info/80' },
    { id: 'vip', icon: <Crown className="h-5 w-5" />, name: translateText('Programa VIP'), desc: translateText('Áreas exclusivas e benefícios'), tier: 'Pro', color: 'from-warning to-warning/80' },
    { id: 'experience', icon: <Gift className="h-5 w-5" />, name: translateText('Pacotes de Experiência'), desc: translateText('Combos e experiências gastronômicas'), tier: translateText('Grátis'), color: 'from-accent to-accent/80' },
    { id: 'reviews', icon: <Star className="h-5 w-5" />, name: translateText('Avaliações Inteligentes'), desc: translateText('Feedback automático pós-visita'), tier: translateText('Grátis'), color: 'from-primary to-primary/80' },
    { id: 'analytics_ai', icon: <TrendingUp className="h-5 w-5" />, name: translateText('Analytics Avançado'), desc: translateText('Previsões, tendências e insights por IA'), tier: 'Premium', color: 'from-destructive to-destructive/80' },
  ];

  const toggle = (id: string) => setActive(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="space-y-4">
      <ConfigHeader
        title={translateText('Marketplace de Features')}
        subtitle={translateText('Ative módulos avançados para seu negócio')}
        icon={<Zap className="h-5 w-5 text-warning" />}
        onBack={() => onNavigate('config-hub')}
      />

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-primary">{active.length}</p>
          <p className="text-[9px] text-muted-foreground">{translateText('Ativos')}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-foreground">{features.length}</p>
          <p className="text-[9px] text-muted-foreground">{translateText('Disponíveis')}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-success">3</p>
          <p className="text-[9px] text-muted-foreground">{translateText('Grátis')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {features.map(feat => {
          const isActive = active.includes(feat.id);
          return (
            <div key={feat.id} className={`rounded-2xl border-2 p-3 transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} text-primary-foreground`}>
                  {feat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">{feat.name}</p>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${feat.tier === 'Premium' ? 'bg-primary/10 text-primary' : feat.tier === 'Pro' ? 'bg-secondary/10 text-secondary' : 'bg-success/10 text-success'}`}>{feat.tier}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{feat.desc}</p>
                </div>
                <button onClick={() => toggle(feat.id)}>
                  {isActive ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
