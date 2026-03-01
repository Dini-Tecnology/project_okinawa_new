import React from "react";
import SEOHead from "@/components/seo/SEOHead";
import NoweeLogo from "@/components/brand/NoweeLogo";

const palette = [
  { name: "Primary", token: "--primary", hsl: "14 100% 57%", hex: "#FF5722", desc: "Warm Orange — Energy, passion, action" },
  { name: "Primary Light", token: "--primary-light", hsl: "14 100% 65%", hex: "#FF7A50", desc: "Glow variant for hover states" },
  { name: "Primary Dark", token: "--primary-dark", hsl: "14 100% 45%", hex: "#CC4519", desc: "Depth variant for pressed states" },
  { name: "Secondary", token: "--secondary", hsl: "168 84% 29%", hex: "#0C8C6E", desc: "Teal — Trust, freshness, innovation" },
  { name: "Secondary Light", token: "--secondary-light", hsl: "168 84% 40%", hex: "#11BF96", desc: "Vibrant teal for accents" },
  { name: "Accent", token: "--accent", hsl: "38 92% 50%", hex: "#F5A623", desc: "Warm Gold — Premium, celebration" },
  { name: "Foreground", token: "--foreground", hsl: "220 20% 10%", hex: "#161B22", desc: "Primary text" },
  { name: "Muted", token: "--muted-foreground", hsl: "220 10% 46%", hex: "#6B7280", desc: "Secondary text" },
];

const typographySamples = [
  { label: "Display / Hero", family: "Space Grotesk", weight: 700, size: "48px", tracking: "-0.03em", sample: "Descubra o agora." },
  { label: "Heading 1", family: "Space Grotesk", weight: 600, size: "36px", tracking: "-0.02em", sample: "Experiências que conectam" },
  { label: "Heading 2", family: "Space Grotesk", weight: 600, size: "28px", tracking: "-0.02em", sample: "Reservas inteligentes" },
  { label: "Heading 3", family: "Inter", weight: 600, size: "22px", tracking: "-0.01em", sample: "Seu restaurante favorito" },
  { label: "Body Large", family: "Inter", weight: 400, size: "18px", tracking: "0", sample: "Momentos compartilhados, memórias que ficam. O NOOWE conecta você às melhores experiências gastronômicas." },
  { label: "Body", family: "Inter", weight: 400, size: "16px", tracking: "0", sample: "Reserve mesas, peça pratos, divida a conta — tudo em um só lugar." },
  { label: "Caption", family: "Inter", weight: 500, size: "12px", tracking: "0.04em", sample: "DISPONÍVEL AGORA · SÃO PAULO" },
];

const BrandIdentity = () => {
  return (
    <>
      <SEOHead title="Brand Identity — NOOWE" description="NOOWE brand identity system — logo, colors, typography, and usage guidelines." noIndex />
      <div className="min-h-screen bg-background text-foreground">

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl" />

          <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-36 text-center">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-8">
              Brand Identity System · v1.0
            </p>
            <div className="flex justify-center mb-10">
              <NoweeLogo size="2xl" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experiências gastronômicas que conectam pessoas.
              <br />
              <span className="text-foreground font-medium">Agora. Aqui. Juntos.</span>
            </p>
          </div>
        </section>

        {/* ─── DIVIDER ─── */}
        <div className="max-w-6xl mx-auto px-6">
          <hr className="border-border" />
        </div>

        {/* ─── LOGO VARIANTS ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-2xl font-semibold mb-2">Logo</h2>
          <p className="text-muted-foreground mb-12">Três variantes para diferentes contextos e espaços.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Full */}
            <div className="rounded-xl border border-border p-10 flex flex-col items-center justify-center gap-6 bg-card">
              <NoweeLogo size="lg" variant="full" />
              <span className="text-xs tracking-widest uppercase text-muted-foreground">Full</span>
            </div>
            {/* Mark */}
            <div className="rounded-xl border border-border p-10 flex flex-col items-center justify-center gap-6 bg-card">
              <NoweeLogo size="lg" variant="mark" />
              <span className="text-xs tracking-widest uppercase text-muted-foreground">Mark</span>
            </div>
            {/* Wordmark */}
            <div className="rounded-xl border border-border p-10 flex flex-col items-center justify-center gap-6 bg-card">
              <NoweeLogo size="lg" variant="wordmark" />
              <span className="text-xs tracking-widest uppercase text-muted-foreground">Wordmark</span>
            </div>
          </div>

          {/* On Dark */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl p-10 flex flex-col items-center justify-center gap-6" style={{ background: "hsl(220 20% 10%)" }}>
              <div className="[&_span]:!text-white">
                <NoweeLogo size="lg" variant="full" />
              </div>
              <span className="text-xs tracking-widest uppercase" style={{ color: "hsl(220 10% 60%)" }}>On Dark</span>
            </div>
            <div className="rounded-xl p-10 flex flex-col items-center justify-center gap-6" style={{ background: "hsl(220 20% 10%)" }}>
              <NoweeLogo size="lg" variant="mark" />
              <span className="text-xs tracking-widest uppercase" style={{ color: "hsl(220 10% 60%)" }}>On Dark</span>
            </div>
            <div className="rounded-xl p-10 flex flex-col items-center justify-center gap-6 bg-primary">
              <div className="[&_span]:!text-white">
                <NoweeLogo size="lg" variant="wordmark" />
              </div>
              <span className="text-xs tracking-widest uppercase text-primary-foreground/60">On Primary</span>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6"><hr className="border-border" /></div>

        {/* ─── SIZING ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-2xl font-semibold mb-2">Escala</h2>
          <p className="text-muted-foreground mb-12">Tamanhos disponíveis — do ícone ao hero.</p>

          <div className="space-y-8">
            {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map((s) => (
              <div key={s} className="flex items-center gap-6">
                <span className="w-10 text-xs text-muted-foreground font-mono text-right">{s}</span>
                <NoweeLogo size={s} />
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6"><hr className="border-border" /></div>

        {/* ─── MARK ANATOMY ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-2xl font-semibold mb-2">Mark — Anatomia</h2>
          <p className="text-muted-foreground mb-12">Dois "O"s entrelaçados como elos de uma corrente. Conexão, vínculo, encontro.</p>

          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-shrink-0">
              <svg width="240" height="240" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Guide rings */}
                <circle cx="22" cy="32" r="14" stroke="hsl(14 100% 57%)" strokeWidth="0.3" strokeDasharray="2 2" fill="none" />
                <circle cx="42" cy="32" r="14" stroke="hsl(168 84% 29%)" strokeWidth="0.3" strokeDasharray="2 2" fill="none" />
                {/* Left O ring */}
                <circle cx="22" cy="32" r="14" stroke="hsl(14 100% 57%)" strokeWidth="4" fill="none" opacity="0.95" />
                {/* Right O ring */}
                <circle cx="42" cy="32" r="14" stroke="hsl(168 84% 29%)" strokeWidth="4" fill="none" opacity="0.9" />
                {/* Interlock: left ring passes over right at top */}
                <clipPath id="anatomy-interlock">
                  <rect x="28" y="18" width="8" height="14" />
                </clipPath>
                <circle cx="22" cy="32" r="14" stroke="hsl(14 100% 57%)" strokeWidth="4" fill="none" clipPath="url(#anatomy-interlock)" />
                {/* Center point */}
                <circle cx="32" cy="32" r="1.5" fill="hsl(38 92% 50%)" opacity="0.8" />
              </svg>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Anel Laranja — Energia</p>
                  <p className="text-muted-foreground">Paixão, calor humano, a ação de sair e viver.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Anel Teal — Confiança</p>
                  <p className="text-muted-foreground">Inovação, frescor, a tecnologia que simplifica.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Entrelaçamento — Vínculo</p>
                  <p className="text-muted-foreground">Onde os anéis se cruzam, as pessoas se conectam. O agora.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6"><hr className="border-border" /></div>

        {/* ─── COLOR PALETTE ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-2xl font-semibold mb-2">Paleta de Cores</h2>
          <p className="text-muted-foreground mb-12">Tokens semânticos — HSL nativo para coerência light/dark.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {palette.map((c) => (
              <div key={c.token} className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="h-20" style={{ backgroundColor: `hsl(${c.hsl})` }} />
                <div className="p-4 space-y-1">
                  <p className="font-medium text-sm text-foreground">{c.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{c.hex}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gradient Strip */}
          <div className="mt-12">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Gradientes de Marca</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-16 rounded-xl" style={{ background: "linear-gradient(135deg, hsl(14 100% 57%), hsl(14 100% 65%))" }}>
                <div className="h-full flex items-center justify-center text-xs font-medium text-white/90">Primary Glow</div>
              </div>
              <div className="h-16 rounded-xl" style={{ background: "linear-gradient(135deg, hsl(14 100% 57%), hsl(168 84% 29%))" }}>
                <div className="h-full flex items-center justify-center text-xs font-medium text-white/90">Hero Gradient</div>
              </div>
              <div className="h-16 rounded-xl" style={{ background: "linear-gradient(135deg, hsl(168 84% 29%), hsl(38 92% 50%))" }}>
                <div className="h-full flex items-center justify-center text-xs font-medium text-white/90">Accent Blend</div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6"><hr className="border-border" /></div>

        {/* ─── TYPOGRAPHY ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-2xl font-semibold mb-2">Tipografia</h2>
          <p className="text-muted-foreground mb-12">
            <span className="font-medium text-foreground">Space Grotesk</span> para display & headings.{" "}
            <span className="font-medium text-foreground">Inter</span> para body & UI.
          </p>

          <div className="space-y-8">
            {typographySamples.map((t, i) => (
              <div key={i} className="border-l-2 border-border pl-6">
                <p className="text-xs font-mono text-muted-foreground mb-2">
                  {t.label} · {t.family} {t.weight} · {t.size}
                </p>
                <p
                  style={{
                    fontFamily: t.family === "Space Grotesk" ? "'Space Grotesk', sans-serif" : "'Inter', sans-serif",
                    fontWeight: t.weight,
                    fontSize: t.size,
                    letterSpacing: t.tracking,
                    lineHeight: 1.3,
                  }}
                  className="text-foreground"
                >
                  {t.sample}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6"><hr className="border-border" /></div>

        {/* ─── USAGE EXAMPLES ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-2xl font-semibold mb-2">Aplicações</h2>
          <p className="text-muted-foreground mb-12">Exemplos de uso em contextos reais.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* App Bar mockup */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                <NoweeLogo size="sm" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted" />
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-10 bg-primary rounded-lg mt-4 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-foreground">Reservar agora</span>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground pb-4">App Header</p>
            </div>

            {/* Splash Screen mockup */}
            <div className="rounded-xl overflow-hidden" style={{ background: "hsl(220 20% 7%)" }}>
              <div className="p-10 flex flex-col items-center justify-center min-h-[280px] gap-6">
                <NoweeLogo size="xl" variant="mark" />
                <div className="[&_span]:!text-white">
                  <NoweeLogo size="lg" variant="wordmark" />
                </div>
                <p className="text-xs tracking-[0.15em] uppercase" style={{ color: "hsl(220 10% 50%)" }}>
                  Experiências gastronômicas
                </p>
              </div>
              <p className="text-xs text-center pb-4" style={{ color: "hsl(220 10% 40%)" }}>Splash Screen</p>
            </div>

            {/* Notification badge */}
            <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
              <NoweeLogo size="sm" variant="mark" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Sua reserva está confirmada!</p>
                <p className="text-xs text-muted-foreground">Restaurante Oia · Hoje, 20h</p>
              </div>
              <span className="text-xs text-muted-foreground">agora</span>
            </div>

            {/* Business card */}
            <div className="rounded-xl border border-border bg-card p-8 flex flex-col justify-between min-h-[160px]">
              <NoweeLogo size="sm" />
              <div>
                <p className="text-sm font-medium text-foreground">Maria Santos</p>
                <p className="text-xs text-muted-foreground">Head of Product · maria@noowe.app</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6"><hr className="border-border" /></div>

        {/* ─── VOICE & TONE ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-2xl font-semibold mb-2">Voz & Tom</h2>
          <p className="text-muted-foreground mb-12">A personalidade da marca em palavras.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Próximo",
                desc: "Falamos como um amigo que conhece os melhores lugares. Sem formalidade excessiva, sem gírias forçadas.",
                example: '"Seu prato favorito está a um toque."',
              },
              {
                title: "Confiante",
                desc: "Sabemos o que fazemos. Diretos, claros, sem rodeios. Cada palavra tem propósito.",
                example: '"Reserve. Peça. Viva."',
              },
              {
                title: "Caloroso",
                desc: "Tecnologia com alma. Celebramos os momentos humanos que a comida proporciona.",
                example: '"Porque as melhores histórias começam à mesa."',
              },
            ].map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                <p className="text-sm italic text-primary font-medium">{v.example}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6"><hr className="border-border" /></div>

        {/* ─── DON'TS ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-2xl font-semibold mb-2">Uso Incorreto</h2>
          <p className="text-muted-foreground mb-12">Preserve a integridade da marca.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Não rotacionar", style: "rotate-12" },
              { label: "Não distorcer", style: "scale-x-[1.4]" },
              { label: "Não adicionar sombra", style: "drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" },
              { label: "Não alterar cores", style: "" },
            ].map((d, i) => (
              <div key={i} className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col items-center gap-4">
                <div className={`${d.style} transition-none`}>
                  {i === 3 ? (
                    <span
                      style={{
                        fontSize: "28px",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        color: "hsl(280 60% 50%)",
                      }}
                    >
                      noowe
                    </span>
                  ) : (
                    <NoweeLogo size="md" />
                  )}
                </div>
                <span className="text-xs text-destructive font-medium">✕ {d.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="max-w-6xl mx-auto px-6 py-16 text-center">
          <NoweeLogo size="sm" variant="mark" className="justify-center mb-4" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NOOWE · Brand Identity System v1.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Documento confidencial. Uso interno e parceiros autorizados.
          </p>
        </footer>
      </div>
    </>
  );
};

export default BrandIdentity;
