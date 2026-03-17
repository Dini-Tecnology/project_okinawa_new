import { createContext, useContext } from 'react';

export type Lang = 'pt' | 'en' | 'es';

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  'nav.platform': { pt: 'Plataforma', en: 'Platform', es: 'Plataforma' },
  'nav.demo': { pt: 'Demo', en: 'Demo', es: 'Demo' },
  'nav.request_demo': { pt: 'Solicitar Demo', en: 'Request Demo', es: 'Solicitar Demo' },

  // Hero
  'hero.overline': { pt: 'O SISTEMA QUE SEU RESTAURANTE PRECISA', en: 'THE SYSTEM YOUR RESTAURANT NEEDS', es: 'EL SISTEMA QUE TU RESTAURANTE NECESITA' },
  'hero.h1_1': { pt: 'Chega de gambiarras.', en: 'No more workarounds.', es: 'Basta de improvisar.' },
  'hero.h1_2': { pt: 'Seu restaurante merece mais.', en: 'Your restaurant deserves more.', es: 'Tu restaurante merece más.' },
  'hero.sub': {
    pt: 'Você não precisa de mais um app. Precisa de uma plataforma que conecta pedidos, cozinha, equipe e clientes — tudo no mesmo ritmo da sua operação.',
    en: 'You don\'t need another app. You need a platform that connects orders, kitchen, staff and guests — all moving at the pace of your operation.',
    es: 'No necesitas otra app. Necesitas una plataforma que conecte pedidos, cocina, equipo y clientes — todo al ritmo de tu operación.',
  },
  'hero.cta1': { pt: 'Quero ver funcionando', en: 'I want to see it working', es: 'Quiero verlo funcionando' },
  'hero.cta2': { pt: 'Como funciona', en: 'How it works', es: 'Cómo funciona' },

  // Value Props
  'value.ops.title': { pt: 'Operação sem retrabalho', en: 'Operations without rework', es: 'Operación sin retrabajo' },
  'value.ops.desc': {
    pt: 'Pedido saiu errado? Comanda perdida? Conta que não fecha? Isso não existe mais. Tudo flui do salão pra cozinha e volta sem ruído.',
    en: 'Wrong order? Lost ticket? Bill that doesn\'t add up? That\'s over. Everything flows from floor to kitchen and back without friction.',
    es: '¿Pedido equivocado? ¿Comanda perdida? ¿Cuenta que no cuadra? Eso ya no existe. Todo fluye del salón a la cocina y vuelve sin fricción.',
  },
  'value.kitchen.title': { pt: 'Cozinha no controle', en: 'Kitchen in control', es: 'Cocina bajo control' },
  'value.kitchen.desc': {
    pt: 'Seu cozinheiro sabe exatamente o que preparar, em que ordem, pra qual mesa. Sem gritos, sem confusão, sem atraso.',
    en: 'Your cook knows exactly what to prepare, in what order, for which table. No shouting, no confusion, no delays.',
    es: 'Tu cocinero sabe exactamente qué preparar, en qué orden, para cuál mesa. Sin gritos, sin confusión, sin atrasos.',
  },
  'value.guest.title': { pt: 'Cliente que volta', en: 'Guests that return', es: 'Clientes que vuelven' },
  'value.guest.desc': {
    pt: 'Quando a experiência é fluida, o cliente percebe. Pedir é fácil. Pagar é rápido. E a vontade de voltar é natural.',
    en: 'When the experience is seamless, guests notice. Ordering is easy. Paying is fast. And wanting to come back is natural.',
    es: 'Cuando la experiencia es fluida, el cliente lo nota. Pedir es fácil. Pagar es rápido. Y las ganas de volver son naturales.',
  },
  'value.bi.title': { pt: 'Decisões com dados reais', en: 'Decisions with real data', es: 'Decisiones con datos reales' },
  'value.bi.desc': {
    pt: 'Chega de achismo. Saiba o que vende, o que dá margem, onde está o gargalo — e aja antes que vire problema.',
    en: 'No more guessing. Know what sells, what gives margin, where the bottleneck is — and act before it becomes a problem.',
    es: 'Basta de adivinar. Sabe qué vende, qué da margen, dónde está el cuello de botella — y actúa antes de que sea un problema.',
  },

  // Problem
  'problem.overline': { pt: 'O PROBLEMA QUE VOCÊ CONHECE BEM', en: 'THE PROBLEM YOU KNOW TOO WELL', es: 'EL PROBLEMA QUE CONOCES BIEN' },
  'problem.title': {
    pt: 'Seu restaurante usa 5 sistemas que não se falam. E você paga a conta.',
    en: 'Your restaurant runs on 5 systems that don\'t talk to each other. And you pay the price.',
    es: 'Tu restaurante usa 5 sistemas que no se hablan. Y tú pagas el precio.',
  },
  'problem.body': {
    pt: 'Um app pro pedido, outro pra cozinha, planilha pro estoque, WhatsApp pra escala, caderno pro caixa. Cada um faz o seu — mas ninguém faz o todo. NOOWE nasceu pra resolver isso: uma plataforma, uma verdade, um ritmo.',
    en: 'One app for orders, another for kitchen, spreadsheet for inventory, WhatsApp for scheduling, notebook for the register. Each does its part — but nobody does the whole. NOOWE was born to fix this: one platform, one truth, one rhythm.',
    es: 'Una app para pedidos, otra para cocina, planilla para inventario, WhatsApp para turnos, cuaderno para la caja. Cada uno hace lo suyo — pero nadie hace el todo. NOOWE nació para resolver esto: una plataforma, una verdad, un ritmo.',
  },

  // Services
  'services.overline': { pt: 'FEITO PRO SEU MODELO', en: 'BUILT FOR YOUR MODEL', es: 'HECHO PARA TU MODELO' },
  'services.title': {
    pt: 'Não importa se é bistrô ou food truck.',
    en: 'Whether it\'s a bistro or a food truck.',
    es: 'No importa si es bistró o food truck.',
  },
  'services.sub': {
    pt: 'Cada tipo de restaurante tem seu ritmo, seu fluxo, suas regras. NOOWE entende isso e se molda à sua operação — não o contrário.',
    en: 'Every type of restaurant has its rhythm, its flow, its rules. NOOWE understands that and molds to your operation — not the other way around.',
    es: 'Cada tipo de restaurante tiene su ritmo, su flujo, sus reglas. NOOWE lo entiende y se moldea a tu operación — no al revés.',
  },

  // Roles
  'roles.overline': { pt: 'CADA UM NO SEU PAPEL', en: 'EVERYONE IN THEIR ROLE', es: 'CADA UNO EN SU ROL' },
  'roles.title': {
    pt: 'Do dono ao garçom, cada um vê o que precisa.',
    en: 'From owner to waiter, everyone sees what they need.',
    es: 'Del dueño al mesero, cada uno ve lo que necesita.',
  },

  // CTA
  'cta.title': {
    pt: 'Cansado de juntar peças que não encaixam?',
    en: 'Tired of piecing together tools that don\'t fit?',
    es: '¿Cansado de juntar piezas que no encajan?',
  },
  'cta.sub': {
    pt: 'Veja o NOOWE funcionando com o seu tipo de restaurante. É rápido, sem compromisso e sem cartão.',
    en: 'See NOOWE working with your type of restaurant. Quick, no commitment, no card.',
    es: 'Mira NOOWE funcionando con tu tipo de restaurante. Rápido, sin compromiso y sin tarjeta.',
  },
  'cta.note': {
    pt: 'Acesso gratuito. Sem cartão de crédito. Sem vendedor.',
    en: 'Free access. No credit card. No salesperson.',
    es: 'Acceso gratuito. Sin tarjeta. Sin vendedor.',
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
  'rdemo.overline': { pt: 'VEJA COM SEUS OLHOS', en: 'SEE IT FOR YOURSELF', es: 'MÍRALO CON TUS OJOS' },
  'rdemo.title': { pt: 'Experimente o NOOWE.', en: 'Try NOOWE yourself.', es: 'Prueba NOOWE.' },
  'rdemo.sub': {
    pt: 'Preencha seus dados e receba um código de acesso exclusivo no seu email. Em segundos você estará dentro da plataforma.',
    en: 'Fill in your details and receive an exclusive access code in your email. In seconds you\'ll be inside the platform.',
    es: 'Completa tus datos y recibe un código de acceso exclusivo en tu correo. En segundos estarás dentro de la plataforma.',
  },
  'rdemo.name': { pt: 'Seu nome', en: 'Your name', es: 'Tu nombre' },
  'rdemo.restaurant': { pt: 'Nome do seu restaurante', en: 'Your restaurant name', es: 'Nombre de tu restaurante' },
  'rdemo.email': { pt: 'Seu melhor email', en: 'Your best email', es: 'Tu mejor email' },
  'rdemo.phone': { pt: 'WhatsApp (opcional)', en: 'WhatsApp (optional)', es: 'WhatsApp (opcional)' },
  'rdemo.submit': { pt: 'Quero experimentar', en: 'I want to try it', es: 'Quiero probarlo' },
  'rdemo.success_title': { pt: 'Quase lá!', en: 'Almost there!', es: '¡Ya casi!' },
  'rdemo.success_body': {
    pt: 'Enviamos seu código de acesso por email. Verifique sua caixa de entrada (e o spam, por precaução).',
    en: 'We sent your access code by email. Check your inbox (and spam, just in case).',
    es: 'Enviamos tu código de acceso por email. Revisa tu bandeja de entrada (y spam, por precaución).',
  },
  'rdemo.resend': { pt: 'Não chegou? Reenviar código.', en: 'Didn\'t arrive? Resend code.', es: '¿No llegó? Reenviar código.' },

  // Access
  'access.title': { pt: 'Digite seu código.', en: 'Enter your code.', es: 'Ingresa tu código.' },
  'access.sub': {
    pt: 'Cole ou digite o código de 6 dígitos que enviamos para seu email.',
    en: 'Paste or type the 6-digit code we sent to your email.',
    es: 'Pega o escribe el código de 6 dígitos que enviamos a tu correo.',
  },
  'access.request_new': { pt: 'Não tenho um código', en: 'I don\'t have a code', es: 'No tengo un código' },
  'access.sim_note': {
    pt: 'Este acesso é uma simulação real da plataforma. Explore como se fosse o seu restaurante.',
    en: 'This is a real simulation of the platform. Explore it as if it were your restaurant.',
    es: 'Este acceso es una simulación real de la plataforma. Explóralo como si fuera tu restaurante.',
  },

  // Intent capture
  'intent.title': { pt: 'Como funciona seu restaurante?', en: 'How does your restaurant work?', es: '¿Cómo funciona tu restaurante?' },
  'intent.sub': {
    pt: 'Isso nos ajuda a personalizar sua experiência.',
    en: 'This helps us personalize your experience.',
    es: 'Esto nos ayuda a personalizar tu experiencia.',
  },
  'intent.table': { pt: 'Serviço à mesa', en: 'Table service', es: 'Servicio a la mesa' },
  'intent.table_desc': { pt: 'Restaurantes, bistrôs, bares', en: 'Restaurants, bistros, bars', es: 'Restaurantes, bistrós, bares' },
  'intent.quick': { pt: 'Atendimento rápido', en: 'Quick service', es: 'Servicio rápido' },
  'intent.quick_desc': { pt: 'Fast food, fast casual, food courts', en: 'Fast food, fast casual, food courts', es: 'Fast food, fast casual, food courts' },
  'intent.delivery': { pt: 'Delivery / retirada', en: 'Delivery / takeout', es: 'Delivery / retiro' },
  'intent.delivery_desc': { pt: 'Dark kitchens, delivery-first', en: 'Dark kitchens, delivery-first', es: 'Dark kitchens, delivery-first' },
  'intent.bar': { pt: 'Bar / noturno', en: 'Bar / nightlife', es: 'Bar / nocturno' },
  'intent.bar_desc': { pt: 'Pubs, clubs, lounges', en: 'Pubs, clubs, lounges', es: 'Pubs, clubs, lounges' },
  'intent.continue': { pt: 'Continuar', en: 'Continue', es: 'Continuar' },

  // Demo hub
  'hub.title': { pt: 'Você está dentro.', en: 'You\'re in.', es: 'Ya estás dentro.' },
  'hub.sub': { pt: 'Escolha como quer explorar o NOOWE.', en: 'Choose how you want to explore NOOWE.', es: 'Elige cómo quieres explorar NOOWE.' },
  'hub.guided_title': { pt: 'Ver simulação guiada', en: 'See guided simulation', es: 'Ver simulación guiada' },
  'hub.guided_tag': { pt: 'recomendado', en: 'recommended', es: 'recomendado' },
  'hub.guided_desc': {
    pt: 'Veja uma operação real acontecendo em poucos passos.',
    en: 'See a real operation happening in just a few steps.',
    es: 'Mira una operación real sucediendo en pocos pasos.',
  },
  'hub.guided_time': { pt: 'Leva menos de 2 minutos', en: 'Takes less than 2 minutes', es: 'Toma menos de 2 minutos' },
  'hub.free_title': { pt: 'Explorar livremente', en: 'Explore freely', es: 'Explorar libremente' },
  'hub.free_desc': {
    pt: 'Acesse todas as telas e navegue no seu ritmo.',
    en: 'Access all screens and browse at your own pace.',
    es: 'Accede a todas las pantallas y navega a tu ritmo.',
  },
  'hub.client_title': { pt: 'Visão do Cliente', en: 'Guest View', es: 'Visión del Cliente' },
  'hub.client_desc': {
    pt: 'Veja como seus clientes vão viver a experiência: pedir, acompanhar, pagar — tudo pelo celular, sem atrito.',
    en: 'See how your guests will experience it: order, track, pay — all from their phone, frictionless.',
    es: 'Mira cómo tus clientes vivirán la experiencia: pedir, seguir, pagar — todo desde su celular, sin fricción.',
  },
  'hub.restaurant_title': { pt: 'Visão do Restaurante', en: 'Restaurant View', es: 'Visión del Restaurante' },
  'hub.restaurant_desc': {
    pt: 'Veja como sua equipe vai operar: do caixa à cozinha, do garçom ao gestor. Cada função com a tela certa.',
    en: 'See how your team will operate: from cashier to kitchen, waiter to manager. Each role with the right screen.',
    es: 'Mira cómo tu equipo va a operar: de la caja a la cocina, del mesero al gerente. Cada rol con la pantalla correcta.',
  },
  'hub.launch': { pt: 'Explorar', en: 'Explore', es: 'Explorar' },
  'hub.or': { pt: 'ou', en: 'or', es: 'o' },

  // Guided simulation
  'guided.exit': { pt: 'Sair da simulação', en: 'Exit simulation', es: 'Salir de la simulación' },
  'guided.back': { pt: 'Voltar', en: 'Back', es: 'Volver' },
  'guided.next': { pt: 'Avançar', en: 'Next', es: 'Avanzar' },
  'guided.finish': { pt: 'Ver resultado', en: 'See result', es: 'Ver resultado' },
  'guided.experience': { pt: 'Experiência', en: 'Experience', es: 'Experiencia' },
  'guided.step1_title': { pt: 'O cliente abre o cardápio', en: 'The guest opens the menu', es: 'El cliente abre el menú' },
  'guided.step1_tooltip': {
    pt: 'Imagine um cliente sentando na mesa e escaneando o QR code. O cardápio digital aparece instantaneamente.',
    en: 'Imagine a guest sitting down and scanning the QR code. The digital menu appears instantly.',
    es: 'Imagina un cliente sentándose y escaneando el código QR. El menú digital aparece al instante.',
  },
  'guided.step2_title': { pt: 'Pedido enviado', en: 'Order sent', es: 'Pedido enviado' },
  'guided.step2_tooltip': {
    pt: 'O pedido foi enviado automaticamente para a cozinha. Sem garçom anotando, sem erro de comunicação.',
    en: 'The order was sent automatically to the kitchen. No waiter writing it down, no miscommunication.',
    es: 'El pedido se envió automáticamente a la cocina. Sin mesero anotando, sin error de comunicación.',
  },
  'guided.step3_title': { pt: 'Cozinha recebe em tempo real', en: 'Kitchen receives in real time', es: 'Cocina recibe en tiempo real' },
  'guided.step3_tooltip': {
    pt: 'O pedido chegou aqui automaticamente, já organizado por prioridade. O cozinheiro sabe exatamente o que fazer.',
    en: 'The order arrived here automatically, already organized by priority. The cook knows exactly what to do.',
    es: 'El pedido llegó aquí automáticamente, ya organizado por prioridad. El cocinero sabe exactamente qué hacer.',
  },
  'guided.step4_title': { pt: 'Acompanhamento em tempo real', en: 'Real-time tracking', es: 'Seguimiento en tiempo real' },
  'guided.step4_tooltip': {
    pt: 'O cliente acompanha cada etapa do pedido no celular. Sem precisar chamar o garçom pra perguntar.',
    en: 'The guest tracks every step of the order on their phone. No need to call the waiter to ask.',
    es: 'El cliente sigue cada etapa del pedido en su celular. Sin necesidad de llamar al mesero.',
  },
  'guided.step5_title': { pt: 'Pagamento sem fricção', en: 'Frictionless payment', es: 'Pago sin fricción' },
  'guided.step5_tooltip': {
    pt: 'O cliente paga direto pelo celular. Divide a conta, deixa gorjeta — tudo sem esperar.',
    en: 'The guest pays directly from their phone. Splits the bill, leaves a tip — all without waiting.',
    es: 'El cliente paga directo desde su celular. Divide la cuenta, deja propina — todo sin esperar.',
  },
  'guided.step6_title': { pt: 'Operação completa', en: 'Operation complete', es: 'Operación completa' },
  'guided.step6_tooltip': {
    pt: 'Pedido concluído. Tudo sincronizado. Do cliente à cozinha, do pagamento ao relatório.',
    en: 'Order completed. Everything synced. From guest to kitchen, from payment to report.',
    es: 'Pedido completado. Todo sincronizado. Del cliente a la cocina, del pago al informe.',
  },

  // Impact screen
  'impact.title': { pt: 'Isso foi uma simulação.', en: 'That was a simulation.', es: 'Eso fue una simulación.' },
  'impact.subtitle': {
    pt: 'No seu restaurante, isso acontece o tempo todo.',
    en: 'In your restaurant, this happens all the time.',
    es: 'En tu restaurante, esto pasa todo el tiempo.',
  },
  'impact.bullet1': { pt: 'Sem retrabalho', en: 'No rework', es: 'Sin retrabajo' },
  'impact.bullet2': { pt: 'Sem erro de comunicação', en: 'No miscommunication', es: 'Sin errores de comunicación' },
  'impact.bullet3': { pt: 'Sem atrasos', en: 'No delays', es: 'Sin atrasos' },
  'impact.cta': { pt: 'Quero isso no meu restaurante', en: 'I want this for my restaurant', es: 'Quiero esto en mi restaurante' },
  'impact.explore': { pt: 'Explorar a plataforma completa', en: 'Explore the full platform', es: 'Explorar la plataforma completa' },
  'impact.tagline': {
    pt: 'Isso não é uma demo. É o seu restaurante funcionando.',
    en: 'This is not a demo. This is your restaurant running.',
    es: 'Esto no es una demo. Es tu restaurante funcionando.',
  },

  // Free mode banner
  'free.banner': {
    pt: 'Quer ver um fluxo guiado?',
    en: 'Want to see a guided flow?',
    es: '¿Quieres ver un flujo guiado?',
  },
  'free.banner_cta': { pt: 'Iniciar simulação', en: 'Start simulation', es: 'Iniciar simulación' },

  // Platform
  'platform.overline': { pt: 'COMO FUNCIONA', en: 'HOW IT WORKS', es: 'CÓMO FUNCIONA' },
  'platform.title': { pt: 'Uma plataforma. Todo tipo de restaurante.', en: 'One platform. Every type of restaurant.', es: 'Una plataforma. Todo tipo de restaurante.' },
  'platform.sub': {
    pt: 'Não importa se você tem um bistrô, um fast casual ou uma rede. O NOOWE se adapta ao seu jeito de operar.',
    en: 'Whether you run a bistro, fast casual or a chain. NOOWE adapts to how you operate.',
    es: 'No importa si tienes un bistró, un fast casual o una cadena. NOOWE se adapta a cómo operas.',
  },
  'platform.client_title': { pt: 'O QUE SEU CLIENTE VAI SENTIR', en: 'WHAT YOUR GUEST WILL FEEL', es: 'LO QUE TU CLIENTE VA A SENTIR' },
  'platform.ops_title': { pt: 'O QUE SUA EQUIPE VAI GANHAR', en: 'WHAT YOUR TEAM WILL GAIN', es: 'LO QUE TU EQUIPO VA A GANAR' },
  'platform.ops_sub': {
    pt: 'Cada pessoa da sua equipe entra e vê só o que importa pra ela. Sem confusão, sem treinamento de semanas.',
    en: 'Each person on your team logs in and sees only what matters to them. No confusion, no weeks of training.',
    es: 'Cada persona de tu equipo entra y ve solo lo que le importa. Sin confusión, sin semanas de entrenamiento.',
  },
  'platform.cross_title': { pt: 'O QUE MUDA NA PRÁTICA', en: 'WHAT CHANGES IN PRACTICE', es: 'LO QUE CAMBIA EN LA PRÁCTICA' },
  'platform.cta_title': { pt: 'Melhor do que ler, é ver.', en: 'Better than reading, is seeing.', es: 'Mejor que leer, es ver.' },
  'platform.cta_body': {
    pt: 'Isso aqui não é um PDF bonito. É a plataforma rodando de verdade. Peça seu acesso e veja com seus próprios olhos.',
    en: 'This isn\'t a fancy PDF. It\'s the platform running for real. Request access and see it with your own eyes.',
    es: 'Esto no es un PDF bonito. Es la plataforma corriendo de verdad. Pide tu acceso y míralo con tus propios ojos.',
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
