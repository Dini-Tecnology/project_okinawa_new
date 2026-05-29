import { Store, Clock, Bell, CreditCard } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  return (
    <V2ListScreen
      title="Configurações"
      items={[
        {
          icon: Store,
          label: 'Dados do Restaurante',
          subtitle: 'Nome, endereço, CNPJ',
          onPress: () => navigation.navigate('RestaurantProfile'),
        },
        {
          icon: Clock,
          label: 'Horário de Funcionamento',
          subtitle: 'Seg-Dom, 11h-23h',
          onPress: () => navigation.navigate('BusinessHours'),
        },
        {
          icon: Bell,
          label: 'Notificações',
          subtitle: 'Alertas e avisos',
          onPress: () => navigation.navigate('NotificationSettings'),
        },
        {
          icon: CreditCard,
          label: 'Pagamentos',
          subtitle: 'Métodos aceitos',
          onPress: () => navigation.navigate('PaymentSettings'),
        },
      ]}
    />
  );
}
