import { QrCode, Users, Bell } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function CasualDiningScreen() {
  return (
    <V2ListScreen title="Casual Dining" subtitle="Configuração do modo" showBack items={[
      { icon: QrCode, label: 'QR Code na mesa', subtitle: 'Ativo em 18 mesas' },
      { icon: Bell, label: 'Chamar garçom', subtitle: 'Push + KDS garçom' },
      { icon: Users, label: 'Pedido compartilhado', subtitle: 'Split por item' },
    ]} />
  );
}
