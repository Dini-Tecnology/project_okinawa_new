import { createContext, useContext } from 'react';

export type Lang = 'pt' | 'en' | 'es';

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  'nav.platform': { pt: 'Para seu Negócio', en: 'For Business', es: 'Para tu Negocio' },
  'nav.demo': { pt: 'Demo', en: 'Demo', es: 'Demo' },
  'nav.request_demo': { pt: 'Solicitar Demo', en: 'Request Demo', es: 'Solicitar Demo' },

  // Hero
  'hero.overline': { pt: 'A SOLUÇÃO COMPLETA PARA SEU NEGÓCIO', en: 'THE COMPLETE SOLUTION FOR YOUR BUSINESS', es: 'LA SOLUCIÓN COMPLETA PARA TU NEGOCIO' },
  'hero.h1_1': { pt: 'Você criou o negócio.', en: 'You built the business.', es: 'Tú creaste el negocio.' },
  'hero.h1_2': { pt: 'Nós criamos a solução completa que ele precisa.', en: 'We built the complete solution it needs.', es: 'Nosotros creamos la solución completa que necesita.' },
  'hero.sub': {
    pt: 'Você não precisa de mais um sistema. Precisa de uma plataforma que conecta toda a jornada da experiência — tudo no mesmo ritmo da sua operação.',
    en: 'You don\'t need another system. You need a platform that connects the entire experience journey — all moving at the pace of your operation.',
    es: 'No necesitas otro sistema. Necesitas una plataforma que conecte todo el recorrido de la experiencia — todo al ritmo de tu operación.',
  },
  'hero.cta1': { pt: 'Quero ver funcionando', en: 'I want to see it working', es: 'Quiero verlo funcionando' },
  'hero.cta2': { pt: 'Como funciona', en: 'How it works', es: 'Cómo funciona' },

  // Home (neutral)
  'home.hero_overline': { pt: 'O FUTURO DA HOSPITALIDADE', en: 'THE FUTURE OF HOSPITALITY', es: 'EL FUTURO DE LA HOSPITALIDAD' },
  'home.hero_h1_1': { pt: 'Uma plataforma.', en: 'One platform.', es: 'Una plataforma.' },
  'home.hero_h1_2': { pt: 'Toda a experiência conectada.', en: 'Every experience connected.', es: 'Toda la experiencia conectada.' },
  'home.hero_sub': {
    pt: 'A NOOWE conecta restaurantes e clientes em uma única plataforma inteligente. Do pedido ao pagamento, da cozinha à mesa — tudo em um fluxo contínuo.',
    en: 'NOOWE connects restaurants and guests in a single intelligent platform. From order to payment, kitchen to table — everything in one continuous flow.',
    es: 'NOOWE conecta restaurantes y clientes en una única plataforma inteligente. Del pedido al pago, de la cocina a la mesa — todo en un flujo continuo.',
  },
  'home.pillars_overline': { pt: 'POR QUE NOOWE', en: 'WHY NOOWE', es: 'POR QUÉ NOOWE' },
  'home.pillars_title': { pt: 'Construído sobre 4 pilares.', en: 'Built on 4 pillars.', es: 'Construido sobre 4 pilares.' },
  'home.pillar_integration_title': { pt: 'Integração total', en: 'Total integration', es: 'Integración total' },
  'home.pillar_integration_desc': { pt: 'Um único sistema que substitui múltiplas ferramentas desconectadas. Pedidos, cozinha, pagamentos e equipe — tudo no mesmo lugar.', en: 'A single system replacing multiple disconnected tools. Orders, kitchen, payments and staff — all in one place.', es: 'Un único sistema que reemplaza múltiples herramientas desconectadas. Pedidos, cocina, pagos y equipo — todo en un solo lugar.' },
  'home.pillar_realtime_title': { pt: 'Tempo real', en: 'Real-time', es: 'Tiempo real' },
  'home.pillar_realtime_desc': { pt: 'Cada ação reflete instantaneamente em toda a operação. Sem delay, sem surpresas.', en: 'Every action reflects instantly across the entire operation. No delay, no surprises.', es: 'Cada acción se refleja instantáneamente en toda la operación. Sin delay, sin sorpresas.' },
  'home.pillar_multilingual_title': { pt: 'Multilíngue nativo', en: 'Natively multilingual', es: 'Multilingüe nativo' },
  'home.pillar_multilingual_desc': { pt: 'Português, Inglês e Espanhol com detecção automática. Para restaurantes e clientes do mundo inteiro.', en: 'Portuguese, English and Spanish with auto detection. For restaurants and guests worldwide.', es: 'Portugués, Inglés y Español con detección automática. Para restaurantes y clientes de todo el mundo.' },
  'home.pillar_security_title': { pt: 'Segurança de ponta', en: 'Enterprise security', es: 'Seguridad empresarial' },
  'home.pillar_security_desc': { pt: 'Criptografia end-to-end, QR codes anti-fraude e controle de acesso por função.', en: 'End-to-end encryption, anti-fraud QR codes and role-based access control.', es: 'Cifrado end-to-end, QR anti-fraude y control de acceso por rol.' },
  'home.audience_sub': { pt: 'Cada lado da experiência tem seu próprio caminho.', en: 'Each side of the experience has its own path.', es: 'Cada lado de la experiencia tiene su propio camino.' },
  'home.quote': {
    pt: '"Conectar quem serve com quem vive a experiência. Esse é o nosso propósito."',
    en: '"Connecting those who serve with those who live the experience. That\'s our purpose."',
    es: '"Conectar a quienes sirven con quienes viven la experiencia. Ese es nuestro propósito."',
  },

  // Value Props
  'value.ops.title': { pt: 'Operação sem retrabalho', en: 'Operations without rework', es: 'Operación sin retrabajo' },
  'value.ops.desc': {
    pt: 'Nada se perde. Nada se repete. Do pedido ao fechamento da conta, tudo acontece no fluxo certo — automaticamente.',
    en: 'Nothing is lost. Nothing repeats. From order to bill closure, everything flows in the right sequence — automatically.',
    es: 'Nada se pierde. Nada se repite. Del pedido al cierre de cuenta, todo ocurre en el flujo correcto — automáticamente.',
  },
  'value.kitchen.title': { pt: 'Cozinha no controle', en: 'Kitchen in control', es: 'Cocina bajo control' },
  'value.kitchen.desc': {
    pt: 'Cada pedido chega no tempo certo, na ordem certa, para a pessoa certa. Sem ruído. Sem pressão desnecessária. Só execução.',
    en: 'Each order arrives at the right time, in the right sequence, to the right person. No noise. No unnecessary pressure. Just execution.',
    es: 'Cada pedido llega en el momento justo, en el orden correcto, a la persona indicada. Sin ruido. Sin presión innecesaria. Solo ejecución.',
  },
  'value.guest.title': { pt: 'Experiência que fideliza', en: 'Experience that builds loyalty', es: 'Experiencia que fideliza' },
  'value.guest.desc': {
    pt: 'Quando tudo flui, o cliente percebe. Pedir é natural. Pagar é rápido. Voltar vira consequência.',
    en: 'When everything flows, guests notice. Ordering feels natural. Paying is fast. Coming back becomes the consequence.',
    es: 'Cuando todo fluye, el cliente lo nota. Pedir es natural. Pagar es rápido. Volver se vuelve consecuencia.',
  },
  'value.bi.title': { pt: 'Decisões com clareza', en: 'Decisions with clarity', es: 'Decisiones con claridad' },
  'value.bi.desc': {
    pt: 'Você não precisa adivinhar. Saiba o que vende, o que gera margem e onde ajustar — antes de virar problema.',
    en: 'You don\'t need to guess. Know what sells, what drives margin and where to adjust — before it becomes a problem.',
    es: 'No necesitas adivinar. Sabe qué vende, qué genera margen y dónde ajustar — antes de que sea un problema.',
  },

  // Problem
  'problem.overline': { pt: 'O PROBLEMA NÃO É NOVO', en: 'THE PROBLEM ISN\'T NEW', es: 'EL PROBLEMA NO ES NUEVO' },
  'problem.title': {
    pt: 'Seu restaurante opera com várias ferramentas. Mas nenhuma opera junto.',
    en: 'Your restaurant runs on multiple tools. But none of them run together.',
    es: 'Tu restaurante opera con varias herramientas. Pero ninguna opera en conjunto.',
  },
  'problem.body': {
    pt: 'Um sistema para pedidos. Outro para a cozinha. Planilhas para controle. Mensagens para organizar equipe. Tudo funciona — isoladamente.\n\nMas o seu restaurante não funciona em partes.\n\nO NOOWE conecta tudo em um único sistema, com uma única lógica, em um único fluxo.',
    en: 'One system for orders. Another for the kitchen. Spreadsheets for control. Messages to organize the team. Everything works — in isolation.\n\nBut your restaurant doesn\'t work in parts.\n\nNOOWE connects everything into one system, with one logic, in one flow.',
    es: 'Un sistema para pedidos. Otro para cocina. Planillas para control. Mensajes para organizar el equipo. Todo funciona — de forma aislada.\n\nPero tu restaurante no funciona por partes.\n\nNOOWE conecta todo en un único sistema, con una única lógica, en un único flujo.',
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
    pt: 'Acesso gratuito, instantâneo e rápido — como seu negócio.',
    en: 'Free, instant and fast access — just like your business.',
    es: 'Acceso gratuito, instantáneo y rápido — como tu negocio.',
  },

  // Footer
  'footer.platform': { pt: 'Para seu Negócio', en: 'For Business', es: 'Para tu Negocio' },
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
  'platform.overline': { pt: 'PARA SEU NEGÓCIO', en: 'FOR YOUR BUSINESS', es: 'PARA TU NEGOCIO' },
  'platform.title': { pt: 'Um sistema.\nTodos os fluxos do seu restaurante.', en: 'One system.\nEvery flow in your restaurant.', es: 'Un sistema.\nTodos los flujos de tu restaurante.' },
  'platform.sub': {
    pt: 'Do primeiro pedido ao fechamento do dia, tudo acontece dentro de uma única lógica — contínua, integrada e em tempo real.',
    en: 'From the first order to closing time, everything runs within a single logic — continuous, integrated and in real time.',
    es: 'Desde el primer pedido hasta el cierre del día, todo ocurre dentro de una única lógica — continua, integrada y en tiempo real.',
  },
  'platform.client_overline': { pt: 'EXPERIÊNCIA', en: 'EXPERIENCE', es: 'EXPERIENCIA' },
  'platform.client_title': { pt: 'O que o seu cliente percebe', en: 'What your guest perceives', es: 'Lo que tu cliente percibe' },
  'platform.client_body': {
    pt: 'Ele não vê sistema.\nEle sente fluidez.\n\nPede sem esforço.\nAcompanha sem ansiedade.\nPaga sem fricção.\n\nE sai com a sensação de que tudo simplesmente funcionou.',
    en: 'They don\'t see a system.\nThey feel fluidity.\n\nOrdering is effortless.\nTracking is anxiety-free.\nPaying is frictionless.\n\nThey leave feeling like everything simply worked.',
    es: 'No ve un sistema.\nSiente fluidez.\n\nPide sin esfuerzo.\nSigue sin ansiedad.\nPaga sin fricción.\n\nY se va con la sensación de que todo simplemente funcionó.',
  },
  'platform.models_overline': { pt: 'ADAPTÁVEL POR DESIGN', en: 'ADAPTABLE BY DESIGN', es: 'ADAPTABLE POR DISEÑO' },
  'platform.models_title': { pt: 'Seu modelo de operação não precisa se adaptar ao sistema.', en: 'Your operation model doesn\'t need to adapt to the system.', es: 'Tu modelo de operación no necesita adaptarse al sistema.' },
  'platform.models_sub': { pt: 'O sistema se adapta ao seu modelo.', en: 'The system adapts to your model.', es: 'El sistema se adapta a tu modelo.' },
  'platform.group_full_title': { pt: 'Experiências completas', en: 'Full experiences', es: 'Experiencias completas' },
  'platform.group_full_desc': {
    pt: 'Operações mais complexas, com múltiplos tempos e alto nível de serviço — organizadas com precisão.',
    en: 'Complex operations with multiple courses and high service levels — organized with precision.',
    es: 'Operaciones complejas, con múltiples tiempos y alto nivel de servicio — organizadas con precisión.',
  },
  'platform.group_volume_title': { pt: 'Alto volume', en: 'High volume', es: 'Alto volumen' },
  'platform.group_volume_desc': {
    pt: 'Velocidade, escala e consistência — sem perder controle.',
    en: 'Speed, scale and consistency — without losing control.',
    es: 'Velocidad, escala y consistencia — sin perder control.',
  },
  'platform.group_continuous_title': { pt: 'Consumo contínuo', en: 'Continuous consumption', es: 'Consumo continuo' },
  'platform.group_continuous_desc': {
    pt: 'Fluxos dinâmicos, comandas abertas e consumo recorrente — tudo sincronizado.',
    en: 'Dynamic flows, open tabs and recurring consumption — all synchronized.',
    es: 'Flujos dinámicos, comandas abiertas y consumo recurrente — todo sincronizado.',
  },
  'platform.group_mobile_title': { pt: 'Mobilidade e flexibilidade', en: 'Mobility and flexibility', es: 'Movilidad y flexibilidad' },
  'platform.group_mobile_desc': {
    pt: 'Operações flexíveis, com controle mesmo fora do padrão tradicional.',
    en: 'Flexible operations, with control even outside the traditional standard.',
    es: 'Operaciones flexibles, con control incluso fuera del estándar tradicional.',
  },
  'platform.ops_overline': { pt: 'OPERAÇÃO', en: 'OPERATIONS', es: 'OPERACIÓN' },
  'platform.ops_title': { pt: 'Clareza para quem executa.\nControle para quem decide.', en: 'Clarity for those who execute.\nControl for those who decide.', es: 'Claridad para quien ejecuta.\nControl para quien decide.' },
  'platform.ops_sub': {
    pt: 'Cada pessoa entra e entende exatamente o que fazer.\nSem ruído. Sem retrabalho. Sem dependência.',
    en: 'Each person logs in and knows exactly what to do.\nNo noise. No rework. No dependency.',
    es: 'Cada persona entra y entiende exactamente qué hacer.\nSin ruido. Sin retrabajo. Sin dependencia.',
  },
  'platform.cross_overline': { pt: 'NA PRÁTICA', en: 'IN PRACTICE', es: 'EN LA PRÁCTICA' },
  'platform.cross_title': { pt: 'O que muda no dia a dia', en: 'What changes day to day', es: 'Lo que cambia en el día a día' },
  'platform.system_title_1': { pt: 'Não são as funcionalidades.', en: 'It\'s not about the features.', es: 'No son las funcionalidades.' },
  'platform.system_title_2': { pt: 'É como tudo funciona junto.', en: 'It\'s how everything works together.', es: 'Es cómo todo funciona junto.' },
  'platform.system_body': {
    pt: 'Um pedido não termina no caixa.\n\nEle começa no cliente, passa pela cozinha, impacta o estoque, atualiza seus números — e melhora sua próxima decisão.\n\nTudo conectado. Sem esforço.',
    en: 'An order doesn\'t end at the register.\n\nIt starts with the guest, flows through the kitchen, impacts inventory, updates your numbers — and improves your next decision.\n\nAll connected. Effortlessly.',
    es: 'Un pedido no termina en la caja.\n\nComienza en el cliente, pasa por la cocina, impacta el inventario, actualiza tus números — y mejora tu próxima decisión.\n\nTodo conectado. Sin esfuerzo.',
  },
  'platform.cta_title': { pt: 'Melhor do que entender, é ver.', en: 'Better than understanding is seeing.', es: 'Mejor que entender, es ver.' },
  'platform.cta_body': {
    pt: 'Acesse o NOOWE e veja a operação acontecendo de verdade — do começo ao fim.',
    en: 'Access NOOWE and see operations happening for real — from start to finish.',
    es: 'Accede a NOOWE y ve la operación sucediendo de verdad — de principio a fin.',
  },
  'platform.cta_button': { pt: 'Solicitar acesso', en: 'Request access', es: 'Solicitar acceso' },

  // Navbar — For You
  'nav.foryou': { pt: 'Para Você', en: 'For You', es: 'Para Ti' },

  // Waitlist
  'waitlist.title': { pt: 'Entre na lista de espera', en: 'Join the waitlist', es: 'Únete a la lista de espera' },
  'waitlist.sub': { pt: 'Seja um dos primeiros a experimentar o NOOWE quando o app for lançado.', en: 'Be one of the first to experience NOOWE when the app launches.', es: 'Sé de los primeros en experimentar NOOWE cuando la app sea lanzada.' },
  'waitlist.name_placeholder': { pt: 'Seu nome', en: 'Your name', es: 'Tu nombre' },
  'waitlist.email_placeholder': { pt: 'Seu email', en: 'Your email', es: 'Tu email' },
  'waitlist.city_placeholder': { pt: 'Sua cidade (opcional)', en: 'Your city (optional)', es: 'Tu ciudad (opcional)' },
  'waitlist.cta': { pt: 'Quero fazer parte', en: 'I want in', es: 'Quiero ser parte' },
  'waitlist.success_title': { pt: 'Você está na lista!', en: "You're on the list!", es: '¡Estás en la lista!' },
  'waitlist.success_body': { pt: 'Vamos te avisar assim que o NOOWE estiver disponível na sua região.', en: "We'll let you know as soon as NOOWE is available in your area.", es: 'Te avisaremos cuando NOOWE esté disponible en tu región.' },
  'waitlist.already': { pt: 'Este email já está na lista.', en: 'This email is already on the list.', es: 'Este email ya está en la lista.' },
  'waitlist.error': { pt: 'Algo deu errado. Tente novamente.', en: 'Something went wrong. Try again.', es: 'Algo salió mal. Inténtalo de nuevo.' },

  // For You (B2C page)
  'foryou.overline': { pt: 'PARA VOCÊ', en: 'FOR YOU', es: 'PARA TI' },
  'foryou.h1': { pt: 'A melhor experiência em restaurantes começa no seu celular.', en: 'The best restaurant experience starts on your phone.', es: 'La mejor experiencia en restaurantes empieza en tu celular.' },
  'foryou.sub': { pt: 'Chega de esperar garçom, disputar atenção ou ficar na dúvida sobre o pedido. Com o NOOWE, tudo flui — do primeiro prato ao pagamento.', en: "No more waiting for the waiter, competing for attention, or wondering about your order. With NOOWE, everything flows — from the first dish to payment.", es: 'Basta de esperar al mesero, competir por atención o quedarse con dudas sobre el pedido. Con NOOWE, todo fluye — del primer plato al pago.' },

  'foryou.features_title': { pt: 'O que muda na sua experiência', en: 'What changes in your experience', es: 'Lo que cambia en tu experiencia' },
  'foryou.features_sub': { pt: 'Funcionalidades que transformam sua ida ao restaurante.', en: 'Features that transform your restaurant visit.', es: 'Funcionalidades que transforman tu visita al restaurante.' },

  'foryou.feat_order_title': { pt: 'Peça sem esforço', en: 'Order effortlessly', es: 'Pide sin esfuerzo' },
  'foryou.feat_order_desc': { pt: 'Cardápio digital no seu celular. Escolha, personalize e envie — sem depender de ninguém.', en: 'Digital menu on your phone. Choose, customize and send — without depending on anyone.', es: 'Menú digital en tu celular. Elige, personaliza y envía — sin depender de nadie.' },
  'foryou.feat_track_title': { pt: 'Acompanhe em tempo real', en: 'Track in real time', es: 'Sigue en tiempo real' },
  'foryou.feat_track_desc': { pt: 'Saiba exatamente onde está seu pedido. Sem ansiedade, sem chamar o garçom.', en: 'Know exactly where your order is. No anxiety, no calling the waiter.', es: 'Sabe exactamente dónde está tu pedido. Sin ansiedad, sin llamar al mesero.' },
  'foryou.feat_pay_title': { pt: 'Pague sem fricção', en: 'Pay without friction', es: 'Paga sin fricción' },
  'foryou.feat_pay_desc': { pt: 'PIX, cartão, Apple Pay, Google Pay. Pague como preferir, direto do celular.', en: 'PIX, card, Apple Pay, Google Pay. Pay however you prefer, right from your phone.', es: 'PIX, tarjeta, Apple Pay, Google Pay. Paga como prefieras, directo del celular.' },
  'foryou.feat_split_title': { pt: 'Divida a conta fácil', en: 'Split the bill easily', es: 'Divide la cuenta fácil' },
  'foryou.feat_split_desc': { pt: 'Divida por igual, por item ou por pessoa. Sem calculadora, sem constrangimento.', en: 'Split equally, by item or by person. No calculator, no awkwardness.', es: 'Divide por igual, por item o por persona. Sin calculadora, sin incomodidad.' },
  'foryou.feat_fast_title': { pt: 'Zero espera', en: 'Zero wait', es: 'Cero espera' },
  'foryou.feat_fast_desc': { pt: 'Fila virtual, skip the line e pedidos antecipados. Seu tempo vale mais.', en: 'Virtual queue, skip the line and advance orders. Your time is worth more.', es: 'Fila virtual, skip the line y pedidos anticipados. Tu tiempo vale más.' },
  'foryou.feat_notify_title': { pt: 'Notificações inteligentes', en: 'Smart notifications', es: 'Notificaciones inteligentes' },
  'foryou.feat_notify_desc': { pt: 'Saiba quando seu pedido está pronto, quando a mesa liberou ou quando é sua vez.', en: "Know when your order is ready, when the table is free or when it's your turn.", es: 'Sabe cuándo tu pedido está listo, cuándo la mesa se liberó o cuándo es tu turno.' },

  'foryou.how_title': { pt: 'Como funciona', en: 'How it works', es: 'Cómo funciona' },
  'foryou.step1_title': { pt: 'Escaneie o QR code', en: 'Scan the QR code', es: 'Escanea el código QR' },
  'foryou.step1_desc': { pt: 'Na mesa, no balcão ou na fila. O NOOWE abre instantaneamente.', en: 'At the table, counter or queue. NOOWE opens instantly.', es: 'En la mesa, mostrador o fila. NOOWE se abre al instante.' },
  'foryou.step2_title': { pt: 'Peça e acompanhe', en: 'Order and track', es: 'Pide y sigue' },
  'foryou.step2_desc': { pt: 'Navegue pelo cardápio, faça seu pedido e acompanhe tudo em tempo real.', en: 'Browse the menu, place your order and track everything in real time.', es: 'Navega por el menú, haz tu pedido y sigue todo en tiempo real.' },
  'foryou.step3_title': { pt: 'Pague e vá', en: 'Pay and go', es: 'Paga y vete' },
  'foryou.step3_desc': { pt: 'Feche a conta no celular. Sem esperar, sem complicação.', en: 'Close your tab on your phone. No waiting, no hassle.', es: 'Cierra la cuenta en tu celular. Sin esperar, sin complicaciones.' },

  'foryou.waitlist_title': { pt: 'Quer ser um dos primeiros?', en: 'Want to be one of the first?', es: '¿Quieres ser de los primeros?' },
  'foryou.waitlist_sub': { pt: 'O NOOWE está chegando. Entre na lista e descubra antes de todo mundo.', en: "NOOWE is coming. Join the list and discover it before everyone else.", es: 'NOOWE está llegando. Únete a la lista y descúbrelo antes que todos.' },

  // Home — Audience bifurcation
  'home.audience_title': { pt: 'Como podemos te ajudar?', en: 'How can we help you?', es: '¿Cómo podemos ayudarte?' },
  'home.biz_title': { pt: 'Para seu negócio', en: 'For your business', es: 'Para tu negocio' },
  'home.biz_desc': { pt: 'Conheça a plataforma completa que conecta todos os fluxos do seu restaurante.', en: 'Discover the complete platform that connects every flow in your restaurant.', es: 'Conoce la plataforma completa que conecta todos los flujos de tu restaurante.' },
  'home.biz_cta': { pt: 'Conhecer a plataforma', en: 'Explore the platform', es: 'Conocer la plataforma' },
  'home.you_title': { pt: 'Para você, cliente', en: 'For you, the guest', es: 'Para ti, cliente' },
  'home.you_desc': { pt: 'Descubra como o NOOWE transforma sua experiência em restaurantes — e entre na lista de espera.', en: 'Discover how NOOWE transforms your restaurant experience — and join the waitlist.', es: 'Descubre cómo NOOWE transforma tu experiencia en restaurantes — y únete a la lista de espera.' },
  'home.you_cta': { pt: 'Saiba mais', en: 'Learn more', es: 'Saber más' },

  // Footer waitlist
  'footer.waitlist_title': { pt: 'Fique por dentro', en: 'Stay in the loop', es: 'Mantente informado' },
  'footer.foryou': { pt: 'Para Você', en: 'For You', es: 'Para Ti' },
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
