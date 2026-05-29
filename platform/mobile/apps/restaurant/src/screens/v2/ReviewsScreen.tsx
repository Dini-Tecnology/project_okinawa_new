import { Star, MessageSquare } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function ReviewsScreen() {
  return (
    <V2ListScreen title="Avaliações" subtitle="Feedback dos clientes" showBack items={[
      { icon: Star, label: '4.8 média geral', subtitle: '128 avaliações' },
      { icon: MessageSquare, label: 'Ana · 5 estrelas', subtitle: 'Atendimento excelente!' },
      { icon: MessageSquare, label: 'Carlos · 4 estrelas', subtitle: 'Comida ótima, demorou um pouco' },
    ]} />
  );
}
