/**
 * Restaurant Configuration Hub v2 — Professional Control Center
 * 9 modular config screens with interactive demo flows and customer experience previews
 */
import React, { useState, useEffect } from 'react';
import {
  Store, Clock, Globe, Camera, MapPin, Phone, Link2,
  Settings, Check, ChevronRight, ChevronLeft, ToggleRight, ToggleLeft,
  Utensils, Users, CreditCard, Sparkles, LayoutGrid, ChefHat, Wine,
  Star, Crown, Ticket, Coffee, Truck, Car, Flame, BookOpen,
  Plus, Minus, Calendar, Bell, Shield, DollarSign, Percent,
  Smartphone, QrCode, ClipboardList, Package, Timer, Heart,
  Zap, Gift, PartyPopper, Brain, TrendingUp, Award, Music, Palette,
  Eye, ArrowUpDown, GripVertical, X, Edit3, AlertTriangle,
  Wifi, Play, CheckCircle2, CircleDot, ArrowRight, Lock,
  Monitor, Layers, Tag, Image, Search, RefreshCw, BarChart3,
  Volume2, Headphones, MessageSquare, Scan, Fingerprint
} from 'lucide-react';
import { useDemoI18n } from '@/components/demo/DemoI18n';

// ============ SHARED COMPONENTS ============

const ConfigHeader: React.FC<{
  title: string; subtitle: string; icon: React.ReactNode; onBack: () => void;
  badge?: string; badgeColor?: string;
}> = ({ title, subtitle, icon, onBack, badge, badgeColor = 'bg-primary/10 text-primary' }) => (
  <div className="flex items-center gap-3 mb-4">
    <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/80 active:scale-95 transition-transform">
      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
    </button>
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {badge && <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${badgeColor}`}>{badge}</span>}
      </div>
      <p className="text-[10px] text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const ToggleRow: React.FC<{
  label: string; desc: string; value: boolean; onChange: () => void;
  icon?: React.ReactNode; locked?: boolean;
}> = ({ label, desc, value, onChange, icon, locked }) => (
  <div className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
    <div className="flex items-center gap-2.5 flex-1 mr-3">
      {icon && <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted shrink-0">{icon}</div>}
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
    </div>
    <button onClick={onChange} className="relative">
      {locked && <Lock className="h-3 w-3 text-muted-foreground absolute -top-1 -right-1" />}
      {value ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
    </button>
  </div>
);

const NumberRow: React.FC<{ label: string; value: number; suffix?: string; onChange: (v: number) => void }> = ({ label, value, suffix = '', onChange }) => (
  <div className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
    <p className="text-xs font-medium text-foreground">{label}</p>
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center active:scale-90 transition-transform">
        <Minus className="h-3 w-3" />
      </button>
      <span className="text-xs font-semibold min-w-[40px] text-center">{value}{suffix}</span>
      <button onClick={() => onChange(value + 1)} className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center active:scale-90 transition-transform">
        <Plus className="h-3 w-3" />
      </button>
    </div>
  </div>
);

const SectionCard: React.FC<{
  title: string; icon: React.ReactNode; children: React.ReactNode;
  action?: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean;
}> = ({ title, icon, children, action, collapsible = false, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">{icon}</div>
          <h3 className="text-xs font-semibold text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {action}
          {collapsible && (
            <button onClick={() => setOpen(!open)}>
              <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
      </div>
      {(!collapsible || open) && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">{children}</div>
      )}
    </div>
  );
};

const SaveButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { translateText } = useDemoI18n();
  const [saved, setSaved] = useState(false);
  const handleClick = () => {
    setSaved(true);
    onClick?.();
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <button onClick={handleClick} className={`w-full rounded-2xl px-3 py-3 text-xs font-semibold mt-4 transition-all ${saved ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'}`}>
      {saved ? (
        <span className="flex items-center justify-center gap-2"><Check className="h-4 w-4" /> {translateText('Salvo com sucesso!')}</span>
      ) : translateText('Salvar Configurações')}
    </button>
  );
};

const ExperiencePreview: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const { translateText } = useDemoI18n();
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Eye className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] font-semibold text-primary">{translateText('Pré-visualização do Cliente')}: {title}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-3">
        {children}
      </div>
    </div>
  );
};

const StepIndicator: React.FC<{ steps: string[]; current: number }> = ({ steps, current }) => (
  <div className="flex items-center gap-1 mb-4">
    {steps.map((step, i) => (
      <div key={i} className="flex items-center gap-1 flex-1">
        <div className={`h-1.5 rounded-full flex-1 transition-all ${i <= current ? 'bg-primary' : 'bg-muted'}`} />
      </div>
    ))}
  </div>
);

const InfoBanner: React.FC<{ text: string; tone?: 'primary' | 'info' | 'warning' | 'success' }> = ({ text, tone = 'primary' }) => {
  const toneMap = {
    primary: 'border-primary/20 bg-primary/5 text-primary',
    info: 'border-info/20 bg-info/5 text-info',
    warning: 'border-warning/20 bg-warning/5 text-warning',
    success: 'border-success/20 bg-success/5 text-success',
  };
  return (
    <div className={`rounded-2xl border p-3 mb-4 ${toneMap[tone]}`}>
      <p className="text-[10px] font-medium flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 shrink-0" /> {text}
      </p>
    </div>
  );
};

// ============ CONFIG HUB (Main) ============

export const ConfigHub: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [showGuide, setShowGuide] = useState(true);

  const modules = [
    { id: 'config-profile', icon: <Store className="h-5 w-5 text-primary" />, label: translateText('Perfil do Restaurante'), desc: translateText('Nome, logo, fotos, contato'), progress: 85, status: 'configured' as const },
    { id: 'config-service-types', icon: <Utensils className="h-5 w-5 text-secondary" />, label: translateText('Tipos de Serviço'), desc: translateText('11 modelos de operação'), progress: 100, status: 'complete' as const },
    { id: 'config-experience', icon: <Sparkles className="h-5 w-5 text-info" />, label: translateText('Experiência do Cliente'), desc: translateText('Reservas, fila, QR, pedidos'), progress: 70, status: 'configured' as const },
    { id: 'config-floor', icon: <LayoutGrid className="h-5 w-5 text-warning" />, label: translateText('Mapa do Salão'), desc: translateText('Mesas, zonas, áreas VIP'), progress: 60, status: 'needs-attention' as const },
    { id: 'config-menu', icon: <BookOpen className="h-5 w-5 text-success" />, label: translateText('Cardápio'), desc: translateText('Categorias, itens, preços'), progress: 90, status: 'configured' as const },
    { id: 'config-team', icon: <Users className="h-5 w-5 text-accent-foreground" />, label: translateText('Equipe & Permissões'), desc: translateText('Cargos, escalas, acesso'), progress: 75, status: 'configured' as const },
    { id: 'config-kitchen', icon: <ChefHat className="h-5 w-5 text-destructive" />, label: translateText('Cozinha & Bar'), desc: translateText('Estações, KDS, receitas'), progress: 50, status: 'needs-attention' as const },
    { id: 'config-payments', icon: <CreditCard className="h-5 w-5 text-primary" />, label: translateText('Pagamentos'), desc: translateText('Taxa, gorjeta, split, métodos'), progress: 80, status: 'configured' as const },
    { id: 'config-features', icon: <Zap className="h-5 w-5 text-warning" />, label: translateText('Marketplace de Features'), desc: translateText('Fidelidade, IA, eventos, VIP'), progress: 40, status: 'needs-attention' as const },
  ];

  const overallProgress = Math.round(modules.reduce((a, m) => a + m.progress, 0) / modules.length);
  const statusColor = { complete: 'text-success', configured: 'text-primary', 'needs-attention': 'text-warning' };
  const statusIcon = { complete: <CheckCircle2 className="h-3.5 w-3.5" />, configured: <CircleDot className="h-3.5 w-3.5" />, 'needs-attention': <AlertTriangle className="h-3.5 w-3.5" /> };

  return (
    <div className="space-y-3">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-foreground/95 to-foreground/80 p-4 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-sm">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold">{translateText('Central de Configuração')}</h2>
              <p className="text-[10px] opacity-70">{translateText('Omakase Sushi · Fine Dining')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] opacity-70">{translateText('Progresso geral')}</span>
                <span className="text-xs font-bold">{overallProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-primary-foreground/20 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guided setup tip */}
      {showGuide && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 shrink-0 mt-0.5">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-foreground">{translateText('Dica: Configure na ordem')}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {translateText('Comece pelo Perfil → Tipos de Serviço → Experiência. A plataforma vai sugerir configurações inteligentes com base nas suas escolhas.')}
            </p>
          </div>
          <button onClick={() => setShowGuide(false)} className="shrink-0">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-success/20 bg-success/5 p-2.5 text-center">
          <p className="text-lg font-bold text-success">{modules.filter(m => m.status === 'complete').length}</p>
          <p className="text-[8px] text-muted-foreground font-medium">{translateText('Completos')}</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-center">
          <p className="text-lg font-bold text-primary">{modules.filter(m => m.status === 'configured').length}</p>
          <p className="text-[8px] text-muted-foreground font-medium">{translateText('Configurados')}</p>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-2.5 text-center">
          <p className="text-lg font-bold text-warning">{modules.filter(m => m.status === 'needs-attention').length}</p>
          <p className="text-[8px] text-muted-foreground font-medium">{translateText('Pendentes')}</p>
        </div>
      </div>

      {/* Module cards */}
      <div className="space-y-2">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => onNavigate(mod.id)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border bg-card text-left transition-all active:scale-[0.98] hover:border-primary/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
              {mod.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-xs font-semibold text-foreground">{mod.label}</p>
                <span className={`${statusColor[mod.status]}`}>{statusIcon[mod.status]}</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{mod.desc}</p>
              <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden w-full">
                <div className={`h-full rounded-full transition-all ${
                  mod.progress === 100 ? 'bg-success' : mod.progress >= 70 ? 'bg-primary' : 'bg-warning'
                }`} style={{ width: `${mod.progress}%` }} />
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateText('Ações Rápidas')}</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onNavigate('config-profile')} className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 text-left">
            <Image className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-medium">{translateText('Atualizar fotos')}</span>
          </button>
          <button onClick={() => onNavigate('config-menu')} className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 text-left">
            <Tag className="h-3.5 w-3.5 text-success" />
            <span className="text-[10px] font-medium">{translateText('Editar preços')}</span>
          </button>
          <button onClick={() => onNavigate('config-team')} className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 text-left">
            <Users className="h-3.5 w-3.5 text-info" />
            <span className="text-[10px] font-medium">{translateText('Escalar equipe')}</span>
          </button>
          <button onClick={() => onNavigate('config-floor')} className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 text-left">
            <LayoutGrid className="h-3.5 w-3.5 text-warning" />
            <span className="text-[10px] font-medium">{translateText('Ajustar mesas')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ 1. PROFILE ============

export const ConfigProfile: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [activeSection, setActiveSection] = useState<'info' | 'media' | 'hours' | 'contact'>('info');

  return (
    <div className="space-y-3">
      <ConfigHeader
        title={translateText('Perfil do Restaurante')}
        subtitle={translateText('Identidade do seu estabelecimento')}
        icon={<Store className="h-5 w-5 text-primary" />}
        onBack={() => onNavigate('config-hub')}
        badge="85%"
      />

      {/* Section tabs */}
      <div className="flex bg-muted/30 rounded-xl p-0.5">
        {[
          { id: 'info' as const, label: translateText('Info') },
          { id: 'media' as const, label: translateText('Mídia') },
          { id: 'hours' as const, label: translateText('Horários') },
          { id: 'contact' as const, label: translateText('Contato') },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-semibold transition-all ${
              activeSection === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'info' && (
        <>
          {/* Logo & Banner preview */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 relative flex items-end justify-between p-3">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card/90 backdrop-blur-sm text-[10px] font-medium shadow-sm">
                <Camera className="h-3 w-3" /> {translateText('Alterar banner')}
              </button>
            </div>
            <div className="-mt-7 ml-4 flex items-end gap-3 pb-3">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border-3 border-card flex items-center justify-center shadow-lg relative">
                <Store className="h-6 w-6 text-primary" />
                <button className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Camera className="h-2.5 w-2.5 text-primary-foreground" />
                </button>
              </div>
              <div className="mb-1">
                <p className="text-sm font-bold text-foreground">Omakase Sushi</p>
                <p className="text-[10px] text-muted-foreground">Fine Dining · Japonesa</p>
              </div>
            </div>
          </div>

          <SectionCard title={translateText('Informações Básicas')} icon={<Edit3 className="h-3.5 w-3.5 text-primary" />}>
            {[
              { label: translateText('Nome'), value: 'Omakase Sushi', editable: true },
              { label: translateText('Descrição'), value: translateText('Experiência autêntica japonesa com ingredientes premium importados'), editable: true },
              { label: 'CNPJ', value: '12.345.678/0001-90', editable: false },
              { label: translateText('Tipo de Cozinha'), value: translateText('Japonesa, Contemporânea'), editable: true },
              { label: translateText('Faixa de Preço'), value: '$$$$', editable: true },
              { label: translateText('Capacidade'), value: translateText('48 lugares'), editable: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
                <p className="text-[10px] text-muted-foreground">{f.label}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-foreground text-right max-w-[55%] truncate">{f.value}</p>
                  {f.editable && <Edit3 className="h-3 w-3 text-muted-foreground/50" />}
                </div>
              </div>
            ))}
          </SectionCard>

          <ExperiencePreview title={translateText('Perfil no app do cliente')}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold">Omakase Sushi</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 text-warning fill-warning" />
                  <span className="text-[10px] font-semibold">4.9</span>
                  <span className="text-[10px] text-muted-foreground">· Fine Dining · $$$$</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">{translateText('Experiência autêntica japonesa com ingredientes premium importados')}</p>
            <div className="flex gap-1.5 mt-2">
              {[translateText('Reservas'), 'QR Code', 'Wi-Fi'].map(tag => (
                <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-semibold text-primary">{tag}</span>
              ))}
            </div>
          </ExperiencePreview>
        </>
      )}

      {activeSection === 'media' && (
        <>
          <SectionCard title={translateText('Galeria de Fotos')} icon={<Image className="h-3.5 w-3.5 text-primary" />}
            action={<button className="text-[10px] font-medium text-primary flex items-center gap-1"><Plus className="h-3 w-3" /> {translateText('Adicionar')}</button>}>
            <div className="p-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: translateText('Fachada'), color: 'from-primary/20 to-primary/10' },
                  { label: translateText('Salão'), color: 'from-info/20 to-info/10' },
                  { label: translateText('Pratos'), color: 'from-warning/20 to-warning/10' },
                  { label: translateText('Bar'), color: 'from-accent/20 to-accent/10' },
                  { label: translateText('Privativo'), color: 'from-success/20 to-success/10' },
                  { label: translateText('Equipe'), color: 'from-secondary/20 to-secondary/10' },
                ].map((p, i) => (
                  <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center relative`}>
                    <Camera className="h-4 w-4 text-muted-foreground/50" />
                    <span className="absolute bottom-1 text-[7px] font-medium text-muted-foreground">{p.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground text-center mt-2">{translateText('Recomendado: 6 fotos de alta qualidade')}</p>
            </div>
          </SectionCard>

          <ExperiencePreview title={translateText('Galeria no app')}>
            <div className="flex gap-1.5 overflow-hidden">
              {[translateText('Fachada'), translateText('Salão'), translateText('Pratos')].map((p, i) => (
                <div key={i} className="h-16 w-20 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0">
                  <Camera className="h-3.5 w-3.5 text-muted-foreground/40" />
                </div>
              ))}
            </div>
          </ExperiencePreview>
        </>
      )}

      {activeSection === 'hours' && (
        <>
          <SectionCard title={translateText('Horários de Funcionamento')} icon={<Clock className="h-3.5 w-3.5 text-primary" />}>
            {[
              { day: translateText('Segunda'), hours: '18:00 - 23:00', open: true },
              { day: translateText('Terça'), hours: '18:00 - 23:00', open: true },
              { day: translateText('Quarta'), hours: '18:00 - 23:00', open: true },
              { day: translateText('Quinta'), hours: '18:00 - 23:00', open: true },
              { day: translateText('Sexta'), hours: '18:00 - 00:00', open: true },
              { day: translateText('Sábado'), hours: '18:00 - 00:00', open: true },
              { day: translateText('Domingo'), hours: '12:00 - 16:00', open: true },
            ].map((h, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 border-b border-border last:border-b-0">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${h.open ? 'bg-success' : 'bg-muted'}`} />
                  <p className="text-[11px] font-medium text-foreground">{h.day}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-primary font-semibold">{h.hours}</span>
                  <Edit3 className="h-3 w-3 text-muted-foreground/40" />
                </div>
              </div>
            ))}
          </SectionCard>

          <SectionCard title={translateText('Horários Especiais')} icon={<Calendar className="h-3.5 w-3.5 text-primary" />}>
            <div className="p-3">
              <button className="flex items-center gap-2 text-xs font-medium text-primary">
                <Plus className="h-3.5 w-3.5" /> {translateText('Adicionar feriado ou evento')}
              </button>
            </div>
          </SectionCard>
        </>
      )}

      {activeSection === 'contact' && (
        <>
          <SectionCard title={translateText('Endereço')} icon={<MapPin className="h-3.5 w-3.5 text-primary" />}>
            <div className="p-3">
              <div className="h-24 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-2 border border-border">
                <MapPin className="h-6 w-6 text-primary/40" />
                <span className="text-[10px] text-muted-foreground ml-2">{translateText('Mapa interativo')}</span>
              </div>
              <p className="text-xs text-foreground">Rua Augusta, 1234 - São Paulo, SP</p>
              <p className="text-[10px] text-muted-foreground">CEP 01304-001</p>
            </div>
          </SectionCard>

          <SectionCard title={translateText('Contato')} icon={<Phone className="h-3.5 w-3.5 text-primary" />}>
            {[
              { icon: <Phone className="h-3 w-3" />, label: translateText('Telefone'), value: '(11) 3456-7890' },
              { icon: <MessageSquare className="h-3 w-3" />, label: 'WhatsApp', value: '(11) 99876-5432' },
              { icon: <Globe className="h-3 w-3" />, label: 'Website', value: 'omakase.com.br' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">{c.icon}</div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">{c.label}</p>
                  <p className="text-xs font-medium text-foreground">{c.value}</p>
                </div>
                <Edit3 className="h-3 w-3 text-muted-foreground/40" />
              </div>
            ))}
          </SectionCard>

          <SectionCard title={translateText('Redes Sociais')} icon={<Link2 className="h-3.5 w-3.5 text-primary" />}>
            {[
              { label: 'Instagram', value: '@omakasesushi', connected: true },
              { label: 'Facebook', value: '/omakasesushi', connected: true },
              { label: 'TikTok', value: '', connected: false },
              { label: 'Google Business', value: translateText('Verificado'), connected: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
                <p className="text-xs font-medium text-foreground">{s.label}</p>
                {s.connected ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-primary font-medium">{s.value}</span>
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  </div>
                ) : (
                  <button className="text-[10px] text-primary font-medium">{translateText('Conectar')}</button>
                )}
              </div>
            ))}
          </SectionCard>
        </>
      )}

      <SaveButton />
    </div>
  );
};

// ============ 2. SERVICE TYPES ============

export const ConfigServiceTypes: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [selected, setSelected] = useState<string[]>(['fine_dining']);
  const [expandedType, setExpandedType] = useState<string | null>('fine_dining');

  const types = [
    { id: 'fine_dining', icon: <Crown className="h-5 w-5" />, name: 'Fine Dining', desc: translateText('Reservas, sommelier, harmonização'),
      features: [
        { name: translateText('Reservas Online'), enabled: true, desc: translateText('Clientes reservam pelo app') },
        { name: 'Wine Pairing', enabled: true, desc: translateText('Harmonização por IA') },
        { name: 'Sommelier', enabled: true, desc: translateText('Notas e sugestões do sommelier') },
        { name: 'Split por Item', enabled: true, desc: translateText('Divisão flexível da conta') },
        { name: 'Course-by-Course', enabled: false, desc: translateText('Menu degustação passo a passo') },
      ],
      clientPreview: translateText('O cliente vê: menu elegante com harmonizações, sommelier digital e conta detalhada por item.'),
    },
    { id: 'casual_dining', icon: <Utensils className="h-5 w-5" />, name: 'Casual Dining', desc: translateText('Waitlist, família, grupos'),
      features: [
        { name: 'Smart Waitlist', enabled: true, desc: translateText('Fila inteligente com pedidos') },
        { name: translateText('Modo Família'), enabled: true, desc: translateText('Prioridade kids e atividades') },
        { name: translateText('Grupos'), enabled: false, desc: translateText('Gestão de mesas grandes') },
      ],
      clientPreview: translateText('O cliente vê: fila virtual com tempo estimado, menu familiar e divisão fácil.'),
    },
    { id: 'fast_casual', icon: <Flame className="h-5 w-5" />, name: 'Fast Casual', desc: translateText('Montador de pratos, alérgenos'),
      features: [
        { name: 'Dish Builder', enabled: true, desc: translateText('Monte seu bowl ou prato') },
        { name: translateText('Alérgenos'), enabled: true, desc: translateText('Filtros e alertas') },
        { name: translateText('Nutricional'), enabled: false, desc: translateText('Contagem de calorias') },
      ],
      clientPreview: translateText('O cliente vê: montador visual de pratos com info nutricional e alérgenos.'),
    },
    { id: 'cafe_bakery', icon: <Coffee className="h-5 w-5" />, name: translateText('Café & Padaria'), desc: translateText('Work mode, refill, Wi-Fi'),
      features: [
        { name: 'Work Mode', enabled: true, desc: translateText('Gestão de Wi-Fi e tomadas') },
        { name: 'Refill', enabled: true, desc: translateText('Lógica de refil automático') },
        { name: translateText('Assinatura'), enabled: false, desc: translateText('Plano mensal de café') },
      ],
      clientPreview: translateText('O cliente vê: mapa de tomadas, Wi-Fi, refil e ambiente para trabalho.'),
    },
    { id: 'buffet', icon: <ClipboardList className="h-5 w-5" />, name: 'Buffet', desc: translateText('Balança inteligente, NFC'),
      features: [
        { name: translateText('Balança Inteligente'), enabled: true, desc: translateText('Pesagem automática por NFC') },
        { name: 'Self-service', enabled: true, desc: translateText('Controle de estação') },
      ],
      clientPreview: translateText('O cliente vê: prato na balança com preço em tempo real e pagamento automático.'),
    },
    { id: 'pub_bar', icon: <Wine className="h-5 w-5" />, name: 'Pub & Bar', desc: translateText('Comanda digital, rounds'),
      features: [
        { name: translateText('Comanda Digital'), enabled: true, desc: translateText('Pré-autorização e limite') },
        { name: 'Round Builder', enabled: true, desc: translateText('Rodada para o grupo') },
        { name: translateText('Consumo Mínimo'), enabled: false, desc: translateText('Regra de gasto mínimo') },
      ],
      clientPreview: translateText('O cliente vê: comanda digital, round builder e tracker de consumo em tempo real.'),
    },
    { id: 'drive_thru', icon: <Car className="h-5 w-5" />, name: 'Drive-Thru', desc: translateText('Geofencing, preparo antecipado'),
      features: [
        { name: 'GPS 500m', enabled: true, desc: translateText('Ativa preparo ao se aproximar') },
        { name: translateText('Preparo Automático'), enabled: true, desc: translateText('Inicia ao detectar chegada') },
      ],
      clientPreview: translateText('O cliente vê: notificação ao se aproximar, pedido pronto na chegada.'),
    },
    { id: 'food_truck', icon: <Truck className="h-5 w-5" />, name: 'Food Truck', desc: translateText('Mapa em tempo real, fila virtual'),
      features: [
        { name: translateText('Mapa GPS'), enabled: true, desc: translateText('Localização em tempo real') },
        { name: translateText('Fila Virtual'), enabled: true, desc: translateText('Fila digital sem ficar em pé') },
      ],
      clientPreview: translateText('O cliente vê: mapa com localização do truck e fila virtual com posição.'),
    },
    { id: 'chefs_table', icon: <Star className="h-5 w-5" />, name: "Chef's Table", desc: translateText('Menu degustação, notas do chef'),
      features: [
        { name: 'Course-by-Course', enabled: true, desc: translateText('Cada etapa revelada ao momento') },
        { name: 'Sommelier Notes', enabled: true, desc: translateText('Notas de harmonização') },
      ],
      clientPreview: translateText('O cliente vê: cada curso revelado individualmente com notas do chef e sommelier.'),
    },
    { id: 'quick_service', icon: <Zap className="h-5 w-5" />, name: 'Quick Service', desc: translateText('Skip the line, pickup rápido'),
      features: [
        { name: 'Skip the Line', enabled: true, desc: translateText('Pular a fila pelo app') },
        { name: translateText('Tracking 4 Estágios'), enabled: true, desc: translateText('Acompanhamento do preparo') },
      ],
      clientPreview: translateText('O cliente vê: pedido rápido, skip the line e tracking de 4 estágios em tempo real.'),
    },
    { id: 'club', icon: <Music className="h-5 w-5" />, name: 'Club & Balada', desc: translateText('Ingressos, VIP, consumo mínimo'),
      features: [
        { name: translateText('Ingressos QR'), enabled: true, desc: translateText('QR animado anti-fraude') },
        { name: translateText('Mapa VIP'), enabled: true, desc: translateText('Seleção de áreas e mesas') },
        { name: translateText('Consumo Mínimo'), enabled: true, desc: translateText('Tracker em tempo real') },
      ],
      clientPreview: translateText('O cliente vê: ingresso QR animado, mapa VIP e tracker de consumo mínimo.'),
    },
  ];

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const totalFeatures = types.filter(t => selected.includes(t.id)).reduce((a, t) => a + t.features.filter(f => f.enabled).length, 0);

  return (
    <div className="space-y-3">
      <ConfigHeader
        title={translateText('Tipos de Serviço')}
        subtitle={translateText('Selecione os modelos que seu estabelecimento opera')}
        icon={<Utensils className="h-5 w-5 text-secondary" />}
        onBack={() => onNavigate('config-hub')}
        badge={`${selected.length}/11`}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-primary">{selected.length}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Ativos')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-success">{totalFeatures}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Features')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-foreground">11</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Disponíveis')}</p>
        </div>
      </div>

      <InfoBanner text={translateText('Cada tipo ativa automaticamente as features relevantes. Toque para expandir e personalizar.')} tone="info" />

      <div className="space-y-2">
        {types.map(type => {
          const isActive = selected.includes(type.id);
          const isExpanded = expandedType === type.id;
          return (
            <div key={type.id} className={`rounded-2xl border-2 overflow-hidden transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <button
                onClick={() => { toggle(type.id); setExpandedType(isExpanded ? null : type.id); }}
                className="w-full p-3 text-left"
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
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {isExpanded && isActive && (
                <div className="px-3 pb-3 space-y-2">
                  {/* Features toggles */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {type.features.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 border-b border-border last:border-b-0">
                        <div className="flex-1 mr-2">
                          <p className="text-[11px] font-medium text-foreground">{f.name}</p>
                          <p className="text-[9px] text-muted-foreground">{f.desc}</p>
                        </div>
                        {f.enabled
                          ? <ToggleRight className="h-5 w-5 text-primary shrink-0" />
                          : <ToggleLeft className="h-5 w-5 text-muted-foreground shrink-0" />
                        }
                      </div>
                    ))}
                  </div>

                  {/* Client experience preview */}
                  <div className="rounded-xl border border-primary/15 bg-primary/5 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Eye className="h-3 w-3 text-primary" />
                      <p className="text-[9px] font-semibold text-primary">{translateText('Visão do cliente')}</p>
                    </div>
                    <p className="text-[10px] text-foreground/80">{type.clientPreview}</p>
                  </div>
                </div>
              )}
            </div>
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
    smart_seating: true, feedback_post_visit: true,
  });
  const [previewJourney, setPreviewJourney] = useState(false);

  const toggle = (key: string) => setConfig(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));

  const journeySteps = [
    { step: 1, label: translateText('Descoberta'), desc: translateText('Cliente encontra seu restaurante'), icon: <Search className="h-3.5 w-3.5" />, active: true },
    { step: 2, label: translateText('Reserva'), desc: translateText('Reserva ou entra na fila'), icon: <Calendar className="h-3.5 w-3.5" />, active: config.reservations || config.waitlist },
    { step: 3, label: translateText('Chegada'), desc: translateText('Check-in e acomodação'), icon: <MapPin className="h-3.5 w-3.5" />, active: true },
    { step: 4, label: translateText('Cardápio'), desc: translateText('Visualiza e escolhe itens'), icon: <BookOpen className="h-3.5 w-3.5" />, active: true },
    { step: 5, label: translateText('Pedido'), desc: config.qr_ordering ? translateText('Pelo QR Code na mesa') : translateText('Pelo garçom'), icon: <QrCode className="h-3.5 w-3.5" />, active: true },
    { step: 6, label: translateText('Acompanhamento'), desc: translateText('Status em tempo real'), icon: <Timer className="h-3.5 w-3.5" />, active: true },
    { step: 7, label: translateText('Consumo'), desc: translateText('Refeição e experiência'), icon: <Utensils className="h-3.5 w-3.5" />, active: true },
    { step: 8, label: translateText('Conta'), desc: translateText('Transparência em tempo real'), icon: <CreditCard className="h-3.5 w-3.5" />, active: true },
    { step: 9, label: translateText('Pagamento'), desc: translateText('Split, gorjeta, NFC'), icon: <Smartphone className="h-3.5 w-3.5" />, active: true },
    { step: 10, label: translateText('Pós-visita'), desc: translateText('Avaliação e fidelidade'), icon: <Star className="h-3.5 w-3.5" />, active: config.feedback_post_visit },
  ];

  return (
    <div className="space-y-3">
      <ConfigHeader
        title={translateText('Experiência do Cliente')}
        subtitle={translateText('Como seus clientes interagem com o estabelecimento')}
        icon={<Sparkles className="h-5 w-5 text-info" />}
        onBack={() => onNavigate('config-hub')}
        badge="70%"
      />

      {/* Journey visualization toggle */}
      <button onClick={() => setPreviewJourney(!previewJourney)}
        className={`w-full rounded-2xl border p-3 flex items-center gap-3 transition-all ${
          previewJourney ? 'border-primary bg-primary/5' : 'border-border bg-card'
        }`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Play className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-semibold text-foreground">{translateText('Jornada do Cliente')}</p>
          <p className="text-[10px] text-muted-foreground">{translateText('Visualize os 10 passos da experiência')}</p>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${previewJourney ? 'rotate-90' : ''}`} />
      </button>

      {previewJourney && (
        <div className="rounded-2xl border border-primary/20 bg-card p-3 space-y-1.5">
          {journeySteps.map((step, i) => (
            <div key={i} className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${step.active ? '' : 'opacity-40'}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                step.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold text-muted-foreground">{step.step}</span>
                  <p className="text-[11px] font-semibold text-foreground">{step.label}</p>
                </div>
                <p className="text-[9px] text-muted-foreground">{step.desc}</p>
              </div>
              {step.active && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
            </div>
          ))}
        </div>
      )}

      <SectionCard title={translateText('Canais de Entrada')} icon={<Calendar className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Reservas Online')} desc={translateText('Clientes podem reservar pelo app')}
          icon={<Calendar className="h-3 w-3 text-primary" />} value={config.reservations} onChange={() => toggle('reservations')} />
        <ToggleRow label={translateText('Lista de Espera / Fila')} desc={translateText('Fila virtual inteligente')}
          icon={<Users className="h-3 w-3 text-info" />} value={config.waitlist} onChange={() => toggle('waitlist')} />
        <ToggleRow label={translateText('Reserva de Eventos')} desc={translateText('Grupos e eventos especiais')}
          icon={<PartyPopper className="h-3 w-3 text-warning" />} value={config.event_bookings} onChange={() => toggle('event_bookings')} />
      </SectionCard>

      <SectionCard title={translateText('Modelo de Atendimento')} icon={<Utensils className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Atendimento na Mesa')} desc={translateText('Garçom dedicado por mesa')}
          icon={<Users className="h-3 w-3 text-success" />} value={config.table_service} onChange={() => toggle('table_service')} />
        <ToggleRow label={translateText('Pedido por QR Code')} desc={translateText('Cliente escaneia e pede pelo celular')}
          icon={<QrCode className="h-3 w-3 text-primary" />} value={config.qr_ordering} onChange={() => toggle('qr_ordering')} />
        <ToggleRow label={translateText('Atendimento no Balcão')} desc={translateText('Retirada no balcão')}
          icon={<Store className="h-3 w-3 text-warning" />} value={config.counter_service} onChange={() => toggle('counter_service')} />
        <ToggleRow label={translateText('Auto-serviço')} desc={translateText('Cliente se serve sozinho')}
          icon={<Utensils className="h-3 w-3 text-muted-foreground" />} value={config.self_ordering} onChange={() => toggle('self_ordering')} />
      </SectionCard>

      <SectionCard title={translateText('Inteligência')} icon={<Brain className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Alocação inteligente')} desc={translateText('IA sugere melhor mesa')}
          icon={<Sparkles className="h-3 w-3 text-info" />} value={config.smart_seating} onChange={() => toggle('smart_seating')} />
        <ToggleRow label={translateText('Feedback pós-visita')} desc={translateText('Avaliação automática no app')}
          icon={<Star className="h-3 w-3 text-warning" />} value={config.feedback_post_visit} onChange={() => toggle('feedback_post_visit')} />
      </SectionCard>

      {config.reservations && (
        <SectionCard title={translateText('Configurações de Reserva')} icon={<Settings className="h-3.5 w-3.5 text-primary" />} collapsible defaultOpen={false}>
          <NumberRow label={translateText('Antecedência máxima (dias)')} value={config.advance_days} onChange={v => setConfig(p => ({ ...p, advance_days: v }))} />
          <NumberRow label={translateText('Tolerância de atraso (min)')} value={config.grace_period} suffix="min" onChange={v => setConfig(p => ({ ...p, grace_period: v }))} />
          <ToggleRow label={translateText('Exigir depósito')} desc={translateText('Caução na reserva')} value={config.require_deposit} onChange={() => toggle('require_deposit')} />
        </SectionCard>
      )}

      {config.waitlist && (
        <SectionCard title={translateText('Configurações da Fila')} icon={<Clock className="h-3.5 w-3.5 text-primary" />} collapsible defaultOpen={false}>
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
  const [selectedZone, setSelectedZone] = useState<string>('z1');

  const zones = [
    { id: 'z1', name: translateText('Salão Principal'), tables: 8, capacity: 32, color: 'bg-primary/10 text-primary', borderColor: 'border-primary/30' },
    { id: 'z2', name: translateText('Varanda'), tables: 4, capacity: 16, color: 'bg-success/10 text-success', borderColor: 'border-success/30' },
    { id: 'z3', name: translateText('Área VIP'), tables: 3, capacity: 12, color: 'bg-warning/10 text-warning', borderColor: 'border-warning/30' },
    { id: 'z4', name: translateText('Privativo'), tables: 2, capacity: 20, color: 'bg-info/10 text-info', borderColor: 'border-info/30' },
  ];

  const allTables = [
    { id: 't1', number: 1, seats: 2, zone: 'z1', shape: 'round' as const },
    { id: 't2', number: 2, seats: 4, zone: 'z1', shape: 'rect' as const },
    { id: 't3', number: 3, seats: 4, zone: 'z1', shape: 'rect' as const },
    { id: 't4', number: 4, seats: 6, zone: 'z1', shape: 'rect' as const },
    { id: 't5', number: 5, seats: 2, zone: 'z2', shape: 'round' as const },
    { id: 't6', number: 6, seats: 4, zone: 'z2', shape: 'round' as const },
    { id: 't7', number: 7, seats: 8, zone: 'z3', shape: 'long' as const },
    { id: 't8', number: 8, seats: 10, zone: 'z4', shape: 'long' as const },
  ];

  const filteredTables = allTables.filter(t => t.zone === selectedZone);
  const totalCapacity = zones.reduce((a, z) => a + z.capacity, 0);
  const totalTables = zones.reduce((a, z) => a + z.tables, 0);

  return (
    <div className="space-y-3">
      <ConfigHeader
        title={translateText('Mapa do Salão')}
        subtitle={translateText('Gerencie mesas, zonas e áreas')}
        icon={<LayoutGrid className="h-5 w-5 text-warning" />}
        onBack={() => onNavigate('config-hub')}
        badge="60%"
        badgeColor="bg-warning/10 text-warning"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-primary">{totalTables}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Mesas')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-foreground">{zones.length}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Zonas')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-success">{totalCapacity}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Lugares')}</p>
        </div>
      </div>

      {/* Visual mini floor plan */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-foreground">{translateText('Planta Visual')}</p>
          <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold">
            <Edit3 className="h-3 w-3" /> {translateText('Editar')}
          </button>
        </div>
        <div className="relative bg-muted/30 rounded-xl p-3 min-h-[160px] border border-border">
          {/* Zone labels */}
          <div className="absolute top-2 left-2 text-[7px] font-bold text-primary/40">{translateText('SALÃO')}</div>
          <div className="absolute top-2 right-2 text-[7px] font-bold text-success/40">{translateText('VARANDA')}</div>
          <div className="absolute bottom-2 left-2 text-[7px] font-bold text-warning/40">VIP</div>
          <div className="absolute bottom-2 right-2 text-[7px] font-bold text-info/40">{translateText('PRIVATIVO')}</div>
          
          {/* Tables grid */}
          <div className="grid grid-cols-4 gap-2 pt-4">
            {allTables.map(table => {
              const zone = zones.find(z => z.id === table.zone);
              return (
                <div
                  key={table.id}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border bg-card transition-all ${
                    table.zone === selectedZone ? zone?.borderColor + ' shadow-sm' : 'border-border'
                  } ${table.shape === 'long' ? 'col-span-2' : ''}`}
                >
                  <span className="text-sm font-bold text-foreground">{table.number}</span>
                  <span className="text-[8px] text-muted-foreground">{table.seats}p</span>
                  <div className={`h-1 w-4 rounded-full mt-1 ${zone?.color.split(' ')[0]}`} />
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
          <GripVertical className="h-3 w-3" /> {translateText('Arraste para reposicionar (full app)')}
        </p>
      </div>

      {/* Zone filter */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {zones.map(zone => (
          <button key={zone.id} onClick={() => setSelectedZone(zone.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
              selectedZone === zone.id ? `${zone.color} border ${zone.borderColor}` : 'bg-muted text-muted-foreground'
            }`}>
            {zone.name} ({zone.tables})
          </button>
        ))}
      </div>

      {/* Tables in zone */}
      <SectionCard title={`${translateText('Mesas')} — ${zones.find(z => z.id === selectedZone)?.name}`} icon={<LayoutGrid className="h-3.5 w-3.5 text-primary" />}>
        {filteredTables.map(table => (
          <div key={table.id} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm ${
                table.shape === 'round' ? 'rounded-full bg-primary/10 text-primary' :
                table.shape === 'long' ? 'rounded-lg bg-info/10 text-info' : 'bg-warning/10 text-warning'
              }`}>{table.number}</div>
              <div>
                <p className="text-xs font-medium text-foreground">{translateText('Mesa')} {table.number}</p>
                <p className="text-[10px] text-muted-foreground">
                  {table.seats} {translateText('lugares')} · {table.shape === 'round' ? translateText('Redonda') : table.shape === 'long' ? translateText('Longa') : translateText('Retangular')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                <Edit3 className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
        <div className="p-3">
          <button className="flex items-center gap-2 text-xs font-medium text-primary">
            <Plus className="h-3.5 w-3.5" /> {translateText('Adicionar mesa')}
          </button>
        </div>
      </SectionCard>

      {/* Merge / actions */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateText('Ações avançadas')}</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-[10px] font-medium text-foreground">
            <Layers className="h-3 w-3 text-primary" /> {translateText('Juntar mesas')}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-[10px] font-medium text-foreground">
            <Plus className="h-3 w-3 text-success" /> {translateText('Nova zona')}
          </button>
        </div>
      </div>

      <SaveButton />
    </div>
  );
};

// ============ 5. MENU ============

export const ConfigMenu: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [expandedCat, setExpandedCat] = useState<string | null>('pratos');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const categories = [
    { id: 'entradas', name: translateText('Entradas'), items: 8, active: true, icon: <Utensils className="h-3.5 w-3.5" /> },
    { id: 'pratos', name: translateText('Pratos Principais'), items: 12, active: true, icon: <ChefHat className="h-3.5 w-3.5" /> },
    { id: 'sobremesas', name: translateText('Sobremesas'), items: 5, active: true, icon: <Gift className="h-3.5 w-3.5" /> },
    { id: 'bebidas', name: translateText('Bebidas'), items: 15, active: true, icon: <Wine className="h-3.5 w-3.5" /> },
    { id: 'vinhos', name: translateText('Carta de Vinhos'), items: 20, active: true, icon: <Wine className="h-3.5 w-3.5" /> },
  ];

  const sampleItems = [
    { name: 'Sashimi Premium Mix', price: 'R$ 89', time: '12min', allergens: [translateText('Peixe'), translateText('Soja')], active: true, orders: 47, rating: 4.9 },
    { name: 'Wagyu Tataki', price: 'R$ 128', time: '15min', allergens: [translateText('Carne')], active: true, orders: 35, rating: 4.8 },
    { name: 'Temaki Especial', price: 'R$ 42', time: '8min', allergens: [translateText('Peixe'), translateText('Glúten')], active: false, orders: 22, rating: 4.6 },
  ];

  return (
    <div className="space-y-3">
      <ConfigHeader
        title={translateText('Gestão do Cardápio')}
        subtitle={translateText('Categorias, itens, preços e disponibilidade')}
        icon={<BookOpen className="h-5 w-5 text-success" />}
        onBack={() => onNavigate('config-hub')}
        badge="90%"
        badgeColor="bg-success/10 text-success"
      />

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-base font-bold text-foreground">60</p>
          <p className="text-[7px] text-muted-foreground">{translateText('Itens')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-base font-bold text-foreground">5</p>
          <p className="text-[7px] text-muted-foreground">{translateText('Categorias')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-base font-bold text-success">98%</p>
          <p className="text-[7px] text-muted-foreground">{translateText('Ativos')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-base font-bold text-primary">R$78</p>
          <p className="text-[7px] text-muted-foreground">{translateText('Ticket')}</p>
        </div>
      </div>

      {/* Categories */}
      <SectionCard title={translateText('Categorias')} icon={<ArrowUpDown className="h-3.5 w-3.5 text-primary" />}
        action={<button className="text-[10px] text-primary font-medium flex items-center gap-1"><Plus className="h-3 w-3" /></button>}>
        {categories.map(cat => (
          <div key={cat.id}>
            <button
              onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              className="w-full flex items-center justify-between p-3 border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-muted-foreground">{cat.icon}</div>
                <p className="text-xs font-medium text-foreground">{cat.name}</p>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{cat.items}</span>
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCat === cat.id ? 'rotate-90' : ''}`} />
            </button>
            {expandedCat === cat.id && (
              <div className="bg-muted/20">
                {sampleItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 ml-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                      <ChefHat className="h-4 w-4 text-primary/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-[11px] font-semibold ${item.active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{item.name}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">{item.price}</span>
                        <span className="text-[9px] text-muted-foreground">{item.time}</span>
                        <span className="text-[9px] text-muted-foreground">·</span>
                        <Star className="h-2.5 w-2.5 text-warning fill-warning" />
                        <span className="text-[9px] text-muted-foreground">{item.rating}</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {item.allergens.map(a => (
                          <span key={a} className="rounded bg-destructive/10 px-1 py-0.5 text-[7px] font-medium text-destructive">{a}</span>
                        ))}
                      </div>
                    </div>
                    <button>
                      {item.active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                    </button>
                  </div>
                ))}
                <div className="p-2 ml-2">
                  <button className="flex items-center gap-1 text-[10px] font-medium text-primary">
                    <Plus className="h-3 w-3" /> {translateText('Adicionar item')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </SectionCard>

      {/* Advanced config */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateText('Configurações Avançadas')}</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: translateText('Alérgenos'), icon: <AlertTriangle className="h-3 w-3 text-destructive" /> },
            { label: 'Upsell', icon: <TrendingUp className="h-3 w-3 text-success" /> },
            { label: translateText('Horários'), icon: <Clock className="h-3 w-3 text-info" /> },
            { label: translateText('Ingredientes'), icon: <ClipboardList className="h-3 w-3 text-warning" /> },
          ].map(item => (
            <button key={item.label} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-[10px] font-medium text-foreground">
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>

      <ExperiencePreview title={translateText('Cardápio no app')}>
        <div className="flex gap-2 mb-2">
          {categories.slice(0, 3).map(c => (
            <span key={c.id} className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${c.id === 'pratos' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {c.name}
            </span>
          ))}
        </div>
        <div className="space-y-2">
          {sampleItems.filter(i => i.active).slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <ChefHat className="h-3.5 w-3.5 text-primary/40" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold">{item.name}</p>
                <p className="text-[9px] text-primary font-bold">{item.price}</p>
              </div>
              <button className="rounded-full bg-primary/10 p-1">
                <Plus className="h-3 w-3 text-primary" />
              </button>
            </div>
          ))}
        </div>
      </ExperiencePreview>

      <SaveButton />
    </div>
  );
};

// ============ 6. TEAM ============

export const ConfigTeam: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const roles = [
    { role: translateText('Dono'), count: 1, permissions: [translateText('Acesso total'), translateText('Financeiro'), translateText('Configurações'), translateText('Relatórios')], icon: <Crown className="h-4 w-4" />, color: 'text-primary', bg: 'bg-primary/10' },
    { role: translateText('Gerente'), count: 1, permissions: [translateText('Operação'), translateText('Aprovações'), translateText('Equipe'), translateText('Estoque')], icon: <Shield className="h-4 w-4" />, color: 'text-secondary', bg: 'bg-secondary/10' },
    { role: 'Maitre', count: 1, permissions: [translateText('Reservas'), translateText('Mesas'), translateText('Fila'), translateText('Check-in')], icon: <Calendar className="h-4 w-4" />, color: 'text-info', bg: 'bg-info/10' },
    { role: 'Chef', count: 1, permissions: ['KDS', translateText('Cardápio'), translateText('Estoque cozinha'), translateText('Fichas técnicas')], icon: <ChefHat className="h-4 w-4" />, color: 'text-warning', bg: 'bg-warning/10' },
    { role: 'Barman', count: 1, permissions: ['KDS Bar', translateText('Receitas'), translateText('Estoque bar')], icon: <Wine className="h-4 w-4" />, color: 'text-accent-foreground', bg: 'bg-accent/10' },
    { role: translateText('Cozinheiro'), count: 2, permissions: [translateText('Estação de preparo'), translateText('Tickets')], icon: <Flame className="h-4 w-4" />, color: 'text-destructive', bg: 'bg-destructive/10' },
    { role: translateText('Garçom'), count: 3, permissions: [translateText('Mesas'), translateText('Pedidos'), translateText('Cobrar'), translateText('Gorjetas')], icon: <Utensils className="h-4 w-4" />, color: 'text-success', bg: 'bg-success/10' },
  ];

  const staff = [
    { name: 'Ricardo Alves', role: translateText('Dono'), status: 'online' as const, shift: 'Integral', avatar: 'RA' },
    { name: 'Marina Costa', role: translateText('Gerente'), status: 'online' as const, shift: '14h-23h', avatar: 'MC' },
    { name: 'Felipe Santos', role: 'Chef', status: 'online' as const, shift: '15h-23h', avatar: 'FS' },
    { name: 'Ana Rodrigues', role: 'Sommelier', status: 'online' as const, shift: '18h-00h', avatar: 'AR' },
    { name: 'Bruno Oliveira', role: translateText('Garçom'), status: 'online' as const, shift: '18h-00h', avatar: 'BO' },
    { name: 'Carla Lima', role: translateText('Garçom'), status: 'break' as const, shift: '12h-18h', avatar: 'CL' },
    { name: 'Diego Martins', role: 'Barman', status: 'offline' as const, shift: translateText('Folga'), avatar: 'DM' },
  ];

  return (
    <div className="space-y-3">
      <ConfigHeader
        title={translateText('Equipe & Permissões')}
        subtitle={translateText('Gerencie cargos, escalas e acessos')}
        icon={<Users className="h-5 w-5 text-accent-foreground" />}
        onBack={() => onNavigate('config-hub')}
        badge={`${staff.length} ${translateText('membros')}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-success">{staff.filter(s => s.status === 'online').length}</p>
          <p className="text-[8px] text-muted-foreground">Online</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-warning">{staff.filter(s => s.status === 'break').length}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Pausa')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-muted-foreground">{staff.filter(s => s.status === 'offline').length}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Folga')}</p>
        </div>
      </div>

      {/* Roles overview with expandable permissions */}
      <SectionCard title={translateText('Cargos e Permissões')} icon={<Shield className="h-3.5 w-3.5 text-primary" />}>
        {roles.map((r, i) => (
          <div key={i}>
            <button onClick={() => setExpandedRole(expandedRole === r.role ? null : r.role)}
              className="w-full flex items-center gap-3 p-3 border-b border-border last:border-b-0 text-left">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${r.bg} ${r.color}`}>{r.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground">{r.role}</p>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{r.count}</span>
                </div>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expandedRole === r.role ? 'rotate-90' : ''}`} />
            </button>
            {expandedRole === r.role && (
              <div className="px-3 pb-2 ml-11">
                <div className="flex flex-wrap gap-1">
                  {r.permissions.map(p => (
                    <span key={p} className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </SectionCard>

      {/* Staff list */}
      <SectionCard title={translateText('Membros da Equipe')} icon={<Users className="h-3.5 w-3.5 text-primary" />}
        action={<button className="text-[10px] text-primary font-medium flex items-center gap-1"><Plus className="h-3 w-3" /> {translateText('Novo')}</button>}>
        {staff.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary relative">
              {s.avatar}
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
                s.status === 'online' ? 'bg-success' : s.status === 'break' ? 'bg-warning' : 'bg-muted'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">{s.name}</p>
              <p className="text-[10px] text-muted-foreground">{s.role} · {s.shift}</p>
            </div>
            <Edit3 className="h-3 w-3 text-muted-foreground/40" />
          </div>
        ))}
      </SectionCard>

      {/* Shift preview */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateText('Escala de Hoje')}</p>
        <div className="space-y-1.5">
          {['11h', '14h', '15h', '18h'].map((hour, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted-foreground w-6">{hour}</span>
              <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden flex gap-0.5">
                {staff.filter(s => s.status !== 'offline').slice(0, i + 2).map((s, j) => (
                  <div key={j} className="h-full bg-primary/30 rounded-full flex-1" title={s.name} />
                ))}
              </div>
              <span className="text-[8px] text-muted-foreground">{Math.min(staff.length, i + 2)}</span>
            </div>
          ))}
        </div>
      </div>

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
    fire_order: true, batch_cooking: false,
  });

  const stations = [
    { name: translateText('Grill / Chapa'), items: translateText('Carnes, grelhados'), kds: 'KDS 1', color: 'bg-destructive/10 text-destructive', active: true, avgTime: '12min' },
    { name: translateText('Frios / Ceviche'), items: translateText('Sashimi, saladas'), kds: 'KDS 1', color: 'bg-info/10 text-info', active: true, avgTime: '8min' },
    { name: translateText('Confeitaria'), items: translateText('Sobremesas'), kds: 'KDS 2', color: 'bg-warning/10 text-warning', active: true, avgTime: '15min' },
    { name: translateText('Bar Principal'), items: translateText('Drinks e cocktails'), kds: 'KDS Bar', color: 'bg-primary/10 text-primary', active: true, avgTime: '4min' },
  ];

  return (
    <div className="space-y-3">
      <ConfigHeader
        title={translateText('Cozinha & Bar')}
        subtitle={translateText('Estações, KDS e fluxo operacional')}
        icon={<ChefHat className="h-5 w-5 text-destructive" />}
        onBack={() => onNavigate('config-hub')}
        badge="50%"
        badgeColor="bg-warning/10 text-warning"
      />

      {/* Visual station flow */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateText('Fluxo de Produção')}</p>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-info" />
            </div>
            <span className="text-[7px] font-medium text-muted-foreground">{translateText('Pedido')}</span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Monitor className="h-4 w-4 text-warning" />
            </div>
            <span className="text-[7px] font-medium text-muted-foreground">KDS</span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Flame className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-[7px] font-medium text-muted-foreground">{translateText('Estação')}</span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <span className="text-[7px] font-medium text-muted-foreground">{translateText('Pronto')}</span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[7px] font-medium text-muted-foreground">{translateText('Entregue')}</span>
          </div>
        </div>
      </div>

      <SectionCard title={translateText('Estações de Preparo')} icon={<Flame className="h-3.5 w-3.5 text-primary" />}
        action={<button className="text-[10px] text-primary font-medium flex items-center gap-1"><Plus className="h-3 w-3" /></button>}>
        {stations.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>
              {s.name.includes('Bar') ? <Wine className="h-4 w-4" /> : <ChefHat className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-foreground">{s.name}</p>
              <p className="text-[9px] text-muted-foreground">{s.items} · {s.kds}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-foreground">{s.avgTime}</span>
              <p className="text-[8px] text-muted-foreground">{translateText('média')}</p>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title={translateText('Configurações KDS')} icon={<Monitor className="h-3.5 w-3.5 text-primary" />}>
        <NumberRow label={translateText('Telas KDS')} value={config.kds_screens} onChange={v => setConfig(p => ({ ...p, kds_screens: v }))} />
        <NumberRow label={translateText('Tempo padrão (min)')} value={config.default_prep_time} suffix="min" onChange={v => setConfig(p => ({ ...p, default_prep_time: v }))} />
        <ToggleRow label={translateText('Roteamento automático')} desc={translateText('Enviar itens para estação correta')}
          icon={<RefreshCw className="h-3 w-3 text-primary" />} value={config.auto_routing} onChange={() => setConfig(p => ({ ...p, auto_routing: !p.auto_routing }))} />
        <ToggleRow label={translateText('Alertas de prioridade')} desc={translateText('Notificar itens atrasados')}
          icon={<Bell className="h-3 w-3 text-destructive" />} value={config.priority_alerts} onChange={() => setConfig(p => ({ ...p, priority_alerts: !p.priority_alerts }))} />
      </SectionCard>

      <SectionCard title={translateText('Modo de Preparo')} icon={<Settings className="h-3.5 w-3.5 text-primary" />} collapsible defaultOpen={false}>
        <ToggleRow label={translateText('Fire Order')} desc={translateText('Chef controla quando iniciar cada prato')}
          value={config.fire_order} onChange={() => setConfig(p => ({ ...p, fire_order: !p.fire_order }))} />
        <ToggleRow label={translateText('Batch Cooking')} desc={translateText('Agrupar itens iguais para preparo simultâneo')}
          value={config.batch_cooking} onChange={() => setConfig(p => ({ ...p, batch_cooking: !p.batch_cooking }))} />
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

  const paymentMethods = [
    { key: 'credit', label: translateText('Crédito'), icon: <CreditCard className="h-4 w-4" />, color: 'bg-primary/10 text-primary' },
    { key: 'debit', label: translateText('Débito'), icon: <CreditCard className="h-4 w-4" />, color: 'bg-info/10 text-info' },
    { key: 'pix', label: 'PIX', icon: <QrCode className="h-4 w-4" />, color: 'bg-success/10 text-success' },
    { key: 'apple_pay', label: 'Apple Pay', icon: <Smartphone className="h-4 w-4" />, color: 'bg-foreground/10 text-foreground' },
    { key: 'google_pay', label: 'Google Pay', icon: <Smartphone className="h-4 w-4" />, color: 'bg-warning/10 text-warning' },
    { key: 'tap_to_pay', label: 'TAP to Pay', icon: <Fingerprint className="h-4 w-4" />, color: 'bg-accent/10 text-accent-foreground' },
  ];

  return (
    <div className="space-y-3">
      <ConfigHeader
        title={translateText('Pagamentos')}
        subtitle={translateText('Taxa, gorjeta, split e métodos aceitos')}
        icon={<CreditCard className="h-5 w-5 text-primary" />}
        onBack={() => onNavigate('config-hub')}
        badge="80%"
      />

      {/* Payment methods as visual cards */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateText('Métodos Aceitos')}</p>
        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map(m => {
            const isActive = config[m.key as keyof typeof config] as boolean;
            return (
              <button key={m.key} onClick={() => toggle(m.key)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
                  isActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 opacity-50'
                }`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.color}`}>{m.icon}</div>
                <span className="text-[9px] font-semibold text-foreground">{m.label}</span>
                {isActive && <Check className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      <SectionCard title={translateText('Taxa de Serviço')} icon={<Percent className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Taxa de serviço')} desc={translateText('Incluir automaticamente na conta')}
          icon={<Percent className="h-3 w-3 text-primary" />} value={config.service_charge} onChange={() => toggle('service_charge')} />
        {config.service_charge && (
          <NumberRow label={translateText('Percentual')} value={config.service_pct} suffix="%" onChange={v => setConfig(p => ({ ...p, service_pct: v }))} />
        )}
      </SectionCard>

      <SectionCard title={translateText('Gorjetas')} icon={<Heart className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Sistema de gorjetas')} desc={translateText('Sugerir gorjeta no fechamento')}
          icon={<Heart className="h-3 w-3 text-destructive" />} value={config.tips_enabled} onChange={() => toggle('tips_enabled')} />
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
        <ToggleRow label={translateText('Individual')} desc={translateText('Cada um paga o seu')}
          icon={<Users className="h-3 w-3 text-primary" />} value={config.split_individual} onChange={() => toggle('split_individual')} />
        <ToggleRow label={translateText('Dividir igualmente')} desc={translateText('Total dividido por todos')}
          icon={<Users className="h-3 w-3 text-info" />} value={config.split_equal} onChange={() => toggle('split_equal')} />
        <ToggleRow label={translateText('Por item')} desc={translateText('Selecionar itens para pagar')}
          icon={<ClipboardList className="h-3 w-3 text-warning" />} value={config.split_by_item} onChange={() => toggle('split_by_item')} />
        <ToggleRow label={translateText('Valor fixo')} desc={translateText('Escolher quanto pagar')}
          icon={<DollarSign className="h-3 w-3 text-success" />} value={config.split_fixed} onChange={() => toggle('split_fixed')} />
      </SectionCard>

      <ExperiencePreview title={translateText('Tela de pagamento')}>
        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-foreground">R$ 342,00</p>
          <p className="text-[10px] text-muted-foreground">{translateText('Taxa de serviço')}: R$ 34,20 (10%)</p>
          <div className="flex justify-center gap-1.5">
            {config.tip_percentages.map(pct => (
              <span key={pct} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${pct === 15 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {pct}%
              </span>
            ))}
          </div>
          <div className="flex gap-1.5 justify-center">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">PIX</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">{translateText('Crédito')}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">Apple Pay</span>
          </div>
        </div>
      </ExperiencePreview>

      <SaveButton />
    </div>
  );
};

// ============ 9. FEATURE MARKETPLACE ============

export const ConfigFeatures: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const [active, setActive] = useState<string[]>(['loyalty', 'ai_recs']);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'loyalty', icon: <Award className="h-5 w-5" />, name: translateText('Programa de Fidelidade'),
      desc: translateText('Pontos, recompensas e leaderboard'), tier: 'Premium', color: 'from-primary to-accent',
      details: translateText('Clientes acumulam pontos a cada visita. Leaderboard mensal. Recompensas personalizáveis. Integrado ao perfil do cliente no app.'),
    },
    {
      id: 'events', icon: <PartyPopper className="h-5 w-5" />, name: translateText('Gestão de Eventos'),
      desc: translateText('Eventos, ingressos e check-in'), tier: 'Pro', color: 'from-secondary to-secondary/80',
      details: translateText('Crie eventos com ingressos, controle capacidade, check-in por QR Code e métricas pós-evento.'),
    },
    {
      id: 'happy_hour', icon: <Clock className="h-5 w-5" />, name: 'Happy Hour',
      desc: translateText('Preços automáticos por horário'), tier: translateText('Grátis'), color: 'from-success to-success/80',
      details: translateText('Configure horários especiais com preços automaticamente ajustados. O cliente vê o contador regressivo no app.'),
    },
    {
      id: 'ai_recs', icon: <Brain className="h-5 w-5" />, name: translateText('IA de Recomendações'),
      desc: translateText('Sugestões inteligentes e harmonização'), tier: 'Premium', color: 'from-info to-info/80',
      details: translateText('IA analisa preferências, histórico e sazonalidade para sugerir pratos e harmonizações personalizadas a cada cliente.'),
    },
    {
      id: 'vip', icon: <Crown className="h-5 w-5" />, name: translateText('Programa VIP'),
      desc: translateText('Áreas exclusivas e benefícios'), tier: 'Pro', color: 'from-warning to-warning/80',
      details: translateText('Crie tiers VIP (Silver, Gold, Platinum) com benefícios exclusivos: reserva prioritária, área especial, descontos.'),
    },
    {
      id: 'experience', icon: <Gift className="h-5 w-5" />, name: translateText('Pacotes de Experiência'),
      desc: translateText('Combos e experiências gastronômicas'), tier: translateText('Grátis'), color: 'from-accent to-accent/80',
      details: translateText('Pacotes que combinam menu, drinks e experiência. Ideal para aniversários, datas especiais e presentes.'),
    },
    {
      id: 'reviews', icon: <Star className="h-5 w-5" />, name: translateText('Avaliações Inteligentes'),
      desc: translateText('Feedback automático pós-visita'), tier: translateText('Grátis'), color: 'from-primary to-primary/80',
      details: translateText('Avaliação enviada automaticamente após o pagamento. Insights de NPS, satisfação por prato e sugestões.'),
    },
    {
      id: 'analytics_ai', icon: <TrendingUp className="h-5 w-5" />, name: translateText('Analytics Avançado'),
      desc: translateText('Previsões, tendências e insights por IA'), tier: 'Premium', color: 'from-destructive to-destructive/80',
      details: translateText('Dashboard com previsão de demanda, otimização de cardápio por margem, análise de churn e recomendações de pricing.'),
    },
  ];

  const toggle = (id: string) => setActive(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const tierColors: Record<string, string> = {
    'Premium': 'bg-primary/10 text-primary',
    'Pro': 'bg-secondary/10 text-secondary',
  };

  return (
    <div className="space-y-3">
      <ConfigHeader
        title={translateText('Marketplace de Features')}
        subtitle={translateText('Ative módulos avançados para seu negócio')}
        icon={<Zap className="h-5 w-5 text-warning" />}
        onBack={() => onNavigate('config-hub')}
        badge={`${active.length} ${translateText('ativos')}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-center">
          <p className="text-lg font-bold text-primary">{active.length}</p>
          <p className="text-[8px] text-muted-foreground font-medium">{translateText('Ativos')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">{features.length}</p>
          <p className="text-[8px] text-muted-foreground font-medium">{translateText('Disponíveis')}</p>
        </div>
        <div className="rounded-xl border border-success/20 bg-success/5 p-2.5 text-center">
          <p className="text-lg font-bold text-success">3</p>
          <p className="text-[8px] text-muted-foreground font-medium">{translateText('Grátis')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {features.map(feat => {
          const isActive = active.includes(feat.id);
          const isExpanded = expandedFeature === feat.id;
          const tierColor = tierColors[feat.tier] || 'bg-success/10 text-success';

          return (
            <div key={feat.id} className={`rounded-2xl border-2 overflow-hidden transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex items-center gap-3 p-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} text-primary-foreground shrink-0`}>
                  {feat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">{feat.name}</p>
                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${tierColor}`}>{feat.tier}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{feat.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => setExpandedFeature(isExpanded ? null : feat.id)} className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center">
                    <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  <button onClick={() => toggle(feat.id)}>
                    {isActive ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                    <p className="text-[10px] text-foreground leading-relaxed">{feat.details}</p>
                  </div>
                  {isActive && (
                    <div className="rounded-xl border border-success/20 bg-success/5 p-2 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      <p className="text-[9px] text-success font-medium">{translateText('Módulo ativo e operacional')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
