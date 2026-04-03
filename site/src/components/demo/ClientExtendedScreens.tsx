/**
 * Client Demo — Extended Screens
 * Auth/Onboarding, Profile, Wallet, Digital Receipt, Support
 * Reusable across all 11 service-type demos
 */
import React, { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight,
  CreditCard, DollarSign, Download, Eye, EyeOff, Gift,
  HelpCircle, History, Lock, LogIn, Mail, MessageCircle,
  Phone, Plus, QrCode, Receipt, Shield, Smartphone,
  Star, User, UserPlus, Wallet, X, Zap,
  Fingerprint, CreditCard as CardIcon, Banknote, PiggyBank,
  FileText, Send, Clock, AlertCircle, Heart,
  Crown, Bell, Settings, LogOut, Award,
  CalendarDays,
} from 'lucide-react';
import { GuidedHint } from './DemoShared';

// ============ AUTH — LOGIN ============

export const AuthLoginScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="px-5 py-6 space-y-5">
      <GuidedHint text="Tela de login — e-mail, social login ou biometria" />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Bem-vindo à NOOWE</h2>
        <p className="text-xs text-muted-foreground">Entre para acessar seu perfil e pedidos</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-foreground">E-mail</label>
          <div className="mt-1 flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-card">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">seu@email.com</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground">Senha</label>
          <div className="mt-1 flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-card">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1 text-sm text-muted-foreground">{showPassword ? 'minhasenha123' : '••••••••'}</span>
            <button onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}</button>
          </div>
        </div>
        <button onClick={() => onNavigate('home')} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Entrar</button>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" /><span className="text-[10px] text-muted-foreground">ou</span><div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Google', color: 'bg-red-500/10 text-red-500' },
            { name: 'Apple', color: 'bg-foreground/10 text-foreground' },
            { name: 'Biometria', color: 'bg-green-500/10 text-green-500' },
          ].map(provider => (
            <button key={provider.name} onClick={() => onNavigate('home')} className={`py-2.5 rounded-xl text-xs font-medium ${provider.color} border border-border`}>{provider.name}</button>
          ))}
        </div>
        <button onClick={() => onNavigate('auth-register')} className="w-full text-center text-xs text-primary font-medium">Não tem conta? <span className="underline">Cadastre-se</span></button>
      </div>
    </div>
  );
};

// ============ AUTH — REGISTER ============

export const AuthRegisterScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => (
  <div className="px-5 py-6 space-y-5">
    <GuidedHint text="Cadastro rápido — em segundos você está dentro" />
    <button onClick={() => onNavigate('auth-login')} className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="w-3.5 h-3.5" /> Voltar</button>
    <div className="text-center space-y-1">
      <h2 className="text-lg font-bold text-foreground">Criar Conta</h2>
      <p className="text-xs text-muted-foreground">Preencha seus dados para começar</p>
    </div>
    <div className="space-y-3">
      {[
        { label: 'Nome completo', icon: User, placeholder: 'Seu nome' },
        { label: 'E-mail', icon: Mail, placeholder: 'seu@email.com' },
        { label: 'Celular', icon: Phone, placeholder: '(11) 99999-9999' },
        { label: 'Senha', icon: Lock, placeholder: '••••••••' },
      ].map(field => (
        <div key={field.label}>
          <label className="text-xs font-medium text-foreground">{field.label}</label>
          <div className="mt-1 flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-card">
            <field.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{field.placeholder}</span>
          </div>
        </div>
      ))}
      <div className="flex items-start gap-2 pt-1">
        <div className="w-4 h-4 rounded border border-primary bg-primary/10 flex items-center justify-center mt-0.5"><Check className="w-3 h-3 text-primary" /></div>
        <p className="text-[10px] text-muted-foreground">Concordo com os Termos de Uso e Política de Privacidade</p>
      </div>
      <button onClick={() => onNavigate('onboarding')} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Criar Conta</button>
    </div>
  </div>
);

// ============ ONBOARDING ============

export const OnboardingScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'Descubra Restaurantes', desc: 'Encontre os melhores restaurantes perto de você com cardápio digital e pedidos inteligentes.', icon: Star, color: 'bg-primary/10 text-primary' },
    { title: 'Peça sem Espera', desc: 'Escaneie o QR da mesa, faça seu pedido e acompanhe em tempo real — sem fila, sem erro.', icon: QrCode, color: 'bg-green-500/10 text-green-500' },
    { title: 'Pague como Quiser', desc: 'PIX, cartão, Apple Pay — divida a conta facilmente e ganhe pontos de fidelidade.', icon: CreditCard, color: 'bg-blue-500/10 text-blue-500' },
  ];
  const s = steps[step];
  return (
    <div className="px-5 py-8 space-y-6 text-center">
      <GuidedHint text="Onboarding — apresentação rápida das funcionalidades" />
      <div className={`w-20 h-20 mx-auto rounded-2xl ${s.color} flex items-center justify-center`}>
        <s.icon className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">{s.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
      </div>
      <div className="flex justify-center gap-2">
        {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-primary w-6' : 'bg-muted'} transition-all`} />)}
      </div>
      <div className="space-y-2 pt-4">
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Próximo</button>
        ) : (
          <button onClick={() => onNavigate('home')} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Começar</button>
        )}
        <button onClick={() => onNavigate('home')} className="text-xs text-muted-foreground">Pular</button>
      </div>
    </div>
  );
};

// ============ PROFILE ============

export const ProfileScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="px-5 pb-4">
      <div className="py-4"><h1 className="font-display text-xl font-bold text-foreground">Meu Perfil</h1></div>
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 mb-5">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-6 h-6 text-primary" /></div>
        <div className="flex-1"><h2 className="font-semibold text-foreground">Usuário Demo</h2><p className="text-xs text-muted-foreground">demo@noowe.com.br</p></div>
        <div className="text-right"><p className="font-display font-bold text-primary">1.250</p><p className="text-[10px] text-muted-foreground">pontos</p></div>
      </div>
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 mb-5">
        <div className="flex items-center gap-2 mb-2"><Crown className="w-4 h-4 text-accent" /><span className="text-sm font-semibold text-foreground">Nível Gold</span></div>
        <div className="h-1.5 bg-muted rounded-full"><div className="h-full bg-accent rounded-full" style={{ width: '62%' }} /></div>
        <p className="text-[10px] text-muted-foreground mt-1">750 pontos para Platinum</p>
      </div>
      <div className="space-y-1">
        {[
          { icon: Wallet, label: 'Minha Carteira', screen: 'wallet' },
          { icon: Bell, label: 'Notificações', screen: 'notifications', badge: 3 },
          { icon: History, label: 'Histórico de Pedidos', screen: 'home' },
          { icon: Gift, label: 'Programa de Fidelidade', screen: 'home' },
          { icon: CreditCard, label: 'Métodos de Pagamento', screen: 'wallet' },
          { icon: Heart, label: 'Favoritos', screen: 'home' },
          { icon: Receipt, label: 'Recibos Digitais', screen: 'digital-receipt' },
          { icon: Settings, label: 'Configurações' },
          { icon: HelpCircle, label: 'Ajuda & Suporte', screen: 'support' },
        ].map(({ icon: Icon, label, screen, badge }) => (
          <button key={label} onClick={() => screen ? onNavigate(screen) : undefined} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-left text-foreground">{label}</span>
            {badge && <span className="w-5 h-5 rounded-full bg-destructive text-primary-foreground text-[10px] font-bold flex items-center justify-center">{badge}</span>}
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </button>
        ))}
      </div>
      <button onClick={() => onNavigate('auth-login')} className="w-full flex items-center gap-3 p-3 rounded-xl text-destructive hover:bg-destructive/5 transition-colors mt-4"><LogOut className="w-5 h-5" /><span className="text-sm">Sair</span></button>
    </div>
  );
};

// ============ WALLET ============

export const WalletScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [showBalance, setShowBalance] = useState(true);
  return (
    <div className="px-5 py-4 space-y-5">
      <GuidedHint text="Carteira digital — saldo, cashback, métodos de pagamento e extrato" />
      <div className="flex items-center justify-between">
        <button onClick={() => onNavigate('profile')} className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="w-3.5 h-3.5" /> Perfil</button>
        <h2 className="text-base font-bold text-foreground">Minha Carteira</h2>
        <div className="w-8" />
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-primary to-primary/70 rounded-2xl p-5 text-primary-foreground">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs opacity-80">Saldo disponível</span>
          <button onClick={() => setShowBalance(!showBalance)}>{showBalance ? <Eye className="w-4 h-4 opacity-70" /> : <EyeOff className="w-4 h-4 opacity-70" />}</button>
        </div>
        <div className="text-2xl font-bold mb-4">{showBalance ? 'R$ 124,50' : '•••••'}</div>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="bg-white/10 rounded-lg py-2"><div className="font-bold text-sm">R$ 45</div>Cashback</div>
          <div className="bg-white/10 rounded-lg py-2"><div className="font-bold text-sm">850</div>Pontos</div>
          <div className="bg-white/10 rounded-lg py-2"><div className="font-bold text-sm">R$ 30</div>Créditos</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Plus, label: 'Adicionar', color: 'bg-green-500/10 text-green-500' },
          { icon: Send, label: 'Transferir', color: 'bg-blue-500/10 text-blue-500' },
          { icon: QrCode, label: 'Pagar QR', color: 'bg-primary/10 text-primary' },
          { icon: Gift, label: 'Resgatar', color: 'bg-amber-500/10 text-amber-500' },
        ].map(a => (
          <button key={a.label} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-border">
            <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center`}><a.icon className="w-4 h-4" /></div>
            <span className="text-[10px] font-medium text-foreground">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Payment methods */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Métodos de Pagamento</span>
          <button className="text-xs text-primary font-medium">+ Adicionar</button>
        </div>
        {[
          { type: 'Visa', last4: '4242', brand: 'Cartão de Crédito', default: true },
          { type: 'Mastercard', last4: '8821', brand: 'Cartão de Débito', default: false },
          { type: 'PIX', last4: '', brand: 'Chave CPF', default: false },
        ].map((card, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0 border-border">
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-foreground">{card.type} {card.last4 && `•••• ${card.last4}`}</div>
              <div className="text-[10px] text-muted-foreground">{card.brand}</div>
            </div>
            {card.default && <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded font-medium">Padrão</span>}
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div>
        <span className="text-sm font-semibold text-foreground">Últimas Transações</span>
        {[
          { place: 'Bistrô Noowe', amount: -148.50, date: 'Hoje, 20:30', type: 'payment', cashback: 7.42 },
          { place: 'Cashback recebido', amount: 12.30, date: 'Ontem', type: 'cashback', cashback: 0 },
          { place: 'Café Noowe', amount: -32.00, date: '28/03', type: 'payment', cashback: 1.60 },
          { place: 'Recarga Wallet', amount: 100.00, date: '25/03', type: 'deposit', cashback: 0 },
        ].map((tx, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b last:border-0 border-border">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0 ? 'bg-green-500/10' : 'bg-muted'}`}>
                {tx.type === 'cashback' ? <Gift className="w-4 h-4 text-green-500" /> : tx.type === 'deposit' ? <Plus className="w-4 h-4 text-green-500" /> : <Receipt className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{tx.place}</div>
                <div className="text-[10px] text-muted-foreground">{tx.date}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>{tx.amount > 0 ? '+' : ''}R$ {Math.abs(tx.amount).toFixed(2)}</div>
              {tx.cashback > 0 && <div className="text-[10px] text-green-500">+R$ {tx.cashback.toFixed(2)} cashback</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ DIGITAL RECEIPT ============

export const DigitalReceiptScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => (
  <div className="px-5 py-4 space-y-5">
    <GuidedHint text="Recibo digital completo — compartilhe, exporte PDF ou adicione à carteira" />
    <div className="flex items-center justify-between">
      <button onClick={() => onNavigate('home')} className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="w-3.5 h-3.5" /> Voltar</button>
      <h2 className="text-base font-bold text-foreground">Recibo Digital</h2>
      <button className="text-xs text-primary font-medium"><Download className="w-4 h-4" /></button>
    </div>

    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="text-center border-b border-dashed border-border pb-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2"><Receipt className="w-6 h-6 text-primary" /></div>
        <div className="text-sm font-bold text-foreground">Restaurante NOOWE</div>
        <div className="text-[10px] text-muted-foreground">CNPJ: 12.345.678/0001-90</div>
        <div className="text-[10px] text-muted-foreground">03/04/2026 · 20:45</div>
      </div>

      <div className="space-y-2">
        {[
          { name: 'Prato Principal', qty: 1, price: 118.00 },
          { name: 'Acompanhamento', qty: 1, price: 89.00 },
          { name: 'Bebida', qty: 2, price: 76.00 },
          { name: 'Sobremesa', qty: 1, price: 42.00 },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="text-xs text-foreground">{item.qty}x {item.name}</div>
            <div className="text-xs font-medium text-foreground">R$ {item.price.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-border pt-3 space-y-1">
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">R$ 325,00</span></div>
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Taxa de serviço (10%)</span><span className="text-foreground">R$ 32,50</span></div>
        <div className="flex justify-between text-xs"><span className="text-green-500">Desconto fidelidade</span><span className="text-green-500">-R$ 15,00</span></div>
        <div className="flex justify-between text-sm font-bold pt-2 border-t border-border"><span className="text-foreground">Total</span><span className="text-foreground">R$ 342,50</span></div>
      </div>

      <div className="bg-muted/50 rounded-xl p-3 space-y-1">
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Pagamento</span><span className="text-foreground">Visa •••• 4242</span></div>
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Gorjeta</span><span className="text-foreground">R$ 34,25 (10%)</span></div>
        <div className="flex justify-between text-xs"><span className="text-green-500">Cashback ganho</span><span className="text-green-500">+R$ 17,13</span></div>
        <div className="flex justify-between text-xs"><span className="text-primary">Pontos ganhos</span><span className="text-primary">+342 pts</span></div>
      </div>

      <div className="text-center">
        <div className="w-24 h-24 mx-auto bg-foreground/5 rounded-xl flex items-center justify-center mb-2">
          <QrCode className="w-16 h-16 text-foreground/20" />
        </div>
        <div className="text-[10px] text-muted-foreground">NFC-e válida · Chave de acesso</div>
        <div className="text-[9px] text-muted-foreground font-mono">3524 0412 3456 7800 0190 5500 1000 0000 1234</div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2">
      <button className="py-2.5 rounded-xl bg-card border border-border text-xs font-medium text-foreground flex flex-col items-center gap-1"><Download className="w-4 h-4" />PDF</button>
      <button className="py-2.5 rounded-xl bg-card border border-border text-xs font-medium text-foreground flex flex-col items-center gap-1"><Send className="w-4 h-4" />Enviar</button>
      <button onClick={() => onNavigate('wallet')} className="py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-medium text-primary flex flex-col items-center gap-1"><Wallet className="w-4 h-4" />Carteira</button>
    </div>

    <button onClick={() => onNavigate('wallet')} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
      Ver Minha Carteira
    </button>
    <button onClick={() => onNavigate('home')} className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground">
      Voltar ao Início
    </button>
  </div>
);

// ============ SUPPORT ============

export const SupportScreen: React.FC<{ onNavigate: (s: string) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'chat' | 'history'>('faq');
  return (
    <div className="px-5 py-4 space-y-5">
      <GuidedHint text="Central de ajuda — FAQ, chat em tempo real e histórico de chamados" />
      <div className="flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="w-3.5 h-3.5" /> Voltar</button>
        <h2 className="text-base font-bold text-foreground">Ajuda & Suporte</h2>
        <div className="w-8" />
      </div>

      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {(['faq', 'chat', 'history'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            {tab === 'faq' ? 'FAQ' : tab === 'chat' ? 'Chat' : 'Histórico'}
          </button>
        ))}
      </div>

      {activeTab === 'faq' && (
        <div className="space-y-2">
          {[
            { q: 'Como funciona o pagamento?', a: 'Aceito PIX, cartões e Apple/Google Pay. A conta pode ser dividida entre várias pessoas.' },
            { q: 'Posso cancelar um pedido?', a: 'Sim, desde que o pedido ainda não tenha entrado em preparo. Consulte a equipe se necessário.' },
            { q: 'Como ganho pontos de fidelidade?', a: 'A cada R$ 1 gasto você acumula 1 ponto. Pontos podem ser trocados por recompensas.' },
            { q: 'Posso reservar uma mesa?', a: 'Sim! Acesse a aba Reservas no app e escolha data, horário e número de convidados.' },
            { q: 'Como chamar o garçom?', a: 'Use o botão "Chamar Equipe" no app — discreto e instantâneo.' },
          ].map((faq, i) => (
            <details key={i} className="bg-card border border-border rounded-xl overflow-hidden group">
              <summary className="px-4 py-3 text-xs font-medium text-foreground cursor-pointer flex items-center justify-between list-none">
                {faq.q}
                <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-4 pb-3 text-xs text-muted-foreground">{faq.a}</div>
            </details>
          ))}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-2xl p-4 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-500/10 flex items-center justify-center"><MessageCircle className="w-6 h-6 text-green-500" /></div>
            <div className="text-sm font-semibold text-foreground">Chat ao Vivo</div>
            <div className="text-xs text-muted-foreground">Tempo médio de resposta: <span className="text-green-500 font-medium">&lt; 2 min</span></div>
            <div className="flex items-center justify-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] text-green-500 font-medium">3 atendentes online</span></div>
            <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">Iniciar Conversa</button>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <div><div className="text-xs font-medium text-foreground">WhatsApp</div><div className="text-[10px] text-muted-foreground">Resposta em até 5 minutos</div></div>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-2">
          {[
            { id: '#1042', subject: 'Dúvida sobre cashback', status: 'resolved', date: '01/04' },
            { id: '#1038', subject: 'Erro no pagamento PIX', status: 'resolved', date: '28/03' },
          ].map((ticket, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-foreground">{ticket.subject}</div>
                <div className="text-[10px] text-muted-foreground">{ticket.id} · {ticket.date}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">Resolvido</span>
            </div>
          ))}
          <p className="text-center text-[10px] text-muted-foreground py-2">Todos os chamados foram resolvidos ✓</p>
        </div>
      )}
    </div>
  );
};