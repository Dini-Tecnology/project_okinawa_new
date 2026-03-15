/**
 * Chef's Table Demo — Mesa do Chef Noowe
 * Deep UX: Discover → Detail → Date + Guests → Dietary Preferences → Wine Preferences → Payment → Countdown → Day-of Welcome → Course 1-3 + Sommelier → Photo Moment → Final Review + Certificate
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint, ItemIcon } from '../DemoShared';
import { FoodImg } from '../FoodImages';
import {
  ArrowLeft, Check, Star, Clock, CreditCard, Gift, Calendar,
  Crown, ChefHat, Wine, Camera, ArrowRight, Sparkles, Heart,
  Users, Lock, MessageCircle, Share2, Award, Loader2, UtensilsCrossed,
} from 'lucide-react';

type Screen = 'home' | 'detail' | 'reservation' | 'dietary' | 'wine-pref' | 'payment' | 'countdown' | 'welcome' | 'course-1' | 'course-2' | 'course-3' | 'photo' | 'finale';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir experiência', screens: ['home', 'detail'] },
  { step: 2, label: 'Reserva exclusiva', screens: ['reservation'] },
  { step: 3, label: 'Preferências alimentares', screens: ['dietary'] },
  { step: 4, label: 'Preferências de vinho', screens: ['wine-pref'] },
  { step: 5, label: 'Pagamento antecipado', screens: ['payment'] },
  { step: 6, label: 'Contagem regressiva', screens: ['countdown'] },
  { step: 7, label: 'Dia da experiência', screens: ['welcome'] },
  { step: 8, label: 'Degustação (3 cursos)', screens: ['course-1', 'course-2', 'course-3'] },
  { step: 9, label: 'Foto & encerramento', screens: ['photo', 'finale'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Experiências', desc: 'Descubra experiências gastronômicas exclusivas.' },
  'detail': { emoji: '👨‍🍳', title: 'Mesa do Chef', desc: 'Jantar exclusivo para 8 com Chef Ricardo Oliveira.' },
  'reservation': { emoji: '📅', title: 'Reserva', desc: 'Escolha data, convidados e garanta sua vaga.' },
  'dietary': { emoji: '🥗', title: 'Dieta', desc: 'Alergias, restrições e preferências alimentares.' },
  'wine-pref': { emoji: '🍷', title: 'Vinhos', desc: 'Perfil de preferências para harmonização.' },
  'payment': { emoji: '💳', title: 'Pagamento', desc: 'Pré-pagamento integral para confirmação.' },
  'countdown': { emoji: '⏳', title: 'Contagem', desc: 'Faltam poucos dias para sua experiência.' },
  'welcome': { emoji: '🥂', title: 'Boas-vindas', desc: 'Recepção com champagne e apresentação.' },
  'course-1': { emoji: '🍽️', title: 'Amuse-Bouche', desc: 'Primeiro curso com história do chef.' },
  'course-2': { emoji: '🥩', title: 'Prato Principal', desc: 'Wagyu A5 com harmonização do sommelier.' },
  'course-3': { emoji: '🍫', title: 'Sobremesa', desc: 'Grand finale com soufflé e espumante.' },
  'photo': { emoji: '📸', title: 'Foto', desc: 'Registro com o chef e menu assinado.' },
  'finale': { emoji: '✨', title: 'Certificado', desc: 'Certificado digital e avaliação da experiência.' },
};

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const ChefsTableDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [selectedDate, setSelectedDate] = useState(0);
  const [guests, setGuests] = useState(2);

  const Header: React.FC<{ title: string; back: Screen; sub?: string }> = ({ title, back, sub }) => (
    <div className="px-5 flex items-center justify-between py-4">
      <button onClick={() => onNavigate(back)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
      <div className="text-center">
        <h1 className="font-display font-bold text-sm">{title}</h1>
        {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
      </div>
      <div className="w-8" />
    </div>
  );

  const CourseProgress: React.FC<{ current: number; total: number }> = ({ current, total }) => (
    <div className="px-5 mb-4">
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-1">Curso {current} de {total}</p>
    </div>
  );

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Experiências</p>
            <h1 className="font-display text-xl font-bold">Chef's Table</h1>
          </div>
          <GuidedHint text="Experiências exclusivas com poucos lugares" />
          <button onClick={() => onNavigate('detail')} className="w-full text-left mb-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-800/20 to-stone-700/20 border border-zinc-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-accent" />
                <span className="text-xs text-accent font-bold uppercase tracking-wider">Exclusivo</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-1">Mesa do Chef Noowe</h3>
              <p className="text-sm text-muted-foreground mb-2">Chef Ricardo Oliveira · 2 estrelas Michelin</p>
              <p className="text-xs text-muted-foreground mb-3">7 cursos de degustação · Harmonização completa · 3h</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />8 lugares</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" />4.9 (128)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">R$ 680<span className="text-xs font-normal text-muted-foreground">/pessoa</span></span>
                <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-bold">3 vagas</span>
              </div>
            </div>
          </button>
        </div>
      );

    case 'detail':
      return (
        <div className="px-5 pb-4">
          <Header title="Mesa do Chef" back="home" />
          <div className="text-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3">
              <ChefHat className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold">Chef Ricardo Oliveira</h2>
            <p className="text-sm text-muted-foreground">2 estrelas Michelin · São Paulo</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= 5 ? 'text-accent fill-accent' : 'text-muted'}`} />)}
              <span className="text-xs font-semibold ml-1">4.9</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <h3 className="font-semibold text-sm mb-2">O que esperar</h3>
            <div className="space-y-1.5">
              {[
                { icon: UtensilsCrossed, text: '7 cursos de degustação exclusivos' },
                { icon: Wine, text: 'Harmonização completa de vinhos premium' },
                { icon: ChefHat, text: 'Interação direta com o chef a cada curso' },
                { icon: Award, text: 'Menu personalizado de lembrança assinado' },
                { icon: Camera, text: 'Sessão de fotos com o chef' },
                { icon: Crown, text: 'Certificado digital de participação' },
                { icon: Clock, text: 'Duração: ~3 horas' },
              ].map((item, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-2"><item.icon className="w-3.5 h-3.5 text-primary shrink-0" />{item.text}</p>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 mb-4">
            <Lock className="w-4 h-4 text-warning" />
            <span className="text-xs text-warning font-semibold">Apenas 3 vagas restantes para Sáb, 22 Mar</span>
          </div>
          <button onClick={() => onNavigate('reservation')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Crown className="w-5 h-5" />Reservar · R$ 680/pessoa
          </button>
        </div>
      );

    case 'reservation':
      return (
        <div className="px-5 pb-4">
          <Header title="Reservar" back="detail" />
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Data disponível</label>
            <div className="flex gap-2">
              {['Sáb 22 Mar', 'Sáb 29 Mar', 'Sáb 5 Abr'].map((d, i) => (
                <button key={d} onClick={() => i < 2 && setSelectedDate(i)} className={`flex-1 py-3 rounded-xl text-xs font-medium border transition-all ${selectedDate === i ? 'border-primary bg-primary/10 text-primary' : i === 2 ? 'border-border text-muted-foreground/40' : 'border-border text-muted-foreground'}`}>
                  {d}
                  {i === 2 && <p className="text-[9px] text-destructive">Esgotado</p>}
                  {i < 2 && <p className="text-[9px] mt-0.5">{i === 0 ? '3 vagas' : '5 vagas'}</p>}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Convidados</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setGuests(Math.max(1, guests-1))} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><span className="text-lg">-</span></button>
              <span className="font-display text-2xl font-bold w-8 text-center">{guests}</span>
              <button onClick={() => setGuests(Math.min(4, guests+1))} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><span className="text-lg">+</span></button>
              <span className="text-xs text-muted-foreground ml-2">pessoa{guests > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{guests} × R$ 680</span><span>R$ {guests * 680}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Harmonização</span><span className="text-success">✓ Incluída</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg"><span>Total</span><span className="text-primary">R$ {guests * 680}</span></div>
          </div>
          <button onClick={() => onNavigate('dietary')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            Próximo: Preferências <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case 'dietary':
      return (
        <div className="px-5 pb-4">
          <Header title="Preferências Alimentares" back="reservation" sub="O chef personaliza para você" />
          <div className="mb-4">
            <label className="text-xs font-semibold mb-2 block">Restrições alimentares</label>
            <div className="flex flex-wrap gap-2">
              {['Nenhuma', 'Vegetariano', 'Vegano', 'Sem glúten', 'Sem lactose', 'Sem frutos do mar', 'Kosher'].map((p, i) => (
                <button key={p} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${i === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold mb-2 block">Alergias</label>
            <div className="flex flex-wrap gap-2">
              {['Nenhuma', 'Nozes', 'Amendoim', 'Soja', 'Ovo', 'Leite', 'Peixe', 'Marisco'].map((p, i) => (
                <button key={p} className={`px-3 py-2 rounded-xl text-xs font-medium border ${i === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold mb-2 block">Ocasião especial?</label>
            <div className="flex flex-wrap gap-2">
              {['Sem ocasião', 'Aniversário 🎂', 'Proposta 💍', 'Negócios 💼', 'Celebração 🎉'].map((p, i) => (
                <button key={p} className={`px-3 py-2 rounded-xl text-xs font-medium border ${i === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{p}</button>
              ))}
            </div>
          </div>
          <button onClick={() => onNavigate('wine-pref')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            Próximo: Vinhos <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case 'wine-pref':
      return (
        <div className="px-5 pb-4">
          <Header title="Perfil de Vinhos" back="dietary" sub="Para harmonização personalizada" />
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Wine className="w-7 h-7 text-accent" />
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold mb-2 block">Preferência principal</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Tinto', emoji: '🍷', sel: true },
                { name: 'Branco', emoji: '🥂' },
                { name: 'Espumante', emoji: '🍾' },
                { name: 'Sem álcool', emoji: '🧃' },
              ].map((w, i) => (
                <button key={w.name} className={`p-3 rounded-xl text-center border-2 ${w.sel ? 'border-primary bg-primary/10' : 'border-border'}`}>
                  <span className="text-xl">{w.emoji}</span>
                  <p className="text-xs font-medium mt-1">{w.name}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold mb-2 block">Intensidade</label>
            <div className="flex gap-2">
              {['Leve', 'Médio', 'Encorpado'].map((i, idx) => (
                <button key={i} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border ${idx === 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{i}</button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold mb-2 block">Região favorita (opcional)</label>
            <div className="flex flex-wrap gap-2">
              {['Qualquer', 'França', 'Itália', 'Chile', 'Argentina', 'Portugal'].map((r, i) => (
                <button key={r} className={`px-3 py-2 rounded-xl text-xs font-medium border ${i === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{r}</button>
              ))}
            </div>
          </div>
          <button onClick={() => onNavigate('payment')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Confirmar & Pagar R$ {guests * 680}
          </button>
        </div>
      );

    case 'payment':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Reserva Confirmada! ✨</h2>
          <p className="text-sm text-muted-foreground mb-1">Mesa do Chef Noowe</p>
          <p className="text-xs text-muted-foreground mb-4">Sáb, 22 Mar · 20:00 · {guests} pessoas</p>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-3">
            <p className="text-xs text-muted-foreground">Código de confirmação</p>
            <p className="font-display text-3xl font-bold tracking-widest text-primary mt-1">MC-047</p>
          </div>
          <div className="w-full p-3 rounded-xl bg-muted/30 mb-4 text-left text-xs text-muted-foreground space-y-1">
            <p>📍 Endereço enviado por email</p>
            <p>👔 Dress code: Smart Casual</p>
            <p>⏱️ Chegue 10 min antes (20:00)</p>
            <p>📝 Suas preferências foram enviadas ao chef</p>
          </div>
          <button onClick={() => onNavigate('countdown')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Continuar
          </button>
        </div>
      );

    case 'countdown':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <Sparkles className="w-10 h-10 text-accent mb-4" />
          <h2 className="font-display text-lg font-bold mb-2">Faltam 3 dias!</h2>
          <p className="text-sm text-muted-foreground mb-5">Sáb, 22 Mar · 20:00</p>
          <div className="grid grid-cols-3 gap-3 w-full mb-5">
            {[
              { value: '0', label: 'Horas' },
              { value: '3', label: 'Dias' },
              { value: '0', label: 'Semanas' },
            ].map((t, i) => (
              <div key={i} className="p-4 rounded-2xl bg-card border border-border">
                <p className="font-display text-3xl font-bold text-primary">{t.value}</p>
                <p className="text-[10px] text-muted-foreground">{t.label}</p>
              </div>
            ))}
          </div>
          <div className="w-full p-4 rounded-xl bg-accent/5 border border-accent/20 mb-4">
            <p className="text-sm font-semibold mb-2">O chef está preparando...</p>
            <p className="text-xs text-muted-foreground italic">"Estou selecionando os melhores ingredientes para uma experiência inesquecível. O Wagyu A5 de Miyazaki já está reservado."</p>
            <p className="text-xs text-primary font-medium mt-2">— Chef Ricardo</p>
          </div>
          <button onClick={() => onNavigate('welcome')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            Simular Dia da Experiência <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case 'welcome':
      return (
        <div className="px-5 pb-4">
          <Header title="Experiência" back="countdown" />
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-display text-lg font-bold">Bem-vindo à Mesa do Chef</h2>
            <p className="text-xs text-muted-foreground">Sáb, 22 Mar · 20:00</p>
          </div>
          {/* Welcome champagne */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 mb-4 text-center">
            <span className="text-3xl">🥂</span>
            <p className="text-sm font-semibold mt-2">Champagne de Boas-Vindas</p>
            <p className="text-xs text-muted-foreground">Veuve Clicquot Brut · Cortesia do Chef</p>
          </div>
          {/* Menu preview */}
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><ChefHat className="w-4 h-4 text-primary" />Menu de Hoje — 7 Cursos</h3>
            {[
              '1. Amuse-Bouche · Tartar de Vieira com Yuzu',
              '2. Entrada · Carpaccio de Atum Trufado',
              '3. Sopa · Creme de Abóbora com Foie Gras',
              '4. Peixe · Robalo em Crosta de Ervas',
              '5. Carne · Wagyu A5 com Aspargos',
              '6. Queijos · Seleção Francesa',
              '7. Sobremesa · Soufflé de Chocolate 70%',
            ].map((course, i) => (
              <p key={i} className="text-xs text-muted-foreground py-0.5">{course}</p>
            ))}
          </div>
          <GuidedHint text="O chef apresentará cada curso pessoalmente" />
          <button onClick={() => onNavigate('course-1')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            Iniciar Experiência <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case 'course-1':
      return (
        <div className="px-5 pb-4">
          <Header title="Amuse-Bouche" back="welcome" sub="Curso 1 de 7" />
          <CourseProgress current={1} total={7} />
          <div className="text-center mb-4">
            <span className="text-5xl block mb-3">🍽️</span>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Amuse-Bouche</p>
            <h2 className="font-display text-xl font-bold">Tartar de Vieira</h2>
            <p className="text-xs text-muted-foreground mt-1">com yuzu, microgreens e ostra Miyagi</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex items-start gap-3">
              <ChefHat className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Chef Ricardo</p>
                <p className="text-xs text-muted-foreground italic">"As vieiras vêm direto da costa catarinense. O yuzu traz acidez equilibrada que prepara o paladar para a jornada que vem."</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 mb-3 flex items-center gap-3">
            <Wine className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs font-semibold">Harmonização</p>
              <p className="text-xs text-muted-foreground">Champagne Brut · Veuve Clicquot</p>
              <p className="text-[10px] text-accent italic mt-0.5">"A efervescência limpa o paladar entre mordidas" — Sommelier</p>
            </div>
          </div>
          <button onClick={() => onNavigate('course-2')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            Próximo Curso <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case 'course-2':
      return (
        <div className="px-5 pb-4">
          <Header title="Prato Principal" back="course-1" sub="Curso 5 de 7" />
          <CourseProgress current={5} total={7} />
          <div className="text-center mb-4">
            <span className="text-5xl block mb-3">🥩</span>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Prato Principal</p>
            <h2 className="font-display text-xl font-bold">Wagyu A5 com Aspargos</h2>
            <p className="text-xs text-muted-foreground mt-1">Miyazaki, Japão · Brasa de binchotan</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex items-start gap-3">
              <ChefHat className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Chef Ricardo</p>
                <p className="text-xs text-muted-foreground italic">"O Wagyu A5 de Miyazaki é o corte mais marmorizado do mundo. Preparamos na brasa de carvão binchotan — preserva a textura e os sucos naturais."</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 mb-3 flex items-center gap-3">
            <Wine className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs font-semibold">Harmonização</p>
              <p className="text-xs text-muted-foreground">Barolo DOCG 2018 · Piemonte, Itália</p>
              <p className="text-[10px] text-accent italic mt-0.5">"Taninos elegantes que se fundem com a gordura do wagyu" — Sommelier</p>
            </div>
          </div>
          {/* Interactive reaction */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {['😍', '🤤', '🔥', '👨‍🍳', '❤️'].map(emoji => (
              <button key={emoji} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-lg hover:scale-110 transition-transform">{emoji}</button>
            ))}
          </div>
          <button onClick={() => onNavigate('course-3')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            Próximo Curso <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case 'course-3':
      return (
        <div className="px-5 pb-4">
          <Header title="Grand Finale" back="course-2" sub="Curso 7 de 7" />
          <CourseProgress current={7} total={7} />
          <div className="text-center mb-4">
            <span className="text-5xl block mb-3">🍫</span>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Sobremesa</p>
            <h2 className="font-display text-xl font-bold">Soufflé de Chocolate 70%</h2>
            <p className="text-xs text-muted-foreground mt-1">com sorvete de baunilha bourbon</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex items-start gap-3">
              <ChefHat className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Chef Ricardo</p>
                <p className="text-xs text-muted-foreground italic">"O soufflé leva exatamente 12 minutos no forno. Não perdoa atrasos — é a perfeição do timing. O chocolate é Valrhona Guanaja 70%."</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 mb-3 flex items-center gap-3">
            <Wine className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs font-semibold">Harmonização Final</p>
              <p className="text-xs text-muted-foreground">Porto Vintage 2017 · Douro, Portugal</p>
            </div>
          </div>
          <GuidedHint text="Momento especial: foto com o chef" pulse={false} />
          <button onClick={() => onNavigate('photo')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />Foto com o Chef
          </button>
        </div>
      );

    case 'photo':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-48 h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center mb-4">
            <div className="text-center">
              <Camera className="w-10 h-10 text-primary/30 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground">Foto com Chef Ricardo</p>
            </div>
          </div>
          <h2 className="font-display text-lg font-bold mb-2">Momento Especial 📸</h2>
          <p className="text-xs text-muted-foreground mb-4">Foto profissional com o chef e menu assinado</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-4">
            <p className="text-xs text-muted-foreground mb-1">Menu assinado pelo chef</p>
            <p className="font-display text-sm font-bold italic">"Para um paladar extraordinário"</p>
            <p className="text-xs text-primary mt-1">— Chef Ricardo Oliveira</p>
          </div>
          <div className="flex gap-3 mb-4">
            <button className="flex-1 py-3 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-2"><Share2 className="w-4 h-4" />Compartilhar</button>
            <button className="flex-1 py-3 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-2"><Heart className="w-4 h-4" />Salvar</button>
          </div>
          <button onClick={() => onNavigate('finale')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Ver Certificado
          </button>
        </div>
      );

    case 'finale':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-5 shadow-xl">
            <Award className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold mb-1">Certificado Digital 🎖️</h2>
          <p className="text-sm text-muted-foreground mb-4">Mesa do Chef Noowe · 22 Mar 2026</p>
          <div className="w-full p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 mb-4">
            <p className="text-xs text-muted-foreground">Certificamos que</p>
            <p className="font-display text-lg font-bold mt-1">Você</p>
            <p className="text-xs text-muted-foreground mt-1">participou da experiência exclusiva</p>
            <p className="font-display font-bold text-primary mt-1">Mesa do Chef · 7 Cursos</p>
            <p className="text-xs text-muted-foreground mt-2 italic">com Chef Ricardo Oliveira</p>
          </div>
          <div className="w-full p-3 rounded-xl bg-primary/5 border border-primary/20 mb-3 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+680 pontos ganhos!</p><p className="text-xs text-muted-foreground">Nível Gold desbloqueado 👑</p></div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-7 h-7 text-accent fill-accent" />)}
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};