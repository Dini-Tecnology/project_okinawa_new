import { Calendar, ClipboardList, Users } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function MaitreScreen() {
  return (
    <V2ListScreen title="Maître" subtitle="Sala, fila e reservas" showBack items={[
      { icon: ClipboardList, label: 'Fila de espera', subtitle: '4 grupos aguardando' },
      { icon: Calendar, label: 'Reservas de hoje', subtitle: '12 confirmadas' },
      { icon: Users, label: 'Mapa de mesas', subtitle: '72% ocupação' },
    ]} />
  );
}
