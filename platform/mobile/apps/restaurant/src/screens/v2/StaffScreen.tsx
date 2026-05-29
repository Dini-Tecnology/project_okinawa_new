import { Users, Shield, Clock } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function StaffScreen() {
  return (
    <V2ListScreen
      title="Equipe"
      subtitle="Gestão de staff"
      showBack
      items={[
        { icon: Users, label: 'Maria · Garçom', subtitle: 'Turno atual' },
        { icon: Users, label: 'Pedro · Cozinha', subtitle: 'Turno atual' },
        { icon: Shield, label: 'Permissões por cargo', subtitle: 'Owner, Manager, Waiter...' },
        { icon: Clock, label: 'Escalas da semana', subtitle: 'Ver turnos' },
      ]}
    />
  );
}
