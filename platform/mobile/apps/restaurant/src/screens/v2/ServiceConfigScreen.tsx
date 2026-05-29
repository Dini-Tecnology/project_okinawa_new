import { Utensils, Truck, Music } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function ServiceConfigScreen() {
  return (
    <V2ListScreen title="Tipo de Serviço" subtitle="Modalidades ativas" showBack items={[
      { icon: Utensils, label: 'Fine Dining', subtitle: 'Reservas + harmonização' },
      { icon: Utensils, label: 'Casual Dining', subtitle: 'QR na mesa' },
      { icon: Truck, label: 'Food Truck', subtitle: 'Modo móvel' },
      { icon: Music, label: 'Club / Noturno', subtitle: 'Fila e VIP' },
    ]} />
  );
}
