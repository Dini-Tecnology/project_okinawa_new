/**
 * Restaurant Demo — Welcome + Setup Screens
 */
import React, { useState } from 'react';
import {
  ArrowRight, Check, ChefHat, BarChart3, LayoutGrid, UtensilsCrossed,
  CalendarDays, Users, Star, Smartphone, Zap, Shield, Clock,
  TrendingUp, Bell, QrCode, CreditCard, Wifi, ParkingSquare,
  Accessibility, Dog, Sun, Wine, MapPin, Phone, Globe, Camera,
  Settings, Sparkles,
} from 'lucide-react';
import { GuidedHint } from '@/components/demo/DemoShared';

// ============ WELCOME ============

export const WelcomeScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => (
  <div className="space-y-8">
    <GuidedHint text="Explore o painel NOOWE como se fosse seu restaurante. Clique em 'Começar' para iniciar!" />

    {/* Hero */}
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-border p-8 md:p-12">
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">DEMO</div>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-display font-bold text-xl">N</span>
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Bistrô Noowe</h1>
            <p className="text-sm text-muted-foreground">Painel de Gestão Operacional</p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Descubra como a <span className="text-foreground font-semibold">NOOWE</span> transforma cada aspecto da operação do seu restaurante — 
          do primeiro pedido ao relatório de final de mês.
        </p>
        <button
          onClick={() => onNavigate('setup')}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow hover:shadow-glow-lg transition-all"
        >
          Começar o Tour
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Feature highlights */}
    <div className="grid md:grid-cols-3 gap-4">
      {[
        { icon: BarChart3, title: 'Dashboard em Tempo Real', desc: 'KPIs, receita, ocupação e pedidos atualizados ao vivo', color: 'text-primary', bg: 'bg-primary/10' },
        { icon: ChefHat, title: 'KDS Profissional', desc: 'Display de cozinha e bar com tickets, timers e prioridades', color: 'text-warning', bg: 'bg-warning/10' },
        { icon: LayoutGrid, title: 'Mapa Interativo', desc: 'Planta do salão com status visual de cada mesa', color: 'text-info', bg: 'bg-info/10' },
        { icon: CalendarDays, title: 'Reservas & Fila', desc: 'Check-in, fila virtual e gestão de fluxo do Maitre', color: 'text-secondary', bg: 'bg-secondary/10' },
        { icon: Smartphone, title: 'App do Garçom', desc: 'Pedidos, chamados e gorjetas direto no celular', color: 'text-success', bg: 'bg-success/10' },
        { icon: TrendingUp, title: 'Analytics Completo', desc: 'Relatórios de receita, itens e desempenho da equipe', color: 'text-accent-foreground', bg: 'bg-accent/10' },
      ].map(({ icon: Icon, title, desc, color, bg }) => (
        <div key={title} className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-colors">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>

    {/* Role preview */}
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-bold text-lg mb-2">Veja pela perspectiva de cada membro</h3>
      <p className="text-sm text-muted-foreground mb-4">O NOOWE se adapta ao papel de cada colaborador na operação</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { emoji: '👑', role: 'Dono / Gerente', focus: 'Dashboard, Analytics, Equipe', color: 'border-primary/30 bg-primary/5' },
          { emoji: '👨‍🍳', role: 'Chef / Cozinha', focus: 'KDS, Cardápio, Estoque', color: 'border-warning/30 bg-warning/5' },
          { emoji: '🤵', role: 'Garçom', focus: 'Pedidos, Mesas, Gorjetas', color: 'border-info/30 bg-info/5' },
          { emoji: '💁‍♀️', role: 'Maitre / Hostess', focus: 'Reservas, Fila, Check-in', color: 'border-secondary/30 bg-secondary/5' },
        ].map(({ emoji, role, focus, color }) => (
          <div key={role} className={`p-4 rounded-xl border ${color} text-center`}>
            <span className="text-3xl">{emoji}</span>
            <p className="font-semibold text-sm mt-2">{role}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{focus}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {[
        { value: '11', label: 'Tipos de Serviço', sub: 'Fine Dining a Club' },
        { value: '6', label: 'Roles RBAC', sub: 'Controle granular' },
        { value: '∞', label: 'Personalização', sub: 'Adapta ao seu negócio' },
      ].map(({ value, label, sub }) => (
        <div key={label} className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="font-display text-3xl font-bold text-primary">{value}</p>
          <p className="text-sm font-semibold mt-1">{label}</p>
          <p className="text-[10px] text-muted-foreground">{sub}</p>
        </div>
      ))}
    </div>
  </div>
);

// ============ SETUP WIZARD ============

export const SetupScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  const [setupStep, setSetupStep] = useState(0);
  const [serviceType, setServiceType] = useState('full-service');

  const SERVICE_TYPES = [
    { id: 'full-service', label: 'Fine Dining', desc: 'Mesa com garçom completo', features: 26 },
    { id: 'casual-dining', label: 'Casual Dining', desc: 'Ambiente descontraído', features: 22 },
    { id: 'fast-casual', label: 'Fast Casual', desc: 'Pedido no balcão', features: 18 },
    { id: 'cafe', label: 'Café / Padaria', desc: 'Work Mode + Refill', features: 16 },
    { id: 'bar', label: 'Pub & Bar', desc: 'Comanda digital', features: 20 },
    { id: 'buffet', label: 'Buffet', desc: 'Balança inteligente', features: 14 },
    { id: 'drive-thru', label: 'Drive-Thru', desc: 'Geofencing GPS', features: 12 },
    { id: 'food-truck', label: 'Food Truck', desc: 'Mapa + Fila virtual', features: 14 },
    { id: 'chefs-table', label: "Chef's Table", desc: 'Menu degustação', features: 24 },
    { id: 'quick-service', label: 'Quick Service', desc: 'Skip the Line', features: 15 },
    { id: 'club', label: 'Club & Balada', desc: 'Ingressos + VIP', features: 22 },
  ];

  const FEATURES = [
    { label: 'Wi-Fi', icon: Wifi, active: true },
    { label: 'Estacionamento', icon: ParkingSquare, active: true },
    { label: 'Acessível', icon: Accessibility, active: true },
    { label: 'Pet Friendly', icon: Dog, active: true },
    { label: 'Terraço', icon: Sun, active: true },
    { label: 'Carta de Vinhos', icon: Wine, active: true },
    { label: 'Reservas Online', icon: CalendarDays, active: true },
    { label: 'QR Code nas Mesas', icon: QrCode, active: true },
  ];

  const steps = ['Perfil', 'Tipo de Serviço', 'Recursos', 'Pagamentos'];

  return (
    <div className="space-y-6">
      <GuidedHint text="Veja como é simples configurar seu restaurante na NOOWE em poucos passos" />

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => setSetupStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                i === setupStep ? 'bg-primary text-primary-foreground shadow-glow' :
                i < setupStep ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < setupStep ? <Check className="w-3.5 h-3.5" /> : <span className="w-4 text-center">{i + 1}</span>}
              <span className="hidden md:inline">{s}</span>
            </button>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${i < setupStep ? 'bg-success' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      {setupStep === 0 && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h3 className="font-display font-bold text-lg">Perfil do Restaurante</h3>
          <div className="flex gap-6">
            <div className="w-28 h-28 rounded-2xl bg-muted flex items-center justify-center relative group cursor-pointer overflow-hidden">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200" alt="Restaurant" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome do Estabelecimento</label>
                <div className="mt-1 p-3 rounded-xl border border-border bg-background text-sm font-semibold">Bistrô Noowe</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</label>
                <div className="mt-1 p-3 rounded-xl border border-border bg-background text-sm text-muted-foreground">Gastronomia contemporânea com ingredientes locais e sazonais</div>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: MapPin, label: 'Endereço', value: 'Rua Oscar Freire, 432 - Jardins, SP' },
              { icon: Phone, label: 'Telefone', value: '(11) 3042-8900' },
              { icon: Clock, label: 'Horário', value: 'Ter-Dom · 12h–15h, 19h–00h' },
              { icon: Globe, label: 'Website', value: 'www.bistronoowe.com.br' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className="text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setSetupStep(1)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-glow">
            Próximo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {setupStep === 1 && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-lg">Tipo de Serviço</h3>
            <p className="text-sm text-muted-foreground">Define as funcionalidades disponíveis na plataforma</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SERVICE_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setServiceType(type.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  serviceType === type.id ? 'border-primary bg-primary/5 shadow-glow ring-1 ring-primary/20' : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <p className="font-semibold text-sm">{type.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{type.desc}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-[10px] text-primary font-semibold">{type.features} features</span>
                </div>
                {serviceType === type.id && <Check className="w-4 h-4 text-primary mt-1" />}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSetupStep(0)} className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium">Voltar</button>
            <button onClick={() => setSetupStep(2)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-glow">
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {setupStep === 2 && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-display font-bold text-lg">Características do Estabelecimento</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURES.map(({ icon: Icon, label, active }) => (
              <button key={label} className={`flex items-center gap-2 p-3.5 rounded-xl border transition-colors ${active ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-border text-muted-foreground'}`}>
                <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
                <span className="text-xs font-medium">{label}</span>
                {active && <Check className="w-3 h-3 text-primary ml-auto" />}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSetupStep(1)} className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium">Voltar</button>
            <button onClick={() => setSetupStep(3)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-glow">
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {setupStep === 3 && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-display font-bold text-lg">Configurações de Pagamento</h3>
            <div className="space-y-3">
              {[
                { label: 'Taxa de serviço', value: '10%', desc: 'Cobrada automaticamente' },
                { label: 'Gorjeta', value: 'Opcional', desc: 'Cliente escolhe 5%, 10%, 15%' },
                { label: 'Split de pagamento', value: 'Ativo', desc: 'Individual, igualitário, por item, valor fixo' },
                { label: 'Métodos aceitos', value: 'Todos', desc: 'Cartão, PIX, Apple Pay, Google Pay, NFC' },
                { label: 'Pré-autorização (Tab)', value: 'Ativo', desc: 'Comanda digital com limite configurável' },
              ].map(({ label, value, desc }) => (
                <div key={label} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30">
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-xl border border-success/20 p-6 text-center">
            <Check className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg">Configuração Completa!</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Seu restaurante está pronto para operar com a NOOWE</p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow mx-auto"
            >
              Ir para o Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
