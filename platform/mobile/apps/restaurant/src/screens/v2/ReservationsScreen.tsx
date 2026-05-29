import { Calendar, Clock, Users } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function ReservationsScreen() {
  return (
    <V2ListScreen
      title="Reservas"
      subtitle="Hoje e próximos dias"
      showBack
      items={[
        { icon: Calendar, label: '19:00 · Mesa 4', subtitle: 'João Silva · 4 pessoas' },
        { icon: Clock, label: '20:30 · Mesa 8', subtitle: 'Ana Costa · 2 pessoas' },
        { icon: Users, label: '21:00 · Salão VIP', subtitle: 'Grupo corporativo · 10 pessoas' },
      ]}
    />
  );
}
