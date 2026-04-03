/**
 * SimTurnoModels — 5-act simulation data for ALL 11 business models.
 * Each model has unique events, metrics, screens, and narrations reflecting
 * its real-world operational reality. Fully translated PT/EN/ES.
 */
import type { SimProfile, SimModel, SimTranslation } from './SimulationData';
import type { TurnoAct, ImpactSummary } from './SimTurnoData';
import { FINE_DINING_ACTS, FINAL_IMPACT } from './SimTurnoData';

// ─── CHEF'S TABLE ───
const CHEFS_TABLE_ACTS: TurnoAct[] = [
  {
    id: 'act1', timeRange: '18:00 – 18:45',
    title: { pt: 'Preparação exclusiva', en: 'Exclusive preparation', es: 'Preparación exclusiva' },
    subtitle: { pt: 'Mise en Place', en: 'Mise en Place', es: 'Mise en Place' },
    emotion: { pt: 'Antecipação + Cuidado', en: 'Anticipation + Care', es: 'Anticipación + Cuidado' },
    woowEffect: { pt: 'Cada detalhe pensado antes', en: 'Every detail planned ahead', es: 'Cada detalle pensado antes' },
    clientScreens: [
      { id: 'c1-invite', icon: 'mail', label: { pt: 'Convite digital exclusivo', en: 'Exclusive digital invite', es: 'Invitación digital exclusiva' }, description: { pt: 'Recebe countdown personalizado', en: 'Receives personalized countdown', es: 'Recibe countdown personalizado' } },
      { id: 'c1-dietary', icon: 'leaf', label: { pt: 'Preferências enviadas', en: 'Preferences sent', es: 'Preferencias enviadas' }, description: { pt: 'Alergias e gostos pré-informados', en: 'Allergies and tastes pre-informed', es: 'Alergias y gustos pre-informados' } },
    ],
    restaurantScreens: [
      { id: 'r1-prep', icon: 'chef-hat', label: { pt: 'Planejamento do menu', en: 'Menu planning', es: 'Planificación del menú' }, description: { pt: 'Chef adapta pratos ao grupo', en: 'Chef adapts dishes to the group', es: 'Chef adapta platos al grupo' } },
      { id: 'r1-stock', icon: 'package', label: { pt: 'Ingredientes especiais', en: 'Special ingredients', es: 'Ingredientes especiales' }, description: { pt: 'Check de insumos premium', en: 'Premium supplies check', es: 'Check de insumos premium' } },
    ],
    events: [
      { id: 'e1-1', time: '18:10', icon: 'mail', urgency: 'info', clientView: { pt: 'Recebeu convite com menu preview', en: 'Received invite with menu preview', es: 'Recibió invitación con preview del menú' }, restaurantView: { pt: 'Chef recebeu perfil dos convidados', en: 'Chef received guest profiles', es: 'Chef recibió perfil de invitados' }, resolution: { pt: 'Menu adaptado automaticamente', en: 'Menu adapted automatically', es: 'Menú adaptado automáticamente' } },
      { id: 'e1-2', time: '18:30', icon: 'leaf', urgency: 'warning', clientView: { pt: 'Indicou alergia a nozes', en: 'Indicated nut allergy', es: 'Indicó alergia a nueces' }, restaurantView: { pt: 'Alerta de alergia no KDS', en: 'Allergy alert on KDS', es: 'Alerta de alergia en KDS' }, resolution: { pt: 'Prato 3 substituído automaticamente', en: 'Course 3 substituted automatically', es: 'Plato 3 sustituido automáticamente' } },
    ],
    metrics: [
      { id: 'm1-1', icon: 'timer', label: { pt: 'Prep do menu', en: 'Menu prep', es: 'Prep del menú' }, without: { pt: '3h', en: '3h', es: '3h' }, withNoowe: { pt: '45 min', en: '45 min', es: '45 min' } },
      { id: 'm1-2', icon: 'alert-octagon', label: { pt: 'Riscos de alergia', en: 'Allergy risks', es: 'Riesgos de alergia' }, without: { pt: 'Ocultos', en: 'Hidden', es: 'Ocultos' }, withNoowe: { pt: '100% visíveis', en: '100% visible', es: '100% visibles' } },
    ],
    narration: {
      owner: { pt: 'Cada experiência é feita sob medida sem aumentar seu custo operacional.', en: 'Each experience is tailor-made without increasing your operational cost.', es: 'Cada experiencia es hecha a medida sin aumentar tu costo operacional.' },
      manager: { pt: 'Você tem visão total das preferências antes dos convidados chegarem.', en: 'You have full visibility of preferences before guests arrive.', es: 'Tienes visión total de las preferencias antes de que lleguen los invitados.' },
      team: { pt: 'Chega de decorar restrições de cabeça — está tudo na sua tela.', en: 'No more memorizing restrictions — it\'s all on your screen.', es: 'Ya no necesitas memorizar restricciones — todo está en tu pantalla.' },
    },
  },
  {
    id: 'act2', timeRange: '19:00 – 20:00',
    title: { pt: 'A experiência começa', en: 'The experience begins', es: 'La experiencia comienza' },
    subtitle: { pt: 'Primeiro Ato', en: 'First Course', es: 'Primer Acto' },
    emotion: { pt: 'Encantamento', en: 'Enchantment', es: 'Encantamiento' },
    woowEffect: { pt: 'Teatro gastronômico em sincronia', en: 'Gastronomic theater in sync', es: 'Teatro gastronómico en sincronía' },
    clientScreens: [
      { id: 'c2-welcome', icon: 'sparkles', label: { pt: 'Boas-vindas interativa', en: 'Interactive welcome', es: 'Bienvenida interactiva' }, description: { pt: 'História do chef e conceito do menu', en: 'Chef\'s story and menu concept', es: 'Historia del chef y concepto del menú' } },
      { id: 'c2-wine', icon: 'wine', label: { pt: 'Harmonização IA', en: 'AI wine pairing', es: 'Maridaje IA' }, description: { pt: 'Sugestão por prato com notas', en: 'Per-course suggestion with notes', es: 'Sugerencia por plato con notas' } },
    ],
    restaurantScreens: [
      { id: 'r2-timing', icon: 'timer', label: { pt: 'Timing de pratos', en: 'Course timing', es: 'Timing de platos' }, description: { pt: 'Orquestração dos tempos de saída', en: 'Orchestration of serving times', es: 'Orquestación de tiempos de salida' } },
      { id: 'r2-somm', icon: 'wine', label: { pt: 'Painel sommelier', en: 'Sommelier panel', es: 'Panel sommelier' }, description: { pt: 'Vinhos alinhados por curso', en: 'Wines aligned per course', es: 'Vinos alineados por curso' } },
    ],
    events: [
      { id: 'e2-1', time: '19:15', icon: 'sparkles', urgency: 'info', clientView: { pt: 'Acessou storytelling do chef', en: 'Accessed chef storytelling', es: 'Accedió al storytelling del chef' }, restaurantView: { pt: 'Todos os convidados engajados', en: 'All guests engaged', es: 'Todos los invitados enganchados' }, resolution: { pt: 'Experiência imersiva desde o início', en: 'Immersive experience from the start', es: 'Experiencia inmersiva desde el inicio' } },
      { id: 'e2-2', time: '19:40', icon: 'wine', urgency: 'info', clientView: { pt: 'Escolheu harmonização premium', en: 'Chose premium pairing', es: 'Eligió maridaje premium' }, restaurantView: { pt: 'Upsell de R$180 por mesa', en: '$36 upsell per table', es: 'Upsell de $36 por mesa' }, resolution: { pt: 'Receita incremental automática', en: 'Automatic incremental revenue', es: 'Ingreso incremental automático' } },
    ],
    metrics: [
      { id: 'm2-1', icon: 'wine', label: { pt: 'Upsell vinho', en: 'Wine upsell', es: 'Upsell vino' }, without: { pt: '15%', en: '15%', es: '15%' }, withNoowe: { pt: '72%', en: '72%', es: '72%' } },
      { id: 'm2-2', icon: 'timer', label: { pt: 'Timing entre pratos', en: 'Inter-course timing', es: 'Timing entre platos' }, without: { pt: 'Irregular', en: 'Irregular', es: 'Irregular' }, withNoowe: { pt: 'Perfeito', en: 'Perfect', es: 'Perfecto' } },
    ],
    narration: {
      owner: { pt: 'O upsell de vinhos aumentou 380% sem parecer invasivo.', en: 'Wine upsell increased 380% without feeling intrusive.', es: 'El upsell de vinos aumentó 380% sin parecer invasivo.' },
      manager: { pt: 'O timing de cada prato está perfeito — sem correria.', en: 'The timing of each course is perfect — no rushing.', es: 'El timing de cada plato está perfecto — sin carreras.' },
      team: { pt: 'Você sabe exatamente quando sair cada prato e qual vinho servir.', en: 'You know exactly when each course goes out and which wine to serve.', es: 'Sabes exactamente cuándo sale cada plato y qué vino servir.' },
    },
  },
  {
    id: 'act3', timeRange: '20:00 – 21:00',
    title: { pt: 'O clímax gastronômico', en: 'The gastronomic climax', es: 'El clímax gastronómico' },
    subtitle: { pt: 'Prato Principal', en: 'Main Course', es: 'Plato Principal' },
    emotion: { pt: 'Êxtase + Surpresa', en: 'Ecstasy + Surprise', es: 'Éxtasis + Sorpresa' },
    woowEffect: { pt: 'Personalização invisível', en: 'Invisible personalization', es: 'Personalización invisible' },
    clientScreens: [
      { id: 'c3-story', icon: 'book-open', label: { pt: 'História do prato', en: 'Dish story', es: 'Historia del plato' }, description: { pt: 'Origem dos ingredientes e técnica', en: 'Ingredient origin and technique', es: 'Origen de ingredientes y técnica' } },
      { id: 'c3-photo', icon: 'camera', label: { pt: 'Foto com o chef', en: 'Photo with chef', es: 'Foto con el chef' }, description: { pt: 'Momento registrado digitalmente', en: 'Moment captured digitally', es: 'Momento registrado digitalmente' } },
    ],
    restaurantScreens: [
      { id: 'r3-kds', icon: 'monitor', label: { pt: 'KDS sincronizado', en: 'Synchronized KDS', es: 'KDS sincronizado' }, description: { pt: 'Todas as mesas em perfeita sincronia', en: 'All tables in perfect sync', es: 'Todas las mesas en perfecta sincronía' } },
      { id: 'r3-feedback', icon: 'message-circle', label: { pt: 'Feedback em tempo real', en: 'Real-time feedback', es: 'Feedback en tiempo real' }, description: { pt: 'Chef vê reações instantâneas', en: 'Chef sees instant reactions', es: 'Chef ve reacciones instantáneas' } },
    ],
    events: [
      { id: 'e3-1', time: '20:20', icon: 'camera', urgency: 'info', clientView: { pt: 'Registrou momento com o chef', en: 'Captured moment with chef', es: 'Registró momento con el chef' }, restaurantView: { pt: 'Galeria do chef atualizada', en: 'Chef gallery updated', es: 'Galería del chef actualizada' }, resolution: { pt: 'Conteúdo para redes sociais', en: 'Content for social media', es: 'Contenido para redes sociales' } },
      { id: 'e3-2', time: '20:40', icon: 'star', urgency: 'info', clientView: { pt: 'Avaliou prato: 5 estrelas', en: 'Rated course: 5 stars', es: 'Evaluó plato: 5 estrellas' }, restaurantView: { pt: 'NPS curso 3: 9.8', en: 'Course 3 NPS: 9.8', es: 'NPS curso 3: 9.8' }, resolution: { pt: 'Dado vira insight de menu', en: 'Data becomes menu insight', es: 'Dato se vuelve insight de menú' } },
    ],
    metrics: [
      { id: 'm3-1', icon: 'star', label: { pt: 'NPS por curso', en: 'Per-course NPS', es: 'NPS por curso' }, without: { pt: 'Nenhum', en: 'None', es: 'Ninguno' }, withNoowe: { pt: '9.8', en: '9.8', es: '9.8' } },
      { id: 'm3-2', icon: 'camera', label: { pt: 'Engajamento social', en: 'Social engagement', es: 'Engagement social' }, without: { pt: '10%', en: '10%', es: '10%' }, withNoowe: { pt: '85%', en: '85%', es: '85%' } },
    ],
    narration: {
      owner: { pt: 'Cada mesa gera conteúdo orgânico que vale mais que propaganda.', en: 'Each table generates organic content worth more than advertising.', es: 'Cada mesa genera contenido orgánico que vale más que publicidad.' },
      manager: { pt: 'O NPS em tempo real te permite ajustar antes do próximo serviço.', en: 'Real-time NPS lets you adjust before the next service.', es: 'El NPS en tiempo real te permite ajustar antes del próximo servicio.' },
      team: { pt: 'Os clientes postam fotos com você — reconhecimento instantâneo.', en: 'Customers post photos with you — instant recognition.', es: 'Los clientes publican fotos contigo — reconocimiento instantáneo.' },
    },
  },
  {
    id: 'act4', timeRange: '21:00 – 21:45',
    title: { pt: 'O grand finale', en: 'The grand finale', es: 'El grand finale' },
    subtitle: { pt: 'Sobremesa + Certificado', en: 'Dessert + Certificate', es: 'Postre + Certificado' },
    emotion: { pt: 'Gratidão + Pertencimento', en: 'Gratitude + Belonging', es: 'Gratitud + Pertenencia' },
    woowEffect: { pt: 'Memória que vira embaixador', en: 'Memory that becomes ambassador', es: 'Memoria que se vuelve embajador' },
    clientScreens: [
      { id: 'c4-cert', icon: 'star', label: { pt: 'Certificado digital', en: 'Digital certificate', es: 'Certificado digital' }, description: { pt: 'NFT da experiência exclusiva', en: 'Exclusive experience NFT', es: 'NFT de la experiencia exclusiva' } },
      { id: 'c4-tip', icon: 'coins', label: { pt: 'Gorjeta digital', en: 'Digital tip', es: 'Propina digital' }, description: { pt: 'Gorjeta vai direto para equipe', en: 'Tip goes directly to team', es: 'Propina va directo al equipo' } },
    ],
    restaurantScreens: [
      { id: 'r4-close', icon: 'credit-card', label: { pt: 'Fechamento automático', en: 'Auto closing', es: 'Cierre automático' }, description: { pt: 'Pagamento processado pelo app', en: 'Payment processed via app', es: 'Pago procesado por app' } },
      { id: 'r4-review', icon: 'star', label: { pt: 'Review imediato', en: 'Immediate review', es: 'Review inmediato' }, description: { pt: 'Avaliação antes de sair', en: 'Review before leaving', es: 'Evaluación antes de salir' } },
    ],
    events: [
      { id: 'e4-1', time: '21:15', icon: 'star', urgency: 'info', clientView: { pt: 'Recebeu certificado digital', en: 'Received digital certificate', es: 'Recibió certificado digital' }, restaurantView: { pt: 'Experiência registrada no CRM', en: 'Experience logged in CRM', es: 'Experiencia registrada en CRM' }, resolution: { pt: 'Cliente vira embaixador da marca', en: 'Customer becomes brand ambassador', es: 'Cliente se vuelve embajador de la marca' } },
      { id: 'e4-2', time: '21:30', icon: 'coins', urgency: 'info', clientView: { pt: 'Deixou gorjeta de 25%', en: 'Left 25% tip', es: 'Dejó propina de 25%' }, restaurantView: { pt: 'Equipe recebeu gorjeta direto', en: 'Team received tip directly', es: 'Equipo recibió propina directo' }, resolution: { pt: 'Equipe mais motivada', en: 'Team more motivated', es: 'Equipo más motivado' } },
    ],
    metrics: [
      { id: 'm4-1', icon: 'coins', label: { pt: 'Gorjeta média', en: 'Average tip', es: 'Propina media' }, without: { pt: '10%', en: '10%', es: '10%' }, withNoowe: { pt: '22%', en: '22%', es: '22%' } },
      { id: 'm4-2', icon: 'star', label: { pt: 'Avaliação Google', en: 'Google review', es: 'Evaluación Google' }, without: { pt: 'Raro', en: 'Rare', es: 'Raro' }, withNoowe: { pt: '92% avaliam', en: '92% review', es: '92% evalúan' } },
    ],
    narration: {
      owner: { pt: 'O certificado digital gera 4x mais indicações que qualquer campanha.', en: 'The digital certificate generates 4x more referrals than any campaign.', es: 'El certificado digital genera 4x más referencias que cualquier campaña.' },
      manager: { pt: 'O fechamento que levava 20 min agora leva 2 min.', en: 'The closing that took 20 min now takes 2 min.', es: 'El cierre que tardaba 20 min ahora tarda 2 min.' },
      team: { pt: 'As gorjetas subiram 120% — o reconhecimento é direto e imediato.', en: 'Tips went up 120% — recognition is direct and immediate.', es: 'Las propinas subieron 120% — el reconocimiento es directo e inmediato.' },
    },
  },
  {
    id: 'act5', timeRange: '21:45 – 22:30',
    title: { pt: 'O legado de cada noite', en: 'Each night\'s legacy', es: 'El legado de cada noche' },
    subtitle: { pt: 'Pós-Experiência', en: 'Post-Experience', es: 'Post-Experiencia' },
    emotion: { pt: 'Realização + Visão', en: 'Achievement + Vision', es: 'Realización + Visión' },
    woowEffect: { pt: 'Dados que constroem futuro', en: 'Data that builds the future', es: 'Datos que construyen futuro' },
    clientScreens: [
      { id: 'c5-gallery', icon: 'camera', label: { pt: 'Galeria da experiência', en: 'Experience gallery', es: 'Galería de la experiencia' }, description: { pt: 'Todas as fotos e momentos', en: 'All photos and moments', es: 'Todas las fotos y momentos' } },
      { id: 'c5-next', icon: 'calendar', label: { pt: 'Próxima experiência', en: 'Next experience', es: 'Próxima experiencia' }, description: { pt: 'Acesso antecipado ao próximo evento', en: 'Early access to next event', es: 'Acceso anticipado al próximo evento' } },
    ],
    restaurantScreens: [
      { id: 'r5-report', icon: 'bar-chart-3', label: { pt: 'Relatório da noite', en: 'Night report', es: 'Reporte de la noche' }, description: { pt: 'Receita, NPS, engajamento, fotos', en: 'Revenue, NPS, engagement, photos', es: 'Ingreso, NPS, engagement, fotos' } },
      { id: 'r5-crm', icon: 'users', label: { pt: 'CRM atualizado', en: 'CRM updated', es: 'CRM actualizado' }, description: { pt: 'Perfis enriquecidos automaticamente', en: 'Profiles enriched automatically', es: 'Perfiles enriquecidos automáticamente' } },
    ],
    events: [
      { id: 'e5-1', time: '22:00', icon: 'bar-chart-3', urgency: 'info', clientView: { pt: 'Recebeu galeria completa', en: 'Received complete gallery', es: 'Recibió galería completa' }, restaurantView: { pt: 'Relatório gerado automaticamente', en: 'Report generated automatically', es: 'Reporte generado automáticamente' }, resolution: { pt: 'Zero trabalho manual no fechamento', en: 'Zero manual work at closing', es: 'Cero trabajo manual en el cierre' } },
    ],
    metrics: [
      { id: 'm5-1', icon: 'refresh-cw', label: { pt: 'Taxa de retorno', en: 'Return rate', es: 'Tasa de retorno' }, without: { pt: '20%', en: '20%', es: '20%' }, withNoowe: { pt: '78%', en: '78%', es: '78%' } },
      { id: 'm5-2', icon: 'bar-chart-3', label: { pt: 'Dados por cliente', en: 'Data per guest', es: 'Datos por cliente' }, without: { pt: 'Nome só', en: 'Name only', es: 'Solo nombre' }, withNoowe: { pt: '23 datapoints', en: '23 datapoints', es: '23 datapoints' } },
    ],
    narration: {
      owner: { pt: 'Cada noite gera dados que fazem a próxima ser melhor.', en: 'Each night generates data that makes the next one better.', es: 'Cada noche genera datos que hacen la próxima mejor.' },
      manager: { pt: 'O relatório que levava 1h agora está pronto em 0 segundos.', en: 'The report that took 1h is now ready in 0 seconds.', es: 'El reporte que tardaba 1h ahora está listo en 0 segundos.' },
      team: { pt: 'Você saiu no horário — sem ficar fechando conta manualmente.', en: 'You left on time — no manual bill closing.', es: 'Saliste a tiempo — sin cerrar cuentas manualmente.' },
    },
  },
];

// ─── CASUAL DINING ───
const CASUAL_DINING_ACTS: TurnoAct[] = [
  {
    id: 'act1', timeRange: '11:30 – 12:30',
    title: { pt: 'O almoço começa', en: 'Lunch begins', es: 'El almuerzo comienza' },
    subtitle: { pt: 'Preparação', en: 'Setup', es: 'Preparación' },
    emotion: { pt: 'Otimismo + Energia', en: 'Optimism + Energy', es: 'Optimismo + Energía' },
    woowEffect: { pt: 'Fila inteligente desde o início', en: 'Smart queue from the start', es: 'Fila inteligente desde el inicio' },
    clientScreens: [
      { id: 'c1-queue', icon: 'person-standing', label: { pt: 'Fila virtual', en: 'Virtual queue', es: 'Fila virtual' }, description: { pt: 'Entra na fila antes de sair de casa', en: 'Joins queue before leaving home', es: 'Entra en fila antes de salir de casa' } },
      { id: 'c1-menu', icon: 'clipboard-list', label: { pt: 'Cardápio antecipado', en: 'Early menu', es: 'Menú anticipado' }, description: { pt: 'Já escolhe enquanto espera', en: 'Chooses while waiting', es: 'Ya elige mientras espera' } },
    ],
    restaurantScreens: [
      { id: 'r1-forecast', icon: 'bar-chart-3', label: { pt: 'Previsão de demanda', en: 'Demand forecast', es: 'Previsión de demanda' }, description: { pt: 'IA prevê lotação por horário', en: 'AI predicts occupancy by hour', es: 'IA prevé ocupación por hora' } },
      { id: 'r1-setup', icon: '🪑', label: { pt: 'Setup de mesas', en: 'Table setup', es: 'Setup de mesas' }, description: { pt: 'Configuração baseada em reservas', en: 'Configuration based on bookings', es: 'Configuración basada en reservas' } },
    ],
    events: [
      { id: 'e1-1', time: '11:45', icon: 'person-standing', urgency: 'info', clientView: { pt: 'Entrou na fila virtual', en: 'Joined virtual queue', es: 'Entró en fila virtual' }, restaurantView: { pt: 'Fila com 8 grupos — ETA visível', en: 'Queue with 8 groups — ETA visible', es: 'Fila con 8 grupos — ETA visible' }, resolution: { pt: 'Tempo de espera reduzido 50%', en: 'Wait time reduced 50%', es: 'Tiempo de espera reducido 50%' } },
      { id: 'e1-2', time: '12:00', icon: 'clipboard-list', urgency: 'info', clientView: { pt: 'Já escolheu o prato na fila', en: 'Already chose dish while in queue', es: 'Ya eligió el plato en la fila' }, restaurantView: { pt: 'Pedido pré-registrado no sistema', en: 'Order pre-registered in system', es: 'Pedido pre-registrado en sistema' }, resolution: { pt: 'Mesa senta e come 5 min mais rápido', en: 'Table sits and eats 5 min faster', es: 'Mesa se sienta y come 5 min más rápido' } },
    ],
    metrics: [
      { id: 'm1-1', icon: 'person-standing', label: { pt: 'Desistência na fila', en: 'Queue abandonment', es: 'Abandono en fila' }, without: { pt: '35%', en: '35%', es: '35%' }, withNoowe: { pt: '8%', en: '8%', es: '8%' } },
      { id: 'm1-2', icon: 'timer', label: { pt: 'Tempo até sentar', en: 'Time to seat', es: 'Tiempo hasta sentar' }, without: { pt: '25 min', en: '25 min', es: '25 min' }, withNoowe: { pt: '8 min', en: '8 min', es: '8 min' } },
    ],
    narration: {
      owner: { pt: 'Cada cliente na fila virtual é um cliente que não desistiu.', en: 'Every customer in the virtual queue is one who didn\'t give up.', es: 'Cada cliente en la fila virtual es uno que no desistió.' },
      manager: { pt: 'Você vê a demanda antes dela acontecer.', en: 'You see demand before it happens.', es: 'Ves la demanda antes de que suceda.' },
      team: { pt: 'Menos correria — os pedidos já chegam prontos no sistema.', en: 'Less rushing — orders arrive ready in the system.', es: 'Menos carreras — los pedidos ya llegan listos al sistema.' },
    },
  },
  {
    id: 'act2', timeRange: '12:30 – 13:30',
    title: { pt: 'Casa lotada', en: 'Full house', es: 'Casa llena' },
    subtitle: { pt: 'Pico do Almoço', en: 'Lunch Peak', es: 'Pico del Almuerzo' },
    emotion: { pt: 'Adrenalina + Fluxo', en: 'Adrenaline + Flow', es: 'Adrenalina + Flujo' },
    woowEffect: { pt: 'Alto volume sem perder qualidade', en: 'High volume without losing quality', es: 'Alto volumen sin perder calidad' },
    clientScreens: [
      { id: 'c2-order', icon: 'smartphone', label: { pt: 'Pedido na mesa', en: 'Table ordering', es: 'Pedido en mesa' }, description: { pt: 'QR code na mesa → pedido direto', en: 'QR code at table → direct order', es: 'QR code en mesa → pedido directo' } },
      { id: 'c2-family', icon: 'users', label: { pt: 'Modo família', en: 'Family mode', es: 'Modo familia' }, description: { pt: 'Cada um pede do seu celular', en: 'Everyone orders from their phone', es: 'Cada uno pide desde su celular' } },
    ],
    restaurantScreens: [
      { id: 'r2-kds', icon: 'monitor', label: { pt: 'KDS por estação', en: 'KDS per station', es: 'KDS por estación' }, description: { pt: 'Pratos distribuídos por praça', en: 'Dishes distributed by station', es: 'Platos distribuidos por estación' } },
      { id: 'r2-waiter', icon: '🤵', label: { pt: 'Garçom digital', en: 'Digital waiter', es: 'Mesero digital' }, description: { pt: 'Ações priorizadas por urgência', en: 'Actions prioritized by urgency', es: 'Acciones priorizadas por urgencia' } },
    ],
    events: [
      { id: 'e2-1', time: '12:45', icon: 'smartphone', urgency: 'info', clientView: { pt: 'Família de 6 pediu pelo app', en: 'Family of 6 ordered via app', es: 'Familia de 6 pidió por app' }, restaurantView: { pt: 'Pedido foi direto ao KDS', en: 'Order went straight to KDS', es: 'Pedido fue directo al KDS' }, resolution: { pt: 'Zero erros de anotação', en: 'Zero annotation errors', es: 'Cero errores de anotación' } },
      { id: 'e2-2', time: '13:00', icon: 'alert-triangle', urgency: 'warning', clientView: { pt: 'Filho tem alergia a glúten', en: 'Child has gluten allergy', es: 'Hijo tiene alergia al gluten' }, restaurantView: { pt: 'Alerta de alergia na cozinha', en: 'Allergy alert in kitchen', es: 'Alerta de alergia en cocina' }, resolution: { pt: 'Substituição sugerida automaticamente', en: 'Substitution suggested automatically', es: 'Sustitución sugerida automáticamente' } },
      { id: 'e2-3', time: '13:15', icon: 'person-standing', urgency: 'info', clientView: { pt: 'Walk-in avisado: 12 min de espera', en: 'Walk-in notified: 12 min wait', es: 'Walk-in avisado: 12 min de espera' }, restaurantView: { pt: 'Rotação de mesas otimizada', en: 'Table rotation optimized', es: 'Rotación de mesas optimizada' }, resolution: { pt: 'Cliente espera sabendo o tempo', en: 'Customer waits knowing the time', es: 'Cliente espera sabiendo el tiempo' } },
    ],
    metrics: [
      { id: 'm2-1', icon: 'timer', label: { pt: 'Pedido → KDS', en: 'Order → KDS', es: 'Pedido → KDS' }, without: { pt: '6 min', en: '6 min', es: '6 min' }, withNoowe: { pt: 'Instantâneo', en: 'Instant', es: 'Instantáneo' } },
      { id: 'm2-2', icon: 'x-circle', label: { pt: 'Erros por turno', en: 'Errors per shift', es: 'Errores por turno' }, without: { pt: '8', en: '8', es: '8' }, withNoowe: { pt: '0', en: '0', es: '0' } },
      { id: 'm2-3', icon: 'refresh-cw', label: { pt: 'Giros de mesa', en: 'Table turns', es: 'Giros de mesa' }, without: { pt: '2.1', en: '2.1', es: '2.1' }, withNoowe: { pt: '3.4', en: '3.4', es: '3.4' } },
    ],
    narration: {
      owner: { pt: 'Mais giros de mesa = mais receita, sem aumentar o espaço.', en: 'More table turns = more revenue, without expanding space.', es: 'Más giros de mesa = más ingreso, sin ampliar espacio.' },
      manager: { pt: 'Você administra 25 mesas sem levantar da cadeira.', en: 'You manage 25 tables without leaving your chair.', es: 'Administras 25 mesas sin levantarte de la silla.' },
      team: { pt: 'Chega de anotar pedido errado — o cliente faz pelo app.', en: 'No more wrong orders — the customer does it via app.', es: 'Basta de anotar pedidos mal — el cliente lo hace por app.' },
    },
  },
  {
    id: 'act3', timeRange: '13:30 – 14:30',
    title: { pt: 'Conta e sobremesa', en: 'Bill and dessert', es: 'Cuenta y postre' },
    subtitle: { pt: 'Rotação', en: 'Rotation', es: 'Rotación' },
    emotion: { pt: 'Satisfação + Gratidão', en: 'Satisfaction + Gratitude', es: 'Satisfacción + Gratitud' },
    woowEffect: { pt: 'Conta rápida = mesa livre', en: 'Fast bill = free table', es: 'Cuenta rápida = mesa libre' },
    clientScreens: [
      { id: 'c3-split', icon: 'credit-card', label: { pt: 'Dividir conta', en: 'Split bill', es: 'Dividir cuenta' }, description: { pt: '4 formas de dividir', en: '4 ways to split', es: '4 formas de dividir' } },
      { id: 'c3-dessert', icon: '🍰', label: { pt: 'Sugestão de sobremesa', en: 'Dessert suggestion', es: 'Sugerencia de postre' }, description: { pt: 'IA sugere baseado no pedido', en: 'AI suggests based on order', es: 'IA sugiere basado en pedido' } },
    ],
    restaurantScreens: [
      { id: 'r3-pay', icon: 'credit-card', label: { pt: 'Multi-pagamento', en: 'Multi-payment', es: 'Multi-pago' }, description: { pt: '5 mesas fecham ao mesmo tempo', en: '5 tables close simultaneously', es: '5 mesas cierran al mismo tiempo' } },
      { id: 'r3-turn', icon: 'refresh-cw', label: { pt: 'Rotação inteligente', en: 'Smart rotation', es: 'Rotación inteligente' }, description: { pt: 'Mesa liberada → próximo da fila', en: 'Table freed → next in queue', es: 'Mesa liberada → siguiente en fila' } },
    ],
    events: [
      { id: 'e3-1', time: '13:40', icon: 'credit-card', urgency: 'info', clientView: { pt: '4 amigos dividiram por item', en: '4 friends split by item', es: '4 amigos dividieron por ítem' }, restaurantView: { pt: 'Pagamento processado sem garçom', en: 'Payment processed without waiter', es: 'Pago procesado sin mesero' }, resolution: { pt: 'Mesa liberada 10 min antes', en: 'Table freed 10 min earlier', es: 'Mesa liberada 10 min antes' } },
      { id: 'e3-2', time: '14:00', icon: '🍰', urgency: 'info', clientView: { pt: 'Aceitou sugestão de sobremesa', en: 'Accepted dessert suggestion', es: 'Aceptó sugerencia de postre' }, restaurantView: { pt: 'Upsell de R$ 45 automático', en: '$9 automatic upsell', es: 'Upsell de $9 automático' }, resolution: { pt: 'Ticket médio +18%', en: 'Average ticket +18%', es: 'Ticket medio +18%' } },
    ],
    metrics: [
      { id: 'm3-1', icon: 'timer', label: { pt: 'Tempo de fechamento', en: 'Closing time', es: 'Tiempo de cierre' }, without: { pt: '15 min', en: '15 min', es: '15 min' }, withNoowe: { pt: '1 min', en: '1 min', es: '1 min' } },
      { id: 'm3-2', icon: 'coins', label: { pt: 'Upsell de sobremesa', en: 'Dessert upsell', es: 'Upsell de postre' }, without: { pt: '12%', en: '12%', es: '12%' }, withNoowe: { pt: '45%', en: '45%', es: '45%' } },
      { id: 'm3-3', icon: 'banknote', label: { pt: 'Receita perdida', en: 'Lost revenue', es: 'Ingreso perdido' }, without: { pt: 'R$ 890', en: '$180', es: '$180' }, withNoowe: { pt: 'R$ 0', en: '$0', es: '$0' }, moneyImpact: 890 },
    ],
    narration: {
      owner: { pt: 'Cada mesa que fecha rápido é receita extra no mesmo espaço.', en: 'Every table that closes fast is extra revenue in the same space.', es: 'Cada mesa que cierra rápido es ingreso extra en el mismo espacio.' },
      manager: { pt: 'Chega de fila no caixa — 5 mesas fecham ao mesmo tempo.', en: 'No more cashier queues — 5 tables close simultaneously.', es: 'Basta de fila en caja — 5 mesas cierran al mismo tiempo.' },
      team: { pt: 'Você atende mais mesas com menos esforço — e mais gorjeta.', en: 'You serve more tables with less effort — and more tips.', es: 'Atiendes más mesas con menos esfuerzo — y más propina.' },
    },
  },
  {
    id: 'act4', timeRange: '14:30 – 15:30',
    title: { pt: 'A experiência continua', en: 'The experience continues', es: 'La experiencia continúa' },
    subtitle: { pt: 'Fidelização', en: 'Loyalty', es: 'Fidelización' },
    emotion: { pt: 'Conexão + Confiança', en: 'Connection + Trust', es: 'Conexión + Confianza' },
    woowEffect: { pt: 'Cada visita vira relação', en: 'Every visit becomes a relationship', es: 'Cada visita se vuelve relación' },
    clientScreens: [
      { id: 'c4-loyalty', icon: 'star', label: { pt: 'Programa de fidelidade', en: 'Loyalty program', es: 'Programa de fidelidad' }, description: { pt: 'Pontos acumulados automaticamente', en: 'Points accumulated automatically', es: 'Puntos acumulados automáticamente' } },
      { id: 'c4-review', icon: 'file-text', label: { pt: 'Avaliação rápida', en: 'Quick review', es: 'Evaluación rápida' }, description: { pt: '3 toques e pronto', en: '3 taps and done', es: '3 toques y listo' } },
    ],
    restaurantScreens: [
      { id: 'r4-nps', icon: 'bar-chart-3', label: { pt: 'NPS em tempo real', en: 'Real-time NPS', es: 'NPS en tiempo real' }, description: { pt: 'Satisfação medida a cada mesa', en: 'Satisfaction measured per table', es: 'Satisfacción medida por mesa' } },
      { id: 'r4-crm', icon: 'users', label: { pt: 'CRM automático', en: 'Auto CRM', es: 'CRM automático' }, description: { pt: 'Perfil do cliente enriquecido', en: 'Customer profile enriched', es: 'Perfil del cliente enriquecido' } },
    ],
    events: [
      { id: 'e4-1', time: '14:45', icon: 'star', urgency: 'info', clientView: { pt: 'Ganhou 150 pontos de fidelidade', en: 'Earned 150 loyalty points', es: 'Ganó 150 puntos de fidelidad' }, restaurantView: { pt: 'Cliente no 3º nível do programa', en: 'Customer at 3rd loyalty level', es: 'Cliente en 3er nivel del programa' }, resolution: { pt: 'Retenção sobe 40%', en: 'Retention up 40%', es: 'Retención sube 40%' } },
    ],
    metrics: [
      { id: 'm4-1', icon: 'refresh-cw', label: { pt: 'Retorno em 30 dias', en: 'Return within 30 days', es: 'Retorno en 30 días' }, without: { pt: '22%', en: '22%', es: '22%' }, withNoowe: { pt: '58%', en: '58%', es: '58%' } },
      { id: 'm4-2', icon: 'star', label: { pt: 'Taxa de avaliação', en: 'Review rate', es: 'Tasa de evaluación' }, without: { pt: '3%', en: '3%', es: '3%' }, withNoowe: { pt: '67%', en: '67%', es: '67%' } },
    ],
    narration: {
      owner: { pt: 'Clientes fiéis gastam 3x mais — e você sabe quem são.', en: 'Loyal customers spend 3x more — and you know who they are.', es: 'Clientes fieles gastan 3x más — y sabes quiénes son.' },
      manager: { pt: 'O NPS te mostra problemas antes que virem reclamação no Google.', en: 'NPS shows you problems before they become Google complaints.', es: 'El NPS te muestra problemas antes de que se vuelvan quejas en Google.' },
      team: { pt: 'Quando o cliente volta e pede "o mesmo de sempre", o sistema já sabe.', en: 'When the customer returns and asks for "the usual", the system already knows.', es: 'Cuando el cliente vuelve y pide "lo de siempre", el sistema ya sabe.' },
    },
  },
  {
    id: 'act5', timeRange: '15:30 – 16:00',
    title: { pt: 'Fechamento do turno', en: 'Shift closing', es: 'Cierre del turno' },
    subtitle: { pt: 'Relatório', en: 'Report', es: 'Reporte' },
    emotion: { pt: 'Clareza + Orgulho', en: 'Clarity + Pride', es: 'Claridad + Orgullo' },
    woowEffect: { pt: 'Relatório pronto em 0 segundos', en: 'Report ready in 0 seconds', es: 'Reporte listo en 0 segundos' },
    clientScreens: [
      { id: 'c5-receipt', icon: 'receipt', label: { pt: 'Recibo digital', en: 'Digital receipt', es: 'Recibo digital' }, description: { pt: 'Recibo + histórico no app', en: 'Receipt + history in app', es: 'Recibo + historial en app' } },
    ],
    restaurantScreens: [
      { id: 'r5-close', icon: 'bar-chart-3', label: { pt: 'Fechamento automático', en: 'Auto closing', es: 'Cierre automático' }, description: { pt: 'Relatório completo do turno', en: 'Complete shift report', es: 'Reporte completo del turno' } },
      { id: 'r5-tips', icon: 'dollar-sign', label: { pt: 'Gorjetas do turno', en: 'Shift tips', es: 'Propinas del turno' }, description: { pt: 'Distribuição transparente', en: 'Transparent distribution', es: 'Distribución transparente' } },
    ],
    events: [
      { id: 'e5-1', time: '15:45', icon: 'bar-chart-3', urgency: 'info', clientView: { pt: 'Recebeu recibo no app', en: 'Received receipt in app', es: 'Recibió recibo en app' }, restaurantView: { pt: 'Turno fechado automaticamente', en: 'Shift closed automatically', es: 'Turno cerrado automáticamente' }, resolution: { pt: 'Zero trabalho manual', en: 'Zero manual work', es: 'Cero trabajo manual' } },
    ],
    metrics: [
      { id: 'm5-1', icon: 'coins', label: { pt: 'Receita do turno', en: 'Shift revenue', es: 'Ingreso del turno' }, without: { pt: 'R$ 4.200', en: '$850', es: '$850' }, withNoowe: { pt: 'R$ 5.600', en: '$1,130', es: '$1,130' } },
      { id: 'm5-2', icon: 'timer', label: { pt: 'Tempo de fechamento', en: 'Closing time', es: 'Tiempo de cierre' }, without: { pt: '45 min', en: '45 min', es: '45 min' }, withNoowe: { pt: 'Automático', en: 'Automatic', es: 'Automático' } },
    ],
    narration: {
      owner: { pt: 'O turno que faturou R$ 4.200 agora fatura R$ 5.600 — sem mudar nada.', en: 'The shift that earned $850 now earns $1,130 — without changing anything.', es: 'El turno que facturó $850 ahora factura $1,130 — sin cambiar nada.' },
      manager: { pt: 'Relatório pronto antes de você sair. Amanhã começa melhor.', en: 'Report ready before you leave. Tomorrow starts better.', es: 'Reporte listo antes de que salgas. Mañana empieza mejor.' },
      team: { pt: 'Suas gorjetas foram 40% maiores — e distribuídas de forma justa.', en: 'Your tips were 40% higher — and fairly distributed.', es: 'Tus propinas fueron 40% mayores — y distribuidas de forma justa.' },
    },
  },
];

// ─── QUICK SERVICE ───
const QUICK_SERVICE_ACTS: TurnoAct[] = [
  {
    id: 'act1', timeRange: '11:00 – 11:30',
    title: { pt: 'Fila zero', en: 'Zero queue', es: 'Fila cero' },
    subtitle: { pt: 'Pré-pedido', en: 'Pre-order', es: 'Pre-pedido' },
    emotion: { pt: 'Rapidez + Controle', en: 'Speed + Control', es: 'Rapidez + Control' },
    woowEffect: { pt: 'Pediu antes, retirou sem esperar', en: 'Ordered ahead, picked up without waiting', es: 'Pidió antes, retiró sin esperar' },
    clientScreens: [
      { id: 'c1-skip', icon: 'zap', label: { pt: 'Skip the Line', en: 'Skip the Line', es: 'Salta la Fila' }, description: { pt: 'Pede e retira sem fila', en: 'Order and pick up without queue', es: 'Pide y retira sin fila' } },
      { id: 'c1-combo', icon: 'utensils-crossed', label: { pt: 'Combos inteligentes', en: 'Smart combos', es: 'Combos inteligentes' }, description: { pt: 'Montados baseado no histórico', en: 'Built based on history', es: 'Montados basado en historial' } },
    ],
    restaurantScreens: [
      { id: 'r1-flow', icon: 'bar-chart-3', label: { pt: 'Fluxo de preparo', en: 'Prep flow', es: 'Flujo de preparo' }, description: { pt: 'Pedidos escalonados por horário', en: 'Orders staggered by time', es: 'Pedidos escalonados por horario' } },
      { id: 'r1-stock', icon: 'package', label: { pt: 'Estoque vivo', en: 'Live stock', es: 'Stock en vivo' }, description: { pt: 'Previsão de consumo por hora', en: 'Consumption forecast per hour', es: 'Previsión de consumo por hora' } },
    ],
    events: [
      { id: 'e1-1', time: '11:10', icon: 'zap', urgency: 'info', clientView: { pt: 'Fez pedido pelo app no caminho', en: 'Ordered via app on the way', es: 'Hizo pedido por app en el camino' }, restaurantView: { pt: 'Pedido escalonado — pronto às 11:20', en: 'Staggered order — ready at 11:20', es: 'Pedido escalonado — listo a las 11:20' }, resolution: { pt: 'Zero espera no balcão', en: 'Zero wait at counter', es: 'Cero espera en mostrador' } },
    ],
    metrics: [
      { id: 'm1-1', icon: 'timer', label: { pt: 'Tempo na fila', en: 'Queue time', es: 'Tiempo en fila' }, without: { pt: '12 min', en: '12 min', es: '12 min' }, withNoowe: { pt: '0 min', en: '0 min', es: '0 min' } },
      { id: 'm1-2', icon: 'smartphone', label: { pt: 'Pedidos digitais', en: 'Digital orders', es: 'Pedidos digitales' }, without: { pt: '5%', en: '5%', es: '5%' }, withNoowe: { pt: '60%', en: '60%', es: '60%' } },
    ],
    narration: {
      owner: { pt: '60% dos pedidos chegam antes do cliente — seu pico flui.', en: '60% of orders arrive before the customer — your peak flows.', es: '60% de los pedidos llegan antes del cliente — tu pico fluye.' },
      manager: { pt: 'A fila do balcão sumiu — pedidos são escalonados pelo sistema.', en: 'The counter queue vanished — orders are staggered by the system.', es: 'La fila del mostrador desapareció — pedidos escalonados por el sistema.' },
      team: { pt: 'Você monta no ritmo certo — sem pressão de fila.', en: 'You prep at the right pace — no queue pressure.', es: 'Preparas al ritmo correcto — sin presión de fila.' },
    },
  },
  {
    id: 'act2', timeRange: '11:30 – 12:30',
    title: { pt: 'Rush do almoço', en: 'Lunch rush', es: 'Rush del almuerzo' },
    subtitle: { pt: 'Volume Máximo', en: 'Max Volume', es: 'Volumen Máximo' },
    emotion: { pt: 'Intensidade + Eficiência', en: 'Intensity + Efficiency', es: 'Intensidad + Eficiencia' },
    woowEffect: { pt: '200 pedidos/hora sem erro', en: '200 orders/hour with zero errors', es: '200 pedidos/hora sin error' },
    clientScreens: [
      { id: 'c2-track', icon: 'map-pin', label: { pt: 'Rastreio em tempo real', en: 'Real-time tracking', es: 'Rastreo en tiempo real' }, description: { pt: 'Sabe exatamente quando buscar', en: 'Knows exactly when to pick up', es: 'Sabe exactamente cuándo buscar' } },
      { id: 'c2-custom', icon: '🎨', label: { pt: 'Personalização total', en: 'Full customization', es: 'Personalización total' }, description: { pt: 'Extras, remoções, quantidade', en: 'Extras, removals, quantity', es: 'Extras, remociones, cantidad' } },
    ],
    restaurantScreens: [
      { id: 'r2-kds', icon: 'monitor', label: { pt: 'KDS multi-estação', en: 'Multi-station KDS', es: 'KDS multi-estación' }, description: { pt: 'Cada estação vê seu pedido', en: 'Each station sees its orders', es: 'Cada estación ve sus pedidos' } },
      { id: 'r2-perf', icon: 'bar-chart-3', label: { pt: 'Painel de performance', en: 'Performance dashboard', es: 'Panel de rendimiento' }, description: { pt: 'Tempo médio por pedido ao vivo', en: 'Live average time per order', es: 'Tiempo medio por pedido en vivo' } },
    ],
    events: [
      { id: 'e2-1', time: '11:45', icon: 'alert-circle', urgency: 'critical', clientView: { pt: 'Pedido customizado enviado', en: 'Customized order sent', es: 'Pedido personalizado enviado' }, restaurantView: { pt: '15 pedidos simultâneos no KDS', en: '15 simultaneous orders on KDS', es: '15 pedidos simultáneos en KDS' }, resolution: { pt: 'Todos saíram em menos de 5 min', en: 'All completed in under 5 min', es: 'Todos salieron en menos de 5 min' } },
      { id: 'e2-2', time: '12:10', icon: 'package', urgency: 'warning', clientView: { pt: '—', en: '—', es: '—' }, restaurantView: { pt: 'Alerta: batata frita abaixo do mínimo', en: 'Alert: fries below minimum stock', es: 'Alerta: papas fritas bajo mínimo' }, resolution: { pt: 'Reposição automática acionada', en: 'Auto restock triggered', es: 'Reposición automática activada' } },
    ],
    metrics: [
      { id: 'm2-1', icon: 'timer', label: { pt: 'Tempo médio', en: 'Avg time', es: 'Tiempo medio' }, without: { pt: '8 min', en: '8 min', es: '8 min' }, withNoowe: { pt: '3.5 min', en: '3.5 min', es: '3.5 min' } },
      { id: 'm2-2', icon: 'x-circle', label: { pt: 'Erros de pedido', en: 'Order errors', es: 'Errores de pedido' }, without: { pt: '15%', en: '15%', es: '15%' }, withNoowe: { pt: '0.5%', en: '0.5%', es: '0.5%' } },
    ],
    narration: {
      owner: { pt: 'Dobrou o volume sem dobrar a equipe.', en: 'Doubled volume without doubling staff.', es: 'Duplicó volumen sin duplicar equipo.' },
      manager: { pt: 'Dashboard mostra tudo em tempo real — sem surpresas.', en: 'Dashboard shows everything in real-time — no surprises.', es: 'Dashboard muestra todo en tiempo real — sin sorpresas.' },
      team: { pt: 'KDS organiza sua estação — você foca em executar.', en: 'KDS organizes your station — you focus on executing.', es: 'KDS organiza tu estación — tú enfocas en ejecutar.' },
    },
  },
  {
    id: 'act3', timeRange: '12:30 – 13:30',
    title: { pt: 'Operação fluida', en: 'Smooth operation', es: 'Operación fluida' },
    subtitle: { pt: 'Sustentação', en: 'Sustain', es: 'Sustentación' },
    emotion: { pt: 'Confiança + Ritmo', en: 'Confidence + Rhythm', es: 'Confianza + Ritmo' },
    woowEffect: { pt: 'A máquina não para', en: 'The machine doesn\'t stop', es: 'La máquina no para' },
    clientScreens: [
      { id: 'c3-ready', icon: 'circle-check', label: { pt: 'Pronto para retirada', en: 'Ready for pickup', es: 'Listo para retiro' }, description: { pt: 'Push notification no celular', en: 'Push notification on phone', es: 'Push notification en celular' } },
      { id: 'c3-rate', icon: 'star', label: { pt: 'Avalie seu pedido', en: 'Rate your order', es: 'Evalúe su pedido' }, description: { pt: 'Feedback em 2 toques', en: 'Feedback in 2 taps', es: 'Feedback en 2 toques' } },
    ],
    restaurantScreens: [
      { id: 'r3-pickup', icon: 'map-pin', label: { pt: 'Painel de retirada', en: 'Pickup panel', es: 'Panel de retiro' }, description: { pt: 'Pedidos prontos organizados', en: 'Ready orders organized', es: 'Pedidos listos organizados' } },
      { id: 'r3-upsell', icon: 'coins', label: { pt: 'Upsell automático', en: 'Auto upsell', es: 'Upsell automático' }, description: { pt: 'Sugestões no momento certo', en: 'Suggestions at the right time', es: 'Sugerencias en el momento justo' } },
    ],
    events: [
      { id: 'e3-1', time: '12:50', icon: 'circle-check', urgency: 'info', clientView: { pt: 'Recebeu notificação: pedido pronto', en: 'Received notification: order ready', es: 'Recibió notificación: pedido listo' }, restaurantView: { pt: 'Cliente retirou em 30 seg', en: 'Customer picked up in 30 sec', es: 'Cliente retiró en 30 seg' }, resolution: { pt: 'Fluxo sem gargalo', en: 'Flow without bottleneck', es: 'Flujo sin cuello de botella' } },
    ],
    metrics: [
      { id: 'm3-1', icon: 'smartphone', label: { pt: 'Retiradas no prazo', en: 'On-time pickups', es: 'Retiros a tiempo' }, without: { pt: '60%', en: '60%', es: '60%' }, withNoowe: { pt: '97%', en: '97%', es: '97%' } },
      { id: 'm3-2', icon: 'coins', label: { pt: 'Ticket médio', en: 'Average ticket', es: 'Ticket medio' }, without: { pt: 'R$ 28', en: '$5.60', es: '$5.60' }, withNoowe: { pt: 'R$ 38', en: '$7.60', es: '$7.60' } },
    ],
    narration: {
      owner: { pt: 'Ticket médio subiu 35% com sugestões inteligentes.', en: 'Average ticket up 35% with smart suggestions.', es: 'Ticket medio subió 35% con sugerencias inteligentes.' },
      manager: { pt: 'O painel de retirada eliminou a confusão no balcão.', en: 'The pickup panel eliminated counter confusion.', es: 'El panel de retiro eliminó la confusión en el mostrador.' },
      team: { pt: 'Menos gritos, menos confusão, mais eficiência.', en: 'Less shouting, less confusion, more efficiency.', es: 'Menos gritos, menos confusión, más eficiencia.' },
    },
  },
  {
    id: 'act4', timeRange: '13:30 – 14:30',
    title: { pt: 'Delivery integrado', en: 'Integrated delivery', es: 'Delivery integrado' },
    subtitle: { pt: 'Multicanal', en: 'Multichannel', es: 'Multicanal' },
    emotion: { pt: 'Expansão + Escala', en: 'Expansion + Scale', es: 'Expansión + Escala' },
    woowEffect: { pt: 'Balcão e delivery no mesmo KDS', en: 'Counter and delivery on the same KDS', es: 'Mostrador y delivery en el mismo KDS' },
    clientScreens: [
      { id: 'c4-delivery', icon: '🛵', label: { pt: 'Rastreio delivery', en: 'Delivery tracking', es: 'Rastreo delivery' }, description: { pt: 'Do forno à porta em tempo real', en: 'From oven to door in real-time', es: 'Del horno a la puerta en tiempo real' } },
    ],
    restaurantScreens: [
      { id: 'r4-multi', icon: 'smartphone', label: { pt: 'Hub multicanal', en: 'Multichannel hub', es: 'Hub multicanal' }, description: { pt: 'Balcão + delivery + app = 1 tela', en: 'Counter + delivery + app = 1 screen', es: 'Mostrador + delivery + app = 1 pantalla' } },
    ],
    events: [
      { id: 'e4-1', time: '13:45', icon: '🛵', urgency: 'info', clientView: { pt: 'Rastreando delivery ao vivo', en: 'Tracking delivery live', es: 'Rastreando delivery en vivo' }, restaurantView: { pt: 'Delivery e balcão sem conflito', en: 'Delivery and counter without conflict', es: 'Delivery y mostrador sin conflicto' }, resolution: { pt: 'Ambos canais com 100% eficiência', en: 'Both channels at 100% efficiency', es: 'Ambos canales con 100% eficiencia' } },
    ],
    metrics: [
      { id: 'm4-1', icon: '🛵', label: { pt: 'Precisão delivery', en: 'Delivery accuracy', es: 'Precisión delivery' }, without: { pt: '82%', en: '82%', es: '82%' }, withNoowe: { pt: '99%', en: '99%', es: '99%' } },
    ],
    narration: {
      owner: { pt: 'Delivery e balcão operam como uma máquina única.', en: 'Delivery and counter operate as one machine.', es: 'Delivery y mostrador operan como una máquina única.' },
      manager: { pt: 'Um só painel, todas as origens de pedido.', en: 'One panel, all order origins.', es: 'Un solo panel, todos los orígenes de pedido.' },
      team: { pt: 'Sem confusão entre pedidos de balcão e delivery.', en: 'No confusion between counter and delivery orders.', es: 'Sin confusión entre pedidos de mostrador y delivery.' },
    },
  },
  {
    id: 'act5', timeRange: '14:30 – 15:00',
    title: { pt: 'Fechamento inteligente', en: 'Smart closing', es: 'Cierre inteligente' },
    subtitle: { pt: 'Insights', en: 'Insights', es: 'Insights' },
    emotion: { pt: 'Clareza + Otimização', en: 'Clarity + Optimization', es: 'Claridad + Optimización' },
    woowEffect: { pt: 'Dados que otimizam amanhã', en: 'Data that optimizes tomorrow', es: 'Datos que optimizan mañana' },
    clientScreens: [
      { id: 'c5-reward', icon: 'sparkles', label: { pt: 'Recompensa fidelidade', en: 'Loyalty reward', es: 'Recompensa fidelidad' }, description: { pt: 'Cupom para próxima visita', en: 'Coupon for next visit', es: 'Cupón para próxima visita' } },
    ],
    restaurantScreens: [
      { id: 'r5-report', icon: 'bar-chart-3', label: { pt: 'Relatório automático', en: 'Auto report', es: 'Reporte automático' }, description: { pt: 'KPIs do turno prontos', en: 'Shift KPIs ready', es: 'KPIs del turno listos' } },
      { id: 'r5-forecast', icon: '🔮', label: { pt: 'Previsão amanhã', en: 'Tomorrow forecast', es: 'Previsión mañana' }, description: { pt: 'IA sugere prep para amanhã', en: 'AI suggests prep for tomorrow', es: 'IA sugiere prep para mañana' } },
    ],
    events: [
      { id: 'e5-1', time: '14:45', icon: 'bar-chart-3', urgency: 'info', clientView: { pt: 'Recebeu cupom de fidelidade', en: 'Received loyalty coupon', es: 'Recibió cupón de fidelidad' }, restaurantView: { pt: 'Relatório do turno gerado', en: 'Shift report generated', es: 'Reporte del turno generado' }, resolution: { pt: 'Amanhã começa otimizado', en: 'Tomorrow starts optimized', es: 'Mañana empieza optimizado' } },
    ],
    metrics: [
      { id: 'm5-1', icon: 'coins', label: { pt: 'Receita vs ontem', en: 'Revenue vs yesterday', es: 'Ingreso vs ayer' }, without: { pt: 'Sem dados', en: 'No data', es: 'Sin datos' }, withNoowe: { pt: '+22%', en: '+22%', es: '+22%' } },
      { id: 'm5-2', icon: 'package', label: { pt: 'Desperdício', en: 'Waste', es: 'Desperdicio' }, without: { pt: '18%', en: '18%', es: '18%' }, withNoowe: { pt: '4%', en: '4%', es: '4%' } },
    ],
    narration: {
      owner: { pt: 'Cada turno gera dados que aumentam a margem do próximo.', en: 'Each shift generates data that increases the next one\'s margin.', es: 'Cada turno genera datos que aumentan el margen del próximo.' },
      manager: { pt: 'O relatório automatizado te libera para pensar estrategicamente.', en: 'The automated report frees you to think strategically.', es: 'El reporte automatizado te libera para pensar estratégicamente.' },
      team: { pt: 'Menos desperdício = menos reposição = turno mais tranquilo.', en: 'Less waste = less restocking = calmer shift.', es: 'Menos desperdicio = menos reposición = turno más tranquilo.' },
    },
  },
];

// ─── GENERIC FACTORY for remaining models ───
// Creates contextually adapted 5-act simulations for each model

function createModelActs(config: {
  model: string;
  times: string[];
  titles: [SimTranslation, SimTranslation, SimTranslation, SimTranslation, SimTranslation];
  subtitles: [SimTranslation, SimTranslation, SimTranslation, SimTranslation, SimTranslation];
  emotions: [SimTranslation, SimTranslation, SimTranslation, SimTranslation, SimTranslation];
  woowEffects: [SimTranslation, SimTranslation, SimTranslation, SimTranslation, SimTranslation];
  clientScreenSets: { id: string; icon: string; label: SimTranslation; description: SimTranslation }[][];
  restaurantScreenSets: { id: string; icon: string; label: SimTranslation; description: SimTranslation }[][];
  eventSets: { id: string; time: string; icon: string; urgency: 'info' | 'warning' | 'critical'; clientView: SimTranslation; restaurantView: SimTranslation; resolution: SimTranslation }[][];
  metricSets: { id: string; icon: string; label: SimTranslation; without: SimTranslation; withNoowe: SimTranslation; moneyImpact?: number }[][];
  narrations: { owner: SimTranslation; manager: SimTranslation; team: SimTranslation }[];
}): TurnoAct[] {
  return config.times.map((timeRange, i) => ({
    id: `act${i + 1}` as TurnoAct['id'],
    timeRange,
    title: config.titles[i],
    subtitle: config.subtitles[i],
    emotion: config.emotions[i],
    woowEffect: config.woowEffects[i],
    clientScreens: config.clientScreenSets[i] || [],
    restaurantScreens: config.restaurantScreenSets[i] || [],
    events: config.eventSets[i] || [],
    metrics: config.metricSets[i] || [],
    narration: config.narrations[i],
  }));
}

// ─── FAST CASUAL ───
const FAST_CASUAL_ACTS: TurnoAct[] = createModelActs({
  model: 'fast-casual',
  times: ['11:00 – 11:30', '11:30 – 12:30', '12:30 – 13:30', '13:30 – 14:30', '14:30 – 15:00'],
  titles: [
    { pt: 'Montagem personalizada', en: 'Custom assembly', es: 'Montaje personalizado' },
    { pt: 'Linha de montagem', en: 'Assembly line', es: 'Línea de montaje' },
    { pt: 'Pico sustentado', en: 'Sustained peak', es: 'Pico sostenido' },
    { pt: 'Fidelidade ativa', en: 'Active loyalty', es: 'Fidelidad activa' },
    { pt: 'Relatório nutricional', en: 'Nutritional report', es: 'Reporte nutricional' },
  ],
  subtitles: [
    { pt: 'Pré-pedido', en: 'Pre-order', es: 'Pre-pedido' },
    { pt: 'Alto Volume', en: 'High Volume', es: 'Alto Volumen' },
    { pt: 'Eficiência', en: 'Efficiency', es: 'Eficiencia' },
    { pt: 'Engajamento', en: 'Engagement', es: 'Engagement' },
    { pt: 'Insights', en: 'Insights', es: 'Insights' },
  ],
  emotions: [
    { pt: 'Curiosidade + Controle', en: 'Curiosity + Control', es: 'Curiosidad + Control' },
    { pt: 'Energia + Fluxo', en: 'Energy + Flow', es: 'Energía + Flujo' },
    { pt: 'Ritmo + Confiança', en: 'Rhythm + Confidence', es: 'Ritmo + Confianza' },
    { pt: 'Conexão + Valor', en: 'Connection + Value', es: 'Conexión + Valor' },
    { pt: 'Clareza + Saúde', en: 'Clarity + Health', es: 'Claridad + Salud' },
  ],
  woowEffects: [
    { pt: 'Monte antes, retire rápido', en: 'Build ahead, pick up fast', es: 'Monta antes, retira rápido' },
    { pt: 'Volume alto com personalização', en: 'High volume with customization', es: 'Volumen alto con personalización' },
    { pt: 'Eficiência sem perder alma', en: 'Efficiency without losing soul', es: 'Eficiencia sin perder alma' },
    { pt: 'Cada pedido constrói relação', en: 'Every order builds relationship', es: 'Cada pedido construye relación' },
    { pt: 'Dados que nutrem decisões', en: 'Data that nourishes decisions', es: 'Datos que nutren decisiones' },
  ],
  clientScreenSets: [
    [{ id: 'c1-build', icon: 'leaf', label: { pt: 'Monte seu bowl', en: 'Build your bowl', es: 'Monta tu bowl' }, description: { pt: 'Base, proteína, toppings', en: 'Base, protein, toppings', es: 'Base, proteína, toppings' } }],
    [{ id: 'c2-track', icon: 'map-pin', label: { pt: 'Rastreio ao vivo', en: 'Live tracking', es: 'Rastreo en vivo' }, description: { pt: 'Veja seu pedido ser montado', en: 'Watch your order being built', es: 'Vea su pedido ser montado' } }],
    [{ id: 'c3-nutri', icon: 'bar-chart-3', label: { pt: 'Info nutricional', en: 'Nutritional info', es: 'Info nutricional' }, description: { pt: 'Calorias e macros em tempo real', en: 'Calories and macros in real-time', es: 'Calorías y macros en tiempo real' } }],
    [{ id: 'c4-rewards', icon: 'sparkles', label: { pt: 'Recompensas', en: 'Rewards', es: 'Recompensas' }, description: { pt: 'Acumule a cada pedido', en: 'Earn with every order', es: 'Acumula con cada pedido' } }],
    [{ id: 'c5-history', icon: 'clipboard-list', label: { pt: 'Histórico saudável', en: 'Healthy history', es: 'Historial saludable' }, description: { pt: 'Resumo nutricional do mês', en: 'Monthly nutritional summary', es: 'Resumen nutricional del mes' } }],
  ],
  restaurantScreenSets: [
    [{ id: 'r1-line', icon: 'refresh-cw', label: { pt: 'Linha de montagem', en: 'Assembly line', es: 'Línea de montaje' }, description: { pt: 'Fluxo otimizado por estação', en: 'Flow optimized per station', es: 'Flujo optimizado por estación' } }],
    [{ id: 'r2-kds', icon: 'monitor', label: { pt: 'KDS inteligente', en: 'Smart KDS', es: 'KDS inteligente' }, description: { pt: 'Pedidos agrupados por base', en: 'Orders grouped by base', es: 'Pedidos agrupados por base' } }],
    [{ id: 'r3-perf', icon: 'bar-chart-3', label: { pt: 'Performance ao vivo', en: 'Live performance', es: 'Rendimiento en vivo' }, description: { pt: 'Tempo por pedido em tempo real', en: 'Time per order in real-time', es: 'Tiempo por pedido en tiempo real' } }],
    [{ id: 'r4-stock', icon: 'package', label: { pt: 'Stock inteligente', en: 'Smart stock', es: 'Stock inteligente' }, description: { pt: 'Previsão de ingredientes', en: 'Ingredient forecasting', es: 'Previsión de ingredientes' } }],
    [{ id: 'r5-report', icon: 'bar-chart-3', label: { pt: 'Relatório do turno', en: 'Shift report', es: 'Reporte del turno' }, description: { pt: 'KPIs + desperdício + tendências', en: 'KPIs + waste + trends', es: 'KPIs + desperdicio + tendencias' } }],
  ],
  eventSets: [
    [{ id: 'e1-1', time: '11:15', icon: 'leaf', urgency: 'info', clientView: { pt: 'Montou bowl personalizado', en: 'Built custom bowl', es: 'Montó bowl personalizado' }, restaurantView: { pt: 'Pedido na fila da linha', en: 'Order in line queue', es: 'Pedido en fila de línea' }, resolution: { pt: 'Pronto em 3 min', en: 'Ready in 3 min', es: 'Listo en 3 min' } }],
    [{ id: 'e2-1', time: '12:00', icon: 'alert-circle', urgency: 'critical', clientView: { pt: '20 pedidos simultâneos', en: '20 simultaneous orders', es: '20 pedidos simultáneos' }, restaurantView: { pt: 'KDS redistribuiu por estação', en: 'KDS redistributed by station', es: 'KDS redistribuyó por estación' }, resolution: { pt: 'Tempo médio manteve em 4 min', en: 'Avg time held at 4 min', es: 'Tiempo medio se mantuvo en 4 min' } }],
    [{ id: 'e3-1', time: '13:00', icon: 'bar-chart-3', urgency: 'info', clientView: { pt: 'Viu calorias do pedido: 520kcal', en: 'Saw order calories: 520kcal', es: 'Vio calorías del pedido: 520kcal' }, restaurantView: { pt: 'Tendência: bowls low-carb +40%', en: 'Trend: low-carb bowls +40%', es: 'Tendencia: bowls low-carb +40%' }, resolution: { pt: 'Insight para ajuste de menu', en: 'Insight for menu adjustment', es: 'Insight para ajuste de menú' } }],
    [{ id: 'e4-1', time: '13:50', icon: 'sparkles', urgency: 'info', clientView: { pt: 'Acumulou bowl grátis', en: 'Earned free bowl', es: 'Acumuló bowl gratis' }, restaurantView: { pt: 'Cliente retorna pela 5ª vez', en: 'Customer returning 5th time', es: 'Cliente retorna por 5ª vez' }, resolution: { pt: 'LTV subiu 280%', en: 'LTV up 280%', es: 'LTV subió 280%' } }],
    [{ id: 'e5-1', time: '14:40', icon: 'bar-chart-3', urgency: 'info', clientView: { pt: 'Recebeu resumo nutricional', en: 'Received nutritional summary', es: 'Recibió resumen nutricional' }, restaurantView: { pt: 'Relatório gerado automaticamente', en: 'Report auto-generated', es: 'Reporte generado automáticamente' }, resolution: { pt: 'Decisões baseadas em dados reais', en: 'Decisions based on real data', es: 'Decisiones basadas en datos reales' } }],
  ],
  metricSets: [
    [{ id: 'm1-1', icon: 'timer', label: { pt: 'Montagem', en: 'Assembly', es: 'Montaje' }, without: { pt: '6 min', en: '6 min', es: '6 min' }, withNoowe: { pt: '3 min', en: '3 min', es: '3 min' } }],
    [{ id: 'm2-1', icon: 'smartphone', label: { pt: 'Pedidos digitais', en: 'Digital orders', es: 'Pedidos digitales' }, without: { pt: '10%', en: '10%', es: '10%' }, withNoowe: { pt: '70%', en: '70%', es: '70%' } }],
    [{ id: 'm3-1', icon: 'coins', label: { pt: 'Ticket médio', en: 'Avg ticket', es: 'Ticket medio' }, without: { pt: 'R$ 32', en: '$6.40', es: '$6.40' }, withNoowe: { pt: 'R$ 42', en: '$8.40', es: '$8.40' } }],
    [{ id: 'm4-1', icon: 'refresh-cw', label: { pt: 'Retorno 30d', en: '30d return', es: 'Retorno 30d' }, without: { pt: '18%', en: '18%', es: '18%' }, withNoowe: { pt: '52%', en: '52%', es: '52%' } }],
    [{ id: 'm5-1', icon: 'package', label: { pt: 'Desperdício', en: 'Waste', es: 'Desperdicio' }, without: { pt: '22%', en: '22%', es: '22%' }, withNoowe: { pt: '5%', en: '5%', es: '5%' } }],
  ],
  narrations: [
    { owner: { pt: 'Personalização em escala — cada pedido é único sem perder velocidade.', en: 'Customization at scale — every order is unique without losing speed.', es: 'Personalización a escala — cada pedido es único sin perder velocidad.' }, manager: { pt: 'A linha de montagem digital elimina gargalos.', en: 'The digital assembly line eliminates bottlenecks.', es: 'La línea de montaje digital elimina cuellos de botella.' }, team: { pt: 'Você monta no ritmo certo — o sistema organiza a fila.', en: 'You build at the right pace — the system organizes the queue.', es: 'Montas al ritmo correcto — el sistema organiza la fila.' } },
    { owner: { pt: 'Alto volume com personalização — o sonho do fast casual.', en: 'High volume with customization — the fast casual dream.', es: 'Alto volumen con personalización — el sueño del fast casual.' }, manager: { pt: 'KDS agrupa pedidos similares para máxima eficiência.', en: 'KDS groups similar orders for maximum efficiency.', es: 'KDS agrupa pedidos similares para máxima eficiencia.' }, team: { pt: 'Sem estresse — cada estação sabe o que fazer.', en: 'No stress — each station knows what to do.', es: 'Sin estrés — cada estación sabe qué hacer.' } },
    { owner: { pt: 'Dados de nutrição atraem um público premium.', en: 'Nutrition data attracts a premium audience.', es: 'Datos de nutrición atraen un público premium.' }, manager: { pt: 'Tendências de consumo em tempo real guiam o menu.', en: 'Real-time consumption trends guide the menu.', es: 'Tendencias de consumo en tiempo real guían el menú.' }, team: { pt: 'Menos perguntas sobre ingredientes — está tudo no app.', en: 'Fewer ingredient questions — it\'s all in the app.', es: 'Menos preguntas sobre ingredientes — todo está en la app.' } },
    { owner: { pt: 'O programa de fidelidade roda sozinho e aumenta LTV.', en: 'The loyalty program runs itself and increases LTV.', es: 'El programa de fidelidad corre solo y aumenta LTV.' }, manager: { pt: 'Stock inteligente elimina desperdício e falta de ingredientes.', en: 'Smart stock eliminates waste and ingredient shortages.', es: 'Stock inteligente elimina desperdicio y falta de ingredientes.' }, team: { pt: 'Clientes fiéis são mais gentis e dão mais gorjeta.', en: 'Loyal customers are kinder and tip more.', es: 'Clientes fieles son más amables y dan más propina.' } },
    { owner: { pt: 'Desperdício caiu 77% — isso vai direto para margem.', en: 'Waste dropped 77% — that goes straight to margin.', es: 'Desperdicio cayó 77% — eso va directo al margen.' }, manager: { pt: 'Relatório pronto antes de sair — amanhã já está planejado.', en: 'Report ready before leaving — tomorrow is already planned.', es: 'Reporte listo antes de salir — mañana ya está planeado.' }, team: { pt: 'Seu turno termina no horário — sem ficar contando estoque.', en: 'Your shift ends on time — no stock counting.', es: 'Tu turno termina a tiempo — sin contar stock.' } },
  ],
});

// For remaining 7 models, create compact but unique acts
function buildSimpleActs(cfg: {
  times: string[];
  titlesPt: string[]; titlesEn: string[]; titlesEs: string[];
  subtitlesPt: string[]; subtitlesEn: string[]; subtitlesEs: string[];
  emotionsPt: string[]; emotionsEn: string[]; emotionsEs: string[];
  woowPt: string[]; woowEn: string[]; woowEs: string[];
  narrationOwnerPt: string[]; narrationOwnerEn: string[]; narrationOwnerEs: string[];
  narrationManagerPt: string[]; narrationManagerEn: string[]; narrationManagerEs: string[];
  narrationTeamPt: string[]; narrationTeamEn: string[]; narrationTeamEs: string[];
  clientScreens: { id: string; icon: string; lPt: string; lEn: string; lEs: string; dPt: string; dEn: string; dEs: string }[][];
  restaurantScreens: { id: string; icon: string; lPt: string; lEn: string; lEs: string; dPt: string; dEn: string; dEs: string }[][];
  events: { id: string; time: string; icon: string; urgency: 'info'|'warning'|'critical'; cPt: string; cEn: string; cEs: string; rPt: string; rEn: string; rEs: string; resPt: string; resEn: string; resEs: string }[][];
  metrics: { id: string; icon: string; lPt: string; lEn: string; lEs: string; woPt: string; woEn: string; woEs: string; wPt: string; wEn: string; wEs: string; money?: number }[][];
}): TurnoAct[] {
  return cfg.times.map((t, i) => ({
    id: `act${i+1}` as TurnoAct['id'],
    timeRange: t,
    title: { pt: cfg.titlesPt[i], en: cfg.titlesEn[i], es: cfg.titlesEs[i] },
    subtitle: { pt: cfg.subtitlesPt[i], en: cfg.subtitlesEn[i], es: cfg.subtitlesEs[i] },
    emotion: { pt: cfg.emotionsPt[i], en: cfg.emotionsEn[i], es: cfg.emotionsEs[i] },
    woowEffect: { pt: cfg.woowPt[i], en: cfg.woowEn[i], es: cfg.woowEs[i] },
    clientScreens: (cfg.clientScreens[i] || []).map(s => ({ id: s.id, icon: s.icon, label: { pt: s.lPt, en: s.lEn, es: s.lEs }, description: { pt: s.dPt, en: s.dEn, es: s.dEs } })),
    restaurantScreens: (cfg.restaurantScreens[i] || []).map(s => ({ id: s.id, icon: s.icon, label: { pt: s.lPt, en: s.lEn, es: s.lEs }, description: { pt: s.dPt, en: s.dEn, es: s.dEs } })),
    events: (cfg.events[i] || []).map(e => ({ id: e.id, time: e.time, icon: e.icon, urgency: e.urgency, clientView: { pt: e.cPt, en: e.cEn, es: e.cEs }, restaurantView: { pt: e.rPt, en: e.rEn, es: e.rEs }, resolution: { pt: e.resPt, en: e.resEn, es: e.resEs } })),
    metrics: (cfg.metrics[i] || []).map(m => ({ id: m.id, icon: m.icon, label: { pt: m.lPt, en: m.lEn, es: m.lEs }, without: { pt: m.woPt, en: m.woEn, es: m.woEs }, withNoowe: { pt: m.wPt, en: m.wEn, es: m.wEs }, ...(m.money ? { moneyImpact: m.money } : {}) })),
    narration: { owner: { pt: cfg.narrationOwnerPt[i], en: cfg.narrationOwnerEn[i], es: cfg.narrationOwnerEs[i] }, manager: { pt: cfg.narrationManagerPt[i], en: cfg.narrationManagerEn[i], es: cfg.narrationManagerEs[i] }, team: { pt: cfg.narrationTeamPt[i], en: cfg.narrationTeamEn[i], es: cfg.narrationTeamEs[i] } },
  }));
}

// ─── DRIVE-THRU ───
const DRIVE_THRU_ACTS = buildSimpleActs({
  times: ['06:00 – 07:00', '07:00 – 09:00', '09:00 – 11:00', '11:00 – 13:00', '13:00 – 14:00'],
  titlesPt: ['Abertura matinal', 'Rush do café', 'Velocidade constante', 'Rush do almoço', 'Análise de fluxo'],
  titlesEn: ['Morning opening', 'Coffee rush', 'Constant speed', 'Lunch rush', 'Flow analysis'],
  titlesEs: ['Apertura matinal', 'Rush del café', 'Velocidad constante', 'Rush del almuerzo', 'Análisis de flujo'],
  subtitlesPt: ['Prep', 'Pico', 'Fluxo', 'Volume', 'Dados'],
  subtitlesEn: ['Prep', 'Peak', 'Flow', 'Volume', 'Data'],
  subtitlesEs: ['Prep', 'Pico', 'Flujo', 'Volumen', 'Datos'],
  emotionsPt: ['Foco + Agilidade', 'Adrenalina + Precisão', 'Ritmo + Confiança', 'Intensidade máxima', 'Clareza + Otimização'],
  emotionsEn: ['Focus + Agility', 'Adrenaline + Precision', 'Rhythm + Confidence', 'Maximum intensity', 'Clarity + Optimization'],
  emotionsEs: ['Foco + Agilidad', 'Adrenalina + Precisión', 'Ritmo + Confianza', 'Intensidad máxima', 'Claridad + Optimización'],
  woowPt: ['Pista pronta antes de abrir', 'Zero erro no pico', 'Fluxo sem parar', '2 pistas simultâneas', 'Dados por carro'],
  woowEn: ['Lane ready before opening', 'Zero errors at peak', 'Non-stop flow', '2 simultaneous lanes', 'Data per car'],
  woowEs: ['Pista lista antes de abrir', 'Cero error en pico', 'Flujo sin parar', '2 pistas simultáneas', 'Datos por carro'],
  narrationOwnerPt: ['A pista já funciona antes do primeiro carro.', 'Zero erros = zero desperdício = mais margem.', 'O ritmo constante sustenta a receita.', '2 pistas operam como uma só — com o dobro de capacidade.', 'Cada carro gera dados que otimizam amanhã.'],
  narrationOwnerEn: ['The lane works before the first car.', 'Zero errors = zero waste = more margin.', 'Constant rhythm sustains revenue.', '2 lanes operate as one — with double capacity.', 'Every car generates data that optimizes tomorrow.'],
  narrationOwnerEs: ['La pista funciona antes del primer carro.', 'Cero errores = cero desperdicio = más margen.', 'El ritmo constante sostiene el ingreso.', '2 pistas operan como una — con el doble de capacidad.', 'Cada carro genera datos que optimizan mañana.'],
  narrationManagerPt: ['Dashboard mostra todas as estações prontas.', 'Painel mostra tempo por carro ao vivo.', 'Estoque é monitorado em tempo real.', 'Ambas as pistas coordenadas por um só KDS.', 'Relatório do turno pronto em 0 segundos.'],
  narrationManagerEn: ['Dashboard shows all stations ready.', 'Panel shows time per car live.', 'Stock is monitored in real-time.', 'Both lanes coordinated by one KDS.', 'Shift report ready in 0 seconds.'],
  narrationManagerEs: ['Dashboard muestra todas las estaciones listas.', 'Panel muestra tiempo por carro en vivo.', 'Stock es monitoreado en tiempo real.', 'Ambas pistas coordinadas por un solo KDS.', 'Reporte del turno listo en 0 segundos.'],
  narrationTeamPt: ['Tudo organizado antes de começar.', 'O headset te guia — sem decorar pedido.', 'Ritmo constante — sem pico de estresse.', 'O sistema separa os pedidos — você só monta.', 'Turno acaba no horário — sem contar gaveta.'],
  narrationTeamEn: ['Everything organized before starting.', 'The headset guides you — no memorizing orders.', 'Constant rhythm — no stress peaks.', 'The system separates orders — you just assemble.', 'Shift ends on time — no cash counting.'],
  narrationTeamEs: ['Todo organizado antes de empezar.', 'El headset te guía — sin memorizar pedidos.', 'Ritmo constante — sin picos de estrés.', 'El sistema separa pedidos — tú solo montas.', 'Turno termina a tiempo — sin contar caja.'],
  clientScreens: [
    [{ id: 'c1-1', icon: 'smartphone', lPt: 'Pedido antecipado', lEn: 'Advance order', lEs: 'Pedido anticipado', dPt: 'Pede pelo app no caminho', dEn: 'Order via app on the way', dEs: 'Pide por app en el camino' }],
    [{ id: 'c2-1', icon: 'zap', lPt: 'Pista expressa', lEn: 'Express lane', lEs: 'Pista expresa', dPt: 'Pista dedicada para app', dEn: 'Dedicated lane for app', dEs: 'Pista dedicada para app' }],
    [{ id: 'c3-1', icon: 'map-pin', lPt: 'Rastreio na pista', lEn: 'Lane tracking', lEs: 'Rastreo en pista', dPt: 'Sabe quantos carros faltam', dEn: 'Knows how many cars ahead', dEs: 'Sabe cuántos carros faltan' }],
    [{ id: 'c4-1', icon: 'sparkles', lPt: 'Combo sugerido', lEn: 'Suggested combo', lEs: 'Combo sugerido', dPt: 'IA sugere baseado no histórico', dEn: 'AI suggests based on history', dEs: 'IA sugiere basado en historial' }],
    [{ id: 'c5-1', icon: 'star', lPt: 'Avaliação rápida', lEn: 'Quick rating', lEs: 'Evaluación rápida', dPt: '1 toque para avaliar', dEn: '1 tap to rate', dEs: '1 toque para evaluar' }],
  ],
  restaurantScreens: [
    [{ id: 'r1-1', icon: 'monitor', lPt: 'Dashboard de pista', lEn: 'Lane dashboard', lEs: 'Dashboard de pista', dPt: 'Visão de todos os pedidos', dEn: 'View of all orders', dEs: 'Visión de todos los pedidos' }],
    [{ id: 'r2-1', icon: 'timer', lPt: 'Timer por carro', lEn: 'Timer per car', lEs: 'Timer por carro', dPt: 'Meta: 90 seg por carro', dEn: 'Target: 90 sec per car', dEs: 'Meta: 90 seg por carro' }],
    [{ id: 'r3-1', icon: 'package', lPt: 'Estoque preditivo', lEn: 'Predictive stock', lEs: 'Stock predictivo', dPt: 'Reposição antes de acabar', dEn: 'Restock before running out', dEs: 'Reposición antes de acabar' }],
    [{ id: 'r4-1', icon: 'monitor', lPt: 'KDS dual-lane', lEn: 'Dual-lane KDS', lEs: 'KDS dual-pista', dPt: '2 pistas no mesmo painel', dEn: '2 lanes on same panel', dEs: '2 pistas en mismo panel' }],
    [{ id: 'r5-1', icon: 'bar-chart-3', lPt: 'Analytics de fluxo', lEn: 'Flow analytics', lEs: 'Analytics de flujo', dPt: 'Tempo médio, pico, gargalos', dEn: 'Avg time, peak, bottlenecks', dEs: 'Tiempo medio, pico, cuellos' }],
  ],
  events: [
    [{ id: 'e1-1', time: '06:30', icon: 'smartphone', urgency: 'info', cPt: 'Fez pedido pelo app', cEn: 'Ordered via app', cEs: 'Hizo pedido por app', rPt: 'Pedido escalonado no KDS', rEn: 'Staggered order on KDS', rEs: 'Pedido escalonado en KDS', resPt: 'Pronto na chegada', resEn: 'Ready on arrival', resEs: 'Listo al llegar' }],
    [{ id: 'e2-1', time: '07:30', icon: 'alert-circle', urgency: 'critical', cPt: '30 carros na fila', cEn: '30 cars in queue', cEs: '30 carros en fila', rPt: 'Sistema redistribuiu para 2 pistas', rEn: 'System redistributed to 2 lanes', rEs: 'Sistema redistribuyó a 2 pistas', resPt: 'Tempo mantido em 90 seg', resEn: 'Time held at 90 sec', resEs: 'Tiempo mantenido en 90 seg' }],
    [{ id: 'e3-1', time: '09:30', icon: 'package', urgency: 'warning', cPt: '—', cEn: '—', cEs: '—', rPt: 'Alerta: copos P acabando', rEn: 'Alert: small cups running out', rEs: 'Alerta: vasos P acabando', resPt: 'Reposição automática acionada', resEn: 'Auto restock triggered', resEs: 'Reposición automática activada' }],
    [{ id: 'e4-1', time: '11:30', icon: 'utensils-crossed', urgency: 'info', cPt: 'Aceitou combo sugerido', cEn: 'Accepted suggested combo', cEs: 'Aceptó combo sugerido', rPt: 'Ticket médio +R$8', rEn: 'Avg ticket +$1.60', rEs: 'Ticket medio +$1.60', resPt: 'Upsell automático', resEn: 'Automatic upsell', resEs: 'Upsell automático' }],
    [{ id: 'e5-1', time: '13:30', icon: 'bar-chart-3', urgency: 'info', cPt: 'Avaliou experiência', cEn: 'Rated experience', cEs: 'Evaluó experiencia', rPt: 'Relatório fechado automaticamente', rEn: 'Report closed automatically', rEs: 'Reporte cerrado automáticamente', resPt: 'Insights prontos para amanhã', resEn: 'Insights ready for tomorrow', resEs: 'Insights listos para mañana' }],
  ],
  metrics: [
    [{ id: 'm1-1', icon: 'timer', lPt: 'Tempo por carro', lEn: 'Time per car', lEs: 'Tiempo por carro', woPt: '4 min', woEn: '4 min', woEs: '4 min', wPt: '90 seg', wEn: '90 sec', wEs: '90 seg' }],
    [{ id: 'm2-1', icon: 'x-circle', lPt: 'Erros de pedido', lEn: 'Order errors', lEs: 'Errores de pedido', woPt: '12%', woEn: '12%', woEs: '12%', wPt: '0.8%', wEn: '0.8%', wEs: '0.8%' }],
    [{ id: 'm3-1', icon: 'package', lPt: 'Rupturas de estoque', lEn: 'Stockouts', lEs: 'Rupturas de stock', woPt: '3/turno', woEn: '3/shift', woEs: '3/turno', wPt: '0', wEn: '0', wEs: '0' }],
    [{ id: 'm4-1', icon: 'coins', lPt: 'Ticket médio', lEn: 'Avg ticket', lEs: 'Ticket medio', woPt: 'R$ 22', woEn: '$4.40', woEs: '$4.40', wPt: 'R$ 30', wEn: '$6.00', wEs: '$6.00' }],
    [{ id: 'm5-1', icon: 'bar-chart-3', lPt: 'Carros/hora', lEn: 'Cars/hour', lEs: 'Carros/hora', woPt: '35', woEn: '35', woEs: '35', wPt: '55', wEn: '55', wEs: '55' }],
  ],
});

// ─── CAFÉ & BAKERY ───
const CAFE_BAKERY_ACTS = buildSimpleActs({
  times: ['07:00 – 08:00', '08:00 – 10:00', '10:00 – 12:00', '12:00 – 14:00', '14:00 – 15:00'],
  titlesPt: ['Primeira xícara', 'Rush da manhã', 'Modo trabalho', 'Almoço leve', 'Fechamento'],
  titlesEn: ['First cup', 'Morning rush', 'Work mode', 'Light lunch', 'Closing'],
  titlesEs: ['Primera taza', 'Rush matinal', 'Modo trabajo', 'Almuerzo ligero', 'Cierre'],
  subtitlesPt: ['Abertura', 'Pico', 'Produtividade', 'Transição', 'Relatório'],
  subtitlesEn: ['Opening', 'Peak', 'Productivity', 'Transition', 'Report'],
  subtitlesEs: ['Apertura', 'Pico', 'Productividad', 'Transición', 'Reporte'],
  emotionsPt: ['Acolhimento', 'Energia + Fluxo', 'Foco + Conforto', 'Versatilidade', 'Satisfação'],
  emotionsEn: ['Warmth', 'Energy + Flow', 'Focus + Comfort', 'Versatility', 'Satisfaction'],
  emotionsEs: ['Acogida', 'Energía + Flujo', 'Foco + Confort', 'Versatilidad', 'Satisfacción'],
  woowPt: ['Pedido recorrente automático', 'Zero fila com pré-pedido', 'Wi-Fi + refil inteligente', 'Menu se adapta ao horário', 'Dados que aquecem decisões'],
  woowEn: ['Auto recurring order', 'Zero queue with pre-order', 'Wi-Fi + smart refill', 'Menu adapts to time', 'Data that warms decisions'],
  woowEs: ['Pedido recurrente automático', 'Cero fila con pre-pedido', 'Wi-Fi + refil inteligente', 'Menú se adapta al horario', 'Datos que calientan decisiones'],
  narrationOwnerPt: ['Clientes recorrentes pedem antes de chegar — sua receita é previsível.', 'O rush flui sem gargalos — mais clientes, mesma equipe.', 'O modo trabalho aumenta o tempo de permanência e consumo.', 'O menu se adapta automaticamente — sem perder item em estoque.', 'Cada turno gera dados que otimizam o próximo.'],
  narrationOwnerEn: ['Recurring customers order before arriving — your revenue is predictable.', 'Rush flows without bottlenecks — more customers, same team.', 'Work mode increases dwell time and consumption.', 'Menu adapts automatically — no stock waste.', 'Each shift generates data that optimizes the next.'],
  narrationOwnerEs: ['Clientes recurrentes piden antes de llegar — tu ingreso es previsible.', 'El rush fluye sin cuellos de botella — más clientes, mismo equipo.', 'El modo trabajo aumenta el tiempo de permanencia y consumo.', 'El menú se adapta automáticamente — sin perder stock.', 'Cada turno genera datos que optimizan el próximo.'],
  narrationManagerPt: ['Dashboard mostra pedidos recorrentes já na fila.', 'Barista vê o próximo pedido antes do cliente chegar.', 'Alertas de refil inteligentes — cliente nunca espera.', 'A transição almoço/café acontece sem interrupção.', 'Relatório mostra itens mais vendidos por horário.'],
  narrationManagerEn: ['Dashboard shows recurring orders already queued.', 'Barista sees next order before customer arrives.', 'Smart refill alerts — customer never waits.', 'Lunch/coffee transition happens without interruption.', 'Report shows best sellers by time slot.'],
  narrationManagerEs: ['Dashboard muestra pedidos recurrentes ya en fila.', 'Barista ve el próximo pedido antes de que llegue el cliente.', 'Alertas de refil inteligentes — cliente nunca espera.', 'La transición almuerzo/café sucede sin interrupción.', 'Reporte muestra más vendidos por horario.'],
  narrationTeamPt: ['Você já sabe o pedido antes do cliente falar.', 'A fila sumiu — pedidos chegam organizados.', 'Refil automático — menos viagens ao balcão.', 'O sistema te avisa quando trocar o cardápio.', 'Gorjetas subiram 30% — o serviço é visivelmente melhor.'],
  narrationTeamEn: ['You know the order before the customer speaks.', 'Queue vanished — orders arrive organized.', 'Auto refill — fewer trips to counter.', 'System tells you when to switch the menu.', 'Tips up 30% — service is visibly better.'],
  narrationTeamEs: ['Ya sabes el pedido antes de que el cliente hable.', 'La fila desapareció — pedidos llegan organizados.', 'Refil automático — menos viajes al mostrador.', 'El sistema te avisa cuándo cambiar el menú.', 'Propinas subieron 30% — el servicio es visiblemente mejor.'],
  clientScreens: [
    [{ id: 'c1-1', icon: 'coffee', lPt: 'Meu café de sempre', lEn: 'My usual coffee', lEs: 'Mi café de siempre', dPt: 'Pedido recorrente com 1 toque', dEn: 'Recurring order with 1 tap', dEs: 'Pedido recurrente con 1 toque' }],
    [{ id: 'c2-1', icon: 'zap', lPt: 'Pré-pedido', lEn: 'Pre-order', lEs: 'Pre-pedido', dPt: 'Pede no caminho, retira na chegada', dEn: 'Order on the way, pick up on arrival', dEs: 'Pide en el camino, retira al llegar' }],
    [{ id: 'c3-1', icon: '💻', lPt: 'Modo trabalho', lEn: 'Work mode', lEs: 'Modo trabajo', dPt: 'Wi-Fi, timer, refil automático', dEn: 'Wi-Fi, timer, auto refill', dEs: 'Wi-Fi, timer, refil automático' }],
    [{ id: 'c4-1', icon: '🥐', lPt: 'Menu do almoço', lEn: 'Lunch menu', lEs: 'Menú del almuerzo', dPt: 'Cardápio muda automaticamente', dEn: 'Menu changes automatically', dEs: 'Menú cambia automáticamente' }],
    [{ id: 'c5-1', icon: 'sparkles', lPt: 'Fidelidade', lEn: 'Loyalty', lEs: 'Fidelidad', dPt: 'Café grátis a cada 10', dEn: 'Free coffee every 10', dEs: 'Café gratis cada 10' }],
  ],
  restaurantScreens: [
    [{ id: 'r1-1', icon: 'bar-chart-3', lPt: 'Pedidos recorrentes', lEn: 'Recurring orders', lEs: 'Pedidos recurrentes', dPt: 'Já na fila antes do cliente', dEn: 'Already queued before customer', dEs: 'Ya en fila antes del cliente' }],
    [{ id: 'r2-1', icon: 'monitor', lPt: 'Fila inteligente', lEn: 'Smart queue', lEs: 'Fila inteligente', dPt: 'Pedidos organizados por prioridade', dEn: 'Orders organized by priority', dEs: 'Pedidos organizados por prioridad' }],
    [{ id: 'r3-1', icon: 'bell', lPt: 'Alertas de refil', lEn: 'Refill alerts', lEs: 'Alertas de refil', dPt: 'Sabe quando repor café', dEn: 'Knows when to refill coffee', dEs: 'Sabe cuándo reponer café' }],
    [{ id: 'r4-1', icon: 'clipboard-list', lPt: 'Menu dinâmico', lEn: 'Dynamic menu', lEs: 'Menú dinámico', dPt: 'Cardápio muda por horário', dEn: 'Menu changes by time', dEs: 'Menú cambia por horario' }],
    [{ id: 'r5-1', icon: 'bar-chart-3', lPt: 'Analytics por turno', lEn: 'Per-shift analytics', lEs: 'Analytics por turno', dPt: 'Itens, horários, tendências', dEn: 'Items, times, trends', dEs: 'Ítems, horarios, tendencias' }],
  ],
  events: [
    [{ id: 'e1-1', time: '07:15', icon: 'coffee', urgency: 'info', cPt: 'Pediu café com 1 toque', cEn: 'Ordered coffee with 1 tap', cEs: 'Pidió café con 1 toque', rPt: 'Pedido já na fila do barista', rEn: 'Order already in barista queue', rEs: 'Pedido ya en fila del barista', resPt: 'Pronto em 2 min', resEn: 'Ready in 2 min', resEs: 'Listo en 2 min' }],
    [{ id: 'e2-1', time: '08:30', icon: 'alert-circle', urgency: 'critical', cPt: '15 pedidos simultâneos', cEn: '15 simultaneous orders', cEs: '15 pedidos simultáneos', rPt: 'Barista vê fila priorizada', rEn: 'Barista sees prioritized queue', rEs: 'Barista ve fila priorizada', resPt: 'Todos prontos em menos de 4 min', resEn: 'All ready in under 4 min', resEs: 'Todos listos en menos de 4 min' }],
    [{ id: 'e3-1', time: '10:30', icon: 'refresh-cw', urgency: 'info', cPt: 'Refil automático notificado', cEn: 'Auto refill notified', cEs: 'Refil automático notificado', rPt: 'Timer de 45 min atingido', rEn: '45 min timer reached', rEs: 'Timer de 45 min alcanzado', resPt: 'Upsell de R$8 por cliente', resEn: '$1.60 upsell per customer', resEs: 'Upsell de $1.60 por cliente' }],
    [{ id: 'e4-1', time: '12:30', icon: '🥐', urgency: 'info', cPt: 'Menu mudou para almoço', cEn: 'Menu changed to lunch', cEs: 'Menú cambió a almuerzo', rPt: 'Transição automática de cardápio', rEn: 'Automatic menu transition', rEs: 'Transición automática de menú', resPt: 'Sem interrupção no serviço', resEn: 'No service interruption', resEs: 'Sin interrupción en servicio' }],
    [{ id: 'e5-1', time: '14:30', icon: 'bar-chart-3', urgency: 'info', cPt: 'Ganhou café grátis', cEn: 'Earned free coffee', cEs: 'Ganó café gratis', rPt: 'Relatório de fidelidade gerado', rEn: 'Loyalty report generated', rEs: 'Reporte de fidelidad generado', resPt: 'Retenção do programa: 72%', resEn: 'Program retention: 72%', resEs: 'Retención del programa: 72%' }],
  ],
  metrics: [
    [{ id: 'm1-1', icon: 'timer', lPt: 'Tempo de preparo', lEn: 'Prep time', lEs: 'Tiempo de preparo', woPt: '5 min', woEn: '5 min', woEs: '5 min', wPt: '2 min', wEn: '2 min', wEs: '2 min' }],
    [{ id: 'm2-1', icon: 'smartphone', lPt: 'Pedidos digitais', lEn: 'Digital orders', lEs: 'Pedidos digitales', woPt: '5%', woEn: '5%', woEs: '5%', wPt: '55%', wEn: '55%', wEs: '55%' }],
    [{ id: 'm3-1', icon: 'coins', lPt: 'Consumo por sessão', lEn: 'Per-session spend', lEs: 'Consumo por sesión', woPt: 'R$ 12', woEn: '$2.40', woEs: '$2.40', wPt: 'R$ 28', wEn: '$5.60', wEs: '$5.60' }],
    [{ id: 'm4-1', icon: 'refresh-cw', lPt: 'Ticket médio almoço', lEn: 'Lunch avg ticket', lEs: 'Ticket medio almuerzo', woPt: 'R$ 22', woEn: '$4.40', woEs: '$4.40', wPt: 'R$ 35', wEn: '$7.00', wEs: '$7.00' }],
    [{ id: 'm5-1', icon: 'refresh-cw', lPt: 'Retenção mensal', lEn: 'Monthly retention', lEs: 'Retención mensual', woPt: '30%', woEn: '30%', woEs: '30%', wPt: '72%', wEn: '72%', wEs: '72%' }],
  ],
});

// ─── PUB & BAR ───
const PUB_BAR_ACTS = buildSimpleActs({
  times: ['17:00 – 18:00', '18:00 – 20:00', '20:00 – 22:00', '22:00 – 00:00', '00:00 – 01:00'],
  titlesPt: ['Happy hour', 'Noite esquenta', 'Casa cheia', 'Pico da noite', 'Fechamento'],
  titlesEn: ['Happy hour', 'Night heats up', 'Full house', 'Night peak', 'Closing'],
  titlesEs: ['Happy hour', 'Noche calienta', 'Casa llena', 'Pico de la noche', 'Cierre'],
  subtitlesPt: ['Abertura', 'Crescendo', 'Pico', 'Madrugada', 'Relatório'],
  subtitlesEn: ['Opening', 'Building', 'Peak', 'Late Night', 'Report'],
  subtitlesEs: ['Apertura', 'Creciendo', 'Pico', 'Madrugada', 'Reporte'],
  emotionsPt: ['Descontração', 'Energia crescente', 'Euforia + Controle', 'Resistência', 'Alívio + Orgulho'],
  emotionsEn: ['Relaxation', 'Rising energy', 'Euphoria + Control', 'Endurance', 'Relief + Pride'],
  emotionsEs: ['Relajación', 'Energía creciente', 'Euforia + Control', 'Resistencia', 'Alivio + Orgullo'],
  woowPt: ['Tab digital pré-autorizada', 'Pedido na mesa sem fila no bar', 'Controle de abas em tempo real', 'Divisão de conta instantânea', 'Gorjetas e relatório automáticos'],
  woowEn: ['Pre-authorized digital tab', 'Table order without bar queue', 'Real-time tab control', 'Instant bill split', 'Tips and auto report'],
  woowEs: ['Tab digital pre-autorizada', 'Pedido en mesa sin fila en barra', 'Control de tabs en tiempo real', 'División de cuenta instantánea', 'Propinas y reporte automáticos'],
  narrationOwnerPt: ['Tabs pré-autorizadas eliminam calotes e aumentam consumo.', 'Pedidos pelo app liberam o barman para criar drinks.', 'Você vê a receita subindo em tempo real — sem sair do escritório.', 'Divisão instantânea = sem fila no caixa = mais drinks vendidos.', 'Relatório mostra quais drinks funcionam e quais não.'],
  narrationOwnerEn: ['Pre-authorized tabs eliminate walkouts and increase spending.', 'App orders free the bartender to create drinks.', 'You see revenue rising in real-time — without leaving the office.', 'Instant split = no cashier queue = more drinks sold.', 'Report shows which drinks work and which don\'t.'],
  narrationOwnerEs: ['Tabs pre-autorizadas eliminan fugas y aumentan consumo.', 'Pedidos por app liberan al barman para crear drinks.', 'Ves el ingreso subiendo en tiempo real — sin salir de la oficina.', 'División instantánea = sin fila en caja = más drinks vendidos.', 'Reporte muestra qué drinks funcionan y cuáles no.'],
  narrationManagerPt: ['Happy hour automático — preços mudam sozinhos.', 'Dashboard mostra todas as mesas e abas ativas.', 'Controle total das abas — sem surpresas no final.', 'A divisão de conta que levava 15 min agora leva 30 seg.', 'Gorjetas distribuídas automaticamente pela equipe.'],
  narrationManagerEn: ['Auto happy hour — prices change on their own.', 'Dashboard shows all tables and active tabs.', 'Full tab control — no surprises at the end.', 'Bill split that took 15 min now takes 30 sec.', 'Tips automatically distributed across team.'],
  narrationManagerEs: ['Happy hour automático — precios cambian solos.', 'Dashboard muestra todas las mesas y tabs activas.', 'Control total de tabs — sin sorpresas al final.', 'División de cuenta que tardaba 15 min ahora tarda 30 seg.', 'Propinas distribuidas automáticamente por el equipo.'],
  narrationTeamPt: ['Tab digital = sem confusão no final da noite.', 'Pedidos chegam direto — sem gritar no bar.', 'O sistema prioriza seus pedidos — foco em executar.', 'Divisão automática = menos briga = menos estresse.', 'Suas gorjetas subiram 45% — reconhecimento justo.'],
  narrationTeamEn: ['Digital tab = no confusion at end of night.', 'Orders arrive directly — no shouting at the bar.', 'System prioritizes your orders — focus on executing.', 'Auto split = fewer disputes = less stress.', 'Your tips went up 45% — fair recognition.'],
  narrationTeamEs: ['Tab digital = sin confusión al final de la noche.', 'Pedidos llegan directo — sin gritar en la barra.', 'El sistema prioriza tus pedidos — enfoque en ejecutar.', 'División automática = menos peleas = menos estrés.', 'Tus propinas subieron 45% — reconocimiento justo.'],
  clientScreens: [
    [{ id: 'c1-1', icon: 'credit-card', lPt: 'Tab digital', lEn: 'Digital tab', lEs: 'Tab digital', dPt: 'Abre aba com cartão pré-autorizado', dEn: 'Open tab with pre-authorized card', dEs: 'Abre tab con tarjeta pre-autorizada' }],
    [{ id: 'c2-1', icon: 'beer', lPt: 'Pedido na mesa', lEn: 'Table order', lEs: 'Pedido en mesa', dPt: 'Pede sem ir ao bar', dEn: 'Order without going to bar', dEs: 'Pide sin ir a la barra' }],
    [{ id: 'c3-1', icon: 'bar-chart-3', lPt: 'Minha aba', lEn: 'My tab', lEs: 'Mi tab', dPt: 'Vê consumo em tempo real', dEn: 'See consumption in real-time', dEs: 'Ve consumo en tiempo real' }],
    [{ id: 'c4-1', icon: 'credit-card', lPt: 'Dividir conta', lEn: 'Split bill', lEs: 'Dividir cuenta', dPt: '4 formas de dividir', dEn: '4 ways to split', dEs: '4 formas de dividir' }],
    [{ id: 'c5-1', icon: 'star', lPt: 'Avaliar a noite', lEn: 'Rate the night', lEs: 'Evaluar la noche', dPt: 'Feedback + gorjeta digital', dEn: 'Feedback + digital tip', dEs: 'Feedback + propina digital' }],
  ],
  restaurantScreens: [
    [{ id: 'r1-1', icon: 'bar-chart-3', lPt: 'Painel de tabs', lEn: 'Tab panel', lEs: 'Panel de tabs', dPt: 'Todas as abas ativas', dEn: 'All active tabs', dEs: 'Todas las tabs activas' }],
    [{ id: 'r2-1', icon: 'monitor', lPt: 'KDS do bar', lEn: 'Bar KDS', lEs: 'KDS del bar', dPt: 'Drinks organizados por prioridade', dEn: 'Drinks organized by priority', dEs: 'Drinks organizados por prioridad' }],
    [{ id: 'r3-1', icon: 'bell', lPt: 'Alertas de consumo', lEn: 'Consumption alerts', lEs: 'Alertas de consumo', dPt: 'Limite de tab atingido', dEn: 'Tab limit reached', dEs: 'Límite de tab alcanzado' }],
    [{ id: 'r4-1', icon: 'credit-card', lPt: 'Multi-checkout', lEn: 'Multi-checkout', lEs: 'Multi-checkout', dPt: '10 contas fecham ao mesmo tempo', dEn: '10 bills close simultaneously', dEs: '10 cuentas cierran al mismo tiempo' }],
    [{ id: 'r5-1', icon: 'bar-chart-3', lPt: 'Relatório da noite', lEn: 'Night report', lEs: 'Reporte de la noche', dPt: 'Receita, drinks, performance', dEn: 'Revenue, drinks, performance', dEs: 'Ingreso, drinks, rendimiento' }],
  ],
  events: [
    [{ id: 'e1-1', time: '17:15', icon: 'credit-card', urgency: 'info', cPt: 'Abriu tab digital', cEn: 'Opened digital tab', cEs: 'Abrió tab digital', rPt: 'Tab pré-autorizada — sem risco', rEn: 'Pre-authorized tab — no risk', rEs: 'Tab pre-autorizada — sin riesgo', resPt: 'Consumo médio sobe 35%', resEn: 'Avg consumption up 35%', resEs: 'Consumo medio sube 35%' }],
    [{ id: 'e2-1', time: '19:00', icon: 'beer', urgency: 'info', cPt: 'Pediu 3 cervejas da mesa', cEn: 'Ordered 3 beers from table', cEs: 'Pidió 3 cervezas desde mesa', rPt: 'Pedido no KDS do barman', rEn: 'Order on bartender KDS', rEs: 'Pedido en KDS del barman', resPt: 'Barman focou em drinks premium', resEn: 'Bartender focused on premium drinks', resEs: 'Barman enfocó en drinks premium' }],
    [{ id: 'e3-1', time: '21:00', icon: 'bell', urgency: 'warning', cPt: 'Tab atingiu R$ 200', cEn: 'Tab reached $40', cEs: 'Tab alcanzó $40', rPt: 'Alerta de consumo alto', rEn: 'High consumption alert', rEs: 'Alerta de consumo alto', resPt: 'Gerente informado — controle total', resEn: 'Manager informed — full control', resEs: 'Gerente informado — control total' }],
    [{ id: 'e4-1', time: '23:00', icon: 'credit-card', urgency: 'info', cPt: 'Grupo de 8 dividiu por igual', cEn: 'Group of 8 split equally', cEs: 'Grupo de 8 dividió por igual', rPt: '8 pagamentos processados em 30 seg', rEn: '8 payments processed in 30 sec', rEs: '8 pagos procesados en 30 seg', resPt: 'Mesa liberada instantaneamente', resEn: 'Table freed instantly', resEs: 'Mesa liberada instantáneamente' }],
    [{ id: 'e5-1', time: '00:30', icon: 'bar-chart-3', urgency: 'info', cPt: 'Deixou gorjeta digital de 18%', cEn: 'Left 18% digital tip', cEs: 'Dejó propina digital de 18%', rPt: 'Relatório da noite gerado', rEn: 'Night report generated', rEs: 'Reporte de la noche generado', resPt: 'Gorjetas distribuídas pela equipe', resEn: 'Tips distributed across team', resEs: 'Propinas distribuidas por el equipo' }],
  ],
  metrics: [
    [{ id: 'm1-1', icon: 'coins', lPt: 'Consumo com tab', lEn: 'Tab consumption', lEs: 'Consumo con tab', woPt: 'R$ 45', woEn: '$9', woEs: '$9', wPt: 'R$ 78', wEn: '$15.60', wEs: '$15.60' }],
    [{ id: 'm2-1', icon: 'timer', lPt: 'Tempo no bar', lEn: 'Bar wait time', lEs: 'Tiempo en barra', woPt: '8 min', woEn: '8 min', woEs: '8 min', wPt: '0 min', wEn: '0 min', wEs: '0 min' }],
    [{ id: 'm3-1', icon: '🚫', lPt: 'Calotes', lEn: 'Walkouts', lEs: 'Fugas', woPt: '3/mês', woEn: '3/month', woEs: '3/mes', wPt: '0', wEn: '0', wEs: '0' }],
    [{ id: 'm4-1', icon: 'timer', lPt: 'Fechamento de conta', lEn: 'Bill closing', lEs: 'Cierre de cuenta', woPt: '15 min', woEn: '15 min', woEs: '15 min', wPt: '30 seg', wEn: '30 sec', wEs: '30 seg' }],
    [{ id: 'm5-1', icon: 'dollar-sign', lPt: 'Gorjetas totais', lEn: 'Total tips', lEs: 'Propinas totales', woPt: 'R$ 320', woEn: '$64', woEs: '$64', wPt: 'R$ 580', wEn: '$116', wEs: '$116' }],
  ],
});

// ─── CLUB & NIGHTLIFE ───
const CLUB_ACTS = buildSimpleActs({
  times: ['22:00 – 23:00', '23:00 – 01:00', '01:00 – 03:00', '03:00 – 04:00', '04:00 – 05:00'],
  titlesPt: ['Portaria inteligente', 'A noite começa', 'Pico total', 'Fechamento de abas', 'After-hours'],
  titlesEn: ['Smart gate', 'Night begins', 'Full peak', 'Tab closing', 'After-hours'],
  titlesEs: ['Portería inteligente', 'La noche comienza', 'Pico total', 'Cierre de tabs', 'After-hours'],
  subtitlesPt: ['Entrada', 'Esquenta', 'Pico', 'Checkout', 'Dados'],
  subtitlesEn: ['Entry', 'Warm-up', 'Peak', 'Checkout', 'Data'],
  subtitlesEs: ['Entrada', 'Calentamiento', 'Pico', 'Checkout', 'Datos'],
  emotionsPt: ['Antecipação', 'Euforia', 'Êxtase', 'Transição', 'Reflexão'],
  emotionsEn: ['Anticipation', 'Euphoria', 'Ecstasy', 'Transition', 'Reflection'],
  emotionsEs: ['Anticipación', 'Euforia', 'Éxtasis', 'Transición', 'Reflexión'],
  woowPt: ['Check-in digital sem fila', 'Drinks sem sair da pista', 'Controle total do caos', 'Checkout em 15 segundos', 'Dados que iluminam decisões'],
  woowEn: ['Digital check-in no queue', 'Drinks without leaving the floor', 'Total chaos control', 'Checkout in 15 seconds', 'Data that illuminates decisions'],
  woowEs: ['Check-in digital sin fila', 'Drinks sin salir de la pista', 'Control total del caos', 'Checkout en 15 segundos', 'Datos que iluminan decisiones'],
  narrationOwnerPt: ['A fila sumiu — check-in digital aumentou a capacidade.', 'Pedidos pelo app = barman faz drinks premium.', 'Volume máximo com zero incidentes.', 'Checkout em 15 seg — liberou 200 pessoas em 30 min.', 'Dados mostram o que funciona — de DJs a drinks.'],
  narrationOwnerEn: ['Queue vanished — digital check-in increased capacity.', 'App orders = bartender makes premium drinks.', 'Maximum volume with zero incidents.', 'Checkout in 15 sec — freed 200 people in 30 min.', 'Data shows what works — from DJs to drinks.'],
  narrationOwnerEs: ['La fila desapareció — check-in digital aumentó capacidad.', 'Pedidos por app = barman hace drinks premium.', 'Volumen máximo con cero incidentes.', 'Checkout en 15 seg — liberó 200 personas en 30 min.', 'Datos muestran qué funciona — de DJs a drinks.'],
  narrationManagerPt: ['Dashboard mostra lotação em tempo real.', 'Todos os pedidos passam pelo KDS — sem grito.', 'Você vê cada setor funcionando como relógio.', 'Contas fecham em lote — sem confusão.', 'Relatório por setor e por turno — pronto em 0s.'],
  narrationManagerEn: ['Dashboard shows real-time occupancy.', 'All orders go through KDS — no shouting.', 'You see each sector working like clockwork.', 'Bills close in batch — no confusion.', 'Per-sector per-shift report — ready in 0s.'],
  narrationManagerEs: ['Dashboard muestra ocupación en tiempo real.', 'Todos los pedidos pasan por KDS — sin gritos.', 'Ves cada sector funcionando como reloj.', 'Cuentas cierran en lote — sin confusión.', 'Reporte por sector y turno — listo en 0s.'],
  narrationTeamPt: ['Entrada organizada — menos confusão, menos estresse.', 'Pedidos chegam organizados — sem berrar no bar.', 'O sistema prioriza — você executa.', 'Sem correria no caixa — tudo digital.', 'Gorjetas subiram 55% — o app facilita dar gorjeta.'],
  narrationTeamEn: ['Organized entry — less confusion, less stress.', 'Orders arrive organized — no shouting at bar.', 'System prioritizes — you execute.', 'No cashier rush — all digital.', 'Tips up 55% — the app makes tipping easy.'],
  narrationTeamEs: ['Entrada organizada — menos confusión, menos estrés.', 'Pedidos llegan organizados — sin gritar en barra.', 'El sistema prioriza — tú ejecutas.', 'Sin correría en caja — todo digital.', 'Propinas subieron 55% — la app facilita dar propina.'],
  clientScreens: [
    [{ id: 'c1-1', icon: 'ticket', lPt: 'Check-in digital', lEn: 'Digital check-in', lEs: 'Check-in digital', dPt: 'QR code na entrada', dEn: 'QR code at entry', dEs: 'QR code en entrada' }],
    [{ id: 'c2-1', icon: 'glass-water', lPt: 'Pedido na pista', lEn: 'Floor order', lEs: 'Pedido en pista', dPt: 'Pede drink sem sair de lá', dEn: 'Order drink without leaving', dEs: 'Pide drink sin irse' }],
    [{ id: 'c3-1', icon: 'bar-chart-3', lPt: 'Minha aba', lEn: 'My tab', lEs: 'Mi tab', dPt: 'Consumo + limite visível', dEn: 'Consumption + visible limit', dEs: 'Consumo + límite visible' }],
    [{ id: 'c4-1', icon: 'credit-card', lPt: 'Checkout express', lEn: 'Express checkout', lEs: 'Checkout express', dPt: 'Fecha a conta em 15 seg', dEn: 'Close bill in 15 sec', dEs: 'Cierra cuenta en 15 seg' }],
    [{ id: 'c5-1', icon: 'camera', lPt: 'Galeria da noite', lEn: 'Night gallery', lEs: 'Galería de la noche', dPt: 'Fotos da noite compartilhadas', dEn: 'Night photos shared', dEs: 'Fotos de la noche compartidas' }],
  ],
  restaurantScreens: [
    [{ id: 'r1-1', icon: 'bar-chart-3', lPt: 'Lotação ao vivo', lEn: 'Live occupancy', lEs: 'Ocupación en vivo', dPt: 'Capacidade em tempo real', dEn: 'Real-time capacity', dEs: 'Capacidad en tiempo real' }],
    [{ id: 'r2-1', icon: 'monitor', lPt: 'KDS multi-bar', lEn: 'Multi-bar KDS', lEs: 'KDS multi-barra', dPt: '3 barras no mesmo painel', dEn: '3 bars on same panel', dEs: '3 barras en mismo panel' }],
    [{ id: 'r3-1', icon: 'bell', lPt: 'Alertas de segurança', lEn: 'Security alerts', lEs: 'Alertas de seguridad', dPt: 'Lotação, incidentes, consumo', dEn: 'Capacity, incidents, consumption', dEs: 'Ocupación, incidentes, consumo' }],
    [{ id: 'r4-1', icon: 'credit-card', lPt: 'Batch checkout', lEn: 'Batch checkout', lEs: 'Checkout en lote', dPt: 'Centenas de contas em minutos', dEn: 'Hundreds of bills in minutes', dEs: 'Cientos de cuentas en minutos' }],
    [{ id: 'r5-1', icon: 'bar-chart-3', lPt: 'Analytics por setor', lEn: 'Per-sector analytics', lEs: 'Analytics por sector', dPt: 'Drinks, receita, por barra', dEn: 'Drinks, revenue, per bar', dEs: 'Drinks, ingreso, por barra' }],
  ],
  events: [
    [{ id: 'e1-1', time: '22:15', icon: 'ticket', urgency: 'info', cPt: 'Check-in por QR code', cEn: 'QR code check-in', cEs: 'Check-in por QR code', rPt: 'Lotação: 120/500', rEn: 'Occupancy: 120/500', rEs: 'Ocupación: 120/500', resPt: 'Fila zerada na entrada', resEn: 'Entry queue cleared', resEs: 'Fila eliminada en entrada' }],
    [{ id: 'e2-1', time: '23:30', icon: 'glass-water', urgency: 'info', cPt: 'Pediu drink da pista', cEn: 'Ordered drink from floor', cEs: 'Pidió drink desde pista', rPt: 'KDS organizou por barra', rEn: 'KDS organized by bar', rEs: 'KDS organizó por barra', resPt: 'Entregue em 3 min', resEn: 'Delivered in 3 min', resEs: 'Entregado en 3 min' }],
    [{ id: 'e3-1', time: '01:30', icon: 'alert-circle', urgency: 'critical', cPt: 'Lotação: 480/500', cEn: 'Occupancy: 480/500', cEs: 'Ocupación: 480/500', rPt: 'Alerta de lotação máxima', rEn: 'Maximum capacity alert', rEs: 'Alerta de ocupación máxima', resPt: 'Controle automático na porta', resEn: 'Auto control at door', resEs: 'Control automático en puerta' }],
    [{ id: 'e4-1', time: '03:30', icon: 'credit-card', urgency: 'info', cPt: 'Checkout em 15 seg', cEn: 'Checkout in 15 sec', cEs: 'Checkout en 15 seg', rPt: '150 contas fecharam em 20 min', rEn: '150 bills closed in 20 min', rEs: '150 cuentas cerraron en 20 min', resPt: 'Zero fila na saída', resEn: 'Zero exit queue', resEs: 'Cero fila en salida' }],
    [{ id: 'e5-1', time: '04:30', icon: 'bar-chart-3', urgency: 'info', cPt: 'Recebeu fotos da noite', cEn: 'Received night photos', cEs: 'Recibió fotos de la noche', rPt: 'Relatório por setor gerado', rEn: 'Per-sector report generated', rEs: 'Reporte por sector generado', resPt: 'Dados prontos para análise', resEn: 'Data ready for analysis', resEs: 'Datos listos para análisis' }],
  ],
  metrics: [
    [{ id: 'm1-1', icon: 'timer', lPt: 'Tempo de entrada', lEn: 'Entry time', lEs: 'Tiempo de entrada', woPt: '8 min', woEn: '8 min', woEs: '8 min', wPt: '15 seg', wEn: '15 sec', wEs: '15 seg' }],
    [{ id: 'm2-1', icon: 'coins', lPt: 'Consumo médio', lEn: 'Avg consumption', lEs: 'Consumo medio', woPt: 'R$ 80', woEn: '$16', woEs: '$16', wPt: 'R$ 140', wEn: '$28', wEs: '$28' }],
    [{ id: 'm3-1', icon: 'alert-octagon', lPt: 'Incidentes', lEn: 'Incidents', lEs: 'Incidentes', woPt: '5/noite', woEn: '5/night', woEs: '5/noche', wPt: '0', wEn: '0', wEs: '0' }],
    [{ id: 'm4-1', icon: 'timer', lPt: 'Checkout', lEn: 'Checkout', lEs: 'Checkout', woPt: '25 min', woEn: '25 min', woEs: '25 min', wPt: '15 seg', wEn: '15 sec', wEs: '15 seg' }],
    [{ id: 'm5-1', icon: 'coins', lPt: 'Receita da noite', lEn: 'Night revenue', lEs: 'Ingreso de la noche', woPt: 'R$ 12k', woEn: '$2.4k', woEs: '$2.4k', wPt: 'R$ 22k', wEn: '$4.4k', wEs: '$4.4k' }],
  ],
});

// ─── FOOD TRUCK ───
const FOOD_TRUCK_ACTS = buildSimpleActs({
  times: ['11:00 – 11:30', '11:30 – 13:00', '13:00 – 14:00', '14:00 – 15:00', '15:00 – 15:30'],
  titlesPt: ['Setup relâmpago', 'Rush da rua', 'Fluxo sustentado', 'Próximo ponto', 'Dia encerrado'],
  titlesEn: ['Lightning setup', 'Street rush', 'Sustained flow', 'Next spot', 'Day closed'],
  titlesEs: ['Setup relámpago', 'Rush callejero', 'Flujo sostenido', 'Próximo punto', 'Día cerrado'],
  subtitlesPt: ['Prep', 'Pico', 'Fluxo', 'Mobilidade', 'Dados'],
  subtitlesEn: ['Prep', 'Peak', 'Flow', 'Mobility', 'Data'],
  subtitlesEs: ['Prep', 'Pico', 'Flujo', 'Movilidad', 'Datos'],
  emotionsPt: ['Agilidade + Foco', 'Adrenalina + Velocidade', 'Ritmo + Controle', 'Flexibilidade', 'Satisfação + Insights'],
  emotionsEn: ['Agility + Focus', 'Adrenaline + Speed', 'Rhythm + Control', 'Flexibility', 'Satisfaction + Insights'],
  emotionsEs: ['Agilidad + Foco', 'Adrenalina + Velocidad', 'Ritmo + Control', 'Flexibilidad', 'Satisfacción + Insights'],
  woowPt: ['Cardápio ativo em 2 min', 'Fila digital no ponto', 'Pedido + pagamento pelo app', 'GPS notifica clientes próximos', 'Dados por ponto e horário'],
  woowEn: ['Menu active in 2 min', 'Digital queue at spot', 'Order + payment via app', 'GPS notifies nearby customers', 'Data per spot and time'],
  woowEs: ['Menú activo en 2 min', 'Fila digital en el punto', 'Pedido + pago por app', 'GPS notifica clientes cercanos', 'Datos por punto y horario'],
  narrationOwnerPt: ['2 minutos para ativar — enquanto concorrentes ainda montam.', 'Fila digital = mais clientes = mais receita no mesmo tempo.', 'Pagamento digital elimina risco de troco e calote.', 'GPS notifica sua base de fãs onde você está.', 'Dados por ponto mostram onde faturar mais amanhã.'],
  narrationOwnerEn: ['2 min to activate — while competitors still set up.', 'Digital queue = more customers = more revenue in same time.', 'Digital payment eliminates change and walkout risk.', 'GPS notifies your fan base where you are.', 'Per-spot data shows where to earn more tomorrow.'],
  narrationOwnerEs: ['2 min para activar — mientras competidores aún montan.', 'Fila digital = más clientes = más ingreso en mismo tiempo.', 'Pago digital elimina riesgo de cambio y fugas.', 'GPS notifica a tu base de fans dónde estás.', 'Datos por punto muestran dónde facturar más mañana.'],
  narrationManagerPt: ['Setup digital — abriu o app, ativou tudo.', 'Dashboard mostra a fila e o estoque ao vivo.', 'Controle de caixa em tempo real — sem contar moeda.', 'Localização enviada automaticamente aos seguidores.', 'Relatório por ponto — compare e escolha o melhor local.'],
  narrationManagerEn: ['Digital setup — opened app, activated everything.', 'Dashboard shows queue and stock live.', 'Real-time cash control — no coin counting.', 'Location sent automatically to followers.', 'Per-spot report — compare and choose best location.'],
  narrationManagerEs: ['Setup digital — abrió app, activó todo.', 'Dashboard muestra fila y stock en vivo.', 'Control de caja en tiempo real — sin contar monedas.', 'Ubicación enviada automáticamente a seguidores.', 'Reporte por punto — compara y elige mejor ubicación.'],
  narrationTeamPt: ['Menos setup = mais tempo cozinhando.', 'Pedidos organizados — sem confusão no balcão.', 'Sem manuseio de dinheiro — mais higiênico e rápido.', 'Você sabe para onde vai antes de desmontar.', 'Gorjetas digitais — não precisa de caixinha.'],
  narrationTeamEn: ['Less setup = more time cooking.', 'Organized orders — no counter confusion.', 'No cash handling — more hygienic and fast.', 'You know where you\'re going before packing up.', 'Digital tips — no tip jar needed.'],
  narrationTeamEs: ['Menos setup = más tiempo cocinando.', 'Pedidos organizados — sin confusión en mostrador.', 'Sin manejo de efectivo — más higiénico y rápido.', 'Sabes a dónde vas antes de desarmar.', 'Propinas digitales — no necesitas alcancía.'],
  clientScreens: [
    [{ id: 'c1-1', icon: 'map-pin', lPt: 'Localizar truck', lEn: 'Find truck', lEs: 'Localizar truck', dPt: 'GPS mostra onde está', dEn: 'GPS shows location', dEs: 'GPS muestra dónde está' }],
    [{ id: 'c2-1', icon: 'person-standing', lPt: 'Fila digital', lEn: 'Digital queue', lEs: 'Fila digital', dPt: 'Entra na fila pelo app', dEn: 'Join queue via app', dEs: 'Entra en fila por app' }],
    [{ id: 'c3-1', icon: 'smartphone', lPt: 'Pedido no app', lEn: 'App order', lEs: 'Pedido en app', dPt: 'Personaliza e paga digital', dEn: 'Customize and pay digital', dEs: 'Personaliza y paga digital' }],
    [{ id: 'c4-1', icon: 'map-pin', lPt: 'Próximo ponto', lEn: 'Next location', lEs: 'Próximo punto', dPt: 'Notificação de novo local', dEn: 'New location notification', dEs: 'Notificación de nuevo local' }],
    [{ id: 'c5-1', icon: 'star', lPt: 'Avaliar e seguir', lEn: 'Rate and follow', lEs: 'Evaluar y seguir', dPt: 'Seja notificado por GPS', dEn: 'Get notified by GPS', dEs: 'Sea notificado por GPS' }],
  ],
  restaurantScreens: [
    [{ id: 'r1-1', icon: 'smartphone', lPt: 'Ativação rápida', lEn: 'Quick activation', lEs: 'Activación rápida', dPt: 'Menu + localização em 2 min', dEn: 'Menu + location in 2 min', dEs: 'Menú + ubicación en 2 min' }],
    [{ id: 'r2-1', icon: 'monitor', lPt: 'Dashboard mobile', lEn: 'Mobile dashboard', lEs: 'Dashboard mobile', dPt: 'Fila + estoque + pedidos', dEn: 'Queue + stock + orders', dEs: 'Fila + stock + pedidos' }],
    [{ id: 'r3-1', icon: 'credit-card', lPt: 'Pagamento digital', lEn: 'Digital payment', lEs: 'Pago digital', dPt: '100% digital — sem troco', dEn: '100% digital — no change', dEs: '100% digital — sin cambio' }],
    [{ id: 'r4-1', icon: 'map-pin', lPt: 'GPS automático', lEn: 'Auto GPS', lEs: 'GPS automático', dPt: 'Notifica seguidores da nova posição', dEn: 'Notifies followers of new position', dEs: 'Notifica seguidores de nueva posición' }],
    [{ id: 'r5-1', icon: 'bar-chart-3', lPt: 'Analytics por ponto', lEn: 'Per-spot analytics', lEs: 'Analytics por punto', dPt: 'Receita, pedidos, tempo por local', dEn: 'Revenue, orders, time per spot', dEs: 'Ingreso, pedidos, tiempo por punto' }],
  ],
  events: [
    [{ id: 'e1-1', time: '11:05', icon: 'smartphone', urgency: 'info', cPt: 'Truck ativou localização', cEn: 'Truck activated location', cEs: 'Truck activó ubicación', rPt: 'Menu e GPS ativos em 2 min', rEn: 'Menu and GPS active in 2 min', rEs: 'Menú y GPS activos en 2 min', resPt: 'Clientes já sabem onde você está', resEn: 'Customers already know where you are', resEs: 'Clientes ya saben dónde estás' }],
    [{ id: 'e2-1', time: '12:00', icon: 'person-standing', urgency: 'warning', cPt: '25 pessoas na fila digital', cEn: '25 people in digital queue', cEs: '25 personas en fila digital', rPt: 'Pedidos escalonados por tempo', rEn: 'Orders staggered by time', rEs: 'Pedidos escalonados por tiempo', resPt: 'Zero desistência na fila', resEn: 'Zero queue abandonment', resEs: 'Cero abandono en fila' }],
    [{ id: 'e3-1', time: '13:30', icon: 'credit-card', urgency: 'info', cPt: 'Pagou pelo app', cEn: 'Paid via app', cEs: 'Pagó por app', rPt: '100% digital — caixa zerado', rEn: '100% digital — zero cash', rEs: '100% digital — caja en cero', resPt: 'Sem risco de troco errado', resEn: 'No wrong change risk', resEs: 'Sin riesgo de cambio errado' }],
    [{ id: 'e4-1', time: '14:15', icon: 'map-pin', urgency: 'info', cPt: 'Notificado de nova localização', cEn: 'Notified of new location', cEs: 'Notificado de nueva ubicación', rPt: 'GPS atualizou para seguidores', rEn: 'GPS updated for followers', rEs: 'GPS actualizó para seguidores', resPt: 'Base de fãs avisada em segundos', resEn: 'Fan base notified in seconds', resEs: 'Base de fans avisada en segundos' }],
    [{ id: 'e5-1', time: '15:15', icon: 'bar-chart-3', urgency: 'info', cPt: 'Avaliou 5 estrelas', cEn: 'Rated 5 stars', cEs: 'Evaluó 5 estrellas', rPt: 'Relatório do dia gerado', rEn: 'Day report generated', rEs: 'Reporte del día generado', resPt: 'Ponto A faturou 40% mais que B', resEn: 'Spot A earned 40% more than B', resEs: 'Punto A facturó 40% más que B' }],
  ],
  metrics: [
    [{ id: 'm1-1', icon: 'timer', lPt: 'Tempo de ativação', lEn: 'Activation time', lEs: 'Tiempo de activación', woPt: '15 min', woEn: '15 min', woEs: '15 min', wPt: '2 min', wEn: '2 min', wEs: '2 min' }],
    [{ id: 'm2-1', icon: 'person-standing', lPt: 'Desistência', lEn: 'Abandonment', lEs: 'Abandono', woPt: '40%', woEn: '40%', woEs: '40%', wPt: '5%', wEn: '5%', wEs: '5%' }],
    [{ id: 'm3-1', icon: 'credit-card', lPt: 'Pagamentos digitais', lEn: 'Digital payments', lEs: 'Pagos digitales', woPt: '20%', woEn: '20%', woEs: '20%', wPt: '100%', wEn: '100%', wEs: '100%' }],
    [{ id: 'm4-1', icon: 'map-pin', lPt: 'Clientes notificados', lEn: 'Customers notified', lEs: 'Clientes notificados', woPt: '0', woEn: '0', woEs: '0', wPt: '350+', wEn: '350+', wEs: '350+' }],
    [{ id: 'm5-1', icon: 'coins', lPt: 'Receita/dia', lEn: 'Revenue/day', lEs: 'Ingreso/día', woPt: 'R$ 1.800', woEn: '$360', woEs: '$360', wPt: 'R$ 3.200', wEn: '$640', wEs: '$640' }],
  ],
});

// ─── BUFFET ───
const BUFFET_ACTS = buildSimpleActs({
  times: ['11:00 – 11:30', '11:30 – 13:00', '13:00 – 14:00', '14:00 – 15:00', '15:00 – 15:30'],
  titlesPt: ['Estações prontas', 'Casa lotada', 'Balança inteligente', 'Sobremesa + Conta', 'Dados do turno'],
  titlesEn: ['Stations ready', 'Full house', 'Smart scale', 'Dessert + Bill', 'Shift data'],
  titlesEs: ['Estaciones listas', 'Casa llena', 'Balanza inteligente', 'Postre + Cuenta', 'Datos del turno'],
  subtitlesPt: ['Prep', 'Pico', 'Inovação', 'Fechamento', 'Insights'],
  subtitlesEn: ['Prep', 'Peak', 'Innovation', 'Closing', 'Insights'],
  subtitlesEs: ['Prep', 'Pico', 'Innovación', 'Cierre', 'Insights'],
  emotionsPt: ['Organização + Frescor', 'Energia + Volume', 'Surpresa + Precisão', 'Satisfação + Rapidez', 'Clareza + Otimização'],
  emotionsEn: ['Organization + Freshness', 'Energy + Volume', 'Surprise + Precision', 'Satisfaction + Speed', 'Clarity + Optimization'],
  emotionsEs: ['Organización + Frescura', 'Energía + Volumen', 'Sorpresa + Precisión', 'Satisfacción + Rapidez', 'Claridad + Optimización'],
  woowPt: ['Estações monitoradas por sensor', 'Check-in digital sem fila', 'Balança NFC = conta sem espera', 'Pagamento pelo app na mesa', 'Desperdício cai 60%'],
  woowEn: ['Stations monitored by sensor', 'Digital check-in no queue', 'NFC scale = bill without waiting', 'App payment at table', 'Waste drops 60%'],
  woowEs: ['Estaciones monitoreadas por sensor', 'Check-in digital sin fila', 'Balanza NFC = cuenta sin espera', 'Pago por app en mesa', 'Desperdicio cae 60%'],
  narrationOwnerPt: ['Sensores monitoram cada estação — reposição antes de acabar.', 'Check-in digital eliminou a fila e acelerou a rotação.', 'Balança NFC = precisão + rapidez = mais satisfação.', 'Pagamento no app = mesa livre em 30 seg.', 'Dados de desperdício por estação otimizam o cardápio.'],
  narrationOwnerEn: ['Sensors monitor each station — restock before running out.', 'Digital check-in eliminated queue and sped up rotation.', 'NFC scale = precision + speed = more satisfaction.', 'App payment = table free in 30 sec.', 'Per-station waste data optimizes the menu.'],
  narrationOwnerEs: ['Sensores monitorean cada estación — reposición antes de acabar.', 'Check-in digital eliminó fila y aceleró rotación.', 'Balanza NFC = precisión + rapidez = más satisfacción.', 'Pago en app = mesa libre en 30 seg.', 'Datos de desperdicio por estación optimizan el menú.'],
  narrationManagerPt: ['Dashboard mostra status de cada estação ao vivo.', 'Fluxo de check-in organizado — sem gargalos.', 'A balança elimina discussões sobre peso.', 'Contas fecham automaticamente — sem fila no caixa.', 'Relatório de desperdício guia as compras.'],
  narrationManagerEn: ['Dashboard shows each station\'s status live.', 'Organized check-in flow — no bottlenecks.', 'Scale eliminates weight disputes.', 'Bills close automatically — no cashier queue.', 'Waste report guides purchases.'],
  narrationManagerEs: ['Dashboard muestra status de cada estación en vivo.', 'Flujo de check-in organizado — sin cuellos de botella.', 'Balanza elimina discusiones sobre peso.', 'Cuentas cierran automáticamente — sin fila en caja.', 'Reporte de desperdicio guía las compras.'],
  narrationTeamPt: ['Você sabe quando repor cada estação — sem surpresas.', 'Check-in digital organiza — menos confusão.', 'Sem discussão de peso — a balança é digital.', 'Sem fila no caixa = menos estresse no fim.', 'O sistema te mostra quais pratos mais saem.'],
  narrationTeamEn: ['You know when to restock each station — no surprises.', 'Digital check-in organizes — less confusion.', 'No weight disputes — scale is digital.', 'No cashier queue = less stress at end.', 'System shows you which dishes sell most.'],
  narrationTeamEs: ['Sabes cuándo reponer cada estación — sin sorpresas.', 'Check-in digital organiza — menos confusión.', 'Sin discusiones de peso — balanza es digital.', 'Sin fila en caja = menos estrés al final.', 'El sistema te muestra qué platos más salen.'],
  clientScreens: [
    [{ id: 'c1-1', icon: 'map-pin', lPt: 'Mapa de estações', lEn: 'Station map', lEs: 'Mapa de estaciones', dPt: 'Status ao vivo de cada estação', dEn: 'Live status of each station', dEs: 'Status en vivo de cada estación' }],
    [{ id: 'c2-1', icon: 'ticket', lPt: 'Check-in digital', lEn: 'Digital check-in', lEs: 'Check-in digital', dPt: 'QR code na entrada', dEn: 'QR code at entry', dEs: 'QR code en entrada' }],
    [{ id: 'c3-1', icon: 'scale', lPt: 'Balança NFC', lEn: 'NFC scale', lEs: 'Balanza NFC', dPt: 'Pesa e registra automaticamente', dEn: 'Weighs and registers automatically', dEs: 'Pesa y registra automáticamente' }],
    [{ id: 'c4-1', icon: 'credit-card', lPt: 'Pagamento no app', lEn: 'App payment', lEs: 'Pago en app', dPt: 'Paga sem levantar da mesa', dEn: 'Pay without leaving table', dEs: 'Paga sin levantarse de la mesa' }],
    [{ id: 'c5-1', icon: 'bar-chart-3', lPt: 'Resumo nutricional', lEn: 'Nutritional summary', lEs: 'Resumen nutricional', dPt: 'Calorias e macros do prato', dEn: 'Plate calories and macros', dEs: 'Calorías y macros del plato' }],
  ],
  restaurantScreens: [
    [{ id: 'r1-1', icon: 'bar-chart-3', lPt: 'Sensores de estação', lEn: 'Station sensors', lEs: 'Sensores de estación', dPt: 'Nível de cada bandeja ao vivo', dEn: 'Live tray level for each', dEs: 'Nivel de cada bandeja en vivo' }],
    [{ id: 'r2-1', icon: 'refresh-cw', lPt: 'Fluxo de entrada', lEn: 'Entry flow', lEs: 'Flujo de entrada', dPt: 'Check-ins por minuto', dEn: 'Check-ins per minute', dEs: 'Check-ins por minuto' }],
    [{ id: 'r3-1', icon: 'scale', lPt: 'Dashboard de pesagem', lEn: 'Weighing dashboard', lEs: 'Dashboard de pesaje', dPt: 'Peso médio por cliente', dEn: 'Avg weight per customer', dEs: 'Peso medio por cliente' }],
    [{ id: 'r4-1', icon: 'credit-card', lPt: 'Multi-checkout', lEn: 'Multi-checkout', lEs: 'Multi-checkout', dPt: 'Contas fecham pelo app', dEn: 'Bills close via app', dEs: 'Cuentas cierran por app' }],
    [{ id: 'r5-1', icon: 'bar-chart-3', lPt: 'Analytics de desperdício', lEn: 'Waste analytics', lEs: 'Analytics de desperdicio', dPt: 'KG desperdiçado por estação', dEn: 'KG wasted per station', dEs: 'KG desperdiciado por estación' }],
  ],
  events: [
    [{ id: 'e1-1', time: '11:15', icon: 'bar-chart-3', urgency: 'info', cPt: 'Viu mapa de estações', cEn: 'Saw station map', cEs: 'Vio mapa de estaciones', rPt: 'Todas as estações verdes', rEn: 'All stations green', rEs: 'Todas las estaciones verdes', resPt: 'Reposição proativa', resEn: 'Proactive restocking', resEs: 'Reposición proactiva' }],
    [{ id: 'e2-1', time: '12:00', icon: 'ticket', urgency: 'warning', cPt: '40 check-ins em 10 min', cEn: '40 check-ins in 10 min', cEs: '40 check-ins en 10 min', rPt: 'Fluxo controlado pela entrada', rEn: 'Flow controlled at entry', rEs: 'Flujo controlado por entrada', resPt: 'Sem aglomeração nas estações', resEn: 'No station crowding', resEs: 'Sin aglomeración en estaciones' }],
    [{ id: 'e3-1', time: '13:15', icon: 'scale', urgency: 'info', cPt: 'Prato pesado: 380g = R$ 30,40', cEn: 'Plate weighed: 380g = $6.08', cEs: 'Plato pesado: 380g = $6.08', rPt: 'Registro automático na conta', rEn: 'Automatic bill registration', rEs: 'Registro automático en cuenta', resPt: 'Zero erro de cobrança', resEn: 'Zero billing errors', resEs: 'Cero errores de cobro' }],
    [{ id: 'e4-1', time: '14:15', icon: 'credit-card', urgency: 'info', cPt: 'Pagou pelo app', cEn: 'Paid via app', cEs: 'Pagó por app', rPt: 'Mesa liberada em 30 seg', rEn: 'Table freed in 30 sec', rEs: 'Mesa liberada en 30 seg', resPt: 'Rotação +25%', resEn: 'Rotation +25%', resEs: 'Rotación +25%' }],
    [{ id: 'e5-1', time: '15:10', icon: 'bar-chart-3', urgency: 'info', cPt: 'Recebeu resumo nutricional', cEn: 'Received nutritional summary', cEs: 'Recibió resumen nutricional', rPt: 'Desperdício: 4kg (era 12kg)', rEn: 'Waste: 4kg (was 12kg)', rEs: 'Desperdicio: 4kg (era 12kg)', resPt: 'Economia de R$ 480/dia', resEn: 'Savings of $96/day', resEs: 'Ahorro de $96/día' }],
  ],
  metrics: [
    [{ id: 'm1-1', icon: 'bar-chart-3', lPt: 'Estações monitoradas', lEn: 'Monitored stations', lEs: 'Estaciones monitoreadas', woPt: '0%', woEn: '0%', woEs: '0%', wPt: '100%', wEn: '100%', wEs: '100%' }],
    [{ id: 'm2-1', icon: 'timer', lPt: 'Tempo de check-in', lEn: 'Check-in time', lEs: 'Tiempo de check-in', woPt: '3 min', woEn: '3 min', woEs: '3 min', wPt: '15 seg', wEn: '15 sec', wEs: '15 seg' }],
    [{ id: 'm3-1', icon: 'x-circle', lPt: 'Erros de cobrança', lEn: 'Billing errors', lEs: 'Errores de cobro', woPt: '8%', woEn: '8%', woEs: '8%', wPt: '0%', wEn: '0%', wEs: '0%' }],
    [{ id: 'm4-1', icon: 'timer', lPt: 'Fechamento', lEn: 'Bill closing', lEs: 'Cierre', woPt: '10 min', woEn: '10 min', woEs: '10 min', wPt: '30 seg', wEn: '30 sec', wEs: '30 seg' }],
    [{ id: 'm5-1', icon: 'package', lPt: 'Desperdício/dia', lEn: 'Waste/day', lEs: 'Desperdicio/día', woPt: '12 kg', woEn: '12 kg', woEs: '12 kg', wPt: '4 kg', wEn: '4 kg', wEs: '4 kg' }],
  ],
});

// ═══════════════════════════════════════════
// MODEL REGISTRY
// ═══════════════════════════════════════════

const ACTS_REGISTRY: Record<SimModel, TurnoAct[]> = {
  'fine-dining': FINE_DINING_ACTS,
  'chefs-table': CHEFS_TABLE_ACTS,
  'casual-dining': CASUAL_DINING_ACTS,
  'quick-service': QUICK_SERVICE_ACTS,
  'fast-casual': FAST_CASUAL_ACTS,
  'drive-thru': DRIVE_THRU_ACTS,
  'cafe-bakery': CAFE_BAKERY_ACTS,
  'pub-bar': PUB_BAR_ACTS,
  'club': CLUB_ACTS,
  'food-truck': FOOD_TRUCK_ACTS,
  'buffet': BUFFET_ACTS,
};

export function getActsForModel(model: SimModel): TurnoAct[] {
  return ACTS_REGISTRY[model] || FINE_DINING_ACTS;
}

// ═══════════════════════════════════════════
// MODEL-SPECIFIC IMPACT DATA
// ═══════════════════════════════════════════

const MODEL_IMPACT_OVERRIDES: Partial<Record<SimModel, Record<SimProfile, ImpactSummary[]>>> = {
  // ─── FINE DINING (uses defaults from FINAL_IMPACT) ───

  // ─── CHEF'S TABLE ───
  'chefs-table': {
    owner: [
      { icon: 'star', label: { pt: 'NPS por curso', en: 'Per-course NPS', es: 'NPS por curso' }, value: { pt: '9.8', en: '9.8', es: '9.8' }, delta: { pt: 'era inexistente', en: 'was nonexistent', es: 'era inexistente' }, color: 'primary' },
      { icon: 'coins', label: { pt: 'Upsell de vinhos', en: 'Wine upsell', es: 'Upsell de vinos' }, value: { pt: '+380%', en: '+380%', es: '+380%' }, delta: { pt: 'harmonização IA', en: 'AI pairing', es: 'maridaje IA' }, color: 'accent' },
      { icon: 'refresh-cw', label: { pt: 'Taxa de retorno', en: 'Return rate', es: 'Tasa de retorno' }, value: { pt: '78%', en: '78%', es: '78%' }, delta: { pt: 'era 20%', en: 'was 20%', es: 'era 20%' }, color: 'success' },
      { icon: 'camera', label: { pt: 'Conteúdo orgânico', en: 'Organic content', es: 'Contenido orgánico' }, value: { pt: '85%', en: '85%', es: '85%' }, delta: { pt: 'postam espontaneamente', en: 'post spontaneously', es: 'publican espontáneamente' }, color: 'secondary' },
    ],
    manager: [
      { icon: 'timer', label: { pt: 'Prep do menu', en: 'Menu prep', es: 'Prep del menú' }, value: { pt: '45 min', en: '45 min', es: '45 min' }, delta: { pt: 'era 3h', en: 'was 3h', es: 'era 3h' }, color: 'primary' },
      { icon: 'alert-octagon', label: { pt: 'Riscos alergia', en: 'Allergy risks', es: 'Riesgos alergia' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: '100% visíveis antes', en: '100% visible before', es: '100% visibles antes' }, color: 'success' },
      { icon: 'timer', label: { pt: 'Fechamento', en: 'Closing', es: 'Cierre' }, value: { pt: '2 min', en: '2 min', es: '2 min' }, delta: { pt: 'era 20 min', en: 'was 20 min', es: 'era 20 min' }, color: 'secondary' },
      { icon: 'bar-chart-3', label: { pt: 'Relatório', en: 'Report', es: 'Reporte' }, value: { pt: 'Automático', en: 'Automatic', es: 'Automático' }, delta: { pt: 'era 1h manual', en: 'was 1h manual', es: 'era 1h manual' }, color: 'accent' },
    ],
    team: [
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+120%', en: '+120%', es: '+120%' }, delta: { pt: 'gorjeta digital', en: 'digital tip', es: 'propina digital' }, color: 'primary' },
      { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-70%', en: '-70%', es: '-70%' }, delta: { pt: 'tudo na tela', en: 'everything on screen', es: 'todo en pantalla' }, color: 'success' },
      { icon: 'camera', label: { pt: 'Reconhecimento', en: 'Recognition', es: 'Reconocimiento' }, value: { pt: '85%', en: '85%', es: '85%' }, delta: { pt: 'clientes postam fotos', en: 'customers post photos', es: 'clientes publican fotos' }, color: 'accent' },
      { icon: 'target', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'prato certo sempre', en: 'right dish always', es: 'plato correcto siempre' }, color: 'secondary' },
    ],
  },

  // ─── CASUAL DINING ───
  'casual-dining': {
    owner: [
      { icon: 'coins', label: { pt: 'Receita por turno', en: 'Revenue per shift', es: 'Ingreso por turno' }, value: { pt: '+28%', en: '+28%', es: '+28%' }, delta: { pt: 'sugestão IA + giros extras', en: 'AI suggestion + extra turns', es: 'sugerencia IA + giros extras' }, color: 'primary' },
      { icon: 'utensils', label: { pt: 'Giros extras', en: 'Extra turns', es: 'Giros extras' }, value: { pt: '+3', en: '+3', es: '+3' }, delta: { pt: 'mesas por turno', en: 'tables per shift', es: 'mesas por turno' }, color: 'accent' },
      { icon: 'person-standing', label: { pt: 'Walk-ins salvos', en: 'Walk-ins saved', es: 'Walk-ins salvados' }, value: { pt: '95%', en: '95%', es: '95%' }, delta: { pt: 'era 60%', en: 'was 60%', es: 'era 60%' }, color: 'success' },
      { icon: 'x-circle', label: { pt: 'Erros de pedido', en: 'Order errors', es: 'Errores de pedido' }, value: { pt: '0%', en: '0%', es: '0%' }, delta: { pt: 'era 12%', en: 'was 12%', es: 'era 12%' }, color: 'secondary' },
    ],
    manager: [
      { icon: 'alert-octagon', label: { pt: 'Incidentes', en: 'Incidents', es: 'Incidentes' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'eram 12 por turno', en: 'were 12 per shift', es: 'eran 12 por turno' }, color: 'success' },
      { icon: 'timer', label: { pt: 'Fechamento', en: 'Bill close', es: 'Cierre' }, value: { pt: '45s', en: '45s', es: '45s' }, delta: { pt: 'era 12 min', en: 'was 12 min', es: 'era 12 min' }, color: 'primary' },
      { icon: 'star', label: { pt: 'NPS do turno', en: 'Shift NPS', es: 'NPS del turno' }, value: { pt: '9.1', en: '9.1', es: '9.1' }, delta: { pt: '+1.9 pontos', en: '+1.9 points', es: '+1.9 puntos' }, color: 'accent' },
      { icon: 'bar-chart-3', label: { pt: 'Visibilidade', en: 'Visibility', es: 'Visibilidad' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'tempo real', en: 'real-time', es: 'tiempo real' }, color: 'secondary' },
    ],
    team: [
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+34%', en: '+34%', es: '+34%' }, delta: { pt: 'gorjeta digital', en: 'digital tip', es: 'propina digital' }, color: 'primary' },
      { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-60%', en: '-60%', es: '-60%' }, delta: { pt: 'menos correria', en: 'less rushing', es: 'menos carreras' }, color: 'success' },
      { icon: 'star', label: { pt: 'Menções', en: 'Mentions', es: 'Menciones' }, value: { pt: '5', en: '5', es: '5' }, delta: { pt: 'clientes citaram seu nome', en: 'customers mentioned your name', es: 'clientes mencionaron tu nombre' }, color: 'accent' },
      { icon: 'target', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'no turno', en: 'in the shift', es: 'en el turno' }, color: 'secondary' },
    ],
  },

  // ─── QUICK SERVICE ───
  'quick-service': {
    owner: [
      { icon: 'timer', label: { pt: 'Tempo na fila', en: 'Queue time', es: 'Tiempo en fila' }, value: { pt: '0 min', en: '0 min', es: '0 min' }, delta: { pt: 'era 12 min', en: 'was 12 min', es: 'era 12 min' }, color: 'primary' },
      { icon: 'coins', label: { pt: 'Receita por hora', en: 'Revenue per hour', es: 'Ingreso por hora' }, value: { pt: '+40%', en: '+40%', es: '+40%' }, delta: { pt: 'com Skip the Line', en: 'with Skip the Line', es: 'con Skip the Line' }, color: 'accent' },
      { icon: 'x-circle', label: { pt: 'Erros de pedido', en: 'Order errors', es: 'Errores de pedido' }, value: { pt: '0.5%', en: '0.5%', es: '0.5%' }, delta: { pt: 'era 15%', en: 'was 15%', es: 'era 15%' }, color: 'success' },
      { icon: 'package', label: { pt: 'Desperdício', en: 'Waste', es: 'Desperdicio' }, value: { pt: '-77%', en: '-77%', es: '-77%' }, delta: { pt: 'com previsão IA', en: 'with AI forecast', es: 'con previsión IA' }, color: 'secondary' },
    ],
    manager: [
      { icon: 'timer', label: { pt: 'Tempo médio pedido', en: 'Avg order time', es: 'Tiempo medio pedido' }, value: { pt: '90s', en: '90s', es: '90s' }, delta: { pt: 'era 6 min', en: 'was 6 min', es: 'era 6 min' }, color: 'primary' },
      { icon: 'alert-octagon', label: { pt: 'Erros no KDS', en: 'KDS errors', es: 'Errores en KDS' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'pedido digital direto', en: 'direct digital order', es: 'pedido digital directo' }, color: 'success' },
      { icon: 'bar-chart-3', label: { pt: 'Throughput', en: 'Throughput', es: 'Throughput' }, value: { pt: '+45%', en: '+45%', es: '+45%' }, delta: { pt: 'pedidos por hora', en: 'orders per hour', es: 'pedidos por hora' }, color: 'accent' },
      { icon: 'users', label: { pt: 'Equipe necessária', en: 'Staff needed', es: 'Equipo necesario' }, value: { pt: '-2', en: '-2', es: '-2' }, delta: { pt: 'no caixa', en: 'at register', es: 'en caja' }, color: 'secondary' },
    ],
    team: [
      { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-55%', en: '-55%', es: '-55%' }, delta: { pt: 'sem anotar pedidos', en: 'no manual orders', es: 'sin anotar pedidos' }, color: 'success' },
      { icon: 'target', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'pedidos digitais', en: 'digital orders', es: 'pedidos digitales' }, color: 'secondary' },
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+28%', en: '+28%', es: '+28%' }, delta: { pt: 'sugestão no app', en: 'app suggestion', es: 'sugerencia en app' }, color: 'primary' },
      { icon: 'timer', label: { pt: 'Hora extra', en: 'Overtime', es: 'Hora extra' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'turno acaba no horário', en: 'shift ends on time', es: 'turno acaba a tiempo' }, color: 'accent' },
    ],
  },

  // ─── FAST CASUAL ───
  'fast-casual': {
    owner: [
      { icon: 'coins', label: { pt: 'Ticket médio', en: 'Avg ticket', es: 'Ticket medio' }, value: { pt: '+22%', en: '+22%', es: '+22%' }, delta: { pt: 'com combos IA', en: 'with AI combos', es: 'con combos IA' }, color: 'primary' },
      { icon: 'timer', label: { pt: 'Tempo de fila', en: 'Queue time', es: 'Tiempo de fila' }, value: { pt: '0 min', en: '0 min', es: '0 min' }, delta: { pt: 'era 8 min', en: 'was 8 min', es: 'era 8 min' }, color: 'accent' },
      { icon: 'refresh-cw', label: { pt: 'Retenção', en: 'Retention', es: 'Retención' }, value: { pt: '88%', en: '88%', es: '88%' }, delta: { pt: 'era 55%', en: 'was 55%', es: 'era 55%' }, color: 'success' },
      { icon: 'package', label: { pt: 'Desperdício', en: 'Waste', es: 'Desperdicio' }, value: { pt: '-65%', en: '-65%', es: '-65%' }, delta: { pt: 'previsão de demanda', en: 'demand forecast', es: 'previsión de demanda' }, color: 'secondary' },
    ],
    manager: [
      { icon: 'bar-chart-3', label: { pt: 'Visibilidade', en: 'Visibility', es: 'Visibilidad' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'tempo real', en: 'real-time', es: 'tiempo real' }, color: 'primary' },
      { icon: 'alert-octagon', label: { pt: 'Incidentes', en: 'Incidents', es: 'Incidentes' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'fluxo automatizado', en: 'automated flow', es: 'flujo automatizado' }, color: 'success' },
      { icon: 'timer', label: { pt: 'Fechamento', en: 'Closing', es: 'Cierre' }, value: { pt: '30s', en: '30s', es: '30s' }, delta: { pt: 'era 8 min', en: 'was 8 min', es: 'era 8 min' }, color: 'secondary' },
      { icon: 'users', label: { pt: 'Eficiência', en: 'Efficiency', es: 'Eficiencia' }, value: { pt: '+40%', en: '+40%', es: '+40%' }, delta: { pt: 'menos equipe no caixa', en: 'less staff at register', es: 'menos equipo en caja' }, color: 'accent' },
    ],
    team: [
      { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-50%', en: '-50%', es: '-50%' }, delta: { pt: 'pedidos organizados', en: 'organized orders', es: 'pedidos organizados' }, color: 'success' },
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+35%', en: '+35%', es: '+35%' }, delta: { pt: 'sugestão digital', en: 'digital suggestion', es: 'sugerencia digital' }, color: 'primary' },
      { icon: 'target', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0.5%', en: '0.5%', es: '0.5%' }, delta: { pt: 'era 10%', en: 'was 10%', es: 'era 10%' }, color: 'secondary' },
      { icon: 'timer', label: { pt: 'Hora extra', en: 'Overtime', es: 'Hora extra' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'processo otimizado', en: 'optimized process', es: 'proceso optimizado' }, color: 'accent' },
    ],
  },

  // ─── DRIVE-THRU ───
  'drive-thru': {
    owner: [
      { icon: 'car', label: { pt: 'Tempo por carro', en: 'Time per car', es: 'Tiempo por auto' }, value: { pt: '2 min', en: '2 min', es: '2 min' }, delta: { pt: 'era 7 min', en: 'was 7 min', es: 'era 7 min' }, color: 'primary' },
      { icon: 'coins', label: { pt: 'Carros por hora', en: 'Cars per hour', es: 'Autos por hora' }, value: { pt: '+65%', en: '+65%', es: '+65%' }, delta: { pt: 'pré-pedido + pagamento', en: 'pre-order + payment', es: 'pre-pedido + pago' }, color: 'accent' },
      { icon: 'x-circle', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0.3%', en: '0.3%', es: '0.3%' }, delta: { pt: 'era 18%', en: 'was 18%', es: 'era 18%' }, color: 'success' },
      { icon: 'person-standing', label: { pt: 'Desistência', en: 'Abandonment', es: 'Abandono' }, value: { pt: '2%', en: '2%', es: '2%' }, delta: { pt: 'era 30%', en: 'was 30%', es: 'era 30%' }, color: 'secondary' },
    ],
    manager: [
      { icon: 'bar-chart-3', label: { pt: 'Throughput', en: 'Throughput', es: 'Throughput' }, value: { pt: '+65%', en: '+65%', es: '+65%' }, delta: { pt: 'carros por hora', en: 'cars per hour', es: 'autos por hora' }, color: 'primary' },
      { icon: 'monitor', label: { pt: 'Visibilidade', en: 'Visibility', es: 'Visibilidad' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'fila em tempo real', en: 'queue in real-time', es: 'fila en tiempo real' }, color: 'secondary' },
      { icon: 'alert-octagon', label: { pt: 'Incidentes', en: 'Incidents', es: 'Incidentes' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'pedido confirmado por tela', en: 'order confirmed on screen', es: 'pedido confirmado por pantalla' }, color: 'success' },
      { icon: 'users', label: { pt: 'Equipe no drive', en: 'Drive staff', es: 'Equipo en drive' }, value: { pt: '-2', en: '-2', es: '-2' }, delta: { pt: 'automação do pedido', en: 'order automation', es: 'automatización del pedido' }, color: 'accent' },
    ],
    team: [
      { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-65%', en: '-65%', es: '-65%' }, delta: { pt: 'sem gritar pedidos', en: 'no shouting orders', es: 'sin gritar pedidos' }, color: 'success' },
      { icon: 'target', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'tela confirma tudo', en: 'screen confirms all', es: 'pantalla confirma todo' }, color: 'secondary' },
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+15%', en: '+15%', es: '+15%' }, delta: { pt: 'opção digital', en: 'digital option', es: 'opción digital' }, color: 'primary' },
      { icon: 'timer', label: { pt: 'Hora extra', en: 'Overtime', es: 'Hora extra' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'fluxo previsível', en: 'predictable flow', es: 'flujo previsible' }, color: 'accent' },
    ],
  },

  // ─── CAFÉ & BAKERY ───
  'cafe-bakery': {
    owner: [
      { icon: 'coins', label: { pt: 'Ticket médio', en: 'Avg ticket', es: 'Ticket medio' }, value: { pt: '+35%', en: '+35%', es: '+35%' }, delta: { pt: 'sugestão de combo IA', en: 'AI combo suggestion', es: 'sugerencia combo IA' }, color: 'primary' },
      { icon: 'timer', label: { pt: 'Fila', en: 'Queue', es: 'Fila' }, value: { pt: '0 min', en: '0 min', es: '0 min' }, delta: { pt: 'era 10 min no pico', en: 'was 10 min at peak', es: 'era 10 min en pico' }, color: 'accent' },
      { icon: 'refresh-cw', label: { pt: 'Clientes recorrentes', en: 'Returning customers', es: 'Clientes recurrentes' }, value: { pt: '82%', en: '82%', es: '82%' }, delta: { pt: 'era 45%', en: 'was 45%', es: 'era 45%' }, color: 'success' },
      { icon: 'package', label: { pt: 'Desperdício', en: 'Waste', es: 'Desperdicio' }, value: { pt: '-55%', en: '-55%', es: '-55%' }, delta: { pt: 'previsão por horário', en: 'time-based forecast', es: 'previsión por horario' }, color: 'secondary' },
    ],
    manager: [
      { icon: 'bar-chart-3', label: { pt: 'Pico controlado', en: 'Controlled peak', es: 'Pico controlado' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'visibilidade total', en: 'full visibility', es: 'visibilidad total' }, color: 'primary' },
      { icon: 'timer', label: { pt: 'Tempo do pedido', en: 'Order time', es: 'Tiempo del pedido' }, value: { pt: '2 min', en: '2 min', es: '2 min' }, delta: { pt: 'era 8 min', en: 'was 8 min', es: 'era 8 min' }, color: 'secondary' },
      { icon: 'cookie', label: { pt: 'Estoque', en: 'Stock', es: 'Stock' }, value: { pt: 'Automático', en: 'Automatic', es: 'Automático' }, delta: { pt: 'alerta antes de acabar', en: 'alert before running out', es: 'alerta antes de acabar' }, color: 'accent' },
      { icon: 'users', label: { pt: 'Eficiência', en: 'Efficiency', es: 'Eficiencia' }, value: { pt: '+45%', en: '+45%', es: '+45%' }, delta: { pt: 'menos equipe no caixa', en: 'less cashier staff', es: 'menos equipo en caja' }, color: 'success' },
    ],
    team: [
      { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-50%', en: '-50%', es: '-50%' }, delta: { pt: 'pedidos organizados', en: 'organized orders', es: 'pedidos organizados' }, color: 'success' },
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+40%', en: '+40%', es: '+40%' }, delta: { pt: 'sugestão no checkout', en: 'checkout suggestion', es: 'sugerencia en checkout' }, color: 'primary' },
      { icon: 'target', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'pedidos digitais', en: 'digital orders', es: 'pedidos digitales' }, color: 'secondary' },
      { icon: 'star', label: { pt: 'Reconhecimento', en: 'Recognition', es: 'Reconocimiento' }, value: { pt: '4', en: '4', es: '4' }, delta: { pt: 'menções por turno', en: 'mentions per shift', es: 'menciones por turno' }, color: 'accent' },
    ],
  },

  // ─── PUB & BAR ───
  'pub-bar': {
    owner: [
      { icon: 'coins', label: { pt: 'Consumo médio', en: 'Avg consumption', es: 'Consumo medio' }, value: { pt: '+73%', en: '+73%', es: '+73%' }, delta: { pt: 'com tab digital', en: 'with digital tab', es: 'con tab digital' }, color: 'primary' },
      { icon: 'shield-alert', label: { pt: 'Calotes', en: 'Walkouts', es: 'Fugas' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'tab pré-autorizada', en: 'pre-authorized tab', es: 'tab pre-autorizada' }, color: 'success' },
      { icon: 'timer', label: { pt: 'Fechamento', en: 'Bill closing', es: 'Cierre' }, value: { pt: '30 seg', en: '30 sec', es: '30 seg' }, delta: { pt: 'era 15 min', en: 'was 15 min', es: 'era 15 min' }, color: 'secondary' },
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+81%', en: '+81%', es: '+81%' }, delta: { pt: 'gorjeta digital fácil', en: 'easy digital tip', es: 'propina digital fácil' }, color: 'accent' },
    ],
    manager: [
      { icon: 'bar-chart-3', label: { pt: 'Consumo em tempo real', en: 'Real-time consumption', es: 'Consumo en tiempo real' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'visão de todas as tabs', en: 'all tabs visible', es: 'visión de todas las tabs' }, color: 'primary' },
      { icon: 'shield-alert', label: { pt: 'Inadimplência', en: 'Non-payment', es: 'Morosidad' }, value: { pt: '0%', en: '0%', es: '0%' }, delta: { pt: 'tab pré-autorizada', en: 'pre-authorized tab', es: 'tab pre-autorizada' }, color: 'success' },
      { icon: 'timer', label: { pt: 'Fechamento', en: 'Closing', es: 'Cierre' }, value: { pt: '30s', en: '30s', es: '30s' }, delta: { pt: 'era 15 min', en: 'was 15 min', es: 'era 15 min' }, color: 'secondary' },
      { icon: 'users', label: { pt: 'Eficiência', en: 'Efficiency', es: 'Eficiencia' }, value: { pt: '+50%', en: '+50%', es: '+50%' }, delta: { pt: 'pedido pelo app', en: 'app ordering', es: 'pedido por app' }, color: 'accent' },
    ],
    team: [
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+81%', en: '+81%', es: '+81%' }, delta: { pt: 'gorjeta digital', en: 'digital tip', es: 'propina digital' }, color: 'primary' },
      { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-55%', en: '-55%', es: '-55%' }, delta: { pt: 'sem correria no caixa', en: 'no register rush', es: 'sin correría en caja' }, color: 'success' },
      { icon: 'target', label: { pt: 'Calotes', en: 'Walkouts', es: 'Fugas' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'tab pré-autorizada', en: 'pre-authorized tab', es: 'tab pre-autorizada' }, color: 'secondary' },
      { icon: 'glass-water', label: { pt: 'Drinks/hora', en: 'Drinks/hour', es: 'Drinks/hora' }, value: { pt: '+45%', en: '+45%', es: '+45%' }, delta: { pt: 'pedidos organizados', en: 'organized orders', es: 'pedidos organizados' }, color: 'accent' },
    ],
  },

  // ─── CLUB & NIGHTLIFE ───
  'club': {
    owner: [
      { icon: 'coins', label: { pt: 'Receita por noite', en: 'Revenue per night', es: 'Ingreso por noche' }, value: { pt: '+52%', en: '+52%', es: '+52%' }, delta: { pt: 'tab digital + drink remoto', en: 'digital tab + remote drink', es: 'tab digital + drink remoto' }, color: 'primary' },
      { icon: 'shield-alert', label: { pt: 'Calotes', en: 'Walkouts', es: 'Fugas' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'tab pré-autorizada', en: 'pre-authorized tab', es: 'tab pre-autorizada' }, color: 'success' },
      { icon: 'users', label: { pt: 'Controle lotação', en: 'Capacity control', es: 'Control ocupación' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'digital em tempo real', en: 'digital real-time', es: 'digital en tiempo real' }, color: 'accent' },
      { icon: 'timer', label: { pt: 'Fila na entrada', en: 'Entry queue', es: 'Fila en entrada' }, value: { pt: '0 min', en: '0 min', es: '0 min' }, delta: { pt: 'check-in QR', en: 'QR check-in', es: 'check-in QR' }, color: 'secondary' },
    ],
    manager: [
      { icon: 'bar-chart-3', label: { pt: 'Lotação', en: 'Occupancy', es: 'Ocupación' }, value: { pt: 'Tempo real', en: 'Real-time', es: 'Tiempo real' }, delta: { pt: 'controle automático', en: 'auto control', es: 'control automático' }, color: 'primary' },
      { icon: 'shield-alert', label: { pt: 'Segurança', en: 'Security', es: 'Seguridad' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'alertas automáticos', en: 'auto alerts', es: 'alertas automáticos' }, color: 'success' },
      { icon: 'glass-water', label: { pt: 'Drinks/hora', en: 'Drinks/hour', es: 'Drinks/hora' }, value: { pt: '+60%', en: '+60%', es: '+60%' }, delta: { pt: 'pedido da pista', en: 'floor ordering', es: 'pedido de pista' }, color: 'accent' },
      { icon: 'timer', label: { pt: 'Fechamento', en: 'Closing', es: 'Cierre' }, value: { pt: '1 min', en: '1 min', es: '1 min' }, delta: { pt: 'era 20 min', en: 'was 20 min', es: 'era 20 min' }, color: 'secondary' },
    ],
    team: [
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+55%', en: '+55%', es: '+55%' }, delta: { pt: 'gorjeta na tab', en: 'tab tip', es: 'propina en tab' }, color: 'primary' },
      { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-60%', en: '-60%', es: '-60%' }, delta: { pt: 'pedidos organizados', en: 'organized orders', es: 'pedidos organizados' }, color: 'success' },
      { icon: 'target', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'pedido digital', en: 'digital order', es: 'pedido digital' }, color: 'secondary' },
      { icon: 'volume-2', label: { pt: 'Eficiência', en: 'Efficiency', es: 'Eficiencia' }, value: { pt: '+60%', en: '+60%', es: '+60%' }, delta: { pt: 'sem gritar pedidos', en: 'no shouting orders', es: 'sin gritar pedidos' }, color: 'accent' },
    ],
  },

  // ─── FOOD TRUCK ───
  'food-truck': {
    owner: [
      { icon: 'map-pin', label: { pt: 'Clientes notificados', en: 'Customers notified', es: 'Clientes notificados' }, value: { pt: '350+', en: '350+', es: '350+' }, delta: { pt: 'por GPS automático', en: 'by auto GPS', es: 'por GPS automático' }, color: 'primary' },
      { icon: 'coins', label: { pt: 'Receita/dia', en: 'Revenue/day', es: 'Ingreso/día' }, value: { pt: '+78%', en: '+78%', es: '+78%' }, delta: { pt: 'com fila digital', en: 'with digital queue', es: 'con fila digital' }, color: 'accent' },
      { icon: 'credit-card', label: { pt: 'Pagamento digital', en: 'Digital payment', es: 'Pago digital' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'sem manuseio de dinheiro', en: 'no cash handling', es: 'sin manejo de efectivo' }, color: 'success' },
      { icon: 'bar-chart-3', label: { pt: 'Dados por ponto', en: 'Data per spot', es: 'Datos por punto' }, value: { pt: '12+', en: '12+', es: '12+' }, delta: { pt: 'métricas por local', en: 'metrics per location', es: 'métricas por local' }, color: 'secondary' },
    ],
    manager: [
      { icon: 'map-pin', label: { pt: 'GPS automático', en: 'Auto GPS', es: 'GPS automático' }, value: { pt: 'Ativo', en: 'Active', es: 'Activo' }, delta: { pt: 'seguidores notificados', en: 'followers notified', es: 'seguidores notificados' }, color: 'primary' },
      { icon: 'person-standing', label: { pt: 'Desistência fila', en: 'Queue abandonment', es: 'Abandono fila' }, value: { pt: '5%', en: '5%', es: '5%' }, delta: { pt: 'era 40%', en: 'was 40%', es: 'era 40%' }, color: 'success' },
      { icon: 'bar-chart-3', label: { pt: 'Analytics/ponto', en: 'Analytics/spot', es: 'Analytics/punto' }, value: { pt: '12+', en: '12+', es: '12+' }, delta: { pt: 'métricas por local', en: 'metrics per location', es: 'métricas por local' }, color: 'secondary' },
      { icon: 'timer', label: { pt: 'Ativação', en: 'Activation', es: 'Activación' }, value: { pt: '2 min', en: '2 min', es: '2 min' }, delta: { pt: 'era 15 min', en: 'was 15 min', es: 'era 15 min' }, color: 'accent' },
    ],
    team: [
      { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-45%', en: '-45%', es: '-45%' }, delta: { pt: 'pedidos organizados', en: 'organized orders', es: 'pedidos organizados' }, color: 'success' },
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+30%', en: '+30%', es: '+30%' }, delta: { pt: 'gorjeta digital', en: 'digital tip', es: 'propina digital' }, color: 'primary' },
      { icon: 'credit-card', label: { pt: 'Sem dinheiro', en: 'No cash', es: 'Sin efectivo' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'mais higiênico', en: 'more hygienic', es: 'más higiénico' }, color: 'secondary' },
      { icon: 'target', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'pedido digital', en: 'digital order', es: 'pedido digital' }, color: 'accent' },
    ],
  },

  // ─── BUFFET ───
  'buffet': {
    owner: [
      { icon: 'scale', label: { pt: 'Erro de cobrança', en: 'Billing errors', es: 'Errores de cobro' }, value: { pt: '0%', en: '0%', es: '0%' }, delta: { pt: 'era 8% (balança NFC)', en: 'was 8% (NFC scale)', es: 'era 8% (balanza NFC)' }, color: 'primary' },
      { icon: 'package', label: { pt: 'Desperdício', en: 'Waste', es: 'Desperdicio' }, value: { pt: '-67%', en: '-67%', es: '-67%' }, delta: { pt: 'sensores de estação', en: 'station sensors', es: 'sensores de estación' }, color: 'success' },
      { icon: 'coins', label: { pt: 'Rotação', en: 'Rotation', es: 'Rotación' }, value: { pt: '+25%', en: '+25%', es: '+25%' }, delta: { pt: 'pagamento no app', en: 'app payment', es: 'pago en app' }, color: 'accent' },
      { icon: 'timer', label: { pt: 'Check-in', en: 'Check-in', es: 'Check-in' }, value: { pt: '15 seg', en: '15 sec', es: '15 seg' }, delta: { pt: 'era 3 min', en: 'was 3 min', es: 'era 3 min' }, color: 'secondary' },
    ],
    manager: [
      { icon: 'bar-chart-3', label: { pt: 'Estações', en: 'Stations', es: 'Estaciones' }, value: { pt: '100%', en: '100%', es: '100%' }, delta: { pt: 'monitoradas ao vivo', en: 'monitored live', es: 'monitoreadas en vivo' }, color: 'primary' },
      { icon: 'package', label: { pt: 'Desperdício', en: 'Waste', es: 'Desperdicio' }, value: { pt: '4 kg', en: '4 kg', es: '4 kg' }, delta: { pt: 'era 12 kg/dia', en: 'was 12 kg/day', es: 'era 12 kg/día' }, color: 'success' },
      { icon: 'timer', label: { pt: 'Fechamento', en: 'Closing', es: 'Cierre' }, value: { pt: '30s', en: '30s', es: '30s' }, delta: { pt: 'era 10 min', en: 'was 10 min', es: 'era 10 min' }, color: 'secondary' },
      { icon: 'ticket', label: { pt: 'Check-in', en: 'Check-in', es: 'Check-in' }, value: { pt: 'Digital', en: 'Digital', es: 'Digital' }, delta: { pt: 'sem fila', en: 'no queue', es: 'sin fila' }, color: 'accent' },
    ],
    team: [
      { icon: 'smile', label: { pt: 'Estresse', en: 'Stress', es: 'Estrés' }, value: { pt: '-50%', en: '-50%', es: '-50%' }, delta: { pt: 'reposição proativa', en: 'proactive restocking', es: 'reposición proactiva' }, color: 'success' },
      { icon: 'scale', label: { pt: 'Discussões peso', en: 'Weight disputes', es: 'Disputas de peso' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'balança digital', en: 'digital scale', es: 'balanza digital' }, color: 'secondary' },
      { icon: 'dollar-sign', label: { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' }, value: { pt: '+20%', en: '+20%', es: '+20%' }, delta: { pt: 'sugestão digital', en: 'digital suggestion', es: 'sugerencia digital' }, color: 'primary' },
      { icon: 'target', label: { pt: 'Erros', en: 'Errors', es: 'Errores' }, value: { pt: '0', en: '0', es: '0' }, delta: { pt: 'processo automatizado', en: 'automated process', es: 'proceso automatizado' }, color: 'accent' },
    ],
  },
};

export function getImpactForModel(model: SimModel, profile: SimProfile): ImpactSummary[] {
  const override = MODEL_IMPACT_OVERRIDES[model];
  if (override && override[profile]) return override[profile];
  return FINAL_IMPACT[profile];
}
