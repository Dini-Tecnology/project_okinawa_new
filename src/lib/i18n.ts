import { createContext, useContext } from 'react';

export type Lang = 'pt' | 'en' | 'es';

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  'nav.platform': { pt: 'Plataforma', en: 'Platform', es: 'Plataforma' },
  'nav.demo': { pt: 'Demo', en: 'Demo', es: 'Demo' },
  'nav.request_demo': { pt: 'Solicitar Demo', en: 'Request Demo', es: 'Solicitar Demo' },

  // Hero
  'hero.overline': { pt: 'APRESENTANDO NOOWE', en: 'INTRODUCING NOOWE', es: 'PRESENTAMOS NOOWE' },
  'hero.h1_1': { pt: 'Um sistema.', en: 'One system.', es: 'Un sistema.' },
  'hero.h1_2': { pt: 'Todo restaurante.', en: 'Every restaurant.', es: 'Cada restaurante.' },
  'hero.sub': {
    pt: 'A plataforma inteligente que unifica operações, equipe e experiência do cliente em um só lugar.',
    en: 'The intelligent platform that unifies operations, team and guest experience in one place.',
    es: 'La plataforma inteligente que unifica operaciones, equipo y experiencia del cliente en un solo lugar.',
  },
  'hero.cta1': { pt: 'Solicitar Demo', en: 'Request Demo', es: 'Solicitar Demo' },
  'hero.cta2': { pt: 'Explorar Plataforma', en: 'Explore Platform', es: 'Explorar Plataforma' },

  // Value Props
  'value.ops.title': { pt: 'Operações Unificadas', en: 'Unified Operations', es: 'Operaciones Unificadas' },
  'value.ops.desc': {
    pt: 'Pedidos, cozinha, estoque e equipe conectados em um fluxo contínuo.',
    en: 'Orders, kitchen, inventory and team connected in one seamless flow.',
    es: 'Pedidos, cocina, inventario y equipo conectados en un flujo continuo.',
  },
  'value.kitchen.title': { pt: 'Cozinha Inteligente', en: 'Smart Kitchen', es: 'Cocina Inteligente' },
  'value.kitchen.desc': {
    pt: 'KDS com roteamento por estação, tempos de preparo e controle de qualidade.',
    en: 'KDS with station routing, prep timing and quality control built in.',
    es: 'KDS con enrutamiento por estación, tiempos de prep y control de calidad.',
  },
  'value.guest.title': { pt: 'Experiência do Cliente', en: 'Guest Experience', es: 'Experiencia del Cliente' },
  'value.guest.desc': {
    pt: 'Do pedido ao pagamento, cada mesa perfeitamente servida.',
    en: 'From order to payment, every table perfectly served.',
    es: 'Del pedido al pago, cada mesa perfectamente servida.',
  },
  'value.bi.title': { pt: 'Inteligência de Negócio', en: 'Business Intelligence', es: 'Inteligencia de Negocio' },
  'value.bi.desc': {
    pt: 'Dados reais, relatórios claros, decisões mais rápidas.',
    en: 'Real data, clear reports, faster decisions.',
    es: 'Datos reales, reportes claros, decisiones más rápidas.',
  },

  // Problem
  'problem.overline': { pt: 'POR QUE NOOWE', en: 'WHY NOOWE', es: 'POR QUÉ NOOWE' },
  'problem.title': {
    pt: 'Restaurantes merecem tecnologia que funciona como eles: em ritmo.',
    en: 'Restaurants deserve technology that works like they do: in rhythm.',
    es: 'Los restaurantes merecen tecnología que funcione como ellos: en ritmo.',
  },
  'problem.body': {
    pt: 'A maioria dos sistemas foi feita para vender software. NOOWE foi feito para operar restaurantes. Uma plataforma, uma verdade, um ritmo.',
    en: 'Most systems were built to sell software. NOOWE was built to run restaurants. One platform, one truth, one rhythm.',
    es: 'La mayoría de los sistemas fueron hechos para vender software. NOOWE fue hecho para operar restaurantes.',
  },

  // Services
  'services.overline': { pt: 'ADAPTA-SE A VOCÊ', en: 'ADAPTS TO YOU', es: 'SE ADAPTA A TI' },
  'services.title': {
    pt: 'Do fine dining ao food truck.',
    en: 'From fine dining to food trucks.',
    es: 'Desde fine dining hasta food trucks.',
  },
  'services.sub': {
    pt: 'NOOWE se adapta ao seu tipo de operação com fluxos dedicados para cada modelo de serviço.',
    en: 'NOOWE adapts to your operation type with dedicated workflows for each service model.',
    es: 'NOOWE se adapta a tu tipo de operación con flujos dedicados para cada modelo de servicio.',
  },

  // Roles
  'roles.overline': { pt: 'CADA PERSPECTIVA', en: 'EVERY PERSPECTIVE', es: 'CADA PERSPECTIVA' },
  'roles.title': {
    pt: 'Cada membro da equipe vê exatamente o que precisa.',
    en: 'Each team member sees exactly what they need.',
    es: 'Cada miembro del equipo ve exactamente lo que necesita.',
  },

  // CTA
  'cta.title': {
    pt: 'Pronto para operar diferente?',
    en: 'Ready to operate differently?',
    es: '¿Listo para operar diferente?',
  },
  'cta.sub': {
    pt: 'Solicite acesso e experimente a plataforma completa.',
    en: 'Request access and experience the full platform.',
    es: 'Solicita acceso y experimenta la plataforma completa.',
  },
  'cta.note': {
    pt: 'Acesso antecipado gratuito. Sem cartão de crédito.',
    en: 'Free early access. No credit card required.',
    es: 'Acceso anticipado gratuito. Sin tarjeta de crédito.',
  },

  // Footer
  'footer.platform': { pt: 'Plataforma', en: 'Platform', es: 'Plataforma' },
  'footer.company': { pt: 'Empresa', en: 'Company', es: 'Empresa' },
  'footer.legal': { pt: 'Legal', en: 'Legal', es: 'Legal' },
  'footer.rights': { pt: 'Todos os direitos reservados.', en: 'All rights reserved.', es: 'Todos los derechos reservados.' },
  'footer.overview': { pt: 'Visão Geral', en: 'Overview', es: 'Visión General' },
  'footer.service_types': { pt: 'Tipos de Serviço', en: 'Service Types', es: 'Tipos de Servicio' },
  'footer.roles': { pt: 'Funções', en: 'Roles', es: 'Roles' },
  'footer.about': { pt: 'Sobre', en: 'About', es: 'About' },
  'footer.careers': { pt: 'Carreiras', en: 'Careers', es: 'Carreras' },
  'footer.privacy': { pt: 'Privacidade', en: 'Privacy', es: 'Privacidad' },
  'footer.terms': { pt: 'Termos', en: 'Terms', es: 'Términos' },

  // Request Demo
  'rdemo.overline': { pt: 'SOLICITAR ACESSO', en: 'REQUEST ACCESS', es: 'SOLICITAR ACCESO' },
  'rdemo.title': { pt: 'Entre no NOOWE.', en: 'Get inside NOOWE.', es: 'Entra en NOOWE.' },
  'rdemo.sub': {
    pt: 'Enviaremos um código de acesso exclusivo para você experimentar a plataforma. Leva menos de 10 segundos.',
    en: 'We\'ll send you an exclusive access code to experience the platform. Takes less than 10 seconds.',
    es: 'Te enviaremos un código de acceso exclusivo. Toma menos de 10 segundos.',
  },
  'rdemo.name': { pt: 'Nome', en: 'Name', es: 'Nombre' },
  'rdemo.restaurant': { pt: 'Nome do Restaurante', en: 'Restaurant Name', es: 'Nombre del Restaurante' },
  'rdemo.email': { pt: 'Email', en: 'Email', es: 'Email' },
  'rdemo.phone': { pt: 'Telefone (opcional)', en: 'Phone (optional)', es: 'Teléfono (opcional)' },
  'rdemo.submit': { pt: 'Solicitar Acesso', en: 'Request Access', es: 'Solicitar Acceso' },
  'rdemo.success_title': { pt: 'Verifique seu email.', en: 'Check your email.', es: 'Revisa tu correo.' },
  'rdemo.success_body': {
    pt: 'Seu código de acesso está a caminho. Procure um email da NOOWE.',
    en: 'Your access code is on its way. Look for an email from NOOWE.',
    es: 'Tu código de acceso está en camino. Busca un email de NOOWE.',
  },
  'rdemo.resend': { pt: 'Não recebeu? Reenviar código.', en: 'Didn\'t receive it? Resend code.', es: '¿No lo recibiste? Reenviar código.' },

  // Access
  'access.title': { pt: 'Insira seu código.', en: 'Enter your code.', es: 'Ingresa tu código.' },
  'access.sub': {
    pt: 'Enviamos um código de acesso de 6 dígitos para seu email.',
    en: 'We sent a 6-digit access code to your email.',
    es: 'Enviamos un código de acceso de 6 dígitos a tu correo.',
  },
  'access.request_new': { pt: 'Solicitar novo código', en: 'Request a new code', es: 'Solicitar nuevo código' },

  // Demo hub
  'hub.title': { pt: 'Bem-vindo ao NOOWE.', en: 'Welcome to NOOWE.', es: 'Bienvenido a NOOWE.' },
  'hub.sub': { pt: 'Escolha sua experiência.', en: 'Choose your experience.', es: 'Elige tu experiencia.' },
  'hub.client_title': { pt: 'Experiência Cliente', en: 'Client Experience', es: 'Experiencia Cliente' },
  'hub.client_desc': {
    pt: 'Viva o NOOWE como um cliente. 11 tipos de serviço, jornada completa do pedido ao pagamento.',
    en: 'Experience NOOWE as a guest. 11 service types, full journey from order to payment.',
    es: 'Experimenta NOOWE como cliente. 11 tipos de servicio, jornada completa.',
  },
  'hub.restaurant_title': { pt: 'Gestão do Restaurante', en: 'Restaurant Management', es: 'Gestión del Restaurante' },
  'hub.restaurant_desc': {
    pt: 'Viva o NOOWE como operador. Do dono ao garçom, cada perspectiva com sua interface dedicada.',
    en: 'Experience NOOWE as an operator. From owner to waiter, each role with its dedicated interface.',
    es: 'Experimenta NOOWE como operador. Del dueño al mesero, cada rol con su interfaz dedicada.',
  },
  'hub.launch': { pt: 'Iniciar', en: 'Launch', es: 'Iniciar' },

  // Platform
  'platform.overline': { pt: 'PLATAFORMA NOOWE', en: 'NOOWE PLATFORM', es: 'PLATAFORMA NOOWE' },
  'platform.title': { pt: 'Projetado para cada tipo de restaurante.', en: 'Designed for every kind of restaurant.', es: 'Diseñado para cada tipo de restaurante.' },
  'platform.sub': {
    pt: 'Uma plataforma que se adapta ao seu modelo de negócio — não o contrário.',
    en: 'A platform that adapts to your business model — not the other way around.',
    es: 'Una plataforma que se adapta a tu modelo de negocio — no al revés.',
  },
  'platform.client_title': { pt: 'A EXPERIÊNCIA DO CLIENTE', en: 'THE CLIENT EXPERIENCE', es: 'LA EXPERIENCIA DEL CLIENTE' },
  'platform.ops_title': { pt: 'GESTÃO E OPERAÇÃO', en: 'MANAGEMENT & OPERATIONS', es: 'GESTIÓN Y OPERACIONES' },
  'platform.ops_sub': {
    pt: 'Cada membro da equipe vê exatamente o que precisa — nada mais, nada menos.',
    en: 'Each team member sees exactly what they need — nothing more, nothing less.',
    es: 'Cada miembro del equipo ve exactamente lo que necesita.',
  },
  'platform.cross_title': { pt: 'FUNCIONALIDADES', en: 'CAPABILITIES', es: 'FUNCIONALIDADES' },
  'platform.cta_title': { pt: 'Pronto para ver?', en: 'Ready to see it?', es: '¿Listo para verlo?' },
  'platform.cta_body': {
    pt: 'Não é um slide deck. É a plataforma funcionando. Solicite acesso e experimente.',
    en: 'It\'s not a slide deck. It\'s the platform working. Request access and experience it.',
    es: 'No es un slide deck. Es la plataforma funcionando. Solicita acceso.',
  },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}

export function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('noowe-lang') as Lang;
  if (stored && ['pt', 'en', 'es'].includes(stored)) return stored;
  const browser = navigator.language.slice(0, 2);
  if (browser === 'pt') return 'pt';
  if (browser === 'es') return 'es';
  return 'en';
}

export function setLang(lang: Lang) {
  localStorage.setItem('noowe-lang', lang);
}

export interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export function useLang() {
  return useContext(LangContext);
}
