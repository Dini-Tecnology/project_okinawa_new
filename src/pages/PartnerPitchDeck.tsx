import { useState, useEffect, useCallback } from "react";
import SEOHead from "@/components/seo/SEOHead";
import NoweeLogo from "@/components/brand/NoweeLogo";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  Heart,
  Target,
  Zap,
  Award,
  MapPin,
  CreditCard,
  Star,
  BarChart3,
  Smartphone,
  Layers,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Brain,
  Rocket,
  Building2,
  DollarSign,
  Percent,
  TrendingDown,
  LineChart,
  Check,
  CircleDot,
  Crown,
  QrCode,
  Utensils,
  Shield,
  Globe,
  Sparkles,
  Clock,
  Handshake,
  Eye,
} from "lucide-react";

// ========================================
// TYPES & DATA
// ========================================

interface Slide {
  id: string;
  type: string;
  title: string;
}

const slides: Slide[] = [
  { id: "cover", type: "cover", title: "NOOWE" },
  { id: "purpose", type: "purpose", title: "Propósito" },
  { id: "problem", type: "problem", title: "O Problema" },
  { id: "opportunity", type: "opportunity", title: "Oportunidade" },
  { id: "solution", type: "solution", title: "A Solução" },
  { id: "product-client", type: "product-client", title: "App Cliente" },
  { id: "product-restaurant", type: "product-restaurant", title: "App Restaurante" },
  { id: "experience", type: "experience", title: "Jornada" },
  { id: "market", type: "market", title: "Mercado" },
  { id: "business-model", type: "business-model", title: "Modelo" },
  { id: "unit-economics", type: "unit-economics", title: "Unit Economics" },
  { id: "competitive", type: "competitive", title: "Diferencial" },
  { id: "product-arch", type: "product-arch", title: "Produto" },
  { id: "gtm", type: "gtm", title: "Go-to-Market" },
  { id: "roadmap", type: "roadmap", title: "Roadmap" },
  { id: "vision", type: "vision", title: "Visão" },
  { id: "cta", type: "cta", title: "Encerramento" },
];

// ========================================
// PHONE MOCKUP COMPONENT
// ========================================

const PhoneMockup = ({
  children,
  className = "",
  scale = 1,
}: {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}) => (
  <div
    className={`relative ${className}`}
    style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
  >
    <div className="w-[220px] h-[440px] bg-foreground/90 rounded-[36px] p-[6px] shadow-2xl">
      <div className="w-full h-full bg-background rounded-[30px] overflow-hidden relative">
        <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[70px] h-[18px] bg-foreground rounded-full z-20" />
        <div className="absolute top-0 left-0 right-0 h-8 bg-background/80 z-10 flex items-center justify-between px-5 pt-1">
          <span className="text-foreground text-[8px] font-semibold">9:41</span>
          <div className="flex items-center gap-0.5">
            <div className="w-[3px] h-[5px] bg-foreground rounded-full" />
            <div className="w-[3px] h-[6px] bg-foreground rounded-full" />
            <div className="w-[3px] h-[7px] bg-foreground rounded-full" />
            <div className="w-[3px] h-[8px] bg-foreground rounded-full" />
            <div className="w-4 h-[7px] bg-foreground rounded-sm ml-1" />
          </div>
        </div>
        <div className="h-full pt-8 overflow-hidden">{children}</div>
      </div>
    </div>
    <div className="absolute -inset-4 bg-primary/10 rounded-[48px] blur-2xl -z-10" />
  </div>
);

// ========================================
// MINI SCREEN MOCKUPS
// ========================================

const MiniHomeScreen = () => (
  <div className="h-full flex flex-col bg-background">
    <div className="bg-gradient-to-br from-primary via-primary/90 to-accent px-3 pt-3 pb-4">
      <p className="text-primary-foreground/80 text-[6px]">Bem-vindo de volta</p>
      <p className="text-primary-foreground text-[9px] font-semibold">Olá, Ricardo</p>
      <div className="mt-2 bg-primary-foreground/20 rounded-lg px-2 py-1.5 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-primary-foreground/50" />
        <span className="text-primary-foreground/70 text-[6px]">Buscar restaurantes...</span>
      </div>
    </div>
    <div className="px-3 pt-3 flex-1">
      <p className="text-foreground text-[7px] font-bold mb-1.5">Em alta perto de você</p>
      <div className="flex gap-1.5 mb-3">
        {["Brunch", "Rooftop", "Vegano"].map((t) => (
          <div key={t} className="px-2 py-1 rounded-full bg-muted">
            <span className="text-[5px] text-muted-foreground">{t}</span>
          </div>
        ))}
      </div>
      <p className="text-foreground text-[7px] font-bold mb-1.5">Recomendados</p>
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-2 mb-2 p-1.5 rounded-lg bg-card border border-border">
          <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[6px] font-bold text-foreground truncate">
              {i === 1 ? "Omakase Sushi" : "Trattoria Bella"}
            </p>
            <p className="text-[5px] text-muted-foreground">
              {i === 1 ? "Japonês • Fine Dining" : "Italiano • Casual"}
            </p>
            <div className="flex items-center gap-0.5 mt-0.5">
              <Star className="w-2 h-2 text-warning fill-warning" />
              <span className="text-[5px] text-foreground font-medium">{i === 1 ? "4.9" : "4.7"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="px-2 py-2 border-t border-border flex justify-around">
      {["home", "search", "queue", "calendar", "user"].map((_, idx) => (
        <div
          key={idx}
          className={`w-5 h-5 rounded-lg flex items-center justify-center ${
            idx === 0 ? "bg-primary" : ""
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-primary-foreground" : "bg-muted-foreground/40"}`} />
        </div>
      ))}
    </div>
  </div>
);

const MiniRestaurantScreen = () => (
  <div className="h-full flex flex-col bg-background">
    <div className="h-24 bg-gradient-to-br from-muted to-muted/50 relative">
      <div className="absolute bottom-1 left-2 right-2">
        <p className="text-foreground text-[9px] font-bold">Omakase Sushi</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Star className="w-2 h-2 text-warning fill-warning" />
          <span className="text-[5px] text-foreground">4.9</span>
          <span className="text-[5px] text-muted-foreground">• Japonês • $$$$</span>
        </div>
      </div>
    </div>
    <div className="px-3 pt-2 flex-1">
      <div className="flex gap-1 mb-2">
        {["Populares", "Entradas", "Principais"].map((c, i) => (
          <div
            key={c}
            className={`px-2 py-0.5 rounded-full text-[5px] ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {c}
          </div>
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-2 mb-1.5 p-1 rounded-lg border border-border">
          <div className="w-8 h-8 rounded-md bg-muted flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[5px] font-bold text-foreground">
              {i === 1 ? "Omakase Selection" : i === 2 ? "Wagyu Tataki" : "Tempurá Misto"}
            </p>
            <p className="text-[5px] text-primary font-semibold">
              R$ {i === 1 ? "189,90" : i === 2 ? "156,00" : "78,00"}
            </p>
          </div>
        </div>
      ))}
    </div>
    <div className="px-3 py-2">
      <div className="bg-primary rounded-xl py-1.5 flex items-center justify-center gap-1">
        <span className="text-primary-foreground text-[6px] font-bold">Ver carrinho</span>
        <span className="text-primary-foreground/80 text-[5px]">• R$ 423,90</span>
      </div>
    </div>
  </div>
);

const MiniLoyaltyScreen = () => (
  <div className="h-full flex flex-col bg-background">
    <div className="bg-foreground px-3 pt-4 pb-5">
      <div className="flex items-center gap-1 mb-1">
        <Crown className="w-3 h-3 text-warning" />
        <span className="text-warning font-bold text-[6px]">GOLD MEMBER</span>
      </div>
      <p className="text-background text-[10px] font-bold">NOOWE Rewards</p>
      <div className="mt-2 bg-background/10 rounded-xl p-2">
        <p className="text-muted text-[5px]">Pontos disponíveis</p>
        <p className="text-background text-[14px] font-bold">2.450</p>
        <div className="w-full h-1 bg-background/20 rounded-full mt-1">
          <div className="w-3/5 h-full bg-primary rounded-full" />
        </div>
        <p className="text-muted text-[4px] mt-0.5">550 pts para Platinum</p>
      </div>
    </div>
    <div className="px-3 pt-2 flex-1">
      <p className="text-foreground text-[7px] font-bold mb-1">Benefícios</p>
      {["Reserva prioritária", "10% cashback", "Acesso antecipado"].map((b) => (
        <div key={b} className="flex items-center gap-1 mb-1">
          <CheckCircle2 className="w-2 h-2 text-success" />
          <span className="text-[5px] text-foreground">{b}</span>
        </div>
      ))}
      <p className="text-foreground text-[7px] font-bold mb-1 mt-2">Leaderboard</p>
      {[
        { name: "Marina S.", pts: "8.450", rank: 1 },
        { name: "Carlos R.", pts: "7.820", rank: 2 },
        { name: "Você", pts: "2.450", rank: 3 },
      ].map((u) => (
        <div
          key={u.rank}
          className={`flex items-center justify-between p-1 rounded-md mb-0.5 ${
            u.rank === 3 ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="text-[5px] font-bold text-primary w-2">{u.rank}º</span>
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-[5px] text-foreground font-medium">{u.name}</span>
          </div>
          <span className="text-[5px] text-primary font-bold">{u.pts}</span>
        </div>
      ))}
    </div>
  </div>
);

const MiniDashboardScreen = () => (
  <div className="h-full flex flex-col bg-background">
    <div className="bg-gradient-to-br from-secondary to-secondary-dark px-3 pt-3 pb-4">
      <p className="text-secondary-foreground/80 text-[6px]">Painel do Restaurante</p>
      <p className="text-secondary-foreground text-[9px] font-semibold">Omakase Sushi</p>
      <div className="grid grid-cols-3 gap-1 mt-2">
        {[
          { label: "Hoje", value: "R$ 12.4k" },
          { label: "Mesas", value: "18/24" },
          { label: "Fila", value: "7" },
        ].map((s) => (
          <div key={s.label} className="bg-secondary-foreground/10 rounded-lg p-1.5 text-center">
            <p className="text-secondary-foreground text-[8px] font-bold">{s.value}</p>
            <p className="text-secondary-foreground/70 text-[5px]">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="px-3 pt-2 flex-1">
      <p className="text-foreground text-[7px] font-bold mb-1">Pedidos em tempo real</p>
      {[
        { mesa: "Mesa 7", status: "Preparando", color: "bg-warning" },
        { mesa: "Mesa 12", status: "Pronto", color: "bg-success" },
        { mesa: "Mesa 3", status: "Novo", color: "bg-info" },
      ].map((o) => (
        <div key={o.mesa} className="flex items-center justify-between p-1.5 rounded-lg border border-border mb-1">
          <div>
            <p className="text-[6px] font-bold text-foreground">{o.mesa}</p>
            <p className="text-[5px] text-muted-foreground">2 itens</p>
          </div>
          <div className={`px-1.5 py-0.5 rounded-full ${o.color}`}>
            <span className="text-[4px] font-bold text-primary-foreground">{o.status}</span>
          </div>
        </div>
      ))}
      <p className="text-foreground text-[7px] font-bold mb-1 mt-2">KDS Cozinha</p>
      <div className="grid grid-cols-2 gap-1">
        {["Grelhados", "Sushi Bar"].map((s) => (
          <div key={s} className="p-1.5 rounded-lg bg-card border border-border">
            <p className="text-[5px] font-bold text-foreground">{s}</p>
            <p className="text-[10px] font-bold text-secondary">3</p>
            <p className="text-[4px] text-muted-foreground">pedidos</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MiniSplitPaymentScreen = () => (
  <div className="h-full flex flex-col bg-background">
    <div className="px-3 pt-4 pb-2">
      <p className="text-foreground text-[9px] font-bold">Dividir Conta</p>
      <p className="text-muted-foreground text-[6px]">Mesa 7 • Omakase Sushi</p>
    </div>
    <div className="px-3 flex-1">
      <div className="flex gap-1 mb-3">
        {["Igual", "Por item", "Custom"].map((m, i) => (
          <div
            key={m}
            className={`flex-1 py-1 rounded-lg text-center text-[5px] font-medium ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {m}
          </div>
        ))}
      </div>
      <p className="text-foreground text-[7px] font-bold mb-1.5">Participantes</p>
      {[
        { name: "Ricardo", amount: "R$ 211,95", avatar: "R" },
        { name: "Marina", amount: "R$ 211,95", avatar: "M" },
      ].map((p) => (
        <div key={p.name} className="flex items-center justify-between p-1.5 rounded-xl border border-border mb-1.5 bg-card">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[5px] font-bold text-primary">{p.avatar}</span>
            </div>
            <span className="text-[6px] font-medium text-foreground">{p.name}</span>
          </div>
          <span className="text-[6px] font-bold text-primary">{p.amount}</span>
        </div>
      ))}
      <div className="mt-2 p-2 rounded-xl bg-muted/50">
        <div className="flex justify-between mb-1">
          <span className="text-[5px] text-muted-foreground">Subtotal</span>
          <span className="text-[5px] text-foreground">R$ 423,90</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[6px] font-bold text-foreground">Sua parte</span>
          <span className="text-[6px] font-bold text-primary">R$ 211,95</span>
        </div>
      </div>
    </div>
    <div className="px-3 py-2">
      <div className="bg-primary rounded-xl py-1.5 text-center">
        <span className="text-primary-foreground text-[6px] font-bold">Pagar R$ 211,95</span>
      </div>
    </div>
  </div>
);

const MiniWaitlistScreen = () => (
  <div className="h-full flex flex-col bg-background">
    <div className="px-3 pt-4 pb-2">
      <p className="text-foreground text-[9px] font-bold">Fila Virtual</p>
      <p className="text-muted-foreground text-[6px]">Omakase Sushi</p>
    </div>
    <div className="px-3 flex-1 flex flex-col items-center pt-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
        <span className="text-[20px] font-bold text-primary">3º</span>
      </div>
      <p className="text-foreground text-[8px] font-bold">Sua posição na fila</p>
      <p className="text-muted-foreground text-[6px] mt-0.5">Tempo estimado: ~15 min</p>
      <div className="w-full mt-4 space-y-1">
        {[
          { pos: 1, name: "Ana P.", time: "Próximo", active: false },
          { pos: 2, name: "João M.", time: "~8 min", active: false },
          { pos: 3, name: "Você", time: "~15 min", active: true },
        ].map((p) => (
          <div
            key={p.pos}
            className={`flex items-center justify-between p-1.5 rounded-lg ${
              p.active ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[6px] font-bold text-primary w-3">{p.pos}º</span>
              <span className="text-[6px] text-foreground">{p.name}</span>
            </div>
            <span className="text-[5px] text-muted-foreground">{p.time}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1 p-1.5 rounded-lg bg-success/10">
        <CheckCircle2 className="w-2.5 h-2.5 text-success" />
        <span className="text-[5px] text-success font-medium">Notificação ativa</span>
      </div>
    </div>
  </div>
);

// ========================================
// SLIDE COMPONENTS
// ========================================

const CoverSlide = () => (
  <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden px-6">
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/6 rounded-full blur-[100px]" />
    </div>

    <div className="relative z-10 mb-10">
      <NoweeLogo size="2xl" />
    </div>

    <p className="text-2xl md:text-4xl text-foreground/80 max-w-3xl relative z-10 leading-relaxed font-light">
      A plataforma que devolve o{" "}
      <span className="text-primary font-semibold">relacionamento com o cliente</span> ao{" "}
      <span className="text-secondary font-semibold">restaurante</span>
    </p>

    <p className="text-lg text-muted-foreground max-w-2xl relative z-10 mt-6 leading-relaxed">
      Infraestrutura digital para restaurantes, bares e estabelecimentos que conecta a experiência do cliente a resultados ao negócio.
    </p>

    <div className="mt-16 text-sm text-muted-foreground relative z-10">
      <span>Março 2026</span>
    </div>
  </div>
);

const PurposeSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20 relative overflow-hidden">
    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />

    <p className="text-primary text-sm font-medium mb-6 uppercase tracking-widest">
      Nosso Propósito
    </p>

    <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight max-w-4xl">
      Acreditamos que a melhor tecnologia é aquela que fortalece a{" "}
      <span className="relative">
        hospitalidade
        <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary/30 rounded-full" />
      </span>
    </h2>

    <div className="space-y-6 max-w-3xl">
      <p className="text-xl text-foreground/80 leading-relaxed">
        Nos últimos anos, restaurantes passaram a depender cada vez mais de intermediários digitais para atrair clientes.
      </p>

      <p className="text-xl text-foreground/80 leading-relaxed">
        Marketplaces ajudaram a gerar demanda, mas também criaram um novo problema:{" "}
        <strong className="text-foreground">o restaurante perdeu o relacionamento direto com o cliente.</strong>
      </p>

      <div className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border">
        <Heart className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
        <div>
          <p className="text-lg font-bold text-foreground mb-1">
            A NOOWE nasce para devolver esse controle ao restaurante
          </p>
          <p className="text-sm text-muted-foreground">
            Conectando descoberta, experiência presencial e fidelização em uma única plataforma.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const ProblemSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest">O Problema</p>

    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
      Restaurantes operam com{" "}
      <span className="text-destructive">margens apertadas</span> e{" "}
      <span className="text-destructive">tecnologia fragmentada</span>
    </h2>

    <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
      Hoje, grande parte da operação digital de um restaurante depende de múltiplas ferramentas desconectadas.
    </p>

    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[
        { number: "12%–27%", label: "Comissões cobradas", icon: Percent, desc: "por marketplaces de delivery" },
        { number: "5+", label: "Sistemas diferentes", icon: Layers, desc: "Reservas, pedidos, pagamentos, fidelidade e gestão" },
        { number: "0", label: "Acesso real aos dados", icon: BarChart3, desc: "Marketplaces concentram relacionamento e comportamento" },
      ].map((stat, i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors">
          <stat.icon className="w-8 h-8 text-destructive mb-4" />
          <p className="text-4xl font-bold text-foreground mb-1">{stat.number}</p>
          <p className="text-sm font-semibold text-foreground">{stat.label}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
        </div>
      ))}
    </div>

    <p className="text-lg text-muted-foreground max-w-3xl">
      Além disso, muitos restaurantes não possuem ferramentas para{" "}
      <strong className="text-foreground">transformar visitas em clientes recorrentes</strong>.
    </p>
  </div>
);

const OpportunitySlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20 relative overflow-hidden">
    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />

    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest">A Oportunidade</p>

    <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight max-w-4xl">
      O relacionamento direto com o cliente voltou a ser{" "}
      <span className="text-primary">estratégico</span>
    </h2>

    <p className="text-xl text-foreground/80 mb-10 max-w-3xl">
      Restaurantes precisam de ferramentas que permitam:
    </p>

    <div className="grid md:grid-cols-2 gap-5 mb-10 max-w-3xl">
      {[
        { icon: Users, text: "Conhecer seus clientes" },
        { icon: TrendingUp, text: "Aumentar recorrência" },
        { icon: Smartphone, text: "Digitalizar a experiência presencial" },
        { icon: Shield, text: "Reduzir dependência de intermediários" },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <item.icon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-lg text-foreground">{item.text}</p>
        </div>
      ))}
    </div>

    <p className="text-lg text-muted-foreground max-w-3xl relative z-10">
      Com a digitalização da jornada no salão, surgem novas oportunidades de{" "}
      <strong className="text-foreground">eficiência operacional</strong> e{" "}
      <strong className="text-foreground">crescimento de receita</strong>.
    </p>
  </div>
);

const SolutionSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest">A Solução</p>

    <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
      Uma plataforma completa para a{" "}
      <span className="text-primary">experiência no restaurante</span>
    </h2>

    <p className="text-xl text-muted-foreground mb-10 max-w-3xl">
      A NOOWE conecta toda a jornada do cliente em um único ecossistema.
    </p>

    <div className="grid md:grid-cols-2 gap-8 mb-8">
      <div className="space-y-5">
        {[
          { icon: MapPin, text: "Descoberta e reservas" },
          { icon: Utensils, text: "Pedidos e menu digital" },
          { icon: CreditCard, text: "Pagamentos e split automático" },
          { icon: Award, text: "Fidelidade e recompensas" },
          { icon: BarChart3, text: "Analytics e comportamento do cliente" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <p className="text-lg text-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-xl font-bold text-foreground">
              Tudo integrado em uma única infraestrutura
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              pensada para o ambiente presencial
            </p>
          </div>
          <div className="absolute -inset-6 bg-primary/5 rounded-[3rem] blur-xl -z-10" />
        </div>
      </div>
    </div>
  </div>
);

const ProductClientSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-12 overflow-hidden">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest text-center">
      App Cliente
    </p>
    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-2 text-center">
      Uma experiência digital pensada para o cliente do restaurante
    </h2>
    <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
      Aplicativo que acompanha toda a jornada da visita. Cada visita gera dados e insights que ajudam o restaurante a construir relacionamento com o cliente.
    </p>

    <div className="flex items-center justify-center gap-6 md:gap-10">
      <PhoneMockup scale={0.85}>
        <MiniHomeScreen />
      </PhoneMockup>
      <PhoneMockup scale={0.95}>
        <MiniRestaurantScreen />
      </PhoneMockup>
      <PhoneMockup scale={0.85}>
        <MiniLoyaltyScreen />
      </PhoneMockup>
    </div>

    <div className="flex justify-center gap-6 mt-6">
      {["Descoberta & Reservas", "Menu & Pedidos", "Fidelidade & Rewards"].map((f, i) => (
        <div key={i} className="text-center">
          <p className="text-xs font-medium text-primary">{f}</p>
        </div>
      ))}
    </div>
  </div>
);

const ProductRestaurantSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-12 overflow-hidden">
    <p className="text-secondary text-sm font-medium mb-4 uppercase tracking-widest text-center">
      App Restaurante
    </p>
    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-2 text-center">
      Ferramentas operacionais em tempo real
    </h2>
    <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
      Plataforma completa de gestão da experiência do cliente. Tudo em uma interface simples para operação do dia a dia.
    </p>

    <div className="flex items-center justify-center gap-8">
      <PhoneMockup scale={0.95}>
        <MiniDashboardScreen />
      </PhoneMockup>

      <div className="hidden md:flex flex-col gap-4 max-w-xs">
        {[
          { icon: BarChart3, title: "Dashboard operacional", desc: "Faturamento, mesas, fila, pedidos" },
          { icon: MapPin, title: "Controle de mesas e reservas", desc: "Gestão visual do salão" },
          { icon: Utensils, title: "Gestão de pedidos e cozinha (KDS)", desc: "Controle por estação culinária" },
          { icon: Users, title: "Gestão de equipe e gorjetas", desc: "Turnos, performance" },
          { icon: Brain, title: "Analytics de comportamento e receita", desc: "Insights em tempo real" },
        ].map((f, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <f.icon className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ExperienceSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-12 overflow-hidden">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest text-center">
      A Jornada Digital
    </p>
    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8 text-center">
      Digitalizamos toda a experiência do cliente no restaurante
    </h2>

    <div className="flex items-center justify-center gap-4 md:gap-8 mb-6">
      <div className="hidden md:block">
        <PhoneMockup scale={0.75}>
          <MiniWaitlistScreen />
        </PhoneMockup>
        <p className="text-[10px] text-center text-muted-foreground mt-2">Fila Virtual</p>
      </div>
      <PhoneMockup scale={0.85}>
        <MiniSplitPaymentScreen />
      </PhoneMockup>
      <div className="hidden md:block">
        <PhoneMockup scale={0.75}>
          <MiniLoyaltyScreen />
        </PhoneMockup>
        <p className="text-[10px] text-center text-muted-foreground mt-2">Fidelidade</p>
      </div>
    </div>

    <div className="flex justify-center">
      <div className="flex items-center gap-2 max-w-3xl">
        {["Descobrir", "Reservar", "Chegar", "Pedir", "Pagar", "Fidelizar"].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                i === 4
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step}
            </div>
            {i < 5 && <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>

    <p className="text-sm text-muted-foreground text-center mt-6 max-w-2xl mx-auto">
      Cada etapa gera dados que ajudam o restaurante a entender melhor seu público e aumentar a recorrência.
    </p>
  </div>
);

const MarketSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest">Mercado</p>

    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      O mercado de alimentação fora do lar no Brasil ultrapassa{" "}
      <span className="text-primary">R$ 500 bilhões</span>
    </h2>

    <div className="grid md:grid-cols-3 gap-6 mb-10">
      {[
        { value: "R$ 500bi", label: "Tamanho do mercado", desc: "de food service no Brasil" },
        { value: "1,3 milhão", label: "Restaurantes, bares", desc: "e estabelecimentos ativos" },
        { value: "+10%", label: "Crescimento médio", desc: "anual do setor" },
      ].map((item, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-border text-center"
        >
          <p className="text-4xl font-bold text-primary mb-1">{item.value}</p>
          <p className="font-semibold text-foreground mb-1">{item.label}</p>
          <p className="text-sm text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>

    <p className="text-lg text-muted-foreground max-w-3xl">
      A digitalização da experiência presencial ainda está nos estágios iniciais, criando uma{" "}
      <strong className="text-foreground">grande oportunidade para plataformas especializadas</strong>.
    </p>
  </div>
);

const BusinessModelSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest">
      Modelo de Negócio
    </p>

    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      SaaS + infraestrutura de pagamentos
    </h2>

    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="p-6 rounded-2xl bg-card border border-border">
        <DollarSign className="w-8 h-8 text-primary mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">Assinatura mensal (SaaS)</h3>
        <p className="text-2xl font-bold text-primary mb-1">R$ 199 – R$ 799</p>
        <p className="text-sm text-muted-foreground">por restaurante, dependendo do porte e funcionalidades</p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border">
        <Percent className="w-8 h-8 text-secondary mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">Take rate em pagamentos</h3>
        <p className="text-2xl font-bold text-secondary mb-1">3,5% – 7,5%</p>
        <p className="text-sm text-muted-foreground">sobre transações processadas</p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border">
        <Sparkles className="w-8 h-8 text-primary mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">Add-ons premium</h3>
        <div className="space-y-2 mt-3">
          {["Analytics avançado", "Automação de marketing", "Ferramentas de fidelização"].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const UnitEconomicsSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest">
      Unit Economics
    </p>

    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
      Unit Economics <span className="text-muted-foreground font-normal text-2xl">(realista)</span>
    </h2>

    <div className="grid md:grid-cols-4 gap-6 mb-10">
      {[
        { metric: "CAC estimado", value: "R$ 800 – R$ 1.500" },
        { metric: "MRR médio por restaurante", value: "R$ 300 – R$ 600" },
        { metric: "LTV estimado", value: "R$ 6.000 – R$ 12.000" },
        { metric: "Payback estimado", value: "6 – 10 meses" },
      ].map((item, i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border text-center">
          <p className="text-sm text-muted-foreground mb-3">{item.metric}</p>
          <p className="text-xl font-bold text-primary">{item.value}</p>
        </div>
      ))}
    </div>

    <p className="text-lg text-muted-foreground max-w-3xl">
      Com o crescimento da base, canais orgânicos e parcerias tendem a{" "}
      <strong className="text-foreground">reduzir o CAC</strong>.
    </p>
  </div>
);

const CompetitiveSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16 overflow-y-auto py-4">
    <p className="text-primary text-sm font-medium mb-3 uppercase tracking-widest">Diferencial Competitivo</p>

    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
      O mercado hoje é <span className="text-destructive">fragmentado</span>
    </h2>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-destructive/5 to-transparent border border-destructive/20">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <X className="w-5 h-5 text-destructive" />
          Cada solução resolve apenas parte do problema
        </h3>
        <div className="space-y-2 text-sm">
          {[
            { tool: "POS e gestão", problem: "Ex: Linx" },
            { tool: "Marketplaces", problem: "Ex: iFood e Rappi" },
            { tool: "Reservas e CRM", problem: "Ex: SevenRooms" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card/50">
              <span className="font-medium text-foreground">{item.tool}</span>
              <span className="text-xs text-muted-foreground">{item.problem}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          NOOWE — Tudo Integrado
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          A NOOWE conecta toda a experiência em uma única plataforma integrada.
        </p>
        <div className="space-y-2 text-sm">
          {[
            "Reservas + Fila Virtual",
            "Menu digital + QR Pedidos",
            "Split Payment + Gorjetas",
            "Fidelidade + Gamificação",
            "Dashboard + KDS + Analytics",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-card/50">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-foreground">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProductArchSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest">Produto</p>

    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      Arquitetura <span className="text-primary">pronta para escalar</span>
    </h2>

    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {[
        {
          icon: Smartphone,
          title: "Dois aplicativos nativos",
          desc: "App cliente e app restaurante",
        },
        {
          icon: Layers,
          title: "Plataforma completa de backend",
          desc: "Pagamentos, reservas, pedidos e fidelidade",
        },
        {
          icon: Globe,
          title: "Arquitetura escalável",
          desc: "Preparada para expansão multi-cidade",
        },
        {
          icon: Sparkles,
          title: "Design system consistente",
          desc: "Experiência pensada para operação real de restaurante",
        },
      ].map((item, i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <item.icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const GTMSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest">Go-to-Market</p>

    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
      Começamos pela oferta:{" "}
      <span className="text-primary">restaurantes parceiros</span>
    </h2>
    <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
      Estratégia inicial baseada em três pilares:
    </p>

    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[
        {
          icon: Award,
          title: "Founding restaurants",
          desc: "Primeiros parceiros participam da evolução do produto",
        },
        {
          icon: QrCode,
          title: "Aquisição no ponto de consumo",
          desc: "QR code nas mesas gera downloads do app",
        },
        {
          icon: Users,
          title: "Rede local",
          desc: "Cada restaurante traz seus próprios clientes para o ecossistema",
        },
      ].map((item, i) => (
        <div key={i} className="p-5 rounded-2xl bg-card border border-border">
          <item.icon className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>

    <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary">
      <p className="text-lg text-foreground">
        Esse modelo cria <strong>crescimento orgânico</strong> a partir do uso real no salão.
      </p>
    </div>
  </div>
);

const RoadmapSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-widest">Roadmap</p>

    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      Primeiros marcos de <span className="text-primary">crescimento</span>
    </h2>

    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-8">
        {[
          {
            phase: "3 meses",
            title: "Próximos 3 meses",
            items: ["Primeiros restaurantes parceiros", "Validação de uso no mundo real"],
            status: "current",
          },
          {
            phase: "12 meses",
            title: "12 meses",
            items: ["Expansão na cidade de São Paulo", "Primeira base relevante de usuários"],
            status: "next",
          },
          {
            phase: "24 meses",
            title: "24 meses",
            items: ["Expansão para outras capitais brasileiras", "Escala da base de restaurantes e clientes"],
            status: "future",
          },
        ].map((phase, i) => (
          <div key={i} className="flex items-start gap-6 relative">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ${
                phase.status === "current"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : phase.status === "next"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-foreground">{phase.title}</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {phase.items.map((item, j) => (
                  <div key={j} className="px-3 py-1.5 rounded-lg bg-muted text-xs text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const VisionSlide = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
    </div>

    <div className="relative z-10">
      <Globe className="w-16 h-16 text-primary/30 mx-auto mb-8" />

      <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight max-w-4xl">
        Construir a infraestrutura digital da{" "}
        <span className="text-primary">hospitalidade</span>
      </h2>

      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
        Nossa visão é um futuro onde:
      </p>

      <div className="flex items-center justify-center gap-8">
        {[
          { icon: Users, label: "Restaurantes conhecem seus clientes" },
          { icon: Sparkles, label: "A experiência presencial é personalizada" },
          { icon: Eye, label: "A tecnologia trabalha de forma invisível" },
        ].map((stat, i) => (
          <div key={i} className="text-center max-w-[200px]">
            <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-sm text-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-10">
        Queremos ajudar restaurantes a transformar cada visita em um{" "}
        <strong className="text-foreground">relacionamento duradouro</strong>.
      </p>
    </div>
  </div>
);

const CTASlide = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[150px]" />
    </div>

    <div className="relative z-10">
      <NoweeLogo size="xl" className="mx-auto mb-8" />

      <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
        Estamos no início de uma grande{" "}
        <span className="text-primary">transformação</span>
      </h2>

      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
        Restaurantes estão se digitalizando rapidamente, mas ainda carecem de ferramentas que conectem experiência, operação e relacionamento com o cliente.
      </p>

      <p className="text-xl text-foreground font-semibold max-w-2xl mx-auto mb-12">
        A NOOWE nasce para ocupar esse espaço.
      </p>

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Handshake className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-foreground">Vamos construir isso juntos.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ========================================
// MAIN COMPONENT
// ========================================

export default function PartnerPitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNav, setShowNav] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length) {
        setCurrentSlide(index);
        setShowNav(false);
      }
    },
    []
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        setShowNav(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const renderSlide = () => {
    switch (slides[currentSlide].type) {
      case "cover": return <CoverSlide />;
      case "purpose": return <PurposeSlide />;
      case "problem": return <ProblemSlide />;
      case "opportunity": return <OpportunitySlide />;
      case "solution": return <SolutionSlide />;
      case "product-client": return <ProductClientSlide />;
      case "product-restaurant": return <ProductRestaurantSlide />;
      case "experience": return <ExperienceSlide />;
      case "market": return <MarketSlide />;
      case "business-model": return <BusinessModelSlide />;
      case "unit-economics": return <UnitEconomicsSlide />;
      case "competitive": return <CompetitiveSlide />;
      case "product-arch": return <ProductArchSlide />;
      case "gtm": return <GTMSlide />;
      case "roadmap": return <RoadmapSlide />;
      case "vision": return <VisionSlide />;
      case "cta": return <CTASlide />;
      default: return <CoverSlide />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead
        title="NOOWE — Apresentação"
        description="NOOWE — A plataforma que devolve o relacionamento com o cliente ao restaurante."
        canonical="/pitch/partner"
      />

      {/* Nav overlay */}
      {showNav && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowNav(false)}
              className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="h-full flex items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3 p-8 max-w-6xl">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    currentSlide === index
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card border-border hover:border-primary/20"
                  }`}
                >
                  <p className="text-lg font-bold text-primary mb-1">{index + 1}</p>
                  <p className="text-xs text-foreground">{slide.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background/60 backdrop-blur-md">
        <button
          onClick={() => setShowNav(true)}
          className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <NoweeLogo size="xs" />
        </div>

        <div className="text-sm font-medium text-muted-foreground">
          {currentSlide + 1}/{slides.length}
        </div>
      </div>

      {/* Slide content */}
      <div className="pt-16 pb-20 min-h-screen flex items-center">
        <div className="w-full">{renderSlide()}</div>
      </div>

      {/* Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background/60 backdrop-blur-md">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`p-3 rounded-xl transition-all ${
            currentSlide === 0
              ? "opacity-30 cursor-not-allowed"
              : "bg-muted/50 hover:bg-muted"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 max-w-md mx-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`p-3 rounded-xl transition-all ${
            currentSlide === slides.length - 1
              ? "opacity-30 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
