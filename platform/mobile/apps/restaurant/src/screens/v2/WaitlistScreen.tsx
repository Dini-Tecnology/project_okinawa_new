import { ClipboardList, Clock, Users } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function WaitlistScreen() {
  return (
    <V2ListScreen title="Fila de Espera" subtitle="Gestão de waitlist" showBack items={[
      { icon: ClipboardList, label: 'Grupo Silva · 4 pessoas', subtitle: 'Est. 15 min' },
      { icon: Clock, label: 'Casal Lima · 2 pessoas', subtitle: 'Est. 8 min' },
      { icon: Users, label: 'Adicionar à fila', subtitle: 'Novo walk-in' },
    ]} />
  );
}
