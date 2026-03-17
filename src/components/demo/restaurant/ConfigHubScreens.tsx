/**
 * Restaurant Configuration Hub v3 — Full CRUD Interactive Control Center
 * 9 modular config screens with complete Create/Read/Update/Delete operations
 */
import React, { useState, useCallback } from 'react';
import {
  Store, Clock, Globe, Camera, MapPin, Phone, Link2,
  Settings, Check, ChevronRight, ChevronLeft, ToggleRight, ToggleLeft,
  Utensils, Users, CreditCard, Sparkles, LayoutGrid, ChefHat, Wine,
  Star, Crown, Coffee, Truck, Car, Flame, BookOpen,
  Plus, Minus, Calendar, Bell, Shield, DollarSign, Percent,
  Smartphone, QrCode, ClipboardList, Timer, Heart,
  Zap, Gift, PartyPopper, Brain, TrendingUp, Award, Music,
  Eye, ArrowUpDown, GripVertical, X, Edit3, AlertTriangle,
  Play, CheckCircle2, CircleDot, ArrowRight, Lock,
  Monitor, Layers, Tag, Image, RefreshCw,
  MessageSquare, Fingerprint, Trash2, Save, Copy
} from 'lucide-react';
import { useDemoI18n } from '@/components/demo/DemoI18n';

/* ═══════════════════════════════════════════════════════════
   SHARED CRUD COMPONENTS
   ═══════════════════════════════════════════════════════════ */

// ── Toast ──
const Toast: React.FC<{ message: string; type?: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type = 'success', onClose }) => {
  const colors = { success: 'bg-success text-success-foreground', error: 'bg-destructive text-destructive-foreground', info: 'bg-info text-info-foreground' };
  const icons = { success: <Check className="h-4 w-4" />, error: <X className="h-4 w-4" />, info: <Bell className="h-4 w-4" /> };
  React.useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 left-4 right-4 z-50 ${colors[type]} rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2`}>
      {icons[type]}
      <span className="text-[11px] font-semibold flex-1">{message}</span>
      <button onClick={onClose}><X className="h-3 w-3 opacity-70" /></button>
    </div>
  );
};

const useToast = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type }), []);
  const el = toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null;
  return { show, el };
};

// ── Modal ──
const Modal: React.FC<{
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[375px] max-h-[80vh] bg-card rounded-t-3xl border border-border shadow-2xl overflow-y-auto animate-in slide-in-from-bottom-4">
        <div className="sticky top-0 bg-card z-10 px-4 pt-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">{title}</h3>
            <button onClick={onClose} className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// ── Confirm Dialog ──
const ConfirmDialog: React.FC<{
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
}> = ({ open, onClose, onConfirm, title, message }) => {
  const { translateText } = useDemoI18n();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[320px] bg-card rounded-2xl border border-border shadow-2xl p-4 animate-in zoom-in-95">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl bg-muted px-3 py-2.5 text-xs font-semibold text-foreground">
            {translateText('Cancelar')}
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 rounded-xl bg-destructive px-3 py-2.5 text-xs font-semibold text-destructive-foreground">
            {translateText('Excluir')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Form Field ──
const FormField: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
}> = ({ label, value, onChange, placeholder, type = 'text', options }) => (
  <div className="mb-3">
    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
    {type === 'select' && options ? (
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
    )}
  </div>
);

// ── Shared UI Primitives ──
const ConfigHeader: React.FC<{
  title: string; subtitle: string; icon: React.ReactNode; onBack: () => void;
  badge?: string; badgeColor?: string;
}> = ({ title, subtitle, icon, onBack, badge, badgeColor = 'bg-primary/10 text-primary' }) => (
  <div className="flex items-center gap-3 mb-4">
    <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/80 active:scale-95 transition-transform">
      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
    </button>
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">{icon}</div>
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
}> = ({ label, desc, value, onChange, icon }) => (
  <div className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
    <div className="flex items-center gap-2.5 flex-1 mr-3">
      {icon && <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted shrink-0">{icon}</div>}
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
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
      <button onClick={() => onChange(Math.max(0, value - 1))} className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center active:scale-90 transition-transform"><Minus className="h-3 w-3" /></button>
      <span className="text-xs font-semibold min-w-[40px] text-center">{value}{suffix}</span>
      <button onClick={() => onChange(value + 1)} className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center active:scale-90 transition-transform"><Plus className="h-3 w-3" /></button>
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

const ExperiencePreview: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const { translateText } = useDemoI18n();
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Eye className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] font-semibold text-primary">{translateText('Pré-visualização do Cliente')}: {title}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-3">{children}</div>
    </div>
  );
};

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

/* ═══════════════════════════════════════════════════════════
   CONFIG HUB — MAIN SCREEN
   ═══════════════════════════════════════════════════════════ */

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
      <div className="rounded-2xl bg-gradient-to-br from-foreground/95 to-foreground/80 p-4 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-8 translate-x-8" />
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
          <button onClick={() => setShowGuide(false)} className="shrink-0"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
        </div>
      )}

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

      <div className="space-y-2">
        {modules.map(mod => (
          <button key={mod.id} onClick={() => onNavigate(mod.id)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border bg-card text-left transition-all active:scale-[0.98] hover:border-primary/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">{mod.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-xs font-semibold text-foreground">{mod.label}</p>
                <span className={statusColor[mod.status]}>{statusIcon[mod.status]}</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{mod.desc}</p>
              <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden w-full">
                <div className={`h-full rounded-full transition-all ${mod.progress === 100 ? 'bg-success' : mod.progress >= 70 ? 'bg-primary' : 'bg-warning'}`} style={{ width: `${mod.progress}%` }} />
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateText('Ações Rápidas')}</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { screen: 'config-profile', icon: <Image className="h-3.5 w-3.5 text-primary" />, label: translateText('Atualizar fotos') },
            { screen: 'config-menu', icon: <Tag className="h-3.5 w-3.5 text-success" />, label: translateText('Editar preços') },
            { screen: 'config-team', icon: <Users className="h-3.5 w-3.5 text-info" />, label: translateText('Escalar equipe') },
            { screen: 'config-floor', icon: <LayoutGrid className="h-3.5 w-3.5 text-warning" />, label: translateText('Ajustar mesas') },
          ].map(a => (
            <button key={a.screen} onClick={() => onNavigate(a.screen)} className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 text-left">
              {a.icon}<span className="text-[10px] font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   1. PROFILE — Full CRUD with inline editing
   ═══════════════════════════════════════════════════════════ */

export const ConfigProfile: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState<'info' | 'hours' | 'contact'>('info');
  const [profile, setProfile] = useState({
    name: 'Omakase Sushi', desc: 'Experiência autêntica japonesa com ingredientes premium importados',
    cnpj: '12.345.678/0001-90', cuisine: 'Japonesa, Contemporânea', priceRange: '$$$$', capacity: '48',
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hours, setHours] = useState([
    { id: 'h1', day: 'Segunda', open: '18:00', close: '23:00', active: true },
    { id: 'h2', day: 'Terça', open: '18:00', close: '23:00', active: true },
    { id: 'h3', day: 'Quarta', open: '18:00', close: '23:00', active: true },
    { id: 'h4', day: 'Quinta', open: '18:00', close: '23:00', active: true },
    { id: 'h5', day: 'Sexta', open: '18:00', close: '00:00', active: true },
    { id: 'h6', day: 'Sábado', open: '18:00', close: '00:00', active: true },
    { id: 'h7', day: 'Domingo', open: '12:00', close: '16:00', active: true },
  ]);
  const [contacts, setContacts] = useState([
    { id: 'c1', type: 'Telefone', value: '(11) 3456-7890' },
    { id: 'c2', type: 'WhatsApp', value: '(11) 99876-5432' },
    { id: 'c3', type: 'Website', value: 'omakase.com.br' },
  ]);
  const [socials, setSocials] = useState([
    { id: 's1', label: 'Instagram', value: '@omakasesushi', connected: true },
    { id: 's2', label: 'Facebook', value: '/omakasesushi', connected: true },
    { id: 's3', label: 'TikTok', value: '', connected: false },
    { id: 's4', label: 'Google Business', value: 'Verificado', connected: true },
  ]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ type: 'Telefone', value: '' });
  const [editHour, setEditHour] = useState<string | null>(null);

  const startEdit = (field: string, currentValue: string) => { setEditingField(field); setEditValue(currentValue); };
  const saveEdit = (field: string) => {
    setProfile(p => ({ ...p, [field]: editValue }));
    setEditingField(null);
    toast.show(translateText('Campo atualizado com sucesso!'));
  };

  const profileFields = [
    { key: 'name', label: translateText('Nome'), value: profile.name },
    { key: 'desc', label: translateText('Descrição'), value: profile.desc },
    { key: 'cnpj', label: 'CNPJ', value: profile.cnpj },
    { key: 'cuisine', label: translateText('Tipo de Cozinha'), value: profile.cuisine },
    { key: 'priceRange', label: translateText('Faixa de Preço'), value: profile.priceRange },
    { key: 'capacity', label: translateText('Capacidade'), value: profile.capacity + ' ' + translateText('lugares') },
  ];

  return (
    <div className="space-y-3 relative">
      {toast.el}
      <ConfigHeader title={translateText('Perfil do Restaurante')} subtitle={translateText('Identidade do seu estabelecimento')}
        icon={<Store className="h-5 w-5 text-primary" />} onBack={() => onNavigate('config-hub')} badge="85%" />

      <div className="flex bg-muted/30 rounded-xl p-0.5">
        {[
          { id: 'info' as const, label: translateText('Info') },
          { id: 'hours' as const, label: translateText('Horários') },
          { id: 'contact' as const, label: translateText('Contato') },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-semibold transition-all ${activeSection === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'info' && (
        <>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 relative flex items-end justify-between p-3">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card/90 backdrop-blur-sm text-[10px] font-medium shadow-sm">
                <Camera className="h-3 w-3" /> {translateText('Alterar banner')}
              </button>
            </div>
            <div className="-mt-7 ml-4 flex items-end gap-3 pb-3">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border-2 border-card flex items-center justify-center shadow-lg relative">
                <Store className="h-6 w-6 text-primary" />
                <button className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Camera className="h-2.5 w-2.5 text-primary-foreground" />
                </button>
              </div>
              <div className="mb-1">
                <p className="text-sm font-bold text-foreground">{profile.name}</p>
                <p className="text-[10px] text-muted-foreground">Fine Dining · {profile.cuisine}</p>
              </div>
            </div>
          </div>

          <SectionCard title={translateText('Informações Básicas')} icon={<Edit3 className="h-3.5 w-3.5 text-primary" />}>
            {profileFields.map(f => (
              <div key={f.key} className="p-3 border-b border-border last:border-b-0">
                {editingField === f.key ? (
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground">{f.label}</label>
                    <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                      className="w-full rounded-lg border border-primary/30 bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(f.key)} className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-[10px] font-semibold text-primary-foreground flex items-center justify-center gap-1">
                        <Check className="h-3 w-3" /> {translateText('Salvar')}
                      </button>
                      <button onClick={() => setEditingField(null)} className="rounded-lg bg-muted px-3 py-1.5 text-[10px] font-semibold text-muted-foreground">
                        {translateText('Cancelar')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => startEdit(f.key, profile[f.key as keyof typeof profile])}>
                    <p className="text-[10px] text-muted-foreground">{f.label}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-foreground text-right max-w-[55%] truncate">{f.value}</p>
                      <Edit3 className="h-3 w-3 text-primary/40" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </SectionCard>
        </>
      )}

      {activeSection === 'hours' && (
        <SectionCard title={translateText('Horários de Funcionamento')} icon={<Clock className="h-3.5 w-3.5 text-primary" />}>
          {hours.map(h => (
            <div key={h.id} className="p-2.5 border-b border-border last:border-b-0">
              {editHour === h.id ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-foreground">{translateText(h.day)}</p>
                  <div className="flex items-center gap-2">
                    <input value={h.open} onChange={e => setHours(prev => prev.map(x => x.id === h.id ? { ...x, open: e.target.value } : x))}
                      className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <span className="text-muted-foreground text-xs">–</span>
                    <input value={h.close} onChange={e => setHours(prev => prev.map(x => x.id === h.id ? { ...x, close: e.target.value } : x))}
                      className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditHour(null); toast.show(translateText('Horário atualizado!')); }}
                      className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-[10px] font-semibold text-primary-foreground"><Check className="h-3 w-3 inline mr-1" />{translateText('Salvar')}</button>
                    <button onClick={() => setHours(prev => prev.map(x => x.id === h.id ? { ...x, active: !x.active } : x))}
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-semibold ${h.active ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                      {h.active ? translateText('Fechar') : translateText('Abrir')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setEditHour(h.id)}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${h.active ? 'bg-success' : 'bg-muted'}`} />
                    <p className="text-[11px] font-medium text-foreground">{translateText(h.day)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${h.active ? 'text-primary' : 'text-muted-foreground line-through'}`}>
                      {h.active ? `${h.open} - ${h.close}` : translateText('Fechado')}
                    </span>
                    <Edit3 className="h-3 w-3 text-primary/40" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </SectionCard>
      )}

      {activeSection === 'contact' && (
        <>
          <SectionCard title={translateText('Contatos')} icon={<Phone className="h-3.5 w-3.5 text-primary" />}
            action={<button onClick={() => setShowAddContact(true)} className="text-[10px] text-primary font-medium flex items-center gap-1"><Plus className="h-3 w-3" />{translateText('Novo')}</button>}>
            {contacts.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary"><Phone className="h-3 w-3" /></div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">{c.type}</p>
                  <p className="text-xs font-medium text-foreground">{c.value}</p>
                </div>
                <button onClick={() => { setContacts(prev => prev.filter(x => x.id !== c.id)); toast.show(translateText('Contato removido'), 'info'); }}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive/50" />
                </button>
              </div>
            ))}
          </SectionCard>

          <SectionCard title={translateText('Redes Sociais')} icon={<Link2 className="h-3.5 w-3.5 text-primary" />}>
            {socials.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 border-b border-border last:border-b-0">
                <p className="text-xs font-medium text-foreground">{s.label}</p>
                {s.connected ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-primary font-medium">{s.value}</span>
                    <button onClick={() => { setSocials(prev => prev.map(x => x.id === s.id ? { ...x, connected: false, value: '' } : x)); toast.show(translateText('Desconectado'), 'info'); }}>
                      <X className="h-3 w-3 text-destructive/40" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setSocials(prev => prev.map(x => x.id === s.id ? { ...x, connected: true, value: '@omakase' } : x)); toast.show(translateText('Conectado com sucesso!')); }}
                    className="text-[10px] text-primary font-medium">{translateText('Conectar')}</button>
                )}
              </div>
            ))}
          </SectionCard>

          <Modal open={showAddContact} onClose={() => setShowAddContact(false)} title={translateText('Novo Contato')}>
            <FormField label={translateText('Tipo')} value={newContact.type} onChange={v => setNewContact(p => ({ ...p, type: v }))}
              type="select" options={[{ value: 'Telefone', label: translateText('Telefone') }, { value: 'WhatsApp', label: 'WhatsApp' }, { value: 'Email', label: 'Email' }]} />
            <FormField label={translateText('Valor')} value={newContact.value} onChange={v => setNewContact(p => ({ ...p, value: v }))} placeholder="(11) 9999-9999" />
            <button onClick={() => {
              if (!newContact.value.trim()) return;
              setContacts(prev => [...prev, { id: `c${Date.now()}`, ...newContact }]);
              setNewContact({ type: 'Telefone', value: '' }); setShowAddContact(false);
              toast.show(translateText('Contato adicionado!'));
            }} className="w-full rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground mt-2">
              {translateText('Adicionar Contato')}
            </button>
          </Modal>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   2. SERVICE TYPES — Toggle with feature details
   ═══════════════════════════════════════════════════════════ */

export const ConfigServiceTypes: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>(['fine_dining']);
  const [expandedType, setExpandedType] = useState<string | null>('fine_dining');
  const [featureStates, setFeatureStates] = useState<Record<string, Record<number, boolean>>>({});

  const types = [
    { id: 'fine_dining', icon: <Crown className="h-5 w-5" />, name: 'Fine Dining', desc: translateText('Reservas, sommelier, harmonização'), features: [translateText('Reservas Online'), 'Wine Pairing', 'Sommelier', 'Split por Item', 'Course-by-Course'] },
    { id: 'casual_dining', icon: <Utensils className="h-5 w-5" />, name: 'Casual Dining', desc: translateText('Waitlist, família, grupos'), features: ['Smart Waitlist', translateText('Modo Família'), translateText('Grupos')] },
    { id: 'fast_casual', icon: <Flame className="h-5 w-5" />, name: 'Fast Casual', desc: translateText('Montador de pratos, alérgenos'), features: ['Dish Builder', translateText('Alérgenos'), translateText('Nutricional')] },
    { id: 'cafe_bakery', icon: <Coffee className="h-5 w-5" />, name: translateText('Café & Padaria'), desc: translateText('Work mode, refill, Wi-Fi'), features: ['Work Mode', 'Refill', 'Wi-Fi'] },
    { id: 'buffet', icon: <ClipboardList className="h-5 w-5" />, name: 'Buffet', desc: translateText('Balança inteligente, NFC'), features: [translateText('Balança Inteligente'), 'NFC', 'Self-service'] },
    { id: 'pub_bar', icon: <Wine className="h-5 w-5" />, name: 'Pub & Bar', desc: translateText('Comanda digital, rounds'), features: [translateText('Comanda Digital'), 'Round Builder', translateText('Consumo Mínimo')] },
    { id: 'drive_thru', icon: <Car className="h-5 w-5" />, name: 'Drive-Thru', desc: translateText('Geofencing, preparo antecipado'), features: ['GPS 500m', translateText('Preparo Automático')] },
    { id: 'food_truck', icon: <Truck className="h-5 w-5" />, name: 'Food Truck', desc: translateText('Mapa em tempo real, fila virtual'), features: [translateText('Mapa GPS'), translateText('Fila Virtual')] },
    { id: 'chefs_table', icon: <Star className="h-5 w-5" />, name: "Chef's Table", desc: translateText('Menu degustação, notas do chef'), features: ['Course-by-Course', 'Sommelier Notes'] },
    { id: 'quick_service', icon: <Zap className="h-5 w-5" />, name: 'Quick Service', desc: translateText('Skip the line, pickup rápido'), features: ['Skip the Line', translateText('Tracking 4 Estágios')] },
    { id: 'club', icon: <Music className="h-5 w-5" />, name: 'Club & Balada', desc: translateText('Ingressos, VIP, consumo mínimo'), features: [translateText('Ingressos QR'), translateText('Mapa VIP'), translateText('Consumo Mínimo')] },
  ];

  const toggleType = (id: string) => {
    setSelected(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      toast.show(next.includes(id) ? `${id.replace('_', ' ')} ${translateText('ativado')}` : `${id.replace('_', ' ')} ${translateText('desativado')}`, next.includes(id) ? 'success' : 'info');
      return next;
    });
  };

  const toggleFeature = (typeId: string, featureIdx: number) => {
    setFeatureStates(prev => ({
      ...prev,
      [typeId]: { ...(prev[typeId] || {}), [featureIdx]: !(prev[typeId]?.[featureIdx] ?? true) }
    }));
  };

  return (
    <div className="space-y-3 relative">
      {toast.el}
      <ConfigHeader title={translateText('Tipos de Serviço')} subtitle={translateText('Selecione os modelos que seu estabelecimento opera')}
        icon={<Utensils className="h-5 w-5 text-secondary" />} onBack={() => onNavigate('config-hub')} badge={`${selected.length}/11`} />

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-primary">{selected.length}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Ativos')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-success">{types.filter(t => selected.includes(t.id)).reduce((a, t) => a + t.features.length, 0)}</p>
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
              <button onClick={() => setExpandedType(isExpanded ? null : type.id)} className="w-full p-3 text-left">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{type.icon}</div>
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
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  <button onClick={() => toggleType(type.id)}
                    className={`w-full rounded-xl py-2 text-[10px] font-semibold transition-all ${isActive ? 'bg-destructive/10 text-destructive' : 'bg-primary text-primary-foreground'}`}>
                    {isActive ? translateText('Desativar tipo') : translateText('Ativar tipo')}
                  </button>
                  {isActive && (
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      {type.features.map((f, i) => {
                        const enabled = featureStates[type.id]?.[i] ?? true;
                        return (
                          <div key={i} className="flex items-center justify-between p-2.5 border-b border-border last:border-b-0">
                            <p className={`text-[11px] font-medium ${enabled ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{f}</p>
                            <button onClick={() => toggleFeature(type.id, i)}>
                              {enabled ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                            </button>
                          </div>
                        );
                      })}
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

/* ═══════════════════════════════════════════════════════════
   3. EXPERIENCE — Interactive toggles with journey preview
   ═══════════════════════════════════════════════════════════ */

export const ConfigExperience: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const toast = useToast();
  const [config, setConfig] = useState({
    reservations: true, waitlist: true, qr_ordering: true, table_service: true,
    counter_service: false, self_ordering: false, event_bookings: true,
    advance_days: 30, grace_period: 15, require_deposit: false,
    estimated_wait: true, drinks_in_queue: true, smart_seating: true, feedback_post_visit: true,
  });
  const [previewJourney, setPreviewJourney] = useState(false);

  const toggle = (key: string) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    toast.show(translateText('Configuração atualizada!'));
  };

  const journeySteps = [
    { label: translateText('Descoberta'), icon: <Eye className="h-3.5 w-3.5" />, active: true },
    { label: translateText('Reserva'), icon: <Calendar className="h-3.5 w-3.5" />, active: config.reservations || config.waitlist },
    { label: translateText('Chegada'), icon: <MapPin className="h-3.5 w-3.5" />, active: true },
    { label: translateText('Cardápio'), icon: <BookOpen className="h-3.5 w-3.5" />, active: true },
    { label: translateText('Pedido'), icon: <QrCode className="h-3.5 w-3.5" />, active: true },
    { label: translateText('Acompanhamento'), icon: <Timer className="h-3.5 w-3.5" />, active: true },
    { label: translateText('Consumo'), icon: <Utensils className="h-3.5 w-3.5" />, active: true },
    { label: translateText('Conta'), icon: <CreditCard className="h-3.5 w-3.5" />, active: true },
    { label: translateText('Pagamento'), icon: <Smartphone className="h-3.5 w-3.5" />, active: true },
    { label: translateText('Pós-visita'), icon: <Star className="h-3.5 w-3.5" />, active: config.feedback_post_visit },
  ];

  return (
    <div className="space-y-3 relative">
      {toast.el}
      <ConfigHeader title={translateText('Experiência do Cliente')} subtitle={translateText('Como seus clientes interagem com o estabelecimento')}
        icon={<Sparkles className="h-5 w-5 text-info" />} onBack={() => onNavigate('config-hub')} />

      <button onClick={() => setPreviewJourney(!previewJourney)}
        className={`w-full rounded-2xl border p-3 flex items-center gap-3 transition-all ${previewJourney ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"><Play className="h-4 w-4 text-primary" /></div>
        <div className="flex-1 text-left">
          <p className="text-xs font-semibold text-foreground">{translateText('Jornada do Cliente')}</p>
          <p className="text-[10px] text-muted-foreground">{journeySteps.filter(s => s.active).length}/{journeySteps.length} {translateText('etapas ativas')}</p>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${previewJourney ? 'rotate-90' : ''}`} />
      </button>

      {previewJourney && (
        <div className="rounded-2xl border border-primary/20 bg-card p-3 space-y-1.5">
          {journeySteps.map((step, i) => (
            <div key={i} className={`flex items-center gap-2.5 p-2 rounded-xl ${step.active ? '' : 'opacity-30'}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${step.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{step.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold text-muted-foreground">{i + 1}</span>
                  <p className="text-[11px] font-semibold text-foreground">{step.label}</p>
                </div>
              </div>
              {step.active && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
            </div>
          ))}
        </div>
      )}

      <SectionCard title={translateText('Canais de Entrada')} icon={<Calendar className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Reservas Online')} desc={translateText('Clientes podem reservar pelo app')} icon={<Calendar className="h-3 w-3 text-primary" />} value={config.reservations} onChange={() => toggle('reservations')} />
        <ToggleRow label={translateText('Lista de Espera / Fila')} desc={translateText('Fila virtual inteligente')} icon={<Users className="h-3 w-3 text-info" />} value={config.waitlist} onChange={() => toggle('waitlist')} />
        <ToggleRow label={translateText('Reserva de Eventos')} desc={translateText('Grupos e eventos especiais')} icon={<PartyPopper className="h-3 w-3 text-warning" />} value={config.event_bookings} onChange={() => toggle('event_bookings')} />
      </SectionCard>

      <SectionCard title={translateText('Modelo de Atendimento')} icon={<Utensils className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Atendimento na Mesa')} desc={translateText('Garçom dedicado')} icon={<Users className="h-3 w-3 text-success" />} value={config.table_service} onChange={() => toggle('table_service')} />
        <ToggleRow label={translateText('Pedido por QR Code')} desc={translateText('Cliente pede pelo celular')} icon={<QrCode className="h-3 w-3 text-primary" />} value={config.qr_ordering} onChange={() => toggle('qr_ordering')} />
        <ToggleRow label={translateText('Atendimento no Balcão')} desc={translateText('Retirada no balcão')} icon={<Store className="h-3 w-3 text-warning" />} value={config.counter_service} onChange={() => toggle('counter_service')} />
        <ToggleRow label={translateText('Auto-serviço')} desc={translateText('Cliente se serve')} icon={<Utensils className="h-3 w-3 text-muted-foreground" />} value={config.self_ordering} onChange={() => toggle('self_ordering')} />
      </SectionCard>

      <SectionCard title={translateText('Inteligência')} icon={<Brain className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Alocação inteligente')} desc={translateText('IA sugere melhor mesa')} icon={<Sparkles className="h-3 w-3 text-info" />} value={config.smart_seating} onChange={() => toggle('smart_seating')} />
        <ToggleRow label={translateText('Feedback pós-visita')} desc={translateText('Avaliação automática')} icon={<Star className="h-3 w-3 text-warning" />} value={config.feedback_post_visit} onChange={() => toggle('feedback_post_visit')} />
      </SectionCard>

      {config.reservations && (
        <SectionCard title={translateText('Configurações de Reserva')} icon={<Settings className="h-3.5 w-3.5 text-primary" />} collapsible defaultOpen={false}>
          <NumberRow label={translateText('Antecedência máxima (dias)')} value={config.advance_days} onChange={v => setConfig(p => ({ ...p, advance_days: v }))} />
          <NumberRow label={translateText('Tolerância (min)')} value={config.grace_period} suffix="min" onChange={v => setConfig(p => ({ ...p, grace_period: v }))} />
          <ToggleRow label={translateText('Exigir depósito')} desc={translateText('Caução na reserva')} value={config.require_deposit} onChange={() => toggle('require_deposit')} />
        </SectionCard>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   4. FLOOR — Full CRUD: add/edit/delete tables & zones
   ═══════════════════════════════════════════════════════════ */

interface TableItem { id: string; number: number; seats: number; zone: string; shape: 'round' | 'rect' | 'long'; }
interface ZoneItem { id: string; name: string; color: string; }

export const ConfigFloor: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const toast = useToast();
  const [zones, setZones] = useState<ZoneItem[]>([
    { id: 'z1', name: translateText('Salão Principal'), color: 'bg-primary/10 text-primary' },
    { id: 'z2', name: translateText('Varanda'), color: 'bg-success/10 text-success' },
    { id: 'z3', name: translateText('Área VIP'), color: 'bg-warning/10 text-warning' },
    { id: 'z4', name: translateText('Privativo'), color: 'bg-info/10 text-info' },
  ]);
  const [tables, setTables] = useState<TableItem[]>([
    { id: 't1', number: 1, seats: 2, zone: 'z1', shape: 'round' },
    { id: 't2', number: 2, seats: 4, zone: 'z1', shape: 'rect' },
    { id: 't3', number: 3, seats: 4, zone: 'z1', shape: 'rect' },
    { id: 't4', number: 4, seats: 6, zone: 'z1', shape: 'rect' },
    { id: 't5', number: 5, seats: 2, zone: 'z2', shape: 'round' },
    { id: 't6', number: 6, seats: 4, zone: 'z2', shape: 'round' },
    { id: 't7', number: 7, seats: 8, zone: 'z3', shape: 'long' },
    { id: 't8', number: 8, seats: 10, zone: 'z4', shape: 'long' },
  ]);
  const [selectedZone, setSelectedZone] = useState('z1');
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'table' | 'zone' } | null>(null);
  const [newTable, setNewTable] = useState<{ seats: string; zone: string; shape: 'round' | 'rect' | 'long' }>({ seats: '4', zone: 'z1', shape: 'rect' });
  const [newZone, setNewZone] = useState({ name: '' });
  const [editTableData, setEditTableData] = useState({ seats: '', zone: '', shape: '' });

  const filteredTables = tables.filter(t => t.zone === selectedZone);
  const totalCapacity = tables.reduce((a, t) => a + t.seats, 0);
  const zoneColors = ['bg-primary/10 text-primary', 'bg-success/10 text-success', 'bg-warning/10 text-warning', 'bg-info/10 text-info', 'bg-destructive/10 text-destructive', 'bg-secondary/10 text-secondary'];

  const addTable = () => {
    const maxNum = tables.reduce((a, t) => Math.max(a, t.number), 0);
    setTables(prev => [...prev, { id: `t${Date.now()}`, number: maxNum + 1, seats: parseInt(newTable.seats) || 4, zone: newTable.zone, shape: newTable.shape }]);
    setShowAddTable(false); setNewTable({ seats: '4', zone: 'z1', shape: 'rect' });
    toast.show(translateText('Mesa adicionada!'));
  };

  const addZone = () => {
    if (!newZone.name.trim()) return;
    const color = zoneColors[zones.length % zoneColors.length];
    setZones(prev => [...prev, { id: `z${Date.now()}`, name: newZone.name, color }]);
    setShowAddZone(false); setNewZone({ name: '' });
    toast.show(translateText('Zona criada!'));
  };

  const startEditTable = (t: TableItem) => {
    setEditingTable(t.id);
    setEditTableData({ seats: String(t.seats), zone: t.zone, shape: t.shape });
  };

  const saveEditTable = (id: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, seats: parseInt(editTableData.seats) || t.seats, zone: editTableData.zone, shape: editTableData.shape as TableItem['shape'] } : t));
    setEditingTable(null);
    toast.show(translateText('Mesa atualizada!'));
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'table') {
      setTables(prev => prev.filter(t => t.id !== deleteConfirm.id));
      toast.show(translateText('Mesa removida'), 'info');
    } else {
      setTables(prev => prev.filter(t => t.zone !== deleteConfirm.id));
      setZones(prev => prev.filter(z => z.id !== deleteConfirm.id));
      if (selectedZone === deleteConfirm.id) setSelectedZone(zones[0]?.id || '');
      toast.show(translateText('Zona removida'), 'info');
    }
  };

  return (
    <div className="space-y-3 relative">
      {toast.el}
      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title={translateText('Confirmar exclusão')} message={deleteConfirm?.type === 'zone' ? translateText('Todas as mesas desta zona serão removidas.') : translateText('Esta mesa será removida permanentemente.')} />

      <ConfigHeader title={translateText('Mapa do Salão')} subtitle={translateText('Gerencie mesas, zonas e áreas')}
        icon={<LayoutGrid className="h-5 w-5 text-warning" />} onBack={() => onNavigate('config-hub')} />

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-primary">{tables.length}</p>
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
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateText('Planta Visual')}</p>
        <div className="grid grid-cols-4 gap-2 p-2 bg-muted/30 rounded-xl min-h-[100px]">
          {tables.map(table => {
            const zone = zones.find(z => z.id === table.zone);
            return (
              <div key={table.id} className={`flex flex-col items-center justify-center p-2 rounded-xl border bg-card ${table.shape === 'long' ? 'col-span-2' : ''} ${zone?.color.split(' ')[0] || 'bg-muted'}`}>
                <span className="text-sm font-bold text-foreground">{table.number}</span>
                <span className="text-[8px] text-muted-foreground">{table.seats}p</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone filter + add */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {zones.map(zone => (
          <button key={zone.id} onClick={() => setSelectedZone(zone.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all shrink-0 ${
              selectedZone === zone.id ? `${zone.color} border border-current/20` : 'bg-muted text-muted-foreground'
            }`}>
            {zone.name} ({tables.filter(t => t.zone === zone.id).length})
            {selectedZone === zone.id && (
              <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: zone.id, type: 'zone' }); }} className="ml-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </button>
        ))}
        <button onClick={() => setShowAddZone(true)} className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Plus className="h-3.5 w-3.5 text-primary" />
        </button>
      </div>

      {/* Tables in zone */}
      <SectionCard title={`${translateText('Mesas')} — ${zones.find(z => z.id === selectedZone)?.name || ''}`} icon={<LayoutGrid className="h-3.5 w-3.5 text-primary" />}
        action={<button onClick={() => { setNewTable(p => ({ ...p, zone: selectedZone })); setShowAddTable(true); }} className="text-[10px] text-primary font-medium flex items-center gap-1"><Plus className="h-3 w-3" />{translateText('Nova')}</button>}>
        {filteredTables.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground">{translateText('Nenhuma mesa nesta zona')}</p>
          </div>
        )}
        {filteredTables.map(table => (
          <div key={table.id} className="p-3 border-b border-border last:border-b-0">
            {editingTable === table.id ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-foreground">{translateText('Mesa')} {table.number}</p>
                <div className="grid grid-cols-2 gap-2">
                  <FormField label={translateText('Lugares')} value={editTableData.seats} onChange={v => setEditTableData(p => ({ ...p, seats: v }))} type="number" />
                  <FormField label={translateText('Formato')} value={editTableData.shape} onChange={v => setEditTableData(p => ({ ...p, shape: v }))} type="select"
                    options={[{ value: 'round', label: translateText('Redonda') }, { value: 'rect', label: translateText('Retangular') }, { value: 'long', label: translateText('Longa') }]} />
                </div>
                <FormField label={translateText('Zona')} value={editTableData.zone} onChange={v => setEditTableData(p => ({ ...p, zone: v }))} type="select"
                  options={zones.map(z => ({ value: z.id, label: z.name }))} />
                <div className="flex gap-2">
                  <button onClick={() => saveEditTable(table.id)} className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-[10px] font-semibold text-primary-foreground"><Check className="h-3 w-3 inline mr-1" />{translateText('Salvar')}</button>
                  <button onClick={() => setEditingTable(null)} className="rounded-lg bg-muted px-3 py-1.5 text-[10px] font-semibold text-muted-foreground">{translateText('Cancelar')}</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm ${
                    table.shape === 'round' ? 'rounded-full bg-primary/10 text-primary' : table.shape === 'long' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                  }`}>{table.number}</div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{translateText('Mesa')} {table.number}</p>
                    <p className="text-[10px] text-muted-foreground">{table.seats} {translateText('lugares')} · {table.shape === 'round' ? translateText('Redonda') : table.shape === 'long' ? translateText('Longa') : translateText('Retangular')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => startEditTable(table)} className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center"><Edit3 className="h-3 w-3 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteConfirm({ id: table.id, type: 'table' })} className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center"><Trash2 className="h-3 w-3 text-destructive" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </SectionCard>

      <Modal open={showAddTable} onClose={() => setShowAddTable(false)} title={translateText('Nova Mesa')}>
        <FormField label={translateText('Lugares')} value={newTable.seats} onChange={v => setNewTable(p => ({ ...p, seats: v }))} type="number" />
        <FormField label={translateText('Formato')} value={newTable.shape} onChange={v => setNewTable(p => ({ ...p, shape: v as TableItem['shape'] }))} type="select"
          options={[{ value: 'round', label: translateText('Redonda') }, { value: 'rect', label: translateText('Retangular') }, { value: 'long', label: translateText('Longa') }]} />
        <FormField label={translateText('Zona')} value={newTable.zone} onChange={v => setNewTable(p => ({ ...p, zone: v }))} type="select"
          options={zones.map(z => ({ value: z.id, label: z.name }))} />
        <button onClick={addTable} className="w-full rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground mt-2">{translateText('Adicionar Mesa')}</button>
      </Modal>

      <Modal open={showAddZone} onClose={() => setShowAddZone(false)} title={translateText('Nova Zona')}>
        <FormField label={translateText('Nome da Zona')} value={newZone.name} onChange={v => setNewZone({ name: v })} placeholder={translateText('Ex: Terraço, Lounge...')} />
        <button onClick={addZone} className="w-full rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground mt-2">{translateText('Criar Zona')}</button>
      </Modal>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   5. MENU — Full CRUD: categories & items
   ═══════════════════════════════════════════════════════════ */

interface MenuItem { id: string; name: string; price: string; time: string; allergens: string[]; active: boolean; category: string; }
interface MenuCategory { id: string; name: string; active: boolean; }

export const ConfigMenu: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const toast = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([
    { id: 'entradas', name: translateText('Entradas'), active: true },
    { id: 'pratos', name: translateText('Pratos Principais'), active: true },
    { id: 'sobremesas', name: translateText('Sobremesas'), active: true },
    { id: 'bebidas', name: translateText('Bebidas'), active: true },
    { id: 'vinhos', name: translateText('Carta de Vinhos'), active: true },
  ]);
  const [items, setItems] = useState<MenuItem[]>([
    { id: 'i1', name: 'Sashimi Premium Mix', price: '89', time: '12', allergens: [translateText('Peixe')], active: true, category: 'entradas' },
    { id: 'i2', name: 'Wagyu Tataki', price: '128', time: '15', allergens: [translateText('Carne')], active: true, category: 'pratos' },
    { id: 'i3', name: 'Temaki Especial', price: '42', time: '8', allergens: [translateText('Peixe'), translateText('Glúten')], active: true, category: 'entradas' },
    { id: 'i4', name: 'Matcha Cheesecake', price: '38', time: '5', allergens: [translateText('Glúten'), translateText('Lactose')], active: true, category: 'sobremesas' },
    { id: 'i5', name: 'Sake Premium', price: '65', time: '1', allergens: [], active: true, category: 'bebidas' },
  ]);
  const [expandedCat, setExpandedCat] = useState<string | null>('entradas');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'item' | 'category' } | null>(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', time: '10', category: 'entradas', allergens: '' });
  const [newCat, setNewCat] = useState({ name: '' });
  const [editData, setEditData] = useState({ name: '', price: '', time: '', allergens: '' });

  const addItem = () => {
    if (!newItem.name.trim()) return;
    setItems(prev => [...prev, { id: `i${Date.now()}`, name: newItem.name, price: newItem.price, time: newItem.time, allergens: newItem.allergens.split(',').map(a => a.trim()).filter(Boolean), active: true, category: newItem.category }]);
    setShowAddItem(false); setNewItem({ name: '', price: '', time: '10', category: expandedCat || 'entradas', allergens: '' });
    toast.show(translateText('Item adicionado ao cardápio!'));
  };

  const addCategory = () => {
    if (!newCat.name.trim()) return;
    setCategories(prev => [...prev, { id: `cat${Date.now()}`, name: newCat.name, active: true }]);
    setShowAddCat(false); setNewCat({ name: '' });
    toast.show(translateText('Categoria criada!'));
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItem(item.id); setEditData({ name: item.name, price: item.price, time: item.time, allergens: item.allergens.join(', ') });
  };

  const saveEditItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, name: editData.name, price: editData.price, time: editData.time, allergens: editData.allergens.split(',').map(a => a.trim()).filter(Boolean) } : i));
    setEditingItem(null);
    toast.show(translateText('Item atualizado!'));
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'item') {
      setItems(prev => prev.filter(i => i.id !== deleteConfirm.id));
      toast.show(translateText('Item removido'), 'info');
    } else {
      setItems(prev => prev.filter(i => i.category !== deleteConfirm.id));
      setCategories(prev => prev.filter(c => c.id !== deleteConfirm.id));
      toast.show(translateText('Categoria removida'), 'info');
    }
  };

  const activeItems = items.filter(i => i.active).length;

  return (
    <div className="space-y-3 relative">
      {toast.el}
      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title={translateText('Confirmar exclusão')} message={deleteConfirm?.type === 'category' ? translateText('Todos os itens desta categoria serão removidos.') : translateText('Este item será removido do cardápio.')} />

      <ConfigHeader title={translateText('Gestão do Cardápio')} subtitle={translateText('Categorias, itens, preços e disponibilidade')}
        icon={<BookOpen className="h-5 w-5 text-success" />} onBack={() => onNavigate('config-hub')} badge={`${items.length} ${translateText('itens')}`} />

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-foreground">{items.length}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Itens')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-foreground">{categories.length}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Categorias')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-success">{activeItems > 0 ? Math.round((activeItems / items.length) * 100) : 0}%</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Ativos')}</p>
        </div>
      </div>

      <SectionCard title={translateText('Categorias & Itens')} icon={<ArrowUpDown className="h-3.5 w-3.5 text-primary" />}
        action={<button onClick={() => setShowAddCat(true)} className="text-[10px] text-primary font-medium flex items-center gap-1"><Plus className="h-3 w-3" />{translateText('Categoria')}</button>}>
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat.id);
          return (
            <div key={cat.id}>
              <div className="flex items-center justify-between p-3 border-b border-border">
                <button onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)} className="flex items-center gap-2 flex-1 text-left">
                  <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expandedCat === cat.id ? 'rotate-90' : ''}`} />
                  <p className="text-xs font-medium text-foreground">{cat.name}</p>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{catItems.length}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setNewItem(p => ({ ...p, category: cat.id })); setShowAddItem(true); }}>
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ id: cat.id, type: 'category' })}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive/40" />
                  </button>
                </div>
              </div>
              {expandedCat === cat.id && (
                <div className="bg-muted/20">
                  {catItems.map(item => (
                    <div key={item.id} className="p-3 border-b border-border last:border-b-0 ml-3">
                      {editingItem === item.id ? (
                        <div className="space-y-2">
                          <FormField label={translateText('Nome')} value={editData.name} onChange={v => setEditData(p => ({ ...p, name: v }))} />
                          <div className="grid grid-cols-2 gap-2">
                            <FormField label={translateText('Preço (R$)')} value={editData.price} onChange={v => setEditData(p => ({ ...p, price: v }))} type="number" />
                            <FormField label={translateText('Tempo (min)')} value={editData.time} onChange={v => setEditData(p => ({ ...p, time: v }))} type="number" />
                          </div>
                          <FormField label={translateText('Alérgenos (separar por vírgula)')} value={editData.allergens} onChange={v => setEditData(p => ({ ...p, allergens: v }))} />
                          <div className="flex gap-2">
                            <button onClick={() => saveEditItem(item.id)} className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-[10px] font-semibold text-primary-foreground"><Check className="h-3 w-3 inline mr-1" />{translateText('Salvar')}</button>
                            <button onClick={() => setEditingItem(null)} className="rounded-lg bg-muted px-3 py-1.5 text-[10px] font-semibold text-muted-foreground">{translateText('Cancelar')}</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] font-semibold ${item.active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-primary">R$ {item.price}</span>
                              <span className="text-[9px] text-muted-foreground">{item.time}min</span>
                            </div>
                            {item.allergens.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {item.allergens.map(a => <span key={a} className="rounded bg-destructive/10 px-1 py-0.5 text-[7px] font-medium text-destructive">{a}</span>)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))}>
                              {item.active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                            </button>
                            <button onClick={() => startEditItem(item)}><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                            <button onClick={() => setDeleteConfirm({ id: item.id, type: 'item' })}><Trash2 className="h-3.5 w-3.5 text-destructive/40" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {catItems.length === 0 && (
                    <div className="p-3 ml-3 text-center">
                      <p className="text-[10px] text-muted-foreground">{translateText('Nenhum item')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </SectionCard>

      <Modal open={showAddItem} onClose={() => setShowAddItem(false)} title={translateText('Novo Item')}>
        <FormField label={translateText('Nome')} value={newItem.name} onChange={v => setNewItem(p => ({ ...p, name: v }))} placeholder="Ex: Sashimi Premium" />
        <div className="grid grid-cols-2 gap-2">
          <FormField label={translateText('Preço (R$)')} value={newItem.price} onChange={v => setNewItem(p => ({ ...p, price: v }))} type="number" placeholder="89" />
          <FormField label={translateText('Tempo (min)')} value={newItem.time} onChange={v => setNewItem(p => ({ ...p, time: v }))} type="number" />
        </div>
        <FormField label={translateText('Categoria')} value={newItem.category} onChange={v => setNewItem(p => ({ ...p, category: v }))} type="select"
          options={categories.map(c => ({ value: c.id, label: c.name }))} />
        <FormField label={translateText('Alérgenos (separar por vírgula)')} value={newItem.allergens} onChange={v => setNewItem(p => ({ ...p, allergens: v }))} placeholder={translateText('Peixe, Glúten...')} />
        <button onClick={addItem} className="w-full rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground mt-2">{translateText('Adicionar Item')}</button>
      </Modal>

      <Modal open={showAddCat} onClose={() => setShowAddCat(false)} title={translateText('Nova Categoria')}>
        <FormField label={translateText('Nome')} value={newCat.name} onChange={v => setNewCat({ name: v })} placeholder={translateText('Ex: Petiscos, Happy Hour...')} />
        <button onClick={addCategory} className="w-full rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground mt-2">{translateText('Criar Categoria')}</button>
      </Modal>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   6. TEAM — Full CRUD: add/edit/delete members
   ═══════════════════════════════════════════════════════════ */

interface StaffMember { id: string; name: string; role: string; shift: string; status: 'online' | 'break' | 'offline'; }

export const ConfigTeam: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const toast = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: 'tm1', name: 'Ricardo Alves', role: 'Dono', shift: 'Integral', status: 'online' },
    { id: 'tm2', name: 'Marina Costa', role: 'Gerente', shift: '14h-23h', status: 'online' },
    { id: 'tm3', name: 'Felipe Santos', role: 'Chef', shift: '15h-23h', status: 'online' },
    { id: 'tm4', name: 'Ana Rodrigues', role: 'Sommelier', shift: '18h-00h', status: 'online' },
    { id: 'tm5', name: 'Bruno Oliveira', role: 'Garçom', shift: '18h-00h', status: 'online' },
    { id: 'tm6', name: 'Carla Lima', role: 'Garçom', shift: '12h-18h', status: 'break' },
    { id: 'tm7', name: 'Diego Martins', role: 'Barman', shift: 'Folga', status: 'offline' },
  ]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: '', role: 'Garçom', shift: '18h-00h' });
  const [editData, setEditData] = useState({ name: '', role: '', shift: '' });

  const roleOptions = [
    { value: 'Dono', label: translateText('Dono') }, { value: 'Gerente', label: translateText('Gerente') },
    { value: 'Maitre', label: 'Maitre' }, { value: 'Chef', label: 'Chef' },
    { value: 'Barman', label: 'Barman' }, { value: 'Cozinheiro', label: translateText('Cozinheiro') },
    { value: 'Garçom', label: translateText('Garçom') }, { value: 'Sommelier', label: 'Sommelier' },
  ];

  const addMember = () => {
    if (!newMember.name.trim()) return;
    setStaff(prev => [...prev, { id: `tm${Date.now()}`, name: newMember.name, role: newMember.role, shift: newMember.shift, status: 'online' }]);
    setShowAddMember(false); setNewMember({ name: '', role: 'Garçom', shift: '18h-00h' });
    toast.show(translateText('Membro adicionado à equipe!'));
  };

  const startEdit = (m: StaffMember) => { setEditingMember(m.id); setEditData({ name: m.name, role: m.role, shift: m.shift }); };

  const saveEdit = (id: string) => {
    setStaff(prev => prev.map(m => m.id === id ? { ...m, name: editData.name, role: editData.role, shift: editData.shift } : m));
    setEditingMember(null);
    toast.show(translateText('Membro atualizado!'));
  };

  const toggleStatus = (id: string) => {
    const cycle: Record<string, 'online' | 'break' | 'offline'> = { online: 'break', break: 'offline', offline: 'online' };
    setStaff(prev => prev.map(m => m.id === id ? { ...m, status: cycle[m.status] } : m));
  };

  return (
    <div className="space-y-3 relative">
      {toast.el}
      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { setStaff(prev => prev.filter(m => m.id !== deleteConfirm)); toast.show(translateText('Membro removido'), 'info'); }}
        title={translateText('Remover membro')} message={translateText('Este membro será removido da equipe.')} />

      <ConfigHeader title={translateText('Equipe & Permissões')} subtitle={translateText('Gerencie cargos, escalas e acessos')}
        icon={<Users className="h-5 w-5 text-accent-foreground" />} onBack={() => onNavigate('config-hub')} badge={`${staff.length} ${translateText('membros')}`} />

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-success/20 bg-success/5 p-2 text-center">
          <p className="text-lg font-bold text-success">{staff.filter(s => s.status === 'online').length}</p>
          <p className="text-[8px] text-muted-foreground">Online</p>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-2 text-center">
          <p className="text-lg font-bold text-warning">{staff.filter(s => s.status === 'break').length}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Pausa')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-center">
          <p className="text-lg font-bold text-muted-foreground">{staff.filter(s => s.status === 'offline').length}</p>
          <p className="text-[8px] text-muted-foreground">{translateText('Folga')}</p>
        </div>
      </div>

      <SectionCard title={translateText('Membros da Equipe')} icon={<Users className="h-3.5 w-3.5 text-primary" />}
        action={<button onClick={() => setShowAddMember(true)} className="text-[10px] text-primary font-medium flex items-center gap-1"><Plus className="h-3 w-3" />{translateText('Novo')}</button>}>
        {staff.map(m => (
          <div key={m.id} className="p-3 border-b border-border last:border-b-0">
            {editingMember === m.id ? (
              <div className="space-y-2">
                <FormField label={translateText('Nome')} value={editData.name} onChange={v => setEditData(p => ({ ...p, name: v }))} />
                <div className="grid grid-cols-2 gap-2">
                  <FormField label={translateText('Cargo')} value={editData.role} onChange={v => setEditData(p => ({ ...p, role: v }))} type="select" options={roleOptions} />
                  <FormField label={translateText('Turno')} value={editData.shift} onChange={v => setEditData(p => ({ ...p, shift: v }))} placeholder="18h-00h" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(m.id)} className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-[10px] font-semibold text-primary-foreground"><Check className="h-3 w-3 inline mr-1" />{translateText('Salvar')}</button>
                  <button onClick={() => setEditingMember(null)} className="rounded-lg bg-muted px-3 py-1.5 text-[10px] font-semibold text-muted-foreground">{translateText('Cancelar')}</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary relative">
                  {m.name.split(' ').map(n => n[0]).join('')}
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${m.status === 'online' ? 'bg-success' : m.status === 'break' ? 'bg-warning' : 'bg-muted'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">{translateText(m.role)} · {m.shift}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleStatus(m.id)} className={`h-6 px-2 rounded-lg text-[8px] font-bold ${m.status === 'online' ? 'bg-success/10 text-success' : m.status === 'break' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                    {m.status === 'online' ? 'ON' : m.status === 'break' ? translateText('PAUSA') : 'OFF'}
                  </button>
                  <button onClick={() => startEdit(m)}><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteConfirm(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive/40" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </SectionCard>

      <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title={translateText('Novo Membro')}>
        <FormField label={translateText('Nome completo')} value={newMember.name} onChange={v => setNewMember(p => ({ ...p, name: v }))} placeholder="Ex: João Silva" />
        <FormField label={translateText('Cargo')} value={newMember.role} onChange={v => setNewMember(p => ({ ...p, role: v }))} type="select" options={roleOptions} />
        <FormField label={translateText('Turno')} value={newMember.shift} onChange={v => setNewMember(p => ({ ...p, shift: v }))} placeholder="18h-00h" />
        <button onClick={addMember} className="w-full rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground mt-2">{translateText('Adicionar Membro')}</button>
      </Modal>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   7. KITCHEN & BAR — Full CRUD: stations
   ═══════════════════════════════════════════════════════════ */

interface Station { id: string; name: string; items: string; kds: string; color: string; avgTime: string; }

export const ConfigKitchen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const toast = useToast();
  const [stations, setStations] = useState<Station[]>([
    { id: 'st1', name: translateText('Grill / Chapa'), items: translateText('Carnes, grelhados'), kds: 'KDS 1', color: 'bg-destructive/10 text-destructive', avgTime: '12' },
    { id: 'st2', name: translateText('Frios / Ceviche'), items: translateText('Sashimi, saladas'), kds: 'KDS 1', color: 'bg-info/10 text-info', avgTime: '8' },
    { id: 'st3', name: translateText('Confeitaria'), items: translateText('Sobremesas'), kds: 'KDS 2', color: 'bg-warning/10 text-warning', avgTime: '15' },
    { id: 'st4', name: translateText('Bar Principal'), items: translateText('Drinks e cocktails'), kds: 'KDS Bar', color: 'bg-primary/10 text-primary', avgTime: '4' },
  ]);
  const [config, setConfig] = useState({ kds_screens: 2, default_prep_time: 15, auto_routing: true, priority_alerts: true, fire_order: true, batch_cooking: false });
  const [showAddStation, setShowAddStation] = useState(false);
  const [editingStation, setEditingStation] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newStation, setNewStation] = useState({ name: '', items: '', kds: 'KDS 1', avgTime: '10' });
  const [editData, setEditData] = useState({ name: '', items: '', kds: '', avgTime: '' });

  const stationColors = ['bg-destructive/10 text-destructive', 'bg-info/10 text-info', 'bg-warning/10 text-warning', 'bg-primary/10 text-primary', 'bg-success/10 text-success', 'bg-secondary/10 text-secondary'];

  const addStation = () => {
    if (!newStation.name.trim()) return;
    setStations(prev => [...prev, { id: `st${Date.now()}`, name: newStation.name, items: newStation.items, kds: newStation.kds, color: stationColors[stations.length % stationColors.length], avgTime: newStation.avgTime }]);
    setShowAddStation(false); setNewStation({ name: '', items: '', kds: 'KDS 1', avgTime: '10' });
    toast.show(translateText('Estação criada!'));
  };

  const startEdit = (s: Station) => { setEditingStation(s.id); setEditData({ name: s.name, items: s.items, kds: s.kds, avgTime: s.avgTime }); };

  const saveEdit = (id: string) => {
    setStations(prev => prev.map(s => s.id === id ? { ...s, name: editData.name, items: editData.items, kds: editData.kds, avgTime: editData.avgTime } : s));
    setEditingStation(null);
    toast.show(translateText('Estação atualizada!'));
  };

  return (
    <div className="space-y-3 relative">
      {toast.el}
      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { setStations(prev => prev.filter(s => s.id !== deleteConfirm)); toast.show(translateText('Estação removida'), 'info'); }}
        title={translateText('Remover estação')} message={translateText('Esta estação será removida do fluxo.')} />

      <ConfigHeader title={translateText('Cozinha & Bar')} subtitle={translateText('Estações, KDS e fluxo operacional')}
        icon={<ChefHat className="h-5 w-5 text-destructive" />} onBack={() => onNavigate('config-hub')} />

      {/* Production flow */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateText('Fluxo de Produção')}</p>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            { icon: <ClipboardList className="h-4 w-4 text-info" />, label: translateText('Pedido'), bg: 'bg-info/10' },
            { icon: <Monitor className="h-4 w-4 text-warning" />, label: 'KDS', bg: 'bg-warning/10' },
            { icon: <Flame className="h-4 w-4 text-destructive" />, label: translateText('Estação'), bg: 'bg-destructive/10' },
            { icon: <CheckCircle2 className="h-4 w-4 text-success" />, label: translateText('Pronto'), bg: 'bg-success/10' },
            { icon: <Users className="h-4 w-4 text-primary" />, label: translateText('Entregue'), bg: 'bg-primary/10' },
          ].map((step, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`h-10 w-10 rounded-xl ${step.bg} flex items-center justify-center`}>{step.icon}</div>
                <span className="text-[7px] font-medium text-muted-foreground">{step.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <SectionCard title={translateText('Estações de Preparo')} icon={<Flame className="h-3.5 w-3.5 text-primary" />}
        action={<button onClick={() => setShowAddStation(true)} className="text-[10px] text-primary font-medium flex items-center gap-1"><Plus className="h-3 w-3" />{translateText('Nova')}</button>}>
        {stations.map(s => (
          <div key={s.id} className="p-3 border-b border-border last:border-b-0">
            {editingStation === s.id ? (
              <div className="space-y-2">
                <FormField label={translateText('Nome')} value={editData.name} onChange={v => setEditData(p => ({ ...p, name: v }))} />
                <FormField label={translateText('Itens')} value={editData.items} onChange={v => setEditData(p => ({ ...p, items: v }))} />
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="KDS" value={editData.kds} onChange={v => setEditData(p => ({ ...p, kds: v }))} />
                  <FormField label={translateText('Tempo médio (min)')} value={editData.avgTime} onChange={v => setEditData(p => ({ ...p, avgTime: v }))} type="number" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(s.id)} className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-[10px] font-semibold text-primary-foreground"><Check className="h-3 w-3 inline mr-1" />{translateText('Salvar')}</button>
                  <button onClick={() => setEditingStation(null)} className="rounded-lg bg-muted px-3 py-1.5 text-[10px] font-semibold text-muted-foreground">{translateText('Cancelar')}</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>
                  {s.name.includes('Bar') ? <Wine className="h-4 w-4" /> : <ChefHat className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-foreground">{s.name}</p>
                  <p className="text-[9px] text-muted-foreground">{s.items} · {s.kds}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-semibold text-foreground">{s.avgTime}min</span>
                  <button onClick={() => startEdit(s)}><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteConfirm(s.id)}><Trash2 className="h-3.5 w-3.5 text-destructive/40" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </SectionCard>

      <SectionCard title={translateText('Configurações KDS')} icon={<Monitor className="h-3.5 w-3.5 text-primary" />}>
        <NumberRow label={translateText('Telas KDS')} value={config.kds_screens} onChange={v => setConfig(p => ({ ...p, kds_screens: v }))} />
        <NumberRow label={translateText('Tempo padrão (min)')} value={config.default_prep_time} suffix="min" onChange={v => setConfig(p => ({ ...p, default_prep_time: v }))} />
        <ToggleRow label={translateText('Roteamento automático')} desc={translateText('Enviar itens para estação correta')} icon={<RefreshCw className="h-3 w-3 text-primary" />}
          value={config.auto_routing} onChange={() => setConfig(p => ({ ...p, auto_routing: !p.auto_routing }))} />
        <ToggleRow label={translateText('Alertas de prioridade')} desc={translateText('Notificar itens atrasados')} icon={<Bell className="h-3 w-3 text-destructive" />}
          value={config.priority_alerts} onChange={() => setConfig(p => ({ ...p, priority_alerts: !p.priority_alerts }))} />
      </SectionCard>

      <SectionCard title={translateText('Modo de Preparo')} icon={<Settings className="h-3.5 w-3.5 text-primary" />} collapsible defaultOpen={false}>
        <ToggleRow label={translateText('Fire Order')} desc={translateText('Chef controla quando iniciar cada prato')} value={config.fire_order} onChange={() => setConfig(p => ({ ...p, fire_order: !p.fire_order }))} />
        <ToggleRow label={translateText('Batch Cooking')} desc={translateText('Agrupar itens iguais')} value={config.batch_cooking} onChange={() => setConfig(p => ({ ...p, batch_cooking: !p.batch_cooking }))} />
      </SectionCard>

      <Modal open={showAddStation} onClose={() => setShowAddStation(false)} title={translateText('Nova Estação')}>
        <FormField label={translateText('Nome')} value={newStation.name} onChange={v => setNewStation(p => ({ ...p, name: v }))} placeholder={translateText('Ex: Frituras, Sushi Bar...')} />
        <FormField label={translateText('Itens que prepara')} value={newStation.items} onChange={v => setNewStation(p => ({ ...p, items: v }))} placeholder={translateText('Ex: Tempurá, Gyoza...')} />
        <div className="grid grid-cols-2 gap-2">
          <FormField label="KDS" value={newStation.kds} onChange={v => setNewStation(p => ({ ...p, kds: v }))} placeholder="KDS 1" />
          <FormField label={translateText('Tempo médio (min)')} value={newStation.avgTime} onChange={v => setNewStation(p => ({ ...p, avgTime: v }))} type="number" />
        </div>
        <button onClick={addStation} className="w-full rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground mt-2">{translateText('Criar Estação')}</button>
      </Modal>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   8. PAYMENTS — Interactive payment config
   ═══════════════════════════════════════════════════════════ */

export const ConfigPayments: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const toast = useToast();
  const [config, setConfig] = useState({
    service_charge: true, service_pct: 10, tips_enabled: true,
    tip_percentages: [10, 15, 20], custom_tip: true,
    split_individual: true, split_equal: true, split_by_item: true, split_fixed: true,
    pix: true, credit: true, debit: true, apple_pay: true, google_pay: true, tap_to_pay: true,
  });

  const toggle = (key: string) => { setConfig(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] })); toast.show(translateText('Configuração atualizada!')); };

  const paymentMethods = [
    { key: 'credit', label: translateText('Crédito'), icon: <CreditCard className="h-4 w-4" />, color: 'bg-primary/10 text-primary' },
    { key: 'debit', label: translateText('Débito'), icon: <CreditCard className="h-4 w-4" />, color: 'bg-info/10 text-info' },
    { key: 'pix', label: 'PIX', icon: <QrCode className="h-4 w-4" />, color: 'bg-success/10 text-success' },
    { key: 'apple_pay', label: 'Apple Pay', icon: <Smartphone className="h-4 w-4" />, color: 'bg-foreground/10 text-foreground' },
    { key: 'google_pay', label: 'Google Pay', icon: <Smartphone className="h-4 w-4" />, color: 'bg-warning/10 text-warning' },
    { key: 'tap_to_pay', label: 'TAP to Pay', icon: <Fingerprint className="h-4 w-4" />, color: 'bg-accent/10 text-accent-foreground' },
  ];

  return (
    <div className="space-y-3 relative">
      {toast.el}
      <ConfigHeader title={translateText('Pagamentos')} subtitle={translateText('Taxa, gorjeta, split e métodos aceitos')}
        icon={<CreditCard className="h-5 w-5 text-primary" />} onBack={() => onNavigate('config-hub')} />

      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{translateText('Métodos Aceitos')}</p>
        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map(m => {
            const isActive = config[m.key as keyof typeof config] as boolean;
            return (
              <button key={m.key} onClick={() => toggle(m.key)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 opacity-50'}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.color}`}>{m.icon}</div>
                <span className="text-[9px] font-semibold text-foreground">{m.label}</span>
                {isActive && <Check className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      <SectionCard title={translateText('Taxa de Serviço')} icon={<Percent className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Taxa de serviço')} desc={translateText('Incluir automaticamente')} icon={<Percent className="h-3 w-3 text-primary" />} value={config.service_charge} onChange={() => toggle('service_charge')} />
        {config.service_charge && <NumberRow label={translateText('Percentual')} value={config.service_pct} suffix="%" onChange={v => setConfig(p => ({ ...p, service_pct: v }))} />}
      </SectionCard>

      <SectionCard title={translateText('Gorjetas')} icon={<Heart className="h-3.5 w-3.5 text-primary" />}>
        <ToggleRow label={translateText('Sistema de gorjetas')} desc={translateText('Sugerir gorjeta no fechamento')} icon={<Heart className="h-3 w-3 text-destructive" />} value={config.tips_enabled} onChange={() => toggle('tips_enabled')} />
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
        <ToggleRow label={translateText('Individual')} desc={translateText('Cada um paga o seu')} icon={<Users className="h-3 w-3 text-primary" />} value={config.split_individual} onChange={() => toggle('split_individual')} />
        <ToggleRow label={translateText('Dividir igualmente')} desc={translateText('Total dividido por todos')} icon={<Users className="h-3 w-3 text-info" />} value={config.split_equal} onChange={() => toggle('split_equal')} />
        <ToggleRow label={translateText('Por item')} desc={translateText('Selecionar itens para pagar')} icon={<ClipboardList className="h-3 w-3 text-warning" />} value={config.split_by_item} onChange={() => toggle('split_by_item')} />
        <ToggleRow label={translateText('Valor fixo')} desc={translateText('Escolher quanto pagar')} icon={<DollarSign className="h-3 w-3 text-success" />} value={config.split_fixed} onChange={() => toggle('split_fixed')} />
      </SectionCard>

      <ExperiencePreview title={translateText('Tela de pagamento')}>
        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-foreground">R$ 342,00</p>
          {config.service_charge && <p className="text-[10px] text-muted-foreground">{translateText('Taxa de serviço')}: R$ {(342 * config.service_pct / 100).toFixed(2)} ({config.service_pct}%)</p>}
          {config.tips_enabled && (
            <div className="flex justify-center gap-1.5">
              {config.tip_percentages.map(pct => (
                <span key={pct} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${pct === 15 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{pct}%</span>
              ))}
            </div>
          )}
        </div>
      </ExperiencePreview>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   9. FEATURE MARKETPLACE — Toggle with details
   ═══════════════════════════════════════════════════════════ */

export const ConfigFeatures: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const { translateText } = useDemoI18n();
  const toast = useToast();
  const [active, setActive] = useState<string[]>(['loyalty', 'ai_recs']);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const features = [
    { id: 'loyalty', icon: <Award className="h-5 w-5" />, name: translateText('Programa de Fidelidade'), desc: translateText('Pontos, recompensas e leaderboard'), tier: 'Premium', color: 'from-primary to-accent',
      details: translateText('Clientes acumulam pontos a cada visita. Leaderboard mensal. Recompensas personalizáveis.') },
    { id: 'events', icon: <PartyPopper className="h-5 w-5" />, name: translateText('Gestão de Eventos'), desc: translateText('Eventos, ingressos e check-in'), tier: 'Pro', color: 'from-secondary to-secondary/80',
      details: translateText('Crie eventos com ingressos, controle capacidade e check-in por QR Code.') },
    { id: 'happy_hour', icon: <Clock className="h-5 w-5" />, name: 'Happy Hour', desc: translateText('Preços automáticos por horário'), tier: translateText('Grátis'), color: 'from-success to-success/80',
      details: translateText('Configure horários especiais com preços automaticamente ajustados.') },
    { id: 'ai_recs', icon: <Brain className="h-5 w-5" />, name: translateText('IA de Recomendações'), desc: translateText('Sugestões inteligentes e harmonização'), tier: 'Premium', color: 'from-info to-info/80',
      details: translateText('IA analisa preferências e histórico para sugerir pratos personalizados.') },
    { id: 'vip', icon: <Crown className="h-5 w-5" />, name: translateText('Programa VIP'), desc: translateText('Áreas exclusivas e benefícios'), tier: 'Pro', color: 'from-warning to-warning/80',
      details: translateText('Crie tiers VIP (Silver, Gold, Platinum) com benefícios exclusivos.') },
    { id: 'experience', icon: <Gift className="h-5 w-5" />, name: translateText('Pacotes de Experiência'), desc: translateText('Combos e experiências gastronômicas'), tier: translateText('Grátis'), color: 'from-accent to-accent/80',
      details: translateText('Pacotes que combinam menu, drinks e experiência.') },
    { id: 'reviews', icon: <Star className="h-5 w-5" />, name: translateText('Avaliações Inteligentes'), desc: translateText('Feedback automático pós-visita'), tier: translateText('Grátis'), color: 'from-primary to-primary/80',
      details: translateText('Avaliação enviada automaticamente após o pagamento.') },
    { id: 'analytics_ai', icon: <TrendingUp className="h-5 w-5" />, name: translateText('Analytics Avançado'), desc: translateText('Previsões e insights por IA'), tier: 'Premium', color: 'from-destructive to-destructive/80',
      details: translateText('Dashboard com previsão de demanda e otimização de cardápio.') },
  ];

  const toggleFeature = (id: string) => {
    setActive(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      const feat = features.find(f => f.id === id);
      toast.show(next.includes(id) ? `${feat?.name} ${translateText('ativado')}!` : `${feat?.name} ${translateText('desativado')}`, next.includes(id) ? 'success' : 'info');
      return next;
    });
  };

  const tierColors: Record<string, string> = { 'Premium': 'bg-primary/10 text-primary', 'Pro': 'bg-secondary/10 text-secondary' };

  return (
    <div className="space-y-3 relative">
      {toast.el}
      <ConfigHeader title={translateText('Marketplace de Features')} subtitle={translateText('Ative módulos avançados para seu negócio')}
        icon={<Zap className="h-5 w-5 text-warning" />} onBack={() => onNavigate('config-hub')} badge={`${active.length} ${translateText('ativos')}`} />

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
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} text-primary-foreground shrink-0`}>{feat.icon}</div>
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
                  <button onClick={() => toggleFeature(feat.id)}>
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
