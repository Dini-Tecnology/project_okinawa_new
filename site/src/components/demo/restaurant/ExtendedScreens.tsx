/**
 * Restaurant Demo — Extended Screens
 * Financial Brain, Chef Advanced, CRM, HR, Integrations, Club Mgmt,
 * QR Codes, Tap to Pay, Reports, Reviews, Reservations, Config extras
 */
import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, ArrowUp, ArrowDown, Clock, Check,
  AlertCircle, CheckCircle2, Package, Users, Star, Shield,
  ChefHat, Flame, BarChart3, Settings, Smartphone, QrCode,
  Globe, Bell, Gift, Heart, Calendar, FileText, Download,
  CreditCard, Wallet, Receipt, PieChart, Target, Zap,
  Music, DoorOpen, UserCheck, Crown, Ticket, MapPin,
  Truck, Navigation, Wifi, Phone, Mail, Building,
  Briefcase, GraduationCap, Award, Activity,
} from 'lucide-react';
import { GuidedHint } from '@/components/demo/DemoShared';

// ============ FINANCIAL DASHBOARD ============

export const FinancialDashboardScreen: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const data = {
    today: { revenue: 12840, costs: 4100, margin: 68, orders: 87, avgTicket: 148, cashBalance: 3200 },
    week: { revenue: 78500, costs: 25200, margin: 67.9, orders: 542, avgTicket: 145, cashBalance: 3200 },
    month: { revenue: 312000, costs: 99800, margin: 68, orders: 2150, avgTicket: 145, cashBalance: 3200 },
  }[period];

  return (
    <div className="space-y-5">
      <GuidedHint text="Painel financeiro completo — receita, custos, margens e previsão" />
      <div className="flex gap-2">
        {(['today', 'week', 'month'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${period === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Receita Bruta</div>
          <div className="text-xl font-bold text-foreground">R$ {data.revenue.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-green-500 mt-1"><ArrowUp className="w-3 h-3" />+12% vs anterior</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Custos (CMV)</div>
          <div className="text-xl font-bold text-foreground">R$ {data.costs.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><PieChart className="w-3 h-3" />{(100 - data.margin).toFixed(1)}% da receita</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Margem Líquida</div>
          <div className="text-xl font-bold text-green-500">{data.margin}%</div>
          <div className="w-full h-2 bg-muted rounded-full mt-2"><div className="h-2 bg-green-500 rounded-full" style={{ width: `${data.margin}%` }} /></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Ticket Médio</div>
          <div className="text-xl font-bold text-foreground">R$ {data.avgTicket}</div>
          <div className="flex items-center gap-1 text-xs text-green-500 mt-1"><ArrowUp className="w-3 h-3" />+R$ 8 vs anterior</div>
        </div>
      </div>
      {/* Revenue breakdown */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-sm font-semibold text-foreground mb-3">Composição da Receita</div>
        {[
          { label: 'Alimentos', pct: 62, color: 'bg-primary' },
          { label: 'Bebidas', pct: 28, color: 'bg-blue-500' },
          { label: 'Taxa de Serviço', pct: 8, color: 'bg-amber-500' },
          { label: 'Outros', pct: 2, color: 'bg-muted-foreground' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 mb-2">
            <span className="text-xs text-muted-foreground w-28">{item.label}</span>
            <div className="flex-1 h-2 bg-muted rounded-full"><div className={`h-2 ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} /></div>
            <span className="text-xs font-medium text-foreground w-10 text-right">{item.pct}%</span>
          </div>
        ))}
      </div>
      {/* Bills summary */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-sm font-semibold text-foreground mb-3">Contas a Pagar</div>
        {[
          { name: 'Fornecedor - Carnes Premium', due: '05/04', amount: 4200, status: 'pending' },
          { name: 'Fornecedor - Bebidas', due: '08/04', amount: 2800, status: 'pending' },
          { name: 'Aluguel', due: '10/04', amount: 12000, status: 'scheduled' },
        ].map((bill, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
            <div>
              <div className="text-xs font-medium text-foreground">{bill.name}</div>
              <div className="text-[10px] text-muted-foreground">Venc: {bill.due}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-foreground">R$ {bill.amount.toLocaleString()}</div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${bill.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-blue-500/10 text-blue-500'}`}>
                {bill.status === 'pending' ? 'Pendente' : 'Agendado'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ CASH REGISTER ============

export const CashRegisterScreen: React.FC = () => {
  const [sessionOpen, setSessionOpen] = useState(true);
  return (
    <div className="space-y-5">
      <GuidedHint text="Controle completo do caixa — abertura, sangria, reforço e fechamento" />
      <div className={`rounded-xl border-2 p-4 ${sessionOpen ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-card'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${sessionOpen ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-sm font-semibold text-foreground">{sessionOpen ? 'Caixa Aberto' : 'Caixa Fechado'}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Aberto por Marina Costa às 14:00</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center"><div className="text-xs text-muted-foreground">Abertura</div><div className="text-sm font-bold text-foreground">R$ 500</div></div>
          <div className="text-center"><div className="text-xs text-muted-foreground">Entradas</div><div className="text-sm font-bold text-green-500">R$ 8.420</div></div>
          <div className="text-center"><div className="text-xs text-muted-foreground">Saldo</div><div className="text-sm font-bold text-foreground">R$ 3.180</div></div>
        </div>
      </div>
      {/* Movements */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-sm font-semibold text-foreground mb-3">Movimentações</div>
        {[
          { type: 'Venda Cartão', amount: 4200, time: '19:45', icon: CreditCard, positive: true },
          { type: 'Venda PIX', amount: 2800, time: '19:30', icon: Smartphone, positive: true },
          { type: 'Venda Dinheiro', amount: 1420, time: '18:50', icon: DollarSign, positive: true },
          { type: 'Sangria', amount: -1500, time: '18:00', icon: ArrowDown, positive: false },
          { type: 'Reforço', amount: 500, time: '14:05', icon: ArrowUp, positive: true },
        ].map((mov, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
            <div className="flex items-center gap-2">
              <mov.icon className="w-4 h-4 text-muted-foreground" />
              <div><div className="text-xs font-medium text-foreground">{mov.type}</div><div className="text-[10px] text-muted-foreground">{mov.time}</div></div>
            </div>
            <span className={`text-sm font-bold ${mov.positive ? 'text-green-500' : 'text-destructive'}`}>{mov.positive ? '+' : ''}R$ {Math.abs(mov.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 rounded-xl bg-warning/10 text-warning text-xs font-semibold border border-warning/20">Sangria</button>
        <button className="flex-1 py-2.5 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-semibold border border-blue-500/20">Reforço</button>
        <button onClick={() => setSessionOpen(false)} className="flex-1 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20">Fechar Caixa</button>
      </div>
    </div>
  );
};

// ============ FISCAL ============

export const FiscalScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Emissão de NFC-e integrada — configure certificado e CNPJ" />
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <span className="text-sm font-semibold text-foreground">Status: Conectado à SEFAZ</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div><span className="text-muted-foreground">CNPJ:</span><br /><span className="font-medium text-foreground">12.345.678/0001-90</span></div>
        <div><span className="text-muted-foreground">I.E.:</span><br /><span className="font-medium text-foreground">123.456.789.000</span></div>
        <div><span className="text-muted-foreground">Certificado:</span><br /><span className="font-medium text-green-500">Válido até 12/2026</span></div>
        <div><span className="text-muted-foreground">Ambiente:</span><br /><span className="font-medium text-foreground">Produção</span></div>
      </div>
    </div>
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-3">Notas Emitidas Hoje</div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center"><div className="text-lg font-bold text-foreground">87</div><div className="text-[10px] text-muted-foreground">Emitidas</div></div>
        <div className="text-center"><div className="text-lg font-bold text-green-500">85</div><div className="text-[10px] text-muted-foreground">Autorizadas</div></div>
        <div className="text-center"><div className="text-lg font-bold text-destructive">2</div><div className="text-[10px] text-muted-foreground">Rejeitadas</div></div>
      </div>
      {[{ num: '000.087', time: '19:52', total: 342.50, status: 'authorized' }, { num: '000.086', time: '19:45', total: 189.00, status: 'authorized' }, { num: '000.085', time: '19:30', total: 456.90, status: 'rejected' }].map((nf, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
          <div><div className="text-xs font-medium text-foreground">NFC-e #{nf.num}</div><div className="text-[10px] text-muted-foreground">{nf.time}</div></div>
          <div className="text-right">
            <div className="text-xs font-bold text-foreground">R$ {nf.total.toFixed(2)}</div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${nf.status === 'authorized' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>{nf.status === 'authorized' ? 'Autorizada' : 'Rejeitada'}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============ COST CONTROL ============

export const CostControlScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="CMV por prato, fichas técnicas e margem de contribuição" />
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">CMV Médio</div><div className="text-lg font-bold text-foreground">32%</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Margem Média</div><div className="text-lg font-bold text-green-500">68%</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Pratos c/ CMV Alto</div><div className="text-lg font-bold text-warning">3</div></div>
    </div>
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-3">Top Pratos por Margem</div>
      {[
        { name: 'Risoto de Cogumelos', cost: 18.50, price: 68, margin: 72.8 },
        { name: 'Filé Mignon ao Molho', cost: 42.00, price: 118, margin: 64.4 },
        { name: 'Salmão Grelhado', cost: 38.00, price: 95, margin: 60 },
        { name: 'Camarão Flamejado', cost: 52.00, price: 125, margin: 58.4 },
        { name: 'Picanha na Brasa', cost: 48.00, price: 98, margin: 51 },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
          <div><div className="text-xs font-medium text-foreground">{item.name}</div><div className="text-[10px] text-muted-foreground">Custo: R$ {item.cost.toFixed(2)} → Venda: R$ {item.price}</div></div>
          <div className={`text-sm font-bold ${item.margin > 65 ? 'text-green-500' : item.margin > 55 ? 'text-warning' : 'text-destructive'}`}>{item.margin}%</div>
        </div>
      ))}
    </div>
  </div>
);

// ============ FORECAST ============

export const ForecastScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Previsão de receita baseada em histórico, sazonalidade e tendências" />
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-1">Previsão — Próximos 7 dias</div>
      <div className="text-2xl font-bold text-foreground mb-1">R$ 92.400</div>
      <div className="flex items-center gap-1 text-xs text-green-500"><ArrowUp className="w-3 h-3" />+8% vs mesma semana anterior</div>
    </div>
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-3">Previsão Diária</div>
      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => {
        const values = [9800, 10200, 11500, 12800, 16500, 18200, 13400];
        const maxVal = 18200;
        return (
          <div key={day} className="flex items-center gap-3 mb-2">
            <span className="text-xs text-muted-foreground w-8">{day}</span>
            <div className="flex-1 h-3 bg-muted rounded-full"><div className="h-3 bg-primary/60 rounded-full" style={{ width: `${(values[i] / maxVal) * 100}%` }} /></div>
            <span className="text-xs font-medium text-foreground w-16 text-right">R$ {(values[i] / 1000).toFixed(1)}k</span>
          </div>
        );
      })}
    </div>
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
      <div className="flex items-center gap-2 text-xs text-amber-600 font-medium"><AlertCircle className="w-4 h-4" />Alerta: Sexta e sábado com previsão de lotação — considere reforço de equipe</div>
    </div>
  </div>
);

// ============ CHEF APPROVALS ============

export const ChefApprovalsScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Reservas do Chef's Table e menus especiais aguardando aprovação" />
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Pendentes</div><div className="text-lg font-bold text-warning">3</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Aprovados Hoje</div><div className="text-lg font-bold text-green-500">5</div></div>
    </div>
    {[
      { guest: 'Carlos & Maria', date: '05/04 — 20h', guests: 2, type: 'Chef\'s Table', dietary: 'Sem glúten', note: 'Aniversário de casamento' },
      { guest: 'Grupo Eventos Corp', date: '07/04 — 19h30', guests: 8, type: 'Menu Degustação', dietary: '1 vegetariano', note: 'Evento corporativo' },
      { guest: 'Ana Beatriz', date: '06/04 — 21h', guests: 4, type: 'Chef\'s Table', dietary: 'Nenhuma', note: 'Harmonização de vinhos' },
    ].map((req, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">{req.guest}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-warning/10 text-warning font-medium">{req.type}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
          <div>📅 {req.date}</div><div>👥 {req.guests} convidados</div>
          <div>🥗 {req.dietary}</div><div>📝 {req.note}</div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-lg bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20 hover:bg-green-500/20 transition-colors">✓ Aprovar</button>
          <button className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20 hover:bg-destructive/20 transition-colors">✗ Recusar</button>
        </div>
      </div>
    ))}
  </div>
);

// ============ CHEF TABLE ============

export const ChefTableScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Experiências exclusivas — menus degustação, capacidade limitada" />
    <div className="bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20 rounded-xl p-4 text-center">
      <div className="text-lg font-bold text-foreground">Chef's Table — Hoje</div>
      <div className="text-xs text-muted-foreground mt-1">Menu Degustação: 7 tempos · R$ 450/pessoa</div>
      <div className="flex justify-center gap-6 mt-3">
        <div><div className="text-lg font-bold text-foreground">2/3</div><div className="text-[10px] text-muted-foreground">Sessões</div></div>
        <div><div className="text-lg font-bold text-foreground">6/8</div><div className="text-[10px] text-muted-foreground">Lugares</div></div>
        <div><div className="text-lg font-bold text-green-500">R$ 2.7k</div><div className="text-[10px] text-muted-foreground">Previsto</div></div>
      </div>
    </div>
    {[{ time: '19:30', guests: 'Carlos & Maria', count: 2, status: 'confirmed', course: 3 }, { time: '21:00', guests: 'Grupo VIP', count: 4, status: 'confirmed', course: 0 }].map((session, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div><span className="text-sm font-semibold text-foreground">{session.time} — {session.guests}</span><div className="text-[10px] text-muted-foreground">{session.count} convidados</div></div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">Confirmado</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {[1,2,3,4,5,6,7].map(c => (
            <div key={c} className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold ${c <= session.course ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>{c}</div>
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">{session.course > 0 ? `Tempo ${session.course}/7` : 'Aguardando'}</span>
        </div>
      </div>
    ))}
  </div>
);

// ============ KDS ANALYTICS ============

export const KdsAnalyticsScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Métricas de performance da cozinha — tempos, eficiência e SLA" />
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'Tempo Médio', value: '12min', delta: '-2min', good: true },
        { label: 'SLA (<15min)', value: '94%', delta: '+3%', good: true },
        { label: 'Tickets Hoje', value: '142', delta: '+18', good: true },
        { label: 'Itens Atrasados', value: '3', delta: '-5', good: true },
      ].map((m, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-3">
          <div className="text-xs text-muted-foreground">{m.label}</div>
          <div className="text-lg font-bold text-foreground">{m.value}</div>
          <div className={`text-[10px] flex items-center gap-1 ${m.good ? 'text-green-500' : 'text-destructive'}`}>{m.good ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}{m.delta}</div>
        </div>
      ))}
    </div>
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-3">Por Estação</div>
      {[
        { name: 'Grill', avg: '14min', sla: 91, tickets: 45 },
        { name: 'Frios', avg: '8min', sla: 98, tickets: 38 },
        { name: 'Massas', avg: '11min', sla: 95, tickets: 32 },
        { name: 'Bar', avg: '4min', sla: 99, tickets: 27 },
      ].map((s, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
          <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-muted-foreground" /><span className="text-xs font-medium text-foreground">{s.name}</span></div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">{s.avg}</span>
            <span className={s.sla >= 95 ? 'text-green-500' : 'text-warning'}>{s.sla}%</span>
            <span className="text-muted-foreground">{s.tickets} tickets</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============ KDS BRAIN CONFIG ============

export const KdsBrainConfigScreen: React.FC = () => {
  const [autoFire, setAutoFire] = useState(true);
  const [convergence, setConvergence] = useState(true);
  return (
    <div className="space-y-5">
      <GuidedHint text="Configure o cérebro autônomo da cozinha — auto-fire, convergência e roteamento" />
      {[
        { label: 'Auto-Fire', desc: 'Disparo automático de cursos por tempo de preparo', enabled: autoFire, toggle: () => setAutoFire(!autoFire) },
        { label: 'Convergência', desc: 'Sincroniza itens de mesmo pedido para saírem juntos', enabled: convergence, toggle: () => setConvergence(!convergence) },
      ].map((feature, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div><div className="text-sm font-semibold text-foreground">{feature.label}</div><div className="text-xs text-muted-foreground mt-0.5">{feature.desc}</div></div>
            <button onClick={feature.toggle} className={`w-12 h-7 rounded-full transition-colors ${feature.enabled ? 'bg-green-500' : 'bg-muted'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${feature.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      ))}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-sm font-semibold text-foreground mb-3">Estações de Preparo</div>
        {[
          { name: 'Grill', emoji: '🔥', type: 'kitchen', threshold: 15, active: true },
          { name: 'Frios', emoji: '🥗', type: 'kitchen', threshold: 10, active: true },
          { name: 'Massas', emoji: '🍝', type: 'kitchen', threshold: 12, active: true },
          { name: 'Bar', emoji: '🍸', type: 'bar', threshold: 5, active: true },
        ].map((station, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
            <div className="flex items-center gap-2"><span>{station.emoji}</span><span className="text-xs font-medium text-foreground">{station.name}</span></div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">Atraso: {station.threshold}min</span>
              <span className="text-green-500">Ativa</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ CRM ============

export const CrmScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="CRM de clientes — perfil, histórico de visitas e preferências" />
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Total Clientes</div><div className="text-lg font-bold text-foreground">1.247</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Novos (30d)</div><div className="text-lg font-bold text-green-500">+89</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Recorrentes</div><div className="text-lg font-bold text-primary">62%</div></div>
    </div>
    {[
      { name: 'Ana Silva', visits: 24, lastVisit: '2 dias', spent: 'R$ 4.800', tier: 'Gold', avatar: '👩' },
      { name: 'Pedro Costa', visits: 18, lastVisit: '5 dias', spent: 'R$ 3.200', tier: 'Silver', avatar: '👨' },
      { name: 'Mariana Reis', visits: 42, lastVisit: 'Hoje', spent: 'R$ 8.900', tier: 'Platinum', avatar: '👩‍💼' },
      { name: 'Lucas Almeida', visits: 8, lastVisit: '12 dias', spent: 'R$ 1.100', tier: 'Bronze', avatar: '🧑' },
    ].map((client, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">{client.avatar}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2"><span className="text-sm font-semibold text-foreground">{client.name}</span><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${client.tier === 'Platinum' ? 'bg-purple-500/10 text-purple-500' : client.tier === 'Gold' ? 'bg-amber-500/10 text-amber-500' : client.tier === 'Silver' ? 'bg-slate-400/10 text-slate-400' : 'bg-orange-500/10 text-orange-500'}`}>{client.tier}</span></div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
              <span>{client.visits} visitas</span><span>Última: {client.lastVisit}</span><span>Total: {client.spent}</span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ============ HR ============

export const HrScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Gestão de RH — escalas, folgas, banco de horas e desempenho" />
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Em Serviço</div><div className="text-lg font-bold text-green-500">8</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Total Equipe</div><div className="text-lg font-bold text-foreground">12</div></div>
    </div>
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-3">Escala da Semana</div>
      {[
        { name: 'Bruno Oliveira', role: 'Garçom', shifts: ['Seg', 'Ter', 'Qua', 'Sex', 'Sáb'], hours: 38 },
        { name: 'Carla Lima', role: 'Garçom', shifts: ['Seg', 'Ter', 'Qui', 'Sex', 'Dom'], hours: 36 },
        { name: 'Felipe Santos', role: 'Chef', shifts: ['Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], hours: 42 },
        { name: 'Diego Martins', role: 'Barman', shifts: ['Qua', 'Qui', 'Sex', 'Sáb', 'Dom'], hours: 40 },
      ].map((emp, i) => (
        <div key={i} className="py-2 border-b last:border-0 border-border">
          <div className="flex items-center justify-between mb-1">
            <div><span className="text-xs font-medium text-foreground">{emp.name}</span><span className="text-[10px] text-muted-foreground ml-2">{emp.role}</span></div>
            <span className="text-[10px] text-muted-foreground">{emp.hours}h/sem</span>
          </div>
          <div className="flex gap-1">
            {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => (
              <div key={d} className={`w-7 h-5 rounded text-[8px] flex items-center justify-center font-medium ${emp.shifts.includes(d) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground/50'}`}>{d[0]}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============ INTEGRATIONS ============

export const IntegrationsScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Integrações com marketplaces — iFood, Rappi e UberEats" />
    {[
      { name: 'iFood', color: 'bg-red-500', status: 'connected', orders: 23, revenue: 3200, auto: true },
      { name: 'Rappi', color: 'bg-orange-500', status: 'connected', orders: 12, revenue: 1800, auto: true },
      { name: 'UberEats', color: 'bg-green-600', status: 'disconnected', orders: 0, revenue: 0, auto: false },
    ].map((integration, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${integration.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>{integration.name[0]}</div>
            <div><div className="text-sm font-semibold text-foreground">{integration.name}</div><div className="text-[10px] text-muted-foreground">{integration.status === 'connected' ? 'Sincronizado' : 'Desconectado'}</div></div>
          </div>
          <div className={`w-3 h-3 rounded-full ${integration.status === 'connected' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
        </div>
        {integration.status === 'connected' && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div><div className="font-bold text-foreground">{integration.orders}</div><div className="text-muted-foreground">Pedidos</div></div>
            <div><div className="font-bold text-foreground">R$ {(integration.revenue / 1000).toFixed(1)}k</div><div className="text-muted-foreground">Receita</div></div>
            <div><div className="font-bold text-green-500">Auto</div><div className="text-muted-foreground">Aceite</div></div>
          </div>
        )}
      </div>
    ))}
  </div>
);

// ============ LOYALTY MANAGEMENT ============

export const LoyaltyMgmtScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Programas de fidelidade — pontos, tiers e stamp cards" />
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Membros Ativos</div><div className="text-lg font-bold text-foreground">847</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Pontos Emitidos</div><div className="text-lg font-bold text-primary">45.2k</div></div>
    </div>
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-3">Distribuição por Tier</div>
      {[
        { tier: 'Platinum', count: 42, color: 'bg-purple-500', pct: 5 },
        { tier: 'Gold', count: 128, color: 'bg-amber-500', pct: 15 },
        { tier: 'Silver', count: 298, color: 'bg-slate-400', pct: 35 },
        { tier: 'Bronze', count: 379, color: 'bg-orange-500', pct: 45 },
      ].map((t, i) => (
        <div key={i} className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${t.color}`} />
          <span className="text-xs text-foreground w-20">{t.tier}</span>
          <div className="flex-1 h-2 bg-muted rounded-full"><div className={`h-2 ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} /></div>
          <span className="text-xs text-muted-foreground w-12 text-right">{t.count}</span>
        </div>
      ))}
    </div>
  </div>
);

// ============ PROMOTIONS MANAGEMENT ============

export const PromotionsMgmtScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Campanhas ativas, cupons e happy hour" />
    {[
      { name: 'Happy Hour — 17h às 19h', type: 'Desconto', value: '30% em drinks', active: true, usage: 142 },
      { name: 'Almoço Executivo', type: 'Combo', value: 'Entrada + Prato + Bebida R$ 49,90', active: true, usage: 89 },
      { name: 'Aniversariante', type: 'Cortesia', value: 'Sobremesa grátis', active: true, usage: 23 },
    ].map((promo, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">{promo.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">Ativa</span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">{promo.type}: {promo.value}</div>
        <div className="text-[10px] text-muted-foreground">{promo.usage} usos este mês</div>
      </div>
    ))}
  </div>
);

// ============ QR CODES ============

export const QrCodesScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Gere QR codes para mesas — individual ou em lote" />
    <div className="grid grid-cols-2 gap-3">
      <button className="bg-card border border-border rounded-xl p-4 text-center hover:bg-muted/50 transition-colors">
        <QrCode className="w-8 h-8 mx-auto text-primary mb-2" />
        <div className="text-xs font-semibold text-foreground">QR Individual</div>
        <div className="text-[10px] text-muted-foreground">Gerar por mesa</div>
      </button>
      <button className="bg-card border border-border rounded-xl p-4 text-center hover:bg-muted/50 transition-colors">
        <Download className="w-8 h-8 mx-auto text-primary mb-2" />
        <div className="text-xs font-semibold text-foreground">QR em Lote</div>
        <div className="text-[10px] text-muted-foreground">Todas as mesas</div>
      </button>
    </div>
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-3">QR Codes Gerados</div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="w-12 h-12 mx-auto bg-foreground/10 rounded flex items-center justify-center"><QrCode className="w-8 h-8 text-foreground/40" /></div>
            <div className="text-[10px] font-medium text-foreground mt-1">Mesa {i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============ TAP TO PAY ============

export const TapToPayScreen: React.FC = () => {
  const [state, setState] = useState<'ready' | 'waiting' | 'success'>('ready');
  return (
    <div className="space-y-5">
      <GuidedHint text="Transforme o celular em maquininha NFC — Stripe Terminal" />
      <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 text-center">
        {state === 'ready' && (
          <>
            <Smartphone className="w-16 h-16 mx-auto text-primary mb-3" />
            <div className="text-lg font-bold text-foreground mb-1">TAP to Pay</div>
            <div className="text-sm text-muted-foreground mb-4">Pronto para receber pagamento</div>
            <div className="text-2xl font-bold text-foreground mb-4">R$ 342,50</div>
            <button onClick={() => { setState('waiting'); setTimeout(() => setState('success'), 2000); }} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Iniciar Cobrança</button>
          </>
        )}
        {state === 'waiting' && (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3 animate-pulse">
              <CreditCard className="w-10 h-10 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground mb-1">Aproxime o Cartão</div>
            <div className="text-sm text-muted-foreground">Aguardando NFC...</div>
          </>
        )}
        {state === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div className="text-lg font-bold text-green-500 mb-1">Pagamento Aprovado!</div>
            <div className="text-sm text-muted-foreground">Visa ****4242 · R$ 342,50</div>
            <button onClick={() => setState('ready')} className="mt-4 px-6 py-2 rounded-xl bg-muted text-foreground text-sm font-medium">Nova Cobrança</button>
          </>
        )}
      </div>
    </div>
  );
};

// ============ REPORTS ============

export const ReportsScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Relatórios exportáveis em PDF e Excel" />
    {[
      { name: 'DRE Simplificado', period: 'Mensal', icon: FileText, formats: ['PDF', 'Excel'] },
      { name: 'Relatório de Vendas', period: 'Diário / Semanal', icon: BarChart3, formats: ['PDF', 'Excel'] },
      { name: 'Relatório de Estoque', period: 'Semanal', icon: Package, formats: ['PDF'] },
      { name: 'Relatório de Equipe', period: 'Mensal', icon: Users, formats: ['PDF', 'Excel'] },
      { name: 'Relatório Fiscal', period: 'Mensal', icon: Receipt, formats: ['PDF', 'XML'] },
    ].map((report, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <report.icon className="w-5 h-5 text-primary" />
            <div><div className="text-sm font-medium text-foreground">{report.name}</div><div className="text-[10px] text-muted-foreground">{report.period}</div></div>
          </div>
          <div className="flex gap-1">
            {report.formats.map(f => (
              <button key={f} className="px-2 py-1 rounded text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{f}</button>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ============ REVIEWS MANAGEMENT ============

export const ReviewsMgmtScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Avaliações de clientes — nota média, comentários e moderação" />
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Nota Média</div><div className="text-lg font-bold text-foreground">4.7 ⭐</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Total</div><div className="text-lg font-bold text-foreground">342</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Pendentes</div><div className="text-lg font-bold text-warning">5</div></div>
    </div>
    {[
      { name: 'Ana M.', rating: 5, text: 'Experiência incrível! Atendimento impecável e comida divina.', date: 'Hoje' },
      { name: 'Pedro S.', rating: 4, text: 'Muito bom, mas demorou um pouco na sobremesa.', date: 'Ontem' },
      { name: 'Lucas A.', rating: 3, text: 'Ambiente bonito, mas preço elevado para a porção servida.', date: '2 dias' },
    ].map((review, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2"><span className="text-sm font-medium text-foreground">{review.name}</span><span className="text-xs text-amber-500">{'⭐'.repeat(review.rating)}</span></div>
          <span className="text-[10px] text-muted-foreground">{review.date}</span>
        </div>
        <p className="text-xs text-muted-foreground">{review.text}</p>
      </div>
    ))}
  </div>
);

// ============ RESERVATIONS MANAGEMENT ============

export const ReservationsMgmtScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Gestão completa de reservas — confirmação, grupos e no-show" />
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Hoje</div><div className="text-lg font-bold text-foreground">12</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Confirmadas</div><div className="text-lg font-bold text-green-500">9</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Pendentes</div><div className="text-lg font-bold text-warning">3</div></div>
    </div>
    {[
      { name: 'Ricardo Silva', time: '19:00', guests: 4, status: 'confirmed', table: 'Mesa 5', phone: '(11) 9xxxx-1234' },
      { name: 'Grupo Corporativo', time: '20:00', guests: 10, status: 'pending', table: 'Mesas 8+9', phone: '(11) 9xxxx-5678' },
      { name: 'Aniversário Julia', time: '20:30', guests: 8, status: 'confirmed', table: 'Mesa 11', phone: '(11) 9xxxx-9012' },
    ].map((res, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">{res.name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${res.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-warning/10 text-warning'}`}>{res.status === 'confirmed' ? 'Confirmada' : 'Pendente'}</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
          <span>🕐 {res.time}</span><span>👥 {res.guests} pessoas</span>
          <span>🪑 {res.table}</span><span>📞 {res.phone}</span>
        </div>
      </div>
    ))}
  </div>
);

// ============ CLUB MANAGEMENT SCREENS ============

export const ClubDoorScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Controle de porta — check-in, lista VIP e capacidade" />
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Dentro</div><div className="text-lg font-bold text-foreground">247</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Capacidade</div><div className="text-lg font-bold text-foreground">400</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Na Fila</div><div className="text-lg font-bold text-warning">32</div></div>
    </div>
    <div className="w-full h-4 bg-muted rounded-full"><div className="h-4 bg-gradient-to-r from-green-500 to-amber-500 rounded-full" style={{ width: '62%' }} /><div className="text-[10px] text-center text-foreground font-medium -mt-3.5">62% lotação</div></div>
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-3">Check-in Recente</div>
      {[
        { name: 'Lista VIP — Grupo Martins', count: 6, time: '23:15', type: 'vip' },
        { name: 'Ingresso Online — Ana', count: 1, time: '23:10', type: 'ticket' },
        { name: 'Promoter — Lista Pedro', count: 4, time: '23:05', type: 'promoter' },
      ].map((entry, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm">{entry.type === 'vip' ? '👑' : entry.type === 'ticket' ? '🎫' : '🎤'}</span>
            <div><div className="text-xs font-medium text-foreground">{entry.name}</div><div className="text-[10px] text-muted-foreground">{entry.count} pessoa(s) · {entry.time}</div></div>
          </div>
          <button className="px-3 py-1 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium">Check-in</button>
        </div>
      ))}
    </div>
  </div>
);

export const ClubQueueMgmtScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Fila virtual — chamar próximos e definir prioridades" />
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Na Fila</div><div className="text-lg font-bold text-foreground">32</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Tempo Médio</div><div className="text-lg font-bold text-foreground">25min</div></div>
    </div>
    {[1,2,3,4,5].map(pos => (
      <div key={pos} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{pos}</div>
          <div><div className="text-xs font-medium text-foreground">Grupo {['Santos', 'Lima', 'Costa', 'Ferreira', 'Alves'][pos-1]}</div><div className="text-[10px] text-muted-foreground">{pos + 1} pessoas · {10 + pos * 5}min esperando</div></div>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Chamar</button>
      </div>
    ))}
  </div>
);

export const ClubPromoterScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Dashboard de promoters — listas, check-ins e comissões" />
    {[
      { name: 'Pedro Almeida', lists: 5, checkins: 28, commission: 1400 },
      { name: 'Juliana Torres', lists: 3, checkins: 18, commission: 900 },
      { name: 'Rafael Nunes', lists: 4, checkins: 22, commission: 1100 },
    ].map((p, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">{p.name}</span>
          <span className="text-xs font-bold text-green-500">R$ {p.commission}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div><div className="font-bold text-foreground">{p.lists}</div><div className="text-muted-foreground">Listas</div></div>
          <div><div className="font-bold text-foreground">{p.checkins}</div><div className="text-muted-foreground">Check-ins</div></div>
          <div><div className="font-bold text-foreground">{Math.round(p.commission / p.checkins)}</div><div className="text-muted-foreground">$/pessoa</div></div>
        </div>
      </div>
    ))}
  </div>
);

export const ClubVipMgmtScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Camarotes e áreas VIP — reservas, consumação e pacotes" />
    {[
      { name: 'Camarote 1 — Terraço', capacity: 10, minSpend: 2000, status: 'reserved', guest: 'Grupo Martins', current: 1850 },
      { name: 'Camarote 2 — Pista', capacity: 8, minSpend: 1500, status: 'available', guest: '', current: 0 },
      { name: 'Área VIP — Rooftop', capacity: 20, minSpend: 5000, status: 'reserved', guest: 'Evento Corp.', current: 4200 },
    ].map((vip, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">{vip.name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${vip.status === 'reserved' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'}`}>{vip.status === 'reserved' ? 'Reservado' : 'Disponível'}</span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">{vip.capacity} lugares · Mínimo R$ {vip.minSpend.toLocaleString()}</div>
        {vip.status === 'reserved' && (
          <div>
            <div className="text-xs text-foreground mb-1">{vip.guest}</div>
            <div className="w-full h-2 bg-muted rounded-full"><div className={`h-2 rounded-full ${vip.current >= vip.minSpend ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (vip.current / vip.minSpend) * 100)}%` }} /></div>
            <div className="text-[10px] text-muted-foreground mt-1">R$ {vip.current.toLocaleString()} / R$ {vip.minSpend.toLocaleString()}</div>
          </div>
        )}
      </div>
    ))}
  </div>
);

// ============ DRIVE-THRU MANAGEMENT ============

export const DriveThruMgmtScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Gestão de faixas, pedidos por GPS e tempos de expedição" />
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Na Fila</div><div className="text-lg font-bold text-foreground">8</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Tempo Médio</div><div className="text-lg font-bold text-foreground">4min</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Atendidos</div><div className="text-lg font-bold text-green-500">142</div></div>
    </div>
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-3">Faixas Ativas</div>
      {[
        { lane: 1, car: 'Honda Civic Prata', order: '#247', items: 3, eta: '2min', status: 'preparing' },
        { lane: 2, car: 'Toyota Corolla Preto', order: '#248', items: 5, eta: '4min', status: 'waiting' },
        { lane: 1, car: 'VW Golf Branco', order: '#249', items: 2, eta: '6min', status: 'queued' },
      ].map((entry, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">F{entry.lane}</div>
            <div><div className="text-xs font-medium text-foreground">{entry.car}</div><div className="text-[10px] text-muted-foreground">{entry.order} · {entry.items} itens · ETA {entry.eta}</div></div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${entry.status === 'preparing' ? 'bg-warning/10 text-warning' : entry.status === 'waiting' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'}`}>{entry.status === 'preparing' ? 'Preparando' : entry.status === 'waiting' ? 'Aguardando' : 'Na fila'}</span>
        </div>
      ))}
    </div>
  </div>
);

// ============ FOOD TRUCK MANAGEMENT ============

export const FoodTruckMgmtScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Localização GPS, agenda semanal e fila virtual do food truck" />
    <div className="bg-card border-2 border-green-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Navigation className="w-5 h-5 text-green-500" />
        <span className="text-sm font-semibold text-foreground">GPS Compartilhando</span>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>
      <div className="text-xs text-muted-foreground">Localização atual: Av. Paulista, 1000 — São Paulo</div>
      <div className="text-[10px] text-muted-foreground mt-1">Última atualização: há 30s</div>
    </div>
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-sm font-semibold text-foreground mb-3">Agenda da Semana</div>
      {[
        { day: 'Seg', location: 'Av. Paulista, 1000', time: '11h-15h' },
        { day: 'Ter', location: 'Pq. Ibirapuera', time: '11h-15h' },
        { day: 'Qua', location: 'Vila Madalena', time: '17h-22h' },
        { day: 'Qui', location: 'Itaim Bibi', time: '11h-15h' },
        { day: 'Sex', location: 'Vila Olímpia', time: '17h-23h' },
      ].map((slot, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary w-8">{slot.day}</span>
            <span className="text-xs text-foreground">{slot.location}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{slot.time}</span>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Na Fila</div><div className="text-lg font-bold text-foreground">5</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Atendidos</div><div className="text-lg font-bold text-green-500">67</div></div>
      <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Faturamento</div><div className="text-lg font-bold text-foreground">R$ 3.2k</div></div>
    </div>
  </div>
);

// ============ CONFIG EXTRAS ============

export const ConfigLanguageScreen: React.FC = () => (
  <div className="space-y-5">
    <GuidedHint text="Configure o idioma do sistema e do cardápio digital" />
    {[
      { lang: 'Português (BR)', flag: '🇧🇷', active: true },
      { lang: 'English (US)', flag: '🇺🇸', active: false },
      { lang: 'Español (ES)', flag: '🇪🇸', active: false },
    ].map((l, i) => (
      <div key={i} className={`bg-card border rounded-xl p-4 flex items-center justify-between ${l.active ? 'border-primary' : 'border-border'}`}>
        <div className="flex items-center gap-3"><span className="text-2xl">{l.flag}</span><span className="text-sm font-medium text-foreground">{l.lang}</span></div>
        {l.active && <CheckCircle2 className="w-5 h-5 text-primary" />}
      </div>
    ))}
  </div>
);

export const ConfigNotificationsScreen: React.FC = () => {
  const [settings, setSettings] = useState({ newOrder: true, lateOrder: true, lowStock: true, reservation: true, review: false, promotion: false });
  return (
    <div className="space-y-5">
      <GuidedHint text="Configure alertas push, sons e notificações" />
      {Object.entries(settings).map(([key, val]) => {
        const labels: Record<string, string> = { newOrder: 'Novo Pedido', lateOrder: 'Pedido Atrasado', lowStock: 'Estoque Baixo', reservation: 'Nova Reserva', review: 'Nova Avaliação', promotion: 'Promoção Ativa' };
        return (
          <div key={key} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{labels[key]}</span>
            <button onClick={() => setSettings(s => ({ ...s, [key]: !val }))} className={`w-12 h-7 rounded-full transition-colors ${val ? 'bg-green-500' : 'bg-muted'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
