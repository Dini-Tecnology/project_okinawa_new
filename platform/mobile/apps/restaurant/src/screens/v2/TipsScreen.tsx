import { CreditCard, PieChart, Users } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function TipsScreen() {
  return (
    <V2ListScreen title="Gorjetas" subtitle="Distribuição e histórico" showBack items={[
      { icon: CreditCard, label: 'Pool do turno', subtitle: 'R$ 840,00 acumulado' },
      { icon: PieChart, label: 'Distribuição por cargo', subtitle: 'Igual · Por role · Por horas' },
      { icon: Users, label: 'Equipe no turno', subtitle: '6 colaboradores' },
    ]} />
  );
}
