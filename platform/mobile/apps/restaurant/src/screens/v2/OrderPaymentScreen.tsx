import { CreditCard, Clock, CheckCircle } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function OrderPaymentScreen() {
  return (
    <V2ListScreen title="Pagamentos" subtitle="Rastreio de cobranças" showBack items={[
      { icon: CreditCard, label: 'Mesa 7 · R$ 186,00', subtitle: 'Pix pendente' },
      { icon: CheckCircle, label: 'Mesa 3 · R$ 92,50', subtitle: 'Pago · Cartão' },
      { icon: Clock, label: 'Mesa 12 · R$ 240,00', subtitle: 'Aguardando fechamento' },
    ]} />
  );
}
