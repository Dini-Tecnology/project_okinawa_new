import { Gift, Users, Award } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function LoyaltyScreen() {
  return (
    <V2ListScreen title="Fidelidade" subtitle="Programa de recompensas" showBack items={[
      { icon: Gift, label: 'Regras do programa', subtitle: '1 ponto a cada R$ 10' },
      { icon: Users, label: 'Membros ativos', subtitle: '342 clientes' },
      { icon: Award, label: 'Resgates do mês', subtitle: '28 recompensas' },
    ]} />
  );
}
