/**
 * Demo Landing Page — Next Level
 * Entry point for the NOOWE Demo System
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Smartphone, Monitor, ArrowRight, Utensils, Users, BarChart3,
  CreditCard, Star, ChefHat, QrCode, Timer, HandMetal, Gift,
  Settings, BookOpen, UserPlus, CalendarDays, Sparkles, Shield,
} from 'lucide-react';

const Demo = () => {
  return (
    <>
      <Helmet>
        <title>Demo Interativa | NOOWE — Plataforma para Restaurantes</title>
        <meta name="description" content="Experimente a NOOWE na prática. Navegue pelo app do cliente e o painel do restaurante com dados reais simulados." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          
          <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-16">
            {/* Nav */}
            <div className="flex items-center justify-between mb-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm font-display">N</span>
                </div>
                <span className="font-display font-bold text-lg tracking-tight">NOOWE</span>
              </Link>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
                  Modo Demo
                </span>
              </div>
            </div>

            {/* Hero content */}
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-8">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-muted-foreground">100% interativo · dados simulados · sem cadastro</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Experimente a NOOWE
                <span className="block text-gradient-primary">na prática</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
                Navegue pelo app como um cliente faria, ou opere o painel completo do restaurante com pedidos, equipe e analytics.
              </p>
            </div>

            {/* Demo cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Client Demo */}
              <Link
                to="/demo/client"
                className="group relative bg-card rounded-2xl border border-border p-8 hover:border-primary/30 hover:shadow-glow transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-light rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Smartphone className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold mb-1">Demo Cliente</h2>
                    <p className="text-sm text-muted-foreground">A experiência completa do seu cliente</p>
                  </div>
                </div>

                <div className="space-y-2.5 mb-8">
                  {[
                    { icon: Utensils, text: 'Menu digital interativo com harmonização IA' },
                    { icon: QrCode, text: 'Escanear QR Code da mesa' },
                    { icon: CreditCard, text: 'Pedido, pagamento e split de conta' },
                    { icon: HandMetal, text: 'Chamar garçom ou sommelier discretamente' },
                    { icon: Timer, text: 'Fila virtual com acompanhamento' },
                    { icon: Gift, text: 'Programa de fidelidade com níveis' },
                    { icon: CalendarDays, text: 'Reservas com convite de amigos' },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4 text-primary/60 shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>Iniciar demo do cliente</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              {/* Restaurant Demo */}
              <Link
                to="/demo/restaurant"
                className="group relative bg-card rounded-2xl border border-border p-8 hover:border-secondary/30 hover:shadow-glow-secondary transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-secondary-light rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Monitor className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold mb-1">Demo Restaurante</h2>
                    <p className="text-sm text-muted-foreground">O painel completo para seu negócio</p>
                  </div>
                </div>

                <div className="space-y-2.5 mb-8">
                  {[
                    { icon: BarChart3, text: 'Dashboard com métricas em tempo real' },
                    { icon: Monitor, text: 'Mapa de mesas com status ao vivo' },
                    { icon: ChefHat, text: 'KDS de cozinha e bar simulados' },
                    { icon: Settings, text: 'Configuração do restaurante e tipo de serviço' },
                    { icon: UserPlus, text: 'Gestão de equipe, funções e escalas' },
                    { icon: BookOpen, text: 'Editor de cardápio completo' },
                    { icon: Users, text: 'Reservas e fila virtual' },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4 text-secondary/60 shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-secondary font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>Iniciar demo do restaurante</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>

            {/* Bottom note */}
            <div className="text-center mt-12">
              <p className="text-xs text-muted-foreground">
                Todos os dados são simulados. O restaurante <strong className="text-foreground">Bistrô Noowe</strong> é fictício e criado para fins de demonstração.
              </p>
            </div>
          </div>
        </section>

        {/* Features strip */}
        <section className="border-t border-border bg-muted/30 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '14+', label: 'Telas do cliente' },
                { value: '9', label: 'Módulos do restaurante' },
                { value: '30+', label: 'Itens no menu' },
                { value: 'Real-time', label: 'Simulação ao vivo' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="max-w-xl mx-auto px-6">
            <h2 className="font-display text-2xl font-bold mb-4">Quer ver isso no seu restaurante?</h2>
            <p className="text-muted-foreground mb-8">Entre em contato e descubra como a NOOWE pode transformar a experiência dos seus clientes.</p>
            <a
              href="https://wa.me/5511999999999?text=Olá! Vi a demo da NOOWE e gostaria de saber mais."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-glow"
            >
              Falar pelo WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default Demo;
