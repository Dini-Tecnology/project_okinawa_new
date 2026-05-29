import { Bell, Check, X } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function CallsScreen() {
  return (
    <V2ListScreen title="Chamados" subtitle="Solicitações de mesa" showBack items={[
      { icon: Bell, label: 'Mesa 5 · Chamar garçom', subtitle: 'Há 2 min' },
      { icon: Bell, label: 'Mesa 9 · Conta', subtitle: 'Há 5 min' },
      { icon: Check, label: 'Marcar como atendido', subtitle: 'Limpar fila' },
    ]} />
  );
}
